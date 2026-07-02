// ================================================================
// Unite Foundation API — Entry Point
// Compatible with cPanel Node.js App Manager (Passenger)
// ================================================================
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimit');

const app = express();

// --- Core middleware ---
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- CORS ---
// Built-in safe defaults so the site keeps working even if CORS_ORIGINS
// env var is missing on the server (e.g. after re-creating the Node.js app).
const DEFAULT_ORIGINS = [
  'https://unitefoundation.bd',
  'https://www.unitefoundation.bd',
  'http://localhost:8080',
];
const envOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const origins = [...new Set([...DEFAULT_ORIGINS, ...envOrigins])];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origins.includes(origin)) return cb(null, true);
    // Allow Lovable preview/staging origins
    if (/^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(origin)) return cb(null, true);
    if (/^https:\/\/[a-z0-9-]+\.lovableproject\.com$/.test(origin)) return cb(null, true);
    if (/^https:\/\/[a-z0-9-]+\.lovable\.dev$/.test(origin)) return cb(null, true);
    return cb(null, false); // respond without CORS headers instead of 500
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
}));

// --- Global rate limit ---
app.use(globalLimiter);

// --- Static uploads ---
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || './uploads')));

// --- Health ---
app.get('/', (_req, res) => res.json({ ok: true, service: 'unite-foundation-api', ts: new Date().toISOString() }));
app.get('/health', (_req, res) => res.json({ ok: true }));

// --- Public diagnostics (no secrets exposed) ---
// SMTP connectivity/auth check — public so it works even when the login token is broken
app.get('/health/smtp', async (req, res) => {
  try {
    const { getTransporter } = require('./services/mailer');
    await getTransporter().verify();
    // ?send=1 → actually send a real test email to the SMTP account itself
    // (self-send only, so this cannot be abused to spam others)
    if (req.query.send === '1') {
      const { sendMail } = require('./services/mailer');
      const self = process.env.SMTP_USER;
      const info = await sendMail({
        to: self,
        subject: 'SMTP self-test — Unite Foundation',
        html: `<p>SMTP send test OK at ${new Date().toISOString()}</p>`,
      });
      return res.json({
        ok: true,
        sent: true,
        to: self,
        messageId: info && info.messageId,
        response: info && info.response,
        host: process.env.SMTP_HOST || null,
        port: Number(process.env.SMTP_PORT || 465),
      });
    }
    res.json({ ok: true, host: process.env.SMTP_HOST || null, port: Number(process.env.SMTP_PORT || 465) });
  } catch (err) {
    res.status(502).json({ ok: false, error: String((err && err.message) || err), code: err && err.code, responseCode: err && err.responseCode });
  }
});

// DB connectivity check — public, exposes NO secrets.
// Shows masked config so we can verify what env vars the running process actually received.
app.get('/health/db', async (_req, res) => {
  const pw = process.env.DB_PASSWORD || '';
  const info = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || null,
    database: process.env.DB_NAME || null,
    passwordSet: Boolean(pw),
    passwordLength: pw.length,
    // common cPanel env-var pitfalls (safe to expose — reveals nothing about the value itself)
    passwordHasLeadingOrTrailingSpace: pw !== pw.trim(),
    passwordHasQuotes: /^["']|["']$/.test(pw),
    pid: process.pid,
    startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  };
  try {
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection({
      host: info.host,
      port: info.port,
      user: process.env.DB_USER,
      password: pw,
      database: process.env.DB_NAME,
      connectTimeout: 8000,
    });
    const [rows] = await conn.query('SELECT DATABASE() AS db, CURRENT_USER() AS current_user_full');
    await conn.end();
    res.json({ ok: true, ...info, connectedAs: rows[0] && rows[0].current_user_full, db: rows[0] && rows[0].db });
  } catch (err) {
    res.status(502).json({ ok: false, ...info, error: String((err && err.message) || err), code: err && err.code });
  }
});

// JWT self-test — detects missing/changed JWT_SECRET and inconsistent worker processes.
// secretFp is a non-reversible 8-char fingerprint (safe to expose).
app.get('/health/auth', (req, res) => {
  const jwt = require('jsonwebtoken');
  const crypto = require('crypto');
  const secret = process.env.JWT_SECRET || '';
  const out = {
    ok: false,
    secretSet: Boolean(secret),
    secretFp: secret ? crypto.createHash('sha256').update(secret).digest('hex').slice(0, 8) : null,
    pid: process.pid,
  };
  if (secret) {
    try {
      jwt.verify(jwt.sign({ t: 1 }, secret, { expiresIn: '1m' }), secret);
      out.ok = true;
    } catch (e) {
      out.selfTestError = String((e && e.message) || e);
    }
  }
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (token && secret) {
    try {
      const d = jwt.verify(token, secret);
      out.token = { valid: true, expiresAt: d.exp ? new Date(d.exp * 1000).toISOString() : null };
    } catch (e) {
      out.token = { valid: false, reason: String((e && e.message) || e) };
    }
  }
  res.json(out);
});

// --- Auto-audit (records mutating requests from authenticated users) ---
const { autoAuditMiddleware, logActivity } = require('./services/audit');
app.use(autoAuditMiddleware);

// Log successful/failed logins explicitly (auto-audit needs req.user which is not set on /auth/login)
app.use((req, res, next) => {
  if (req.method === 'POST' && (req.path === '/auth/login' || req.path === '/login')) {
    res.on('finish', () => {
      const email = req.body && req.body.email;
      if (res.statusCode === 200) {
        logActivity({ req, action: 'login', entity: 'auth', summary: `Login: ${email}`, status: 200, meta: { email } });
      } else if (res.statusCode === 401) {
        logActivity({ req, action: 'login_failed', entity: 'auth', summary: `Failed login: ${email}`, status: 401, meta: { email } });
      }
    });
  }
  next();
});

// --- Routes ---
app.use('/auth', require('./routes/auth'));
app.use('/donations', require('./routes/donations'));
app.use('/applications', require('./routes/applications'));
app.use('/projects', require('./routes/projects'));
app.use('/posts', require('./routes/posts'));
app.use('/gallery', require('./routes/gallery'));
app.use('/messages', require('./routes/messages'));
app.use('/settings', require('./routes/settings'));
app.use('/team', require('./routes/team'));
app.use('/partners', require('./routes/partners'));
app.use('/admin', require('./routes/admin'));
app.use('/stats', require('./routes/stats'));
app.use('/logs', require('./routes/logs'));

// --- 404 + errors ---
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`API listening on :${PORT}`));
}

module.exports = app;
