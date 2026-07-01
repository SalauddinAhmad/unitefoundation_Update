const router = require('express').Router();
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { requireAuth } = require('../middleware/auth');

router.get('/overview', requireAuth, asyncH(async (_req, res) => {
  const [[donationSum]] = await pool.execute("SELECT COALESCE(SUM(amount),0) total, COUNT(*) count FROM donations WHERE status='completed'");
  const [[volCount]] = await pool.execute("SELECT COUNT(*) c FROM applications WHERE kind='volunteer'");
  const [[projCount]] = await pool.execute("SELECT COUNT(*) c FROM projects WHERE status='active'");
  const [[msgCount]] = await pool.execute("SELECT COUNT(*) c FROM messages WHERE status='new'");
  res.json({
    kpis: {
      total_donations: Number(donationSum.total),
      donation_count: donationSum.count,
      volunteers: volCount.c,
      active_projects: projCount.c,
      new_messages: msgCount.c,
    },
  });
}));

router.get('/donations-trend', requireAuth, asyncH(async (_req, res) => {
  const [rows] = await pool.execute(`
    SELECT DATE(created_at) d, SUM(amount) total
    FROM donations WHERE status='completed' AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at) ORDER BY d
  `);
  res.json(rows);
}));

router.get('/channels', requireAuth, asyncH(async (_req, res) => {
  const [rows] = await pool.execute(`SELECT method, SUM(amount) total FROM donations WHERE status='completed' GROUP BY method`);
  res.json(rows);
}));

module.exports = router;
