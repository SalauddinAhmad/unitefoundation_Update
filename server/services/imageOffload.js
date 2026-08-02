// ================================================================
// Image offload: converts base64 `data:` URIs stored inside DB
// columns into real files under /uploads/media, replacing the DB
// value with a normal https URL.
//
// Why: some rows stored multi-MB data URIs, which made list
// endpoints (/projects, /posts) 6+ MB. Slow hosts then reset the
// connection mid-response, so the site loaded only part of its data.
// ================================================================
const fs = require('fs/promises');
const path = require('path');
const pool = require('../db/pool');
const { uuid } = require('../utils/uid');

const uploadsRoot = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || './uploads');
const mediaDir = path.join(uploadsRoot, 'media');

// Tables/columns that may hold an image URL
const TARGETS = [
  { table: 'projects', columns: ['cover_image_url'] },
  { table: 'posts', columns: ['cover_image_url'] },
  { table: 'team_members', columns: ['photo'] },
  { table: 'gallery_items', columns: ['url', 'thumb_url'] },
  { table: 'partners', columns: ['logo_url', 'logo'] },
  { table: 'media_library', columns: ['url', 'thumb_url'] },
];




function extFromMime(mime = '') {
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('svg')) return 'svg';
  return 'jpg';
}

function parseDataUri(value) {
  const m = /^data:([^;,]+);base64,(.+)$/is.exec(String(value || '').trim());
  if (!m) return null;
  try {
    return { mime: m[1], buffer: Buffer.from(m[2].replace(/\s/g, ''), 'base64') };
  } catch {
    return null;
  }
}

async function writeFileFor(prefix, mime, buffer) {
  await fs.mkdir(mediaDir, { recursive: true });
  const ext = extFromMime(mime);
  const name = `${Date.now()}-${uuid()}-${prefix}.${ext}`;
  await fs.writeFile(path.join(mediaDir, name), buffer);
  return `/uploads/media/${name}`;
}

async function offloadTable({ table, columns }) {
  const converted = [];
  for (const col of columns) {
    let rows;
    try {
      [rows] = await pool.query(
        `SELECT id, \`${col}\` AS val FROM \`${table}\` WHERE \`${col}\` LIKE 'data:%'`
      );
    } catch {
      continue; // table/column not present in this deployment
    }
    for (const row of rows) {
      const parsed = parseDataUri(row.val);
      if (!parsed || !parsed.buffer.length) continue;
      try {
        const url = await writeFileFor(`${table}-${col}`, parsed.mime, parsed.buffer);
        await pool.execute(`UPDATE \`${table}\` SET \`${col}\`=? WHERE id=?`, [url, row.id]);
        converted.push({ table, column: col, id: row.id, bytes: parsed.buffer.length, url });
      } catch (e) {
        console.error(`[imageOffload] ${table}.${col} ${row.id} failed:`, e.message);
      }
    }
  }
  return converted;
}

// ----------------------------------------------------------------
// Host-independence pass: rewrite any absolute link that points at
// this API's own /uploads/... into a relative path. If the hosting
// IP, domain or protocol changes later, stored images keep working
// (the API re-absolutizes them per request).
// ----------------------------------------------------------------
const ABS_UPLOADS = /(?:https?:)?\/\/[^/"'\s]+(\/uploads\/)/gi;

async function normalizeTable({ table, columns }) {
  let fixed = 0;
  for (const col of columns) {
    let rows;
    try {
      [rows] = await pool.query(
        `SELECT id, \`${col}\` AS val FROM \`${table}\`
          WHERE \`${col}\` LIKE '%//%/uploads/%'`
      );
    } catch {
      continue;
    }
    for (const row of rows) {
      const next = String(row.val).replace(ABS_UPLOADS, '$1');
      if (next === row.val) continue;
      try {
        await pool.execute(`UPDATE \`${table}\` SET \`${col}\`=? WHERE id=?`, [next, row.id]);
        fixed++;
      } catch (e) {
        console.error(`[imageOffload] normalize ${table}.${col} ${row.id}:`, e.message);
      }
    }
  }
  return fixed;
}

// settings stores JSON blobs (hero slides, page headers, payment QR…)
async function normalizeSettings() {
  let fixed = 0;
  try {
    const [rows] = await pool.query(
      `SELECT \`key\`, \`value\` FROM settings WHERE \`value\` LIKE '%//%/uploads/%'`
    );
    for (const row of rows) {
      const next = String(row.value).replace(ABS_UPLOADS, '$1');
      if (next === row.value) continue;
      await pool.execute('UPDATE settings SET `value`=? WHERE `key`=?', [next, row.key]);
      fixed++;
    }
  } catch { /* different settings shape in some deployments */ }
  return fixed;
}

async function normalizeStoredUrls() {
  let fixed = 0;
  for (const t of TARGETS) fixed += await normalizeTable(t);
  fixed += await normalizeTable({ table: 'posts', columns: ['content'] });
  fixed += await normalizeTable({ table: 'projects', columns: ['description', 'content'] });
  fixed += await normalizeTable({ table: 'form_schemas', columns: ['extras'] });
  fixed += await normalizeSettings();
  if (fixed) console.log(`[imageOffload] normalized ${fixed} absolute /uploads links to relative`);
  return fixed;
}

async function runImageOffload() {
  const all = [];
  for (const t of TARGETS) all.push(...(await offloadTable(t)));
  if (all.length) {
    const mb = all.reduce((s, r) => s + r.bytes, 0) / (1024 * 1024);
    console.log(`[imageOffload] converted ${all.length} inline images (${mb.toFixed(1)} MB) to files`);
  }
  const normalized = await normalizeStoredUrls();
  return Object.assign(all, { normalized });
}

module.exports = { runImageOffload, normalizeStoredUrls };

