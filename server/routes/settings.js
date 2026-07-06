const router = require('express').Router();
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { requireAuth, requireRole } = require('../middleware/auth');

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
  const [rows] = await pool.execute('SELECT data FROM settings WHERE id=1');
  res.json(normaliseSettings(rows[0]?.data));
}));

router.put('/', requireAuth, requireRole('admin'), asyncH(async (req, res) => {
  const data = req.body || {};
  await pool.execute(
    'INSERT INTO settings (id,data) VALUES (1,?) ON DUPLICATE KEY UPDATE data=VALUES(data)',
    [JSON.stringify(data)]
  );
  res.json(data);
}));

module.exports = router;
