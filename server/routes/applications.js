const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');

const KINDS = ['volunteer','member','career','donor'];

router.get('/:kind', requireAuth, asyncH(async (req, res) => {
  if (!KINDS.includes(req.params.kind)) return res.status(400).json({ message: 'Invalid kind' });
  const [rows] = await pool.execute('SELECT * FROM applications WHERE kind=? ORDER BY created_at DESC', [req.params.kind]);
  res.json(rows);
}));

// pluralised list endpoints for spec compatibility
['volunteers','members','careers','donors'].forEach(p => {
  const kind = p.replace(/s$/, '');
  router.get('/' + p, requireAuth, asyncH(async (_req, res) => {
    const [rows] = await pool.execute('SELECT * FROM applications WHERE kind=? ORDER BY created_at DESC', [kind]);
    res.json(rows);
  }));
});

router.post('/:kind', asyncH(async (req, res) => {
  if (!KINDS.includes(req.params.kind)) return res.status(400).json({ message: 'Invalid kind' });
  const data = z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    profession: z.string().optional(),
    message: z.string().optional(),
    extra: z.any().optional(),
  }).parse(req.body);
  const id = uuid();
  await pool.execute(
    `INSERT INTO applications (id,kind,name,phone,email,address,profession,message,extra)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, req.params.kind, data.name, data.phone || null, data.email || null, data.address || null,
     data.profession || null, data.message || null, data.extra ? JSON.stringify(data.extra) : null]
  );
  res.status(201).json({ id, status: 'new' });
}));

router.patch('/:kind/:id', requireAuth, asyncH(async (req, res) => {
  const { status } = z.object({ status: z.enum(['new','reviewing','approved','rejected']) }).parse(req.body);
  await pool.execute('UPDATE applications SET status=? WHERE id=? AND kind=?', [status, req.params.id, req.params.kind]);
  res.json({ ok: true });
}));

module.exports = router;
