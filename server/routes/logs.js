// ============================================================
// GET /logs — Activity log (Super Admin only)
// Query: ?limit=100&offset=0&user_id=&entity=&action=&from=&to=&q=
// ============================================================
const router = require('express').Router();
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

router.use(requireAuth, requireSuperAdmin);

router.get('/', asyncH(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const where = [];
  const args = [];
  if (req.query.user_id) { where.push('user_id = ?'); args.push(String(req.query.user_id)); }
  if (req.query.entity)  { where.push('entity = ?');  args.push(String(req.query.entity)); }
  if (req.query.action)  { where.push('action = ?');  args.push(String(req.query.action)); }
  if (req.query.from)    { where.push('created_at >= ?'); args.push(String(req.query.from)); }
  if (req.query.to)      { where.push('created_at <= ?'); args.push(String(req.query.to)); }
  if (req.query.q) {
    where.push('(user_email LIKE ? OR user_name LIKE ? OR path LIKE ? OR summary LIKE ?)');
    const s = `%${req.query.q}%`;
    args.push(s, s, s, s);
  }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT id, user_id, user_email, user_name, user_role, action, entity, entity_id,
            method, path, status, ip, user_agent, summary, meta, created_at
     FROM activity_logs
     ${w}
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [...args, limit, offset],
  );
  const [countRow] = await pool.query(`SELECT COUNT(*) AS n FROM activity_logs ${w}`, args);
  res.json({ items: rows, total: countRow[0].n, limit, offset });
}));

// GET /logs/summary — quick KPIs for the last N days
router.get('/summary', asyncH(async (req, res) => {
  const days = Math.min(Number(req.query.days) || 7, 90);
  const [byAction] = await pool.query(
    `SELECT action, COUNT(*) AS n FROM activity_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY action ORDER BY n DESC`, [days]);
  const [byUser] = await pool.query(
    `SELECT user_id, user_email, user_name, COUNT(*) AS n FROM activity_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND user_id IS NOT NULL
      GROUP BY user_id, user_email, user_name ORDER BY n DESC LIMIT 10`, [days]);
  const [byEntity] = await pool.query(
    `SELECT entity, COUNT(*) AS n FROM activity_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY entity ORDER BY n DESC LIMIT 10`, [days]);
  res.json({ days, byAction, byUser, byEntity });
}));

// DELETE /logs/purge?days=90 — trim old rows
router.delete('/purge', asyncH(async (req, res) => {
  const days = Math.max(Number(req.query.days) || 90, 7);
  const [r] = await pool.query('DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)', [days]);
  res.json({ ok: true, deleted: r.affectedRows });
}));

module.exports = router;
