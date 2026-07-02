const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { shortId } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');

router.get('/', asyncH(async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM projects ORDER BY created_at DESC');
  res.json(rows.map(parseGallery));
}));

router.get('/:id', asyncH(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM projects WHERE id=? OR slug=?', [req.params.id, req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json(parseGallery(rows[0]));
}));

function parseGallery(row) {
  if (row && row.gallery && typeof row.gallery === 'string') {
    try { row.gallery = JSON.parse(row.gallery); } catch { /* keep as-is */ }
  }
  return row;
}

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  budget: z.number().optional(),
  raised: z.number().optional(),
  beneficiaries: z.number().optional(),
  status: z.enum(['active','completed','draft']).optional(),
  cover_image_url: z.string().optional(),
});

router.post('/', requireAuth, asyncH(async (req, res) => {
  const d = schema.parse(req.body);
  const id = shortId('P-');
  await pool.execute(
    `INSERT INTO projects (id,title,slug,category,description,content,budget,raised,beneficiaries,status,cover_image_url)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id, d.title, d.slug || id.toLowerCase(), d.category || null, d.description || null, d.content || null,
     d.budget || 0, d.raised || 0, d.beneficiaries || 0, d.status || 'draft', d.cover_image_url || null]
  );
  res.status(201).json({ id });
}));

router.patch('/:id', requireAuth, asyncH(async (req, res) => {
  const d = schema.partial().parse(req.body);
  const keys = Object.keys(d);
  if (!keys.length) return res.json({ ok: true });
  const set = keys.map(k => `\`${k}\`=?`).join(',');
  const vals = keys.map(k => {
    if (k === 'gallery' && d[k] != null) return JSON.stringify(d[k]);
    if (k === 'urgent') return d[k] ? 1 : 0;
    return d[k];
  });
  await pool.execute(`UPDATE projects SET ${set} WHERE id=?`, [...vals, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth, asyncH(async (req, res) => {
  await pool.execute('DELETE FROM projects WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
