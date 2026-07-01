const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');

router.get('/', asyncH(async (req, res) => {
  const status = req.query.status;
  const params = [];
  let where = '';
  if (status) { where = 'WHERE status=?'; params.push(status); }
  const [rows] = await pool.execute(`SELECT * FROM posts ${where} ORDER BY created_at DESC`, params);
  res.json(rows);
}));

router.get('/:slug', asyncH(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM posts WHERE slug=? OR id=?', [req.params.slug, req.params.slug]);
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
}));

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  cover_image_url: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft','published']).optional(),
});

router.post('/', requireAuth, asyncH(async (req, res) => {
  const d = schema.parse(req.body);
  const id = uuid();
  await pool.execute(
    `INSERT INTO posts (id,title,slug,excerpt,content,cover_image_url,category,status,author_id,published_at)
     VALUES (?,?,?,?,?,?,?,?,?, ${d.status === 'published' ? 'NOW()' : 'NULL'})`,
    [id, d.title, d.slug, d.excerpt || null, d.content || null, d.cover_image_url || null,
     d.category || null, d.status || 'draft', req.user.sub]
  );
  res.status(201).json({ id });
}));

router.patch('/:id', requireAuth, asyncH(async (req, res) => {
  const d = schema.partial().parse(req.body);
  const keys = Object.keys(d);
  if (!keys.length) return res.json({ ok: true });
  const set = keys.map(k => `\`${k}\`=?`).join(',');
  await pool.execute(`UPDATE posts SET ${set} WHERE id=?`, [...keys.map(k => d[k]), req.params.id]);
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth, asyncH(async (req, res) => {
  await pool.execute('DELETE FROM posts WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
