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
 * @param {string} p.action       create|update|delete|login|logout|password_change|role_change|export|other
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

/**
 * Express middleware — automatically logs every authenticated
 * mutating request (POST/PUT/PATCH/DELETE) after the response is sent.
 * Skips GET and HEAD to keep the table small.
 */
function autoAuditMiddleware(req, res, next) {
  const method = req.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();

  res.on('finish', () => {
    // Only log for authenticated users. Public forms are logged via explicit calls in their routes.
    if (!req.user) return;
    // Only log successful or client-error mutations (skip 5xx to avoid noise storms)
    if (res.statusCode >= 500) return;

    // Derive entity from the first URL segment (e.g. /posts/12 → "posts")
    const seg = (req.originalUrl || req.url || '').split('?')[0].split('/').filter(Boolean);
    const entity = seg[0] || 'unknown';
    const entityId = seg[1] || null;

    const action =
      method === 'POST' ? 'create' :
      method === 'DELETE' ? 'delete' :
      method === 'PUT' || method === 'PATCH' ? 'update' : 'other';

    logActivity({
      req,
      action,
      entity,
      entityId,
      status: res.statusCode,
    });
  });

  next();
}

module.exports = { logActivity, autoAuditMiddleware };
