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
  banner_url: z.string().max(10 * 1024 * 1024).optional().default(''),
}).optional().default({});

router.get('/', asyncH(async (_req, res) => {
  const [rows] = await pool.execute('SELECT form_key, title, subtitle, fields, extras, updated_at FROM form_schemas');
  res.json(rows.map(hydrate));
}));

router.get('/:key', asyncH(async (req, res) => {
  if (!KEYS.includes(req.params.key)) return res.status(400).json({ message: 'Invalid key' });
  const [rows] = await pool.execute('SELECT form_key, title, subtitle, fields, extras, updated_at FROM form_schemas WHERE form_key=?', [req.params.key]);
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  res.json(hydrate(rows[0]));
}));

router.put('/:key', requireAuth, asyncH(async (req, res) => {
  if (!KEYS.includes(req.params.key)) return res.status(400).json({ message: 'Invalid key' });
  const body = z.object({
    title: z.string().max(200).optional().default(''),
    subtitle: z.string().max(1000).optional().default(''),
    fields: z.array(fieldSchema).min(0),
    extras: extrasSchema,
  }).parse(req.body);
  const fieldsJson = JSON.stringify(body.fields);
  const extrasJson = JSON.stringify(body.extras || {});
  await pool.execute(
    `INSERT INTO form_schemas (form_key, title, subtitle, fields, extras) VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), fields=VALUES(fields), extras=VALUES(extras)`,
    [req.params.key, body.title, body.subtitle, fieldsJson, extrasJson]
  );
  res.json({ ok: true });
}));

function hydrate(row) {
  return {
    form_key: row.form_key,
    title: row.title,
    subtitle: row.subtitle,
    fields: safeParse(row.fields, []),
    extras: safeParse(row.extras, {}),
    updated_at: row.updated_at,
  };
}

function safeParse(v, fallback) {
  if (v == null || v === '') return fallback;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return fallback; }
}

module.exports = router;
