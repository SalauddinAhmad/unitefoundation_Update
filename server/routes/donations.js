const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { shortId } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');
const { validateEmail } = require('../utils/emailValidator');

router.get('/', requireAuth, asyncH(async (req, res) => {
  const from = /^\d{4}-\d{2}-\d{2}$/.test(req.query.from) ? req.query.from : null;
  const to = /^\d{4}-\d{2}-\d{2}$/.test(req.query.to) ? req.query.to : null;
  const parts = [];
  const args = [];
  if (from) { parts.push('created_at >= ?'); args.push(`${from} 00:00:00`); }
  if (to)   { parts.push('created_at <= ?'); args.push(`${to} 23:59:59`); }
  const where = parts.length ? `WHERE ${parts.join(' AND ')}` : '';
  const limit = req.query.all === '1' ? 100000 : 500;
  const [rows] = await pool.execute(
    `SELECT * FROM donations ${where} ORDER BY created_at DESC LIMIT ${limit}`,
    args
  );
  res.json(rows);
}));


router.get('/:id', requireAuth, asyncH(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM donations WHERE id=?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
}));

router.post('/', asyncH(async (req, res) => {
  const data = z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    amount: z.number().positive(),
    method: z.enum(['bkash','nagad','rocket','bank','card','sslcommerz']),
    area: z.string().optional(),
    transaction_id: z.string().optional(),
    note: z.string().optional(),
  }).parse(req.body);
  if (data.email) {
    const ev = validateEmail(data.email);
    if (!ev.ok) return res.status(400).json({ message: ev.message, code: ev.code });
  }
  const id = shortId('TXN-');
  await pool.execute(
    `INSERT INTO donations (id,name,phone,email,amount,method,area,transaction_id,note,status)
     VALUES (?,?,?,?,?,?,?,?,?, 'pending')`,
    [id, data.name, data.phone || null, data.email || null, data.amount, data.method, data.area || null, data.transaction_id || null, data.note || null]
  );
  res.status(201).json({ id, status: 'pending' });
}));

router.patch('/:id', requireAuth, asyncH(async (req, res) => {
  const { status } = z.object({ status: z.enum(['pending','completed','failed']) }).parse(req.body);
  await pool.execute('UPDATE donations SET status=? WHERE id=?', [status, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth, asyncH(async (req, res) => {
  await pool.execute('DELETE FROM donations WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
