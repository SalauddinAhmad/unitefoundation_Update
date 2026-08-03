const router = require('express').Router();
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { requireAuth, requireRole } = require('../middleware/auth');
const { invalidate: invalidateNotifyPrefs } = require('../services/notifyPrefs');

// Historically `settings.data` has been declared with mixed types across
// environments — JSON in some databases (auto-parsed by mysql2 to an
// object) and TEXT/LONGTEXT in others (returned as a raw string). Always
// normalise to an object before sending to the client, otherwise the
// frontend receives a JSON-encoded string and silently falls back to
// defaults, hiding any edits the admin made from the live site.
function normaliseSettings(v) {
  if (v == null) return {};
  if (typeof v === 'object') return v;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return {}; }
  }
  return {};
}

router.get('/', asyncH(async (_req, res) => {
  // Some legacy databases stored settings under a different row id. Merge any
  // extra rows in as a base so older hero/about/payment data is not lost,
  // while row id=1 always wins for keys it defines.
  const [rows] = await pool.execute('SELECT id, data FROM settings ORDER BY id DESC');
  let merged = {};
  for (const r of rows) {
    if (Number(r.id) === 1) continue;
    merged = { ...merged, ...normaliseSettings(r.data) };
  }
  const primary = rows.find((r) => Number(r.id) === 1);
  merged = { ...merged, ...normaliseSettings(primary?.data) };
  res.json(merged);
}));


// Accept the same payload over POST: some LiteSpeed/Imunify360 hosts drop
// large PUT bodies, so the client retries with POST + X-HTTP-Method-Override.
const saveSettings = asyncH(async (req, res) => {
  const incoming = req.body || {};
  // Merge on top of what is already stored. A partial payload (for example a
  // form-schema-only save, or a dashboard tab that posts a subset) must never
  // be able to wipe hero slides, payments, founder, etc.
  const [rows] = await pool.execute('SELECT data FROM settings WHERE id=1');
  const current = normaliseSettings(rows[0]?.data);
  const data = { ...current, ...incoming };
  await pool.execute(
    'INSERT INTO settings (id,data) VALUES (1,?) ON DUPLICATE KEY UPDATE data=VALUES(data)',
    [JSON.stringify(data)]
  );
  invalidateNotifyPrefs();
  res.json(data);
});

router.put('/', requireAuth, requireRole('admin'), saveSettings);
router.post('/', requireAuth, requireRole('admin'), saveSettings);


module.exports = router;
