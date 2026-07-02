const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');
const { sendMail } = require('../services/mailer');

// Every /admin/* endpoint is super-admin only.
router.use(requireAuth, requireSuperAdmin);

router.get('/users', asyncH(async (_req, res) => {
  const [rows] = await pool.execute('SELECT id,name,email,role,two_factor_enabled,created_at FROM users ORDER BY created_at DESC');
  res.json(rows);
}));

router.post('/users', asyncH(async (req, res) => {
  const d = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(['super_admin','admin','editor','moderator','viewer']),
    password: z.string().min(8),
    sendEmail: z.boolean().optional(),
  }).parse(req.body);
  const id = uuid();
  const hash = await bcrypt.hash(d.password, 12);
  await pool.execute(
    'INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)',
    [id, d.name, d.email, hash, d.role]
  );

  let emailSent = false, emailError = null;
  if (d.sendEmail) {
    try {
      await sendMail({
        to: d.email,
        subject: 'Unite Foundation — Account created',
        html: `<p>আপনার অ্যাকাউন্ট তৈরি হয়েছে।</p><p>Email: <b>${d.email}</b><br/>Password: <b>${d.password}</b></p><p>প্রথম লগইনের পর পাসওয়ার্ড পরিবর্তন করুন।</p>`,
      });
      emailSent = true;
    } catch (e) {
      console.error('[admin create] email failed:', e);
      emailError = String((e && e.message) || e);
    }
  }
  res.status(201).json({ id, emailSent, emailError });
}));

router.post('/users/:id/reset-credentials', asyncH(async (req, res) => {
  const d = z.object({ password: z.string().min(8), sendEmail: z.boolean().optional() }).parse(req.body);
  const hash = await bcrypt.hash(d.password, 12);
  await pool.execute('UPDATE users SET password_hash=? WHERE id=?', [hash, req.params.id]);
  let emailSent = false, emailError = null;
  if (d.sendEmail) {
    const [rows] = await pool.execute('SELECT email FROM users WHERE id=?', [req.params.id]);
    if (rows[0]) {
      try {
        await sendMail({
          to: rows[0].email,
          subject: 'Unite Foundation — Password reset',
          html: `<p>আপনার নতুন password: <b>${d.password}</b></p>`,
        });
        emailSent = true;
      } catch (e) {
        console.error('[admin reset] email failed:', e);
        emailError = String((e && e.message) || e);
      }
    } else {
      emailError = 'User not found';
    }
  }
  res.json({ ok: true, emailSent, emailError });
}));

router.delete('/users/:id', asyncH(async (req, res) => {
  await pool.execute('DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
