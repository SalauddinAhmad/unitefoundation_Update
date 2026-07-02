const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');

// Public list (only active by default, unless ?all=1 with auth)
router.get('/', asyncH(async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT * FROM partners WHERE status='active' ORDER BY sort_order ASC, created_at DESC"
  );
  res.json(rows.map(parseContent));
}));

// Admin — see all including drafts
router.get('/all', requireAuth, asyncH(async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM partners ORDER BY sort_order ASC, created_at DESC');
  res.json(rows.map(parseContent));
}));

router.get('/:slug', asyncH(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM partners WHERE slug=? OR id=?', [req.params.slug, req.params.slug]);
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json(parseContent(rows[0]));
}));

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  logo_url: z.string().optional().nullable(),
  cover_url: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  content: z.any().optional(), // JSON object → stored as string
  website: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  theme: z.string().optional().nullable(),
  established: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  sort_order: z.number().optional(),
  status: z.enum(['active', 'draft']).optional(),
});

router.post('/', requireAuth, asyncH(async (req, res) => {
  const d = schema.parse(req.body);
  const id = uuid();
  await pool.execute(
    `INSERT INTO partners
      (id,name,slug,logo_url,cover_url,tagline,description,content,website,category,theme,established,address,phone,sort_order,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id, d.name, d.slug, d.logo_url || null, d.cover_url || null,
      d.tagline || null, d.description || null,
      d.content ? JSON.stringify(d.content) : null,
      d.website || null, d.category || null, d.theme || 'green',
      d.established || null, d.address || null, d.phone || null,
      d.sort_order || 0, d.status || 'active',
    ]
  );
  res.status(201).json({ id });
}));

router.patch('/:id', requireAuth, asyncH(async (req, res) => {
  const d = schema.partial().parse(req.body);
  const keys = Object.keys(d);
  if (!keys.length) return res.json({ ok: true });
  const set = keys.map(k => `\`${k}\`=?`).join(',');
  const vals = keys.map(k => (k === 'content' && d[k] != null ? JSON.stringify(d[k]) : d[k]));
  await pool.execute(`UPDATE partners SET ${set} WHERE id=?`, [...vals, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth, asyncH(async (req, res) => {
  await pool.execute('DELETE FROM partners WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

function parseContent(row) {
  if (!row) return row;
  if (row.content && typeof row.content === 'string') {
    try { row.content = JSON.parse(row.content); } catch { /* leave as string */ }
  }
  return row;
}

module.exports = router;
