// Dynamic form-schema CRUD. Public GET, admin PUT.
// Persists field list AND the surrounding editorial copy / banner
// shown next to each form on the public site.
const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { requireAuth } = require('../middleware/auth');

const KEYS = ['volunteer', 'representative', 'donor', 'monthly', 'member'];

const fieldSchema = z.object({
  key: z.string().min(1).max(64),
  label: z.string().max(200),
  placeholder: z.string().max(200).optional().default(''),
  type: z.enum(['text','email','tel','number','url','date','textarea','select','radio-group','checkbox-group','checkbox','section']),
  required: z.boolean().optional().default(false),
  options: z.array(z.string()).optional().default([]),
  help: z.string().max(500).optional().default(''),
  full: z.boolean().optional().default(false),
  system: z.boolean().optional().default(false),
});

const extrasSchema = z.object({
  intro: z.string().max(4000).optional().default(''),
  bullets_title: z.string().max(200).optional().default(''),
  bullets: z.array(z.string().max(400)).optional().default([]),
  quote_text: z.string().max(1000).optional().default(''),
  quote_source: z.string().max(200).optional().default(''),
  stats: z.array(z.object({ v: z.string().max(40), l: z.string().max(80) })).optional().default([]),
  banner_type: z.enum(['none', 'image', 'video']).optional().default('none'),
  // Store only short media/video URLs here. Base64 data URIs make PUT payloads
  // large enough for cPanel/LiteSpeed to abort with browser "Failed to fetch".
  banner_url: z.string().max(3000).optional().default(''),
  disabled: z.boolean().optional().default(false),
  disabled_message: z.string().max(500).optional().default(''),
}).optional().default({});

const DATA_URI_RE = /^data:[^;,]+;base64,/i;

function stripDataUriBanner(extras = {}) {
  const next = { ...extras };
  if (typeof next.banner_url === 'string' && DATA_URI_RE.test(next.banner_url)) {
    next.banner_type = 'none';
    next.banner_url = '';
  }
  return next;
}

// Cache whether the `extras` column exists so we degrade gracefully
// if migration 017 has not been applied to the target database yet.
let _hasExtras = null;
async function hasExtrasColumn() {
  if (_hasExtras !== null) return _hasExtras;
  try {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'form_schemas' AND column_name = 'extras'"
    );
    _hasExtras = rows[0].c > 0;
  } catch {
    _hasExtras = false;
  }
  return _hasExtras;
}

router.get('/', asyncH(async (_req, res) => {
  const withExtras = await hasExtrasColumn();
  const sql = withExtras
    ? 'SELECT form_key, title, subtitle, fields, extras, updated_at FROM form_schemas'
    : 'SELECT form_key, title, subtitle, fields, updated_at FROM form_schemas';
  const [rows] = await pool.execute(sql);
  res.json(rows.map(hydrate));
}));

router.get('/:key', asyncH(async (req, res) => {
  if (!KEYS.includes(req.params.key)) return res.status(400).json({ message: 'Invalid key' });
  const withExtras = await hasExtrasColumn();
  const sql = withExtras
    ? 'SELECT form_key, title, subtitle, fields, extras, updated_at FROM form_schemas WHERE form_key=?'
    : 'SELECT form_key, title, subtitle, fields, updated_at FROM form_schemas WHERE form_key=?';
  const [rows] = await pool.execute(sql, [req.params.key]);
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  res.json(hydrate(rows[0]));
}));

// Some shared cPanel/LiteSpeed + Imunify360 setups silently drop PUT requests
// with larger JSON bodies (browser shows "Failed to fetch"). Accept the same
// payload over POST so the client can retry without the WAF-triggering verb.
const saveSchema = asyncH(async (req, res) => {
  if (!KEYS.includes(req.params.key)) return res.status(400).json({ message: 'Invalid key' });
  // Some shared-hosting WAF rules inspect request bodies and silently drop
  // certain payloads (the browser then reports a bare "Failed to fetch").
  // The client may therefore send the same JSON base64-wrapped as { _b64 }.
  if (req.body && typeof req.body._b64 === 'string') {
    try {
      req.body = JSON.parse(Buffer.from(req.body._b64, 'base64').toString('utf8'));
    } catch {
      return res.status(400).json({ message: 'Invalid encoded payload' });
    }
  }
  if (req.body && req.body.extras) req.body.extras = stripDataUriBanner(req.body.extras);
  const body = z.object({

    title: z.string().max(200).optional().default(''),
    subtitle: z.string().max(1000).optional().default(''),
    fields: z.array(fieldSchema).min(0),
    extras: extrasSchema,
  }).parse(req.body);
  const fieldsJson = JSON.stringify(body.fields);
  const extrasJson = JSON.stringify(stripDataUriBanner(body.extras || {}));
  const withExtras = await hasExtrasColumn();
  if (withExtras) {
    await pool.execute(
      `INSERT INTO form_schemas (form_key, title, subtitle, fields, extras) VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), fields=VALUES(fields), extras=VALUES(extras)`,
      [req.params.key, body.title, body.subtitle, fieldsJson, extrasJson]
    );
  } else {
    // Fallback: write only base columns; extras will be applied once migration 017 runs.
    await pool.execute(
      `INSERT INTO form_schemas (form_key, title, subtitle, fields) VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), fields=VALUES(fields)`,
      [req.params.key, body.title, body.subtitle, fieldsJson]
    );
  }
  res.json({ ok: true, extras_persisted: withExtras });
});

router.put('/:key', requireAuth, saveSchema);
router.post('/:key', requireAuth, saveSchema);



function hydrate(row) {
  const extras = stripDataUriBanner(safeParse(row.extras, {}));
  return {
    form_key: row.form_key,
    title: row.title,
    subtitle: row.subtitle,
    fields: safeParse(row.fields, []),
    extras,
    updated_at: row.updated_at,
  };
}

function safeParse(v, fallback) {
  if (v == null || v === '') return fallback;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return fallback; }
}

module.exports = router;
