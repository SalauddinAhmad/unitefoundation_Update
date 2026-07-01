const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');
const { sendMail } = require('../services/mailer');

router.get('/', requireAuth, asyncH(async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM messages ORDER BY created_at DESC');
  res.json(rows);
}));

router.post('/', asyncH(async (req, res) => {
  const d = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    subject: z.string().optional(),
    body: z.string().min(1),
  }).parse(req.body);
  const id = uuid();
  await pool.execute(
    'INSERT INTO messages (id,name,email,phone,subject,body) VALUES (?,?,?,?,?,?)',
    [id, d.name, d.email, d.phone || null, d.subject || null, d.body]
  );
  res.status(201).json({ id });
}));

router.patch('/:id', requireAuth, asyncH(async (req, res) => {
  const { status } = z.object({ status: z.enum(['new','read','replied']) }).parse(req.body);
  await pool.execute('UPDATE messages SET status=? WHERE id=?', [status, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth, asyncH(async (req, res) => {
  await pool.execute('DELETE FROM messages WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

router.post('/:id/reply', requireAuth, asyncH(async (req, res) => {
  const d = z.object({ to: z.string().email(), subject: z.string(), body: z.string().min(1) }).parse(req.body);
  await sendMail({ to: d.to, subject: d.subject, html: d.body });
  await pool.execute(
    'INSERT INTO message_replies (message_id,to_email,subject,body) VALUES (?,?,?,?)',
    [req.params.id, d.to, d.subject, d.body]
  );
  await pool.execute('UPDATE messages SET status="replied" WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
