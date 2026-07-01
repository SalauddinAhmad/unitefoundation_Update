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
    filename: (_r, file, cb) => cb(null, `${Date.now()}_${file.originalname.replace(/[^\w.\-]/g,'_')}`),
  }),
  limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024 },
});

router.get('/', asyncH(async (_req, res) => {
  const [albums] = await pool.execute('SELECT * FROM gallery_albums ORDER BY created_at DESC');
  const [items] = await pool.execute('SELECT * FROM gallery_items ORDER BY sort_order, created_at DESC');
  res.json({ albums, items });
}));

router.post('/albums', requireAuth, asyncH(async (req, res) => {
  const d = z.object({ title: z.string().min(1), slug: z.string().optional(), cover_url: z.string().optional() }).parse(req.body);
  const id = uuid();
  await pool.execute('INSERT INTO gallery_albums (id,title,slug,cover_url) VALUES (?,?,?,?)',
    [id, d.title, d.slug || null, d.cover_url || null]);
  res.status(201).json({ id });
}));

router.post('/upload', requireAuth, upload.single('file'), asyncH(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  const id = uuid();
  const { album_id, title, kind = 'image' } = req.body || {};
  await pool.execute(
    'INSERT INTO gallery_items (id,album_id,kind,title,url) VALUES (?,?,?,?,?)',
    [id, album_id || null, kind, title || null, url]
  );
  res.status(201).json({ id, url });
}));

router.delete('/:id', requireAuth, asyncH(async (req, res) => {
  await pool.execute('DELETE FROM gallery_items WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
