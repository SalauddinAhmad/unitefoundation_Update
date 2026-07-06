// ================================================================
// Media Library routes
// All endpoints require auth. GET returns metadata + thumb only
// (fast grid). GET /:id returns full url when the picker confirms
// a selection.
// ================================================================
const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');

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

router.post('/', requireAuth, asyncH(async (req, res) => {
  const d = uploadSchema.parse(req.body);
  const id = uuid();
  const uploader = req.user && req.user.sub ? req.user.sub : null;
  await pool.execute(
    `INSERT INTO media_library
       (id, url, thumb_url, filename, mime, size_bytes, width, height, uploaded_by)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      id,
      d.url,
      d.thumb_url || null,
      d.filename || null,
      d.mime || null,
      d.size_bytes || 0,
      d.width || 0,
      d.height || 0,
      uploader,
    ]
  );
  res.status(201).json({ id, url: d.url });
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
