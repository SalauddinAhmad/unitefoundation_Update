// ============================================================
// Activity / audit logger
// Writes to the activity_logs table. Never throws — logging
// failures must not break the underlying request.
// ============================================================
const db = require('../db/pool');

/**
 * Persist one activity row.
 * @param {object} p
 * @param {object} [p.req]        Express req (used for user + ip + UA when present)
 * @param {string} p.action       create|update|delete|login|login_failed|logout|password_change|role_change|export|other
 * @param {string} p.entity       Domain object e.g. "posts", "settings"
 * @param {string|number} [p.entityId]
 * @param {string} [p.summary]    Short human message
 * @param {object} [p.meta]       Extra JSON metadata (never store secrets/passwords)
 * @param {number} [p.status]     HTTP status (override)
 */
async function logActivity(p) {
  try {
    const req = p.req || {};
    const u = req.user || {};
    const ip =
      (req.headers && (req.headers['x-forwarded-for'] || '').split(',')[0].trim()) ||
      req.ip ||
      null;
    const ua = req.headers && req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 255) : null;

    await db.query(
      `INSERT INTO activity_logs
       (user_id, user_email, user_name, user_role, action, entity, entity_id,
        method, path, status, ip, user_agent, summary, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        u.id || u.sub || null,
        u.email || null,
        u.name || null,
        u.role || null,
        String(p.action || 'other').slice(0, 64),
        String(p.entity || 'unknown').slice(0, 64),
        p.entityId != null ? String(p.entityId).slice(0, 64) : null,
        req.method || null,
        req.originalUrl ? String(req.originalUrl).slice(0, 255) : null,
        p.status != null ? p.status : (req.res && req.res.statusCode) || null,
        ip,
        ua,
        p.summary ? String(p.summary).slice(0, 500) : null,
        p.meta ? JSON.stringify(p.meta) : null,
      ],
    );
  } catch (e) {
    // Silent — audit must never break the request
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[audit] log failed:', e && e.message);
    }
  }
}

// Bangla labels for common entities — used to build human-readable summaries
const ENTITY_BN = {
  posts: 'ব্লগ', projects: 'প্রকল্প', donations: 'ডোনেশন', settings: 'সেটিংস',
  admins: 'অ্যাডমিন', messages: 'বার্তা', gallery: 'গ্যালারি', team: 'টিম মেম্বার',
  partners: 'পার্টনার', applications: 'আবেদন', forms: 'ফর্ম', media: 'মিডিয়া',
  auth: 'অথ', logs: 'লগ', users: 'ইউজার', albums: 'অ্যালবাম', items: 'আইটেম',
};

const ACTION_BN = {
  create: 'তৈরি করেছেন', update: 'আপডেট করেছেন', delete: 'ডিলিট করেছেন',
  login: 'লগইন করেছেন', login_failed: 'লগইন ব্যর্থ হয়েছে', logout: 'লগআউট করেছেন',
  password_change: 'পাসওয়ার্ড পরিবর্তন করেছেন', role_change: 'রোল পরিবর্তন করেছেন',
};

const SENSITIVE_KEY_RE = /(password|pass|token|secret|otp|hash|authorization|cookie)/i;

function sanitizeAuditBody(body) {
  if (!body || typeof body !== 'object') return null;
  return Object.keys(body).reduce((acc, k) => {
    const v = body[k];
    if (v == null) return acc;
    if (SENSITIVE_KEY_RE.test(k)) {
      acc[k] = '[redacted]';
      return acc;
    }
    acc[k] = v;
    return acc;
  }, {});
}

function readAuditBody(req, initialBody) {
  const base = sanitizeAuditBody(initialBody || req.body);
  const out = base ? { ...base } : {};

  // Multer parses multipart/form-data after this middleware has registered,
  // so file details are only available at finish time. Keep only safe metadata.
  if (req.file) {
    out.filename = req.file.originalname || req.file.filename || out.filename;
    out.file_mime = req.file.mimetype || null;
    out.file_size = req.file.size || (req.file.buffer && req.file.buffer.length) || null;
  }
  if (Array.isArray(req.files)) {
    out.files_count = req.files.length;
    const first = req.files[0];
    if (first) out.filename = first.originalname || first.filename || out.filename;
  }
  return Object.keys(out).length ? out : null;
}

// Pick a short "identifier" from a request body — a name/title we can show
// in the log so the row is meaningful ("Ali-এর টিম মেম্বার আপডেট করেছেন").
function pickBodyLabel(body) {
  if (!body || typeof body !== 'object') return null;
  const keys = ['name', 'title', 'title_bn', 'title_en', 'subject', 'label', 'filename', 'email'];
  for (const k of keys) {
    if (body[k] && typeof body[k] === 'string' && body[k].trim()) {
      return body[k].trim().slice(0, 80);
    }
  }
  return null;
}

// List changed fields in Bangla (for PATCH/PUT) so admins see WHAT was edited.
function pickChangedFields(body) {
  if (!body || typeof body !== 'object') return [];
  const FIELD_BN = {
    name: 'নাম', title: 'শিরোনাম', bio: 'পরিচিতি', photo: 'ছবি', image: 'ছবি',
    cover: 'কভার', cover_image: 'কভার', avatar: 'অ্যাভাটার', logo: 'লোগো',
    role: 'রোল', email: 'ইমেইল', phone: 'ফোন', address: 'ঠিকানা',
    content: 'বিষয়বস্তু', body: 'বিষয়বস্তু', description: 'বিবরণ',
    status: 'স্ট্যাটাস', published: 'প্রকাশনা', order: 'ক্রম', sort_order: 'ক্রম',
    facebook: 'ফেসবুক', linkedin: 'লিঙ্কডইন', youtube: 'ইউটিউব',
    slug: 'স্লাগ', category: 'ক্যাটাগরি', tags: 'ট্যাগ',
  };
  return Object.keys(body)
    .filter(k => k !== 'id')
    .map(k => FIELD_BN[k] || k)
    .slice(0, 6);
}

function buildSummary(action, entity, entityId, body) {
  const entBn = ENTITY_BN[entity] || entity;
  const actBn = ACTION_BN[action] || action;
  const label = pickBodyLabel(body);
  const idPart = entityId ? ` (#${String(entityId).slice(0, 12)})` : '';
  const namePart = label ? ` "${label}"` : '';
  let base = `${entBn}${namePart}${idPart} ${actBn}`;
  if (action === 'update') {
    const fields = pickChangedFields(body);
    if (fields.length) base += ` — পরিবর্তিত: ${fields.join(', ')}`;
  }
  return base;
}

function detectAuditTarget(req, method) {
  const seg = (req.originalUrl || req.url || '').split('?')[0].split('/').filter(Boolean);
  const first = seg[0] || 'unknown';
  const second = seg[1] || '';
  let entity = first;
  let entityId = seg.length > 1 ? seg[seg.length - 1] : null;

  if (first === 'admin' && second === 'users') {
    entity = 'admins';
    entityId = seg[2] || null;
  } else if (first === 'gallery' && second === 'albums') {
    entity = 'albums';
    entityId = seg[2] || null;
  } else if (first === 'gallery' && second === 'items') {
    entity = 'gallery';
    entityId = seg[2] || null;
  } else if (first === 'gallery' && second === 'upload') {
    entity = 'media';
    entityId = null;
  }

  let action =
    method === 'POST' ? 'create' :
    method === 'DELETE' ? 'delete' :
    method === 'PUT' || method === 'PATCH' ? 'update' : 'other';

  if (first === 'auth' && second === 'logout') action = 'logout';
  if (first === 'auth' && second === 'change-password') action = 'password_change';
  if (first === 'admin' && second === 'users' && seg[3] === 'role') action = 'role_change';
  if (first === 'admin' && second === 'users' && seg[3] === 'reset-credentials') action = 'password_change';

  return { entity, entityId, action };
}

/**
 * Express middleware — automatically logs every authenticated
 * mutating request (POST/PUT/PATCH/DELETE) after the response is sent.
 * Skips GET and HEAD to keep the table small.
 */
function autoAuditMiddleware(req, res, next) {
  const method = req.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();

  const pathOnly = (req.originalUrl || req.url || '').split('?')[0];
  // Login and OTP login are logged inside auth.js where the real user row is known.
  if (['/auth/login', '/auth/verify-otp', '/auth/forgot-password', '/auth/reset-password'].includes(pathOnly)) {
    return next();
  }

  // Snapshot body now — some routes mutate/clear req.body before finish fires.
  const bodySnapshot = req.body && typeof req.body === 'object' ? sanitizeAuditBody(req.body) : null;

  res.on('finish', () => {
    if (!req.user) return;
    // Only record actions that actually succeeded. Failed logins are logged manually.
    if (res.statusCode >= 400) return;

    const { entity, entityId, action } = detectAuditTarget(req, method);
    const safeBody = readAuditBody(req, bodySnapshot);
    const summary = buildSummary(action, entity, entityId, safeBody);

    // Include a small, safe body preview in meta for the detail view
    const metaBody = safeBody ? Object.keys(safeBody).reduce((acc, k) => {
      const v = safeBody[k];
      if (v == null) return acc;
      if (SENSITIVE_KEY_RE.test(k)) {
        acc[k] = '[redacted]';
        return acc;
      }
      if (typeof v === 'string') {
        // Strip base64 data URLs — they'd bloat the log table
        acc[k] = v.length > 200 || /^data:/.test(v) ? `[${typeof v}, ${v.length} chars]` : v;
      } else if (typeof v === 'object') {
        acc[k] = '[object]';
      } else {
        acc[k] = v;
      }
      return acc;
    }, {}) : null;

    logActivity({
      req,
      action,
      entity,
      entityId,
      status: res.statusCode,
      summary,
      meta: metaBody,
    });
  });

  next();
}


module.exports = { logActivity, autoAuditMiddleware };
