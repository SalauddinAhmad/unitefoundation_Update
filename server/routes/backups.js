// ============================================================
// /backups — automatic database backup management (super admin)
// ============================================================
const router = require('express').Router();
const fs = require('fs');
const { z } = require('zod');
const asyncH = require('../utils/asyncH');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');
const { logActivity } = require('../services/audit');
const backup = require('../services/backup');

router.use(requireAuth, requireSuperAdmin);

// Status + config + file list
router.get('/', asyncH(async (_req, res) => {
  res.json({
    config: backup.getConfig(),
    state: backup.getState(),
    running: backup.isRunning(),
    nextRunAt: backup.nextRunAt(),
    backups: backup.listBackups(),
  });
}));

// Update schedule / retention / email settings
router.put('/config', asyncH(async (req, res) => {
  const d = z.object({
    enabled: z.boolean().optional(),
    frequency: z.enum(['hourly', 'daily', 'weekly']).optional(),
    retention: z.number().int().min(1).max(60).optional(),
    emailCopy: z.boolean().optional(),
    emailTo: z.string().email().or(z.literal('')).optional(),
  }).parse(req.body || {});
  const cfg = backup.setConfig(d);
  logActivity({ req, action: 'update', entity: 'backups', summary: 'ব্যাকআপ সেটিংস আপডেট', meta: cfg });
  res.json(cfg);
}));

// Run one backup immediately
router.post('/run', asyncH(async (req, res) => {
  const out = await backup.runBackup('manual');
  logActivity({
    req,
    action: out.ok ? 'create' : 'other',
    entity: 'backups',
    summary: out.ok ? `ম্যানুয়াল ব্যাকআপ তৈরি (${out.file})` : `ব্যাকআপ ব্যর্থ: ${out.error}`,
  });
  res.status(out.ok ? 200 : 500).json(out);
}));

// Download one dump
router.get('/download/:file', asyncH(async (req, res) => {
  const p = backup.backupPath(req.params.file);
  if (!p) return res.status(404).json({ message: 'Backup not found' });
  res.setHeader('Content-Type', 'application/gzip');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.file}"`);
  fs.createReadStream(p).pipe(res);
}));

// Delete one dump
router.delete('/:file', asyncH(async (req, res) => {
  const ok = backup.removeBackup(req.params.file);
  if (!ok) return res.status(404).json({ message: 'Backup not found' });
  logActivity({ req, action: 'delete', entity: 'backups', summary: `ব্যাকআপ ডিলিট (${req.params.file})` });
  res.json({ ok: true });
}));

module.exports = router;
