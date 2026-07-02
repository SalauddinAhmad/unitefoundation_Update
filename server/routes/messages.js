const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');
const { sendMail } = require('../services/mailer');
const { tplWrapContent } = require('../services/emailTemplate');

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
  try {
    await sendMail({ to: d.to, subject: d.subject, html: tplWrapContent({ subject: d.subject, bodyHtml: d.body }) });
  } catch (err) {
    return res.status(502).json({ message: 'SMTP পাঠাতে ব্যর্থ', error: String(err && err.message || err) });
  }
  await pool.execute(
    'INSERT INTO message_replies (message_id,to_email,subject,body) VALUES (?,?,?,?)',
    [req.params.id, d.to, d.subject, d.body]
  );
  await pool.execute('UPDATE messages SET status="replied" WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

// Admin-composed outbound email (not a public contact-form submission)
router.post('/compose', requireAuth, asyncH(async (req, res) => {
  const d = z.object({
    to: z.array(z.string().email()).min(1),
    cc: z.array(z.string().email()).optional().default([]),
    bcc: z.array(z.string().email()).optional().default([]),
    subject: z.string().min(1),
    html: z.string().min(1),
  }).parse(req.body);
  try {
    await sendMail({
      to: d.to.join(','),
      cc: d.cc.join(','),
      bcc: d.bcc.join(','),
      subject: d.subject,
      html: tplWrapContent({ subject: d.subject, bodyHtml: d.html }),
    });
  } catch (err) {
    return res.status(502).json({ message: 'SMTP পাঠাতে ব্যর্থ', error: String(err && err.message || err) });
  }
  await pool.execute(
    'INSERT INTO message_replies (message_id,to_email,subject,body) VALUES (?,?,?,?)',
    [null, d.to[0], d.subject, d.html]
  );
  res.json({ ok: true });
}));

// SMTP diagnostic — verifies transporter can connect & authenticate
router.get('/smtp/test', requireAuth, asyncH(async (_req, res) => {
  const { getTransporter } = require('../services/mailer');
  try {
    const t = getTransporter();
    await t.verify();
    res.json({
      ok: true,
      host: process.env.SMTP_HOST || null,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || 'true') === 'true',
      from: process.env.SMTP_FROM || process.env.SMTP_USER || null,
    });
  } catch (err) {
    res.status(502).json({ ok: false, error: String(err && err.message || err) });
  }
}));

module.exports = router;
