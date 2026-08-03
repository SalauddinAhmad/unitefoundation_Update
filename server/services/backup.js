// ============================================================
// Automatic database backup service
// ------------------------------------------------------------
// - Dumps every table (schema + data) into a gzipped .sql file
//   under server/backups/
// - Runs automatically on a schedule (daily by default) without
//   any manual action; the scheduler is driven both by a timer
//   and by a lightweight "is a backup due?" check, so it still
//   works on shared cPanel/Passenger hosting where workers sleep.
// - Keeps only the last N backups (retention) so disk never fills.
// - Optionally emails the dump to the admin address.
// ============================================================
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const pool = require('../db/pool');

const BACKUP_DIR = path.join(__dirname, '..', process.env.BACKUP_DIR || 'backups');
const CONFIG_PATH = path.join(BACKUP_DIR, 'config.json');
const STATE_PATH = path.join(BACKUP_DIR, 'state.json');

const DEFAULT_CONFIG = {
  enabled: true,
  // hourly | daily | weekly
  frequency: 'daily',
  // how many dumps to keep on disk
  retention: 7,
  // email a copy of each dump (uses the configured SMTP transport)
  emailCopy: false,
  emailTo: '',
};

const FREQ_MS = {
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
};

function ensureDir() {
  try { fs.mkdirSync(BACKUP_DIR, { recursive: true }); } catch { /* ignore */ }
}

function readJson(file, fallback) {
  try { return { ...fallback, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; }
  catch { return { ...fallback }; }
}

function writeJson(file, data) {
  ensureDir();
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); } catch { /* ignore */ }
}

function getConfig() {
  return readJson(CONFIG_PATH, DEFAULT_CONFIG);
}

function setConfig(patch) {
  const next = { ...getConfig(), ...patch };
  next.retention = Math.min(60, Math.max(1, Number(next.retention) || 7));
  if (!FREQ_MS[next.frequency]) next.frequency = 'daily';
  next.enabled = Boolean(next.enabled);
  next.emailCopy = Boolean(next.emailCopy);
  next.emailTo = String(next.emailTo || '').trim();
  writeJson(CONFIG_PATH, next);
  return next;
}

function getState() {
  return readJson(STATE_PATH, { lastRunAt: null, lastStatus: null, lastError: null, lastFile: null, lastSize: 0 });
}

// ---------- SQL dump ----------
function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL';
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
  if (Buffer.isBuffer(v)) return `0x${v.toString('hex')}`;
  if (typeof v === 'object') return `'${String(JSON.stringify(v)).replace(/[\\'"\0\n\r\x1a]/g, (c) => ({ '\\': '\\\\', "'": "\\'", '"': '\\"', '\0': '\\0', '\n': '\\n', '\r': '\\r', '\x1a': '\\Z' }[c]))}'`;
  return `'${String(v).replace(/[\\'"\0\n\r\x1a]/g, (c) => ({ '\\': '\\\\', "'": "\\'", '"': '\\"', '\0': '\\0', '\n': '\\n', '\r': '\\r', '\x1a': '\\Z' }[c]))}'`;
}

function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}_${p(d.getUTCHours())}${p(d.getUTCMinutes())}`;
}

let running = false;

/**
 * Create one gzipped SQL dump of the whole database.
 * @param {'auto'|'manual'} trigger
 */
async function runBackup(trigger = 'auto') {
  if (running) return { ok: false, skipped: true, reason: 'already_running' };
  running = true;
  ensureDir();

  const fileName = `uf-backup_${stamp()}_${trigger}.sql.gz`;
  const filePath = path.join(BACKUP_DIR, fileName);
  const gzip = zlib.createGzip({ level: 6 });
  const out = fs.createWriteStream(filePath);
  gzip.pipe(out);

  const write = (chunk) =>
    new Promise((resolve, reject) => {
      if (gzip.write(chunk)) return resolve();
      gzip.once('drain', resolve);
      gzip.once('error', reject);
    });

  try {
    const dbName = process.env.DB_NAME || '';
    await write(`-- Unite Foundation automatic backup\n-- database: ${dbName}\n-- created: ${new Date().toISOString()}\n`);
    await write(`SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n\n`);

    const [tables] = await pool.query(
      `SELECT TABLE_NAME AS t FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME`
    );

    let rowTotal = 0;
    for (const { t } of tables) {
      const [[create]] = await pool.query(`SHOW CREATE TABLE \`${t}\``);
      const ddl = create['Create Table'] || create['Create View'] || '';
      await write(`\n-- ----- table: ${t} -----\nDROP TABLE IF EXISTS \`${t}\`;\n${ddl};\n`);

      // Stream rows in pages so memory stays small on shared hosting.
      const PAGE = 200;
      let offset = 0;
      for (;;) {
        const [rows] = await pool.query(`SELECT * FROM \`${t}\` LIMIT ${PAGE} OFFSET ${offset}`);
        if (!rows.length) break;
        const cols = Object.keys(rows[0]).map((c) => `\`${c}\``).join(',');
        const values = rows.map((r) => `(${Object.values(r).map(esc).join(',')})`).join(',\n');
        await write(`INSERT INTO \`${t}\` (${cols}) VALUES\n${values};\n`);
        rowTotal += rows.length;
        offset += PAGE;
        if (rows.length < PAGE) break;
      }
    }

    await write(`\nSET FOREIGN_KEY_CHECKS=1;\n`);
    await new Promise((resolve, reject) => {
      out.on('finish', resolve);
      out.on('error', reject);
      gzip.end();
    });

    const size = fs.statSync(filePath).size;
    const state = {
      lastRunAt: new Date().toISOString(),
      lastStatus: 'ok',
      lastError: null,
      lastFile: fileName,
      lastSize: size,
      lastTables: tables.length,
      lastRows: rowTotal,
      lastTrigger: trigger,
    };
    writeJson(STATE_PATH, state);

    pruneOld();
    await maybeEmail(filePath, fileName, size);

    return { ok: true, file: fileName, size, tables: tables.length, rows: rowTotal };
  } catch (err) {
    try { gzip.destroy(); out.destroy(); fs.unlinkSync(filePath); } catch { /* ignore */ }
    writeJson(STATE_PATH, {
      ...getState(),
      lastRunAt: new Date().toISOString(),
      lastStatus: 'error',
      lastError: String((err && err.message) || err),
      lastTrigger: trigger,
    });
    return { ok: false, error: String((err && err.message) || err) };
  } finally {
    running = false;
  }
}

function listBackups() {
  ensureDir();
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith('.sql.gz'))
    .map((f) => {
      const st = fs.statSync(path.join(BACKUP_DIR, f));
      return { file: f, size: st.size, createdAt: st.mtime.toISOString() };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function pruneOld() {
  const { retention } = getConfig();
  const files = listBackups();
  files.slice(retention).forEach((f) => {
    try { fs.unlinkSync(path.join(BACKUP_DIR, f.file)); } catch { /* ignore */ }
  });
}

function removeBackup(file) {
  const safe = path.basename(file);
  if (!safe.endsWith('.sql.gz')) return false;
  try { fs.unlinkSync(path.join(BACKUP_DIR, safe)); return true; } catch { return false; }
}

function backupPath(file) {
  const safe = path.basename(file);
  if (!safe.endsWith('.sql.gz')) return null;
  const p = path.join(BACKUP_DIR, safe);
  return fs.existsSync(p) ? p : null;
}

async function maybeEmail(filePath, fileName, size) {
  const cfg = getConfig();
  if (!cfg.emailCopy) return;
  const to = cfg.emailTo || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (!to) return;
  // Never try to email huge dumps — most mailboxes reject > 20 MB.
  if (size > 18 * 1024 * 1024) return;
  try {
    const { sendMail } = require('./mailer');
    await sendMail({
      to,
      subject: `ডেটাবেজ ব্যাকআপ — ${fileName}`,
      html: `<p>স্বয়ংক্রিয় ডেটাবেজ ব্যাকআপ সফলভাবে তৈরি হয়েছে।</p>
             <p><b>ফাইল:</b> ${fileName}<br/><b>সাইজ:</b> ${(size / 1024 / 1024).toFixed(2)} MB<br/>
             <b>সময়:</b> ${new Date().toISOString()}</p>`,
      attachments: [{ filename: fileName, path: filePath }],
    });
  } catch (e) {
    console.error('[backup] email failed:', e.message);
  }
}

/** Is a scheduled backup due right now? */
function isDue() {
  const cfg = getConfig();
  if (!cfg.enabled) return false;
  const { lastRunAt } = getState();
  if (!lastRunAt) return true;
  const age = Date.now() - new Date(lastRunAt).getTime();
  return age >= (FREQ_MS[cfg.frequency] || FREQ_MS.daily);
}

/** Fire a scheduled backup only when due. Never throws. */
async function maybeRunScheduled() {
  try {
    if (running || !isDue()) return;
    await runBackup('auto');
  } catch (e) {
    console.error('[backup] scheduled run failed:', e.message);
  }
}

function nextRunAt() {
  const cfg = getConfig();
  const { lastRunAt } = getState();
  if (!cfg.enabled) return null;
  const base = lastRunAt ? new Date(lastRunAt).getTime() : Date.now();
  return new Date(base + (FREQ_MS[cfg.frequency] || FREQ_MS.daily)).toISOString();
}

module.exports = {
  BACKUP_DIR,
  getConfig,
  setConfig,
  getState,
  runBackup,
  listBackups,
  removeBackup,
  backupPath,
  maybeRunScheduled,
  isDue,
  nextRunAt,
  isRunning: () => running,
};
