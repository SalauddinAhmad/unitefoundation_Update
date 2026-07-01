const router = require('express').Router();
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', asyncH(async (_req, res) => {
  const [rows] = await pool.execute('SELECT data FROM settings WHERE id=1');
  res.json(rows[0]?.data || {});
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
