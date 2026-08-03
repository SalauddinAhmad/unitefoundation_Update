// ================================================================
// Admin notification preferences (Dashboard → Settings → নোটিফিকেশন)
//
// The dashboard stores the toggles inside settings.data.notifications:
//   { notify_email, email_on_donation, email_on_volunteer,
//     email_on_message, weekly_report, sms_alerts }
//
// Until now the server ignored them completely and always mailed
// APPLICATIONS_NOTIFY_EMAIL. This module reads the saved settings
// (cached for 30s) and exposes a single helper used by all routes.
// ================================================================

const pool = require('../db/pool');
const { sendMail } = require('./mailer');

let cache = null;
let lastLoad = 0;
let inflight = null;
const TTL = 30_000;

function parse(v) {
  if (v == null) return {};
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return {}; }
}

async function loadPrefs() {
  const [rows] = await pool.execute('SELECT id, data FROM settings ORDER BY id DESC');
  let merged = {};
  for (const r of rows) {
    if (Number(r.id) === 1) continue;
    merged = { ...merged, ...parse(r.data) };
  }
  const primary = rows.find((r) => Number(r.id) === 1);
  merged = { ...merged, ...parse(primary?.data) };
  return (merged && merged.notifications) || {};
}

async function getPrefs() {
  const now = Date.now();
  if (cache && now - lastLoad < TTL) return cache;
  if (inflight) return inflight;
  inflight = loadPrefs()
    .then((p) => { cache = p; lastLoad = Date.now(); return p; })
    .catch((e) => {
      console.error('[notify] failed to load settings:', e && e.message);
      return cache || {};
    })
    .finally(() => { inflight = null; });
  return inflight;
}

/** Recipients: admin-configured list (comma/semicolon/space separated) → env fallback. */
function recipientsOf(prefs) {
  const raw = String((prefs && prefs.notify_email) || '').trim();
  const list = raw
    ? raw.split(/[,;\s]+/).map((s) => s.trim()).filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s))
    : [];
  if (list.length) return list;
  const fallback = process.env.APPLICATIONS_NOTIFY_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
  return fallback ? [fallback] : [];
}

const EVENT_KEY = {
  donation: 'email_on_donation',
  application: 'email_on_volunteer',
  message: 'email_on_message',
};

/**
 * Send an admin notification for `event` ('donation' | 'application' | 'message')
 * if the matching toggle is on. Never throws — always fire-and-forget safe.
 */
async function notifyAdmin({ event, subject, html }) {
  try {
    const prefs = await getPrefs();
    const key = EVENT_KEY[event];
    // Default ON when the setting was never saved (undefined), OFF only when
    // the admin explicitly turned it off.
    if (key && prefs[key] === false) return { skipped: 'disabled' };
    const to = recipientsOf(prefs);
    if (!to.length) return { skipped: 'no-recipient' };
    await sendMail({ to: to.join(', '), subject, html });
    return { ok: true, to };
  } catch (err) {
    console.error('[notify] admin email failed:', err && err.message);
    return { error: err && err.message };
  }
}

/** Invalidate the cache — called right after settings are saved. */
function invalidate() { cache = null; lastLoad = 0; }

module.exports = { notifyAdmin, getPrefs, recipientsOf, invalidate };
