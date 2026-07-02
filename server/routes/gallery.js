const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');

const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_r, file, cb) => cb(null, `${Date.now()}_${file.originalname.replace(/[^\w.\-]/g, '_')}`),
  }),
  limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024 },
});

// Convert JSON string fields to arrays
function normalizeAlbum(row) {
  if (row && row.tags && typeof row.tags === 'string') {
    try { row.tags = JSON.parse(row.tags); } catch { row.tags = []; }
  }
  if (row && row.tags == null) row.tags = [];
  return row;
}

/* ================= PUBLIC ================= */
router.get('/', asyncH(async (_req, res) => {
  const [albums] = await pool.execute('SELECT * FROM gallery_albums ORDER BY sort_order, created_at DESC');
  const [items] = await pool.execute('SELECT * FROM gallery_items ORDER BY sort_order, created_at DESC');
  res.json({ albums: albums.map(normalizeAlbum), items });
}));

/* ================= ALBUMS (admin) ================= */
const albumSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  cover_url: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.enum(['published', 'draft', 'archived']).optional(),
  date: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  featured: z.union([z.boolean(), z.number()]).optional(),
  sort_order: z.number().optional(),
});

router.post('/albums', requireAuth, asyncH(async (req, res) => {
  const d = albumSchema.parse(req.body);
  const id = uuid();
  await pool.execute(
    `INSERT INTO gallery_albums
      (id,title,slug,description,cover_url,category,status,date,location,tags,featured,sort_order)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id, d.title, d.slug || null, d.description || null, d.cover_url || null,
      d.category || null, d.status || 'published',
      d.date || null, d.location || null,
      d.tags ? JSON.stringify(d.tags) : null,
      d.featured ? 1 : 0, d.sort_order || 0,
    ]
  );
  res.status(201).json({ id });
}));

router.patch('/albums/:id', requireAuth, asyncH(async (req, res) => {
  const d = albumSchema.partial().parse(req.body);
  const keys = Object.keys(d);
  if (!keys.length) return res.json({ ok: true });
  const set = keys.map((k) => `\`${k}\`=?`).join(',');
  const vals = keys.map((k) => {
    if (k === 'tags' && d[k] != null) return JSON.stringify(d[k]);
    if (k === 'featured') return d[k] ? 1 : 0;
    return d[k];
  });
  await pool.execute(`UPDATE gallery_albums SET ${set} WHERE id=?`, [...vals, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/albums/:id', requireAuth, asyncH(async (req, res) => {
  // items become detached (FK ON DELETE SET NULL). Or purge them:
  await pool.execute('DELETE FROM gallery_items WHERE album_id=?', [req.params.id]);
  await pool.execute('DELETE FROM gallery_albums WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

/* ================= ITEMS (admin) ================= */
const itemSchema = z.object({
  album_id: z.string().optional().nullable(),
  kind: z.enum(['image', 'video']).optional(),
  title: z.string().optional().nullable(),
  url: z.string().min(1),
  thumb_url: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  youtube_id: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  sort_order: z.number().optional(),
});

// Upload a file and create an item (image or video file)
router.post('/upload', requireAuth, upload.single('file'), asyncH(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  const id = uuid();
  const { album_id, title, kind = 'image', caption } = req.body || {};
  await pool.execute(
    'INSERT INTO gallery_items (id,album_id,kind,title,url,caption) VALUES (?,?,?,?,?,?)',
    [id, album_id || null, kind, title || null, url, caption || null]
  );
  res.status(201).json({ id, url });
}));

// Create item from an external URL (e.g. YouTube link, remote image)
router.post('/items', requireAuth, asyncH(async (req, res) => {
  const d = itemSchema.parse(req.body);
  const id = uuid();
  await pool.execute(
    `INSERT INTO gallery_items
       (id,album_id,kind,title,url,thumb_url,caption,youtube_id,duration,sort_order)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      id, d.album_id || null, d.kind || 'image', d.title || null,
      d.url, d.thumb_url || null, d.caption || null,
      d.youtube_id || null, d.duration || null, d.sort_order || 0,
    ]
  );
  res.status(201).json({ id });
}));

router.patch('/items/:id', requireAuth, asyncH(async (req, res) => {
  const d = itemSchema.partial().parse(req.body);
  const keys = Object.keys(d);
  if (!keys.length) return res.json({ ok: true });
  const set = keys.map((k) => `\`${k}\`=?`).join(',');
  const vals = keys.map((k) => d[k]);
  await pool.execute(`UPDATE gallery_items SET ${set} WHERE id=?`, [...vals, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth, asyncH(async (req, res) => {
  await pool.execute('DELETE FROM gallery_items WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
