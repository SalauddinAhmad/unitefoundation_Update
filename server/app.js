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
const fs = require('fs');

const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimit');

const app = express();

// --- Core middleware ---
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// --- CORS ---
// Keep CORS before body parsing. If a dashboard save request is rejected while
// parsing JSON (large/invalid body), the browser still receives a readable JSON
// error instead of a generic "Failed to fetch" network failure.
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

// Form Manager saves should be tiny JSON payloads. If a stale dashboard tab or
// old localStorage cache still tries to send embedded base64 media, reject it
// before express.json() reads the full body; shared cPanel/LiteSpeed can time
// out on those large PUTs and the browser reports only "Failed to fetch".
app.use('/forms', (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next();
  const len = Number(req.headers['content-length'] || 0);
  if (len > 200 * 1024) {
    return res.status(413).json({
      message: 'Form payload is too large. Remove embedded/base64 images and choose images from Media Library again.',
    });
  }
  return next();
});

// Body limits raised to 25mb so base64-encoded image uploads
// (gallery / blog cover / project cover) don't get truncated.
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
// Image links are stored relative ("/uploads/...") so a server IP or domain
// change never breaks them; these two middlewares normalize what goes into
// the DB and absolutize what goes out to the browser.
const { mediaUrlRequestMiddleware, mediaUrlResponseMiddleware } = require('./utils/mediaUrl');
app.use(mediaUrlRequestMiddleware);
app.use(mediaUrlResponseMiddleware);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Global rate limit ---
app.use(globalLimiter);

// --- Static uploads ---
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || './uploads')));

// --- Health ---
app.get('/', (_req, res) => res.json({ ok: true, service: 'unite-foundation-api', ts: new Date().toISOString() }));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/health/deploy', (_req, res) => {
  // Deploy diagnostics. `appRoot` is the directory Passenger actually loaded
  // the app from — the single most useful signal when an upload succeeds but
  // the live release never changes (wrong Application Root / remote path).
  let release = process.env.DEPLOY_RELEASE || 'local';
  let releaseFileMtime = null;
  let releaseFileFound = false;
  const releasePath = path.join(__dirname, 'DEPLOY_RELEASE');
  try {
    release = fs.readFileSync(releasePath, 'utf8').trim() || release;
    releaseFileFound = true;
    releaseFileMtime = fs.statSync(releasePath).mtime.toISOString();
  } catch { /* local development has no release marker */ }

  let restartMtime = null;
  try {
    restartMtime = fs.statSync(path.join(__dirname, 'tmp', 'restart.txt')).mtime.toISOString();
  } catch { /* no passenger restart marker */ }

  let appJsMtime = null;
  try {
    appJsMtime = fs.statSync(path.join(__dirname, 'app.js')).mtime.toISOString();
  } catch { /* ignore */ }

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.json({
    ok: true,
    release,
    releaseFileFound,
    releaseFileMtime,
    restartMtime,
    appJsMtime,
    appRoot: __dirname,
    node: process.version,
    pid: process.pid,
    startedAt: new Date(Date.now() - Math.round(process.uptime() * 1000)).toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    mailTransport: process.env.SMTP_TRANSPORT || 'sendmail',
  });
});


// --- Crash guards -------------------------------------------------
// On shared cPanel/Passenger hosting a single unhandled async error kills the
// worker; Passenger then shows "running" while every request 503s until the
// next spawn. Log and keep serving instead of dying.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason && reason.stack ? reason.stack : reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err && err.stack ? err.stack : err);
});

// One-time maintenance: move any base64 `data:` images stored in the DB into
// real files. Huge inline images made /projects and /posts several MB, which
// the host would cut off mid-response (partial data on the site).
let offloadRunning = false;
let offloadResult = null;
async function triggerOffload() {
  if (offloadRunning) return { ok: true, status: 'running' };
  offloadRunning = true;
  try {
    const { runImageOffload } = require('./services/imageOffload');
    const converted = await runImageOffload();
    offloadResult = { converted: converted.length, at: new Date().toISOString() };
    return { ok: true, ...offloadResult };
  } catch (e) {
    offloadResult = { error: e.message, at: new Date().toISOString() };
    return { ok: false, ...offloadResult };
  } finally {
    offloadRunning = false;
  }
}
app.get('/health/images', (_req, res) => res.json({ ok: true, running: offloadRunning, last: offloadResult }));
app.post('/health/images/fix', async (_req, res) => res.json(await triggerOffload()));
// Run automatically once (marker file), so every Passenger respawn doesn't
// re-scan the whole database and blow the host's CPU/EP limits.
const offloadMarker = path.join(__dirname, '.image-offload-done');
if (!fs.existsSync(offloadMarker) && process.env.DISABLE_BOOT_OFFLOAD !== 'true') {
  setTimeout(() => {
    triggerOffload()
      .then(() => { try { fs.writeFileSync(offloadMarker, new Date().toISOString()); } catch { /* ignore */ } })
      .catch(() => {});
  }, 5000).unref?.();
}



// --- Public diagnostics (no secrets exposed) ---
// SMTP connectivity/auth check — public so it works even when the login token is broken
app.get('/health/smtp', async (req, res) => {
  try {
    const { resolveTransporter, getActiveConfig } = require('./services/mailer');
    await resolveTransporter(req.query.probe === '1');
    const cfg = getActiveConfig() || {};
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
        transport: cfg.transport || 'smtp',
        path: cfg.path || null,
        host: cfg.host || null,
        port: cfg.port || null,
        secure: cfg.secure,
      });
    }
    res.json({
      ok: true,
      transport: cfg.transport || 'smtp',
      path: cfg.path || null,
      host: cfg.host || null,
      port: cfg.port || null,
      secure: cfg.secure,
      note: cfg.transport === 'sendmail' ? 'Run with &send=1 to verify actual delivery.' : undefined,
    });

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
const { autoAuditMiddleware } = require('./services/audit');
app.use(autoAuditMiddleware);

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
app.use('/media', require('./routes/media'));
app.use('/forms', require('./routes/forms'));
app.use('/sslcommerz', require('./routes/sslcommerz'));
app.use('/email-templates', require('./routes/emailTemplates'));
app.use('/newsletter', require('./routes/newsletter'));

// --- 404 + errors ---
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  const server = app.listen(PORT, () => console.log(`API listening on :${PORT}`));

  // Keep cPanel/Passenger entry processes from being tied up by idle sockets.
  server.keepAliveTimeout = Number(process.env.HTTP_KEEP_ALIVE_TIMEOUT_MS || 5000);
  server.headersTimeout = Number(process.env.HTTP_HEADERS_TIMEOUT_MS || 10000);
  server.requestTimeout = Number(process.env.HTTP_REQUEST_TIMEOUT_MS || 30000);

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down API...`);
    server.close(async () => {
      try {
        await require('./db/pool').end();
        require('./services/mailer').closeTransporter();
      } catch (err) {
        console.error('Graceful shutdown cleanup failed:', err);
      } finally {
        process.exit(0);
      }
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
