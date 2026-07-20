// ================================================================
// In-memory cache of admin-editable email-template overrides.
//
// The templates render code (emailTemplate.js) is fully synchronous —
// so instead of hitting MySQL on every send we keep a small cache
// that refreshes in the background. If the table doesn't exist
// (migration 021 not applied yet) we silently fall back to the
// hard-coded defaults declared in emailTemplateDefaults.js.
// ================================================================

const pool = require('../db/pool');
const { TEMPLATES, KEYS, mergeWithDefaults } = require('./emailTemplateDefaults');

let cache = {}; // { [key]: {subject, slots} }
let tableExists = null;
let lastLoad = 0;
let inflight = null;

async function hasTable() {
  if (tableExists !== null) return tableExists;
  try {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'email_templates'"
    );
    tableExists = rows[0].c > 0;
  } catch {
    tableExists = false;
  }
  return tableExists;
}

async function loadFromDb() {
  if (!(await hasTable())) return {};
  const [rows] = await pool.execute('SELECT `key`, data FROM email_templates');
  const out = {};
  for (const r of rows) {
    let d = r.data;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch { d = {}; } }
    if (d && typeof d === 'object') out[r.key] = d;
  }
  return out;
}

/** Kick off a background reload; safe to call frequently. */
function refresh(force = false) {
  const now = Date.now();
  if (!force && now - lastLoad < 60_000) return inflight || Promise.resolve();
  if (inflight) return inflight;
  inflight = loadFromDb()
    .then((data) => { cache = data; lastLoad = Date.now(); })
    .catch(() => { /* keep old cache */ })
    .finally(() => { inflight = null; });
  return inflight;
}

/** Sync accessor — always returns {subject, slots} merged with defaults. */
function get(key) {
  // fire-and-forget background refresh
  refresh().catch(() => {});
  return mergeWithDefaults(key, cache[key]);
}

/** Explicit setter used by the editor route; updates cache immediately. */
function setLocal(key, data) {
  if (KEYS.includes(key)) cache[key] = data;
}

/** Reset a key back to defaults in cache. */
function clearLocal(key) {
  delete cache[key];
}

// Warm the cache at boot (no await — non-blocking).
refresh(true).catch(() => {});

module.exports = { get, refresh, setLocal, clearLocal, hasTable, TEMPLATES, KEYS };
