const router = require('express').Router();
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { requireAuth, requireRole } = require('../middleware/auth');
const { invalidate: invalidateNotifyPrefs, getPrefs: getNotifyPrefs, recipientsOf: notifyRecipients, notifyAdmin } = require('../services/notifyPrefs');
const { renderEmail } = require('../services/emailTemplate');

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

// Send a test notification email to the configured recipients
router.post('/notify-test', requireAuth, requireRole('admin'), asyncH(async (_req, res) => {
  invalidateNotifyPrefs();
  const prefs = await getNotifyPrefs();
  const to = notifyRecipients(prefs);
  if (!to.length) return res.status(400).json({ message: 'কোনো নোটিফিকেশন ইমেইল সেট করা নেই' });
  const out = await notifyAdmin({
    event: 'test',
    subject: 'টেস্ট নোটিফিকেশন | Unite Foundation',
    html: renderEmail({
      title: 'টেস্ট নোটিফিকেশন',
      preheader: 'নোটিফিকেশন ইমেইল ঠিকভাবে কাজ করছে',
      intro: '<p style="margin:0;">এটি একটি টেস্ট ইমেইল। আপনি এটি পেয়ে থাকলে নোটিফিকেশন ইমেইল সঠিকভাবে কাজ করছে।</p>',
    }),
  });
  if (out && out.error) return res.status(500).json({ message: out.error });
  res.json({ ok: true, to });
}));

router.put('/', requireAuth, requireRole('admin'), saveSettings);
router.post('/', requireAuth, requireRole('admin'), saveSettings);


module.exports = router;
