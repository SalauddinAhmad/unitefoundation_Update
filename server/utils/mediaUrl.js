// ================================================================
// Media URL helpers — host/IP independent image links.
//
// Rule: the DATABASE always stores a RELATIVE path ("/uploads/media/x.webp").
// The API turns it into an absolute URL at response time, based on the
// configured PUBLIC_API_BASE_URL or (fallback) the incoming request host.
//
// Why: earlier the absolute URL (domain/IP at upload time) was baked into
// the DB. When the hosting IP / domain / protocol changed, every stored
// image link broke and images had to be re-uploaded. With relative storage
// nothing breaks — the same rows keep working on any host.
// ================================================================

const UPLOADS_RE = /^(?:https?:)?\/\/[^/]+(\/uploads\/[^\s"']*)$/i;

/** Strip any scheme+host so only "/uploads/..." is stored in the DB. */
function toRelativeMediaUrl(value) {
  const s = String(value == null ? '' : value).trim();
  if (!s) return value;
  const m = UPLOADS_RE.exec(s);
  if (m) return m[1];
  if (s.startsWith('/uploads/')) return s;
  return value; // data URIs, external CDN links, etc. stay untouched
}

/** Public base URL of this API (no trailing slash). */
function publicBaseUrl(req) {
  const configured = (process.env.PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '');
  if (configured) return configured;
  if (req && typeof req.get === 'function') {
    const host = req.get('x-forwarded-host') || req.get('host');
    const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim();
    if (host) return `${proto}://${host}`;
  }
  return '';
}

/** Make a stored value absolute for the client. */
function absolutizeMediaUrl(value, base) {
  if (typeof value !== 'string') return value;
  if (!base) return value;
  if (value.startsWith('/uploads/')) return `${base}${value}`;
  return value;
}

/** Deep-walk a JSON payload and absolutize every "/uploads/..." string. */
function absolutizePayload(payload, base, depth = 0) {
  if (!base || depth > 12) return payload;
  if (typeof payload === 'string') return absolutizeMediaUrl(payload, base);
  if (Array.isArray(payload)) return payload.map((v) => absolutizePayload(v, base, depth + 1));
  if (payload && typeof payload === 'object' && payload.constructor === Object) {
    const out = {};
    for (const [k, v] of Object.entries(payload)) out[k] = absolutizePayload(v, base, depth + 1);
    return out;
  }
  return payload;
}

/** Deep-walk a request body and store /uploads links relative. */
function relativizePayload(payload, depth = 0) {
  if (depth > 12) return payload;
  if (typeof payload === 'string') {
    // handles both plain URLs and URLs embedded in HTML/JSON strings
    return payload.replace(/(?:https?:)?\/\/[^/"'\s]+(\/uploads\/)/gi, '$1');
  }
  if (Array.isArray(payload)) return payload.map((v) => relativizePayload(v, depth + 1));
  if (payload && typeof payload === 'object' && payload.constructor === Object) {
    const out = {};
    for (const [k, v] of Object.entries(payload)) out[k] = relativizePayload(v, depth + 1);
    return out;
  }
  return payload;
}

/** Express middleware: normalize incoming bodies before they hit the DB. */
function mediaUrlRequestMiddleware(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    try { req.body = relativizePayload(req.body); } catch { /* keep original */ }
  }
  next();
}

/**
 * Express middleware: rewrites relative /uploads/ paths in every JSON
 * response into absolute URLs for the current host.
 */
function mediaUrlResponseMiddleware(req, res, next) {
  const base = publicBaseUrl(req);
  if (!base) return next();
  const originalJson = res.json.bind(res);
  res.json = (body) => originalJson(absolutizePayload(body, base));
  next();
}

module.exports = {
  toRelativeMediaUrl,
  relativizePayload,
  mediaUrlRequestMiddleware,
  publicBaseUrl,
  absolutizeMediaUrl,
  absolutizePayload,
  mediaUrlResponseMiddleware,
};
