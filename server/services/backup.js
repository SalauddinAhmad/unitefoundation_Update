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
const crypto = require('crypto');
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

function apiBase() {
  return String(process.env.API_PUBLIC_URL || process.env.API_BASE_URL || 'https://api.unitefoundation.bd').replace(/\/+$/, '');
}

/** Signed, time-limited token so the emailed link works without a login. */
function downloadToken(file, ttlDays = 30) {
  const exp = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  const secret = process.env.JWT_SECRET || 'unite-backup';
  const sig = crypto.createHmac('sha256', secret).update(`${file}.${exp}`).digest('hex').slice(0, 32);
  return `${exp}.${sig}`;
}

function verifyDownloadToken(file, token) {
  const [exp, sig] = String(token || '').split('.');
  if (!exp || !sig) return false;
  if (Date.now() > Number(exp)) return false;
  const secret = process.env.JWT_SECRET || 'unite-backup';
  const good = crypto.createHmac('sha256', secret).update(`${file}.${exp}`).digest('hex').slice(0, 32);
  try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good)); } catch { return false; }
}

function downloadUrl(file) {
  return `${apiBase()}/backups/file/${encodeURIComponent(file)}?t=${downloadToken(file)}`;
}

/** Recipients: comma/semicolon separated list (max 2). */
function recipients(cfg) {
  const raw = cfg.emailTo || process.env.ADMIN_EMAIL || process.env.SMTP_USER || '';
  return String(raw)
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s))
    .slice(0, 2);
}

function emailHtml({ fileName, size, url, when }) {
  const mb = (size / 1024 / 1024).toFixed(2);
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f6f5;font-family:-apple-system,'Segoe UI',Roboto,'Noto Sans Bengali',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);">
      <tr><td style="background:linear-gradient(135deg,#14532d,#1c7a44);padding:26px 28px;">
        <div style="color:#ffffff;font-size:19px;font-weight:700;line-height:1.7;">ডেটাবেজ ব্যাকআপ সম্পন্ন</div>
        <div style="color:#d6ead9;font-size:13px;line-height:1.8;">Unite Foundation — স্বয়ংক্রিয় ব্যাকআপ সিস্টেম</div>
      </td></tr>
      <tr><td style="padding:26px 28px;">
        <p style="margin:0 0 18px;color:#374151;font-size:14px;line-height:1.9;">
          আপনার সম্পূর্ণ ডেটাবেজের একটি নতুন ব্যাকআপ সফলভাবে তৈরি হয়েছে। নিচের বাটনে ক্লিক করে ফাইলটি ডাউনলোড করতে পারবেন।
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7faf8;border:1px solid #e3ece6;border-radius:12px;">
          <tr><td style="padding:14px 16px;font-size:13px;color:#6b7280;line-height:1.9;">ফাইল</td>
              <td style="padding:14px 16px;font-size:13px;color:#111827;font-weight:600;line-height:1.9;text-align:right;">${fileName}</td></tr>
          <tr><td style="padding:0 16px 14px;font-size:13px;color:#6b7280;line-height:1.9;">সাইজ</td>
              <td style="padding:0 16px 14px;font-size:13px;color:#111827;font-weight:600;line-height:1.9;text-align:right;">${mb} MB</td></tr>
          <tr><td style="padding:0 16px 16px;font-size:13px;color:#6b7280;line-height:1.9;">সময়</td>
              <td style="padding:0 16px 16px;font-size:13px;color:#111827;font-weight:600;line-height:1.9;text-align:right;">${when}</td></tr>
        </table>
        <div style="text-align:center;margin:26px 0 8px;">
          <a href="${url}" style="display:inline-block;background:#1c7a44;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 34px;border-radius:10px;line-height:1.6;">ব্যাকআপ ডাউনলোড করুন</a>
        </div>
        <p style="margin:14px 0 0;color:#9ca3af;font-size:11.5px;line-height:1.9;text-align:center;">
          লিংকটি ৩০ দিন পর্যন্ত সচল থাকবে। ফাইলটি gzip করা SQL ডাম্প — phpMyAdmin দিয়ে সরাসরি রিস্টোর করা যায়।
        </p>
      </td></tr>
      <tr><td style="background:#f7faf8;padding:16px 28px;text-align:center;color:#9ca3af;font-size:11px;line-height:1.9;">
        © Unite Foundation — এই ইমেইলটি স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে।
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

async function maybeEmail(filePath, fileName, size) {
  const cfg = getConfig();
  if (!cfg.emailCopy) return;
  const to = recipients(cfg);
  if (!to.length) return;
  const attachments = size > 18 * 1024 * 1024
    ? []
    : [{ filename: fileName, path: filePath }];
  try {
    const { sendMail } = require('./mailer');
    await sendMail({
      to: to.join(', '),
      subject: `ডেটাবেজ ব্যাকআপ — ${fileName}`,
      html: emailHtml({ fileName, size, url: downloadUrl(fileName), when: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC' }),
      attachments,
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
  verifyDownloadToken,
  downloadUrl,
  isRunning: () => running,
};
