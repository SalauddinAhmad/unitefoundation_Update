const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');
const { sendMail } = require('../services/mailer');
const { tplAdminCreated, tplPasswordChanged, subjectOf } = require('../services/emailTemplate');

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
        subject: subjectOf('admin_created', { name: d.name, email: d.email }),
        html: tplAdminCreated({ name: d.name, email: d.email, password: d.password }),
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
          subject: 'Unite Foundation — আপনার পাসওয়ার্ড রিসেট করা হয়েছে',
          html: tplPasswordChanged({ password: d.password }),
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

router.patch('/users/:id/role', asyncH(async (req, res) => {
  const d = z.object({
    role: z.enum(['super_admin','admin','editor','moderator','viewer']),
  }).parse(req.body);

  const [target] = await pool.execute('SELECT role FROM users WHERE id=?', [req.params.id]);
  if (!target[0]) return res.status(404).json({ message: 'User not found' });

  // Prevent demoting yourself out of super_admin.
  if (req.params.id === req.user.sub && target[0].role === 'super_admin' && d.role !== 'super_admin') {
    return res.status(400).json({ message: 'নিজের Super Admin রোল পরিবর্তন করা যাবে না' });
  }
  // Prevent demoting the last super_admin.
  if (target[0].role === 'super_admin' && d.role !== 'super_admin') {
    const [cnt] = await pool.execute("SELECT COUNT(*) AS c FROM users WHERE role='super_admin'");
    if ((cnt[0]?.c || 0) <= 1) {
      return res.status(400).json({ message: 'সর্বশেষ Super Admin এর রোল পরিবর্তন করা যাবে না' });
    }
  }
  await pool.execute('UPDATE users SET role=? WHERE id=?', [d.role, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/users/:id', asyncH(async (req, res) => {
  if (req.params.id === req.user.sub) {
    return res.status(400).json({ message: 'নিজের অ্যাকাউন্ট মুছতে পারবেন না' });
  }
  // Prevent deleting the last super_admin.
  const [target] = await pool.execute('SELECT role FROM users WHERE id=?', [req.params.id]);
  if (target[0]?.role === 'super_admin') {
    const [cnt] = await pool.execute("SELECT COUNT(*) AS c FROM users WHERE role='super_admin'");
    if ((cnt[0]?.c || 0) <= 1) {
      return res.status(400).json({ message: 'সর্বশেষ Super Admin মুছে ফেলা যাবে না' });
    }
  }
  await pool.execute('DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));


module.exports = router;
