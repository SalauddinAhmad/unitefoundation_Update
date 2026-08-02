// ================================================================
// Media Library routes
// All endpoints require auth. GET returns metadata + thumb only
// (fast grid). GET /:id returns full url when the picker confirms
// a selection.
// ================================================================
const router = require('express').Router();
const { z } = require('zod');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');
const { toRelativeMediaUrl } = require('../utils/mediaUrl');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image uploads are allowed'));
  },
});

const uploadsRoot = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || './uploads');
const mediaDir = path.join(uploadsRoot, 'media');

function safeName(name = 'image') {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'image';
}

function extFromMime(mime = '') {
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('svg')) return 'svg';
  return 'jpg';
}

function parseDataUri(dataUri) {
  const match = /^data:([^;,]+);base64,(.+)$/i.exec(String(dataUri || '').trim());
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2].replace(/\s/g, ''), 'base64') };
}

// NOTE: we intentionally store a RELATIVE path in the DB so links keep
// working if the server IP / domain / protocol ever changes. The response
// middleware turns it into an absolute URL per request.
async function saveImageBuffer(req, buffer, mime, filename) {
  await fs.mkdir(mediaDir, { recursive: true });
  const id = uuid();
  const ext = extFromMime(mime);
  const finalName = `${Date.now()}-${id}-${safeName(filename)}.${ext}`;
  await fs.writeFile(path.join(mediaDir, finalName), buffer);
  return {
    id,
    url: `/uploads/media/${finalName}`,
    filename: finalName,
    mime: mime || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    size: buffer.length,
  };
}

// List media (lightweight — no full url)
router.get('/', requireAuth, asyncH(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 60, 200);
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const search = (req.query.search || '').toString().trim();

  let where = '';
  const params = [];
  if (search) {
    where = 'WHERE filename LIKE ?';
    params.push(`%${search}%`);
  }
  const [rows] = await pool.query(
    `SELECT id,
            COALESCE(NULLIF(thumb_url,''), url) AS thumb_url,
            filename, mime, size_bytes, width, height, created_at
       FROM media_library
       ${where}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
    params
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM media_library ${where}`,
    params
  );
  res.json({ items: rows, total });
}));

// Get full image (used when the picker selects an item)
router.get('/:id', requireAuth, asyncH(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, url, filename, mime, size_bytes, width, height, created_at FROM media_library WHERE id=?',
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
}));

// Upload/register a new image (base64 data URI or absolute URL)
const uploadSchema = z.object({
  url: z.string().min(1),
  thumb_url: z.string().optional().nullable(),
  filename: z.string().optional().nullable(),
  mime: z.string().optional().nullable(),
  size_bytes: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

router.post('/', requireAuth, upload.single('file'), asyncH(async (req, res) => {
  const body = req.file ? req.body : uploadSchema.parse(req.body);
  let stored = null;

  if (req.file) {
    stored = await saveImageBuffer(req, req.file.buffer, req.file.mimetype, req.file.originalname);
  } else {
    const parsed = parseDataUri(body.url);
    if (parsed) {
      stored = await saveImageBuffer(req, parsed.buffer, parsed.mime, body.filename || 'image');
    }
  }

  const id = stored?.id || uuid();
  const imageUrl = stored?.url || toRelativeMediaUrl(body.url);
  const filename = body.filename || stored?.filename || null;
  const mime = stored?.mime || body.mime || null;
  const size = stored?.size || Number(body.size_bytes || 0);
  const width = Number(body.width || 0);
  const height = Number(body.height || 0);
  const uploader = req.user && req.user.sub ? req.user.sub : null;
  await pool.execute(
    `INSERT INTO media_library
       (id, url, thumb_url, filename, mime, size_bytes, width, height, uploaded_by)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      id,
      imageUrl,
      body.thumb_url && !String(body.thumb_url).startsWith('data:')
        ? toRelativeMediaUrl(body.thumb_url)
        : imageUrl,
      filename,
      mime,
      size,
      width,
      height,
      uploader,
    ]
  );
  res.status(201).json({ id, url: imageUrl });
}));

// Rename (SEO-friendly filename)
const renameSchema = z.object({
  filename: z.string().trim().min(1).max(255),
});
router.patch('/:id', requireAuth, asyncH(async (req, res) => {
  const { filename } = renameSchema.parse(req.body);
  const [r] = await pool.execute(
    'UPDATE media_library SET filename=? WHERE id=?',
    [filename, req.params.id]
  );
  if (!r.affectedRows) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true, filename });
}));

router.delete('/:id', requireAuth, asyncH(async (req, res) => {
  await pool.execute('DELETE FROM media_library WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
