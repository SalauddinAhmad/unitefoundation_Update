const router = require('express').Router();
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { requireAuth } = require('../middleware/auth');

// Build a "created_at BETWEEN ..." WHERE fragment from ?from & ?to (YYYY-MM-DD).
// Both inclusive. Missing values are ignored (no filter on that side).
function dateWhere(req, column = 'created_at') {
  const from = /^\d{4}-\d{2}-\d{2}$/.test(req.query.from) ? req.query.from : null;
  const to = /^\d{4}-\d{2}-\d{2}$/.test(req.query.to) ? req.query.to : null;
  const parts = [];
  const args = [];
  if (from) { parts.push(`${column} >= ?`); args.push(`${from} 00:00:00`); }
  if (to)   { parts.push(`${column} <= ?`); args.push(`${to} 23:59:59`); }
  return { sql: parts.length ? ` AND ${parts.join(' AND ')}` : '', args };
}

router.get('/overview', requireAuth, asyncH(async (req, res) => {
  const w = dateWhere(req);
  const [[donationSum]] = await pool.execute(
    `SELECT COALESCE(SUM(amount),0) total, COUNT(*) count
     FROM donations WHERE status='completed'${w.sql}`, w.args);
  const [[donors]] = await pool.execute(
    `SELECT COUNT(DISTINCT COALESCE(NULLIF(phone,''), NULLIF(email,''), CAST(id AS CHAR))) c
     FROM donations WHERE status='completed'${w.sql}`, w.args);
  const wApps = dateWhere(req);
  const [[volCount]] = await pool.execute(
    `SELECT COUNT(*) c FROM applications WHERE kind='volunteers'${wApps.sql}`, wApps.args);
  const [[projCount]] = await pool.execute("SELECT COUNT(*) c FROM projects WHERE status='active'");
  const [[msgCount]] = await pool.execute(
    `SELECT COUNT(*) c FROM messages WHERE status='new'${wApps.sql}`, wApps.args);
  res.json({
    kpis: {
      total_donations: Number(donationSum.total),
      donation_count: Number(donationSum.count),
      unique_donors: Number(donors.c),
      volunteers: Number(volCount.c),
      active_projects: Number(projCount.c),
      new_messages: Number(msgCount.c),
    },
  });
}));

router.get('/donations-trend', requireAuth, asyncH(async (req, res) => {
  const w = dateWhere(req);
  // When no range is provided, keep the old "last 30 days" behaviour.
  const defaultWindow = w.sql ? '' : " AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)";
  const [rows] = await pool.execute(`
    SELECT DATE(created_at) d, SUM(amount) total
    FROM donations WHERE status='completed'${w.sql}${defaultWindow}
    GROUP BY DATE(created_at) ORDER BY d
  `, w.args);
  res.json(rows);
}));

router.get('/channels', requireAuth, asyncH(async (req, res) => {
  const w = dateWhere(req);
  const [rows] = await pool.execute(
    `SELECT method, SUM(amount) total FROM donations WHERE status='completed'${w.sql} GROUP BY method`,
    w.args);
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
