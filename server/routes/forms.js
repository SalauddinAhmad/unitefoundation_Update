// Dynamic form-schema CRUD. Public GET, admin PUT.
const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { requireAuth } = require('../middleware/auth');

const KEYS = ['volunteer', 'representative', 'donor', 'member'];

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

router.get('/', asyncH(async (_req, res) => {
  const [rows] = await pool.execute('SELECT form_key, title, subtitle, fields, updated_at FROM form_schemas');
  res.json(rows.map(r => ({ ...r, fields: safeParse(r.fields) })));
}));

router.get('/:key', asyncH(async (req, res) => {
  if (!KEYS.includes(req.params.key)) return res.status(400).json({ message: 'Invalid key' });
  const [rows] = await pool.execute('SELECT form_key, title, subtitle, fields, updated_at FROM form_schemas WHERE form_key=?', [req.params.key]);
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  res.json({ ...rows[0], fields: safeParse(rows[0].fields) });
}));

router.put('/:key', requireAuth, asyncH(async (req, res) => {
  if (!KEYS.includes(req.params.key)) return res.status(400).json({ message: 'Invalid key' });
  const body = z.object({
    title: z.string().max(200).optional().default(''),
    subtitle: z.string().max(1000).optional().default(''),
    fields: z.array(fieldSchema).min(0),
  }).parse(req.body);
  const fieldsJson = JSON.stringify(body.fields);
  await pool.execute(
    `INSERT INTO form_schemas (form_key, title, subtitle, fields) VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), fields=VALUES(fields)`,
    [req.params.key, body.title, body.subtitle, fieldsJson]
  );
  res.json({ ok: true });
}));

function safeParse(v) {
  if (!v) return [];
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return []; }
}

module.exports = router;
