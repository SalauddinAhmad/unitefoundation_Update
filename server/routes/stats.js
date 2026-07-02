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

// -------- Visitor counter (public) --------
async function ensureVisitorTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS visitor_stats (
      day DATE PRIMARY KEY,
      visits INT UNSIGNED NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function readTotals() {
  const [[t]] = await pool.execute('SELECT COALESCE(SUM(visits),0) total FROM visitor_stats');
  const [[today]] = await pool.execute('SELECT COALESCE(visits,0) visits FROM visitor_stats WHERE day = CURRENT_DATE()');
  const [[week]] = await pool.execute('SELECT COALESCE(SUM(visits),0) total FROM visitor_stats WHERE day >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)');
  const [[month]] = await pool.execute('SELECT COALESCE(SUM(visits),0) total FROM visitor_stats WHERE day >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)');
  return {
    total: Number(t.total),
    today: Number(today?.visits || 0),
    week: Number(week?.total || 0),
    month: Number(month?.total || 0),
  };
}

router.post('/visit', asyncH(async (_req, res) => {
  await ensureVisitorTable();
  await pool.execute(
    'INSERT INTO visitor_stats (day, visits) VALUES (CURRENT_DATE(), 1) ON DUPLICATE KEY UPDATE visits = visits + 1'
  );
  res.json(await readTotals());
}));

router.get('/visits', asyncH(async (_req, res) => {
  await ensureVisitorTable();
  res.json(await readTotals());
}));

router.get('/visits-trend', requireAuth, asyncH(async (_req, res) => {
  await ensureVisitorTable();
  const [rows] = await pool.execute(
    'SELECT day, visits FROM visitor_stats WHERE day >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) ORDER BY day'
  );
  res.json(rows);
}));

module.exports = router;
