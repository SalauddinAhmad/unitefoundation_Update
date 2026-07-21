const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid, token } = require('../utils/uid');
const { authLimiter } = require('../middleware/rateLimit');
const { requireAuth } = require('../middleware/auth');
const { sendMail } = require('../services/mailer');
const { tplLoginOtp, tplForgotPassword, subjectOf } = require('../services/emailTemplate');
const { logActivity } = require('../services/audit');

const signToken = (u) => jwt.sign(
  { sub: u.id, role: u.role, email: u.email, name: u.name },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
);

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

function attachAuditUser(req, user) {
  req.user = { sub: user.id, id: user.id, email: user.email, name: user.name, role: user.role };
}

// POST /auth/login
router.post('/login', authLimiter, asyncH(async (req, res) => {
  const { email, password } = z.object({
    email: z.string().email(), password: z.string().min(1),
  }).parse(req.body);

  const [rows] = await pool.execute('SELECT * FROM users WHERE email=? LIMIT 1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    logActivity({ req, action: 'login_failed', entity: 'auth', summary: `Failed login: ${email}`, status: 401, meta: { email } });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.two_factor_enabled) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    await pool.execute('INSERT INTO otp_codes (user_id, code, expires_at) VALUES (?,?,?)', [user.id, code, expires]);
    try {
      await sendMail({
        to: user.email,
        subject: subjectOf('login_otp', { code }),
        html: tplLoginOtp({ code }),
      });
    } catch (e) { console.error('OTP mail failed', e); }
    return res.json({ requiresOtp: true });
  }

  attachAuditUser(req, user);
  logActivity({ req, action: 'login', entity: 'auth', summary: `${user.name || user.email} লগইন করেছেন`, status: 200, meta: { email: user.email } });
  res.json({ token: signToken(user), user: publicUser(user) });
}));

// POST /auth/verify-otp
router.post('/verify-otp', authLimiter, asyncH(async (req, res) => {
  const { email, code } = z.object({ email: z.string().email(), code: z.string().length(6) }).parse(req.body);
  const [rows] = await pool.execute('SELECT * FROM users WHERE email=? LIMIT 1', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid' });
  const [otps] = await pool.execute(
    'SELECT * FROM otp_codes WHERE user_id=? AND code=? AND used=0 AND expires_at>NOW() ORDER BY id DESC LIMIT 1',
    [user.id, code]
  );
  if (!otps[0]) return res.status(401).json({ message: 'Invalid or expired code' });
  await pool.execute('UPDATE otp_codes SET used=1 WHERE id=?', [otps[0].id]);
  attachAuditUser(req, user);
  logActivity({ req, action: 'login', entity: 'auth', summary: `${user.name || user.email} 2FA দিয়ে লগইন করেছেন`, status: 200, meta: { email: user.email, two_factor: true } });
  res.json({ token: signToken(user), user: publicUser(user) });
}));

// GET /auth/me
router.get('/me', requireAuth, asyncH(async (req, res) => {
  const [rows] = await pool.execute('SELECT id,name,email,role FROM users WHERE id=?', [req.user.sub]);
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json({ user: rows[0] });
}));

// POST /auth/logout (client just drops token; endpoint exists for symmetry)
router.post('/logout', requireAuth, (_req, res) => res.json({ ok: true }));

// POST /auth/forgot-password
router.post('/forgot-password', authLimiter, asyncH(async (req, res) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);
  const [rows] = await pool.execute('SELECT id FROM users WHERE email=?', [email]);
  if (rows[0]) {
    const t = token(24);
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await pool.execute('INSERT INTO password_resets (token, user_id, expires_at) VALUES (?,?,?)', [t, rows[0].id, expires]);
    const link = `${process.env.FRONTEND_URL}/reset-password/${t}`;
    try {
      await sendMail({
        to: email,
        subject: subjectOf('forgot_password'),
        html: tplForgotPassword({ resetUrl: link }),
      });
    } catch (e) { console.error('Reset mail failed', e); }
  }
  res.json({ ok: true });
}));

// POST /auth/reset-password
router.post('/reset-password', authLimiter, asyncH(async (req, res) => {
  const { token: t, password } = z.object({
    token: z.string().min(10), password: z.string().min(8),
  }).parse(req.body);
  const [rows] = await pool.execute('SELECT * FROM password_resets WHERE token=? AND expires_at>NOW()', [t]);
  const row = rows[0];
  if (!row) return res.status(400).json({ message: 'Invalid or expired token' });
  const hash = await bcrypt.hash(password, 12);
  await pool.execute('UPDATE users SET password_hash=? WHERE id=?', [hash, row.user_id]);
  await pool.execute('DELETE FROM password_resets WHERE token=?', [t]);
  res.json({ ok: true });
}));

// POST /auth/change-password  (self-service, requires current password)
router.post('/change-password', requireAuth, asyncH(async (req, res) => {
  const { currentPassword, newPassword } = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে'),
  }).parse(req.body);

  const [rows] = await pool.execute('SELECT * FROM users WHERE id=? LIMIT 1', [req.user.sub]);
  const user = rows[0];
  if (!user) return res.status(404).json({ message: 'User not found' });

  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'বর্তমান পাসওয়ার্ড সঠিক নয়' });

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'নতুন পাসওয়ার্ড পুরনো পাসওয়ার্ড থেকে আলাদা হতে হবে' });
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await pool.execute('UPDATE users SET password_hash=? WHERE id=?', [hash, user.id]);
  res.json({ ok: true });
}));

module.exports = router;
