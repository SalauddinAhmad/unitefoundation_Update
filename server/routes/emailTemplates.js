// ================================================================
// GET/PUT admin-editable email templates.
// All endpoints are super_admin only.
// Falls back gracefully if migration 021 hasn't been applied yet.
// ================================================================
const router = require('express').Router();
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');
const store = require('../services/emailTemplateStore');
const { TEMPLATES, KEYS, mergeWithDefaults } = require('../services/emailTemplateDefaults');
const tpl = require('../services/emailTemplate');

// Descriptor payload (labels, fields, variables, sample) for the editor UI.
function descriptor() {
  return Object.fromEntries(
    KEYS.map((k) => {
      const d = TEMPLATES[k];
      return [k, {
        label: d.label,
        description: d.description,
        variables: d.variables,
        fields: d.fields,
        sample: d.sample,
        defaults: d.defaults,
      }];
    }),
  );
}

// GET /email-templates → { schema, values }
router.get('/', requireAuth, requireSuperAdmin, asyncH(async (_req, res) => {
  await store.refresh(true).catch(() => {});
  const values = Object.fromEntries(KEYS.map((k) => [k, store.get(k)]));
  res.json({ schema: descriptor(), values });
}));

// PUT /email-templates/:key  body: { subject, slots }
router.put('/:key', requireAuth, requireSuperAdmin, asyncH(async (req, res) => {
  const key = req.params.key;
  if (!KEYS.includes(key)) return res.status(404).json({ message: 'Unknown template' });

  const body = req.body || {};
  const def = TEMPLATES[key];
  const allowedSlotKeys = new Set(def.fields.filter((f) => f.key !== 'subject').map((f) => f.key));
  allowedSlotKeys.add('html_override'); // exposed via dedicated button, not in fields[]

  const cleanSlots = {};
  const inSlots = body.slots && typeof body.slots === 'object' ? body.slots : {};
  for (const k of Object.keys(inSlots)) {
    if (allowedSlotKeys.has(k) && typeof inSlots[k] === 'string') {
      const cap = k === 'html_override' ? 200_000 : 5000;
      cleanSlots[k] = inSlots[k].slice(0, cap);
    }
  }
  const subject = typeof body.subject === 'string' && body.subject.trim()
    ? body.subject.slice(0, 255)
    : def.defaults.subject;

  const data = { subject, slots: cleanSlots };
  const json = JSON.stringify(data);
  const updatedBy = req.user?.email || req.user?.id || null;

  if (!(await store.hasTable())) {
    return res.status(503).json({
      message: 'email_templates টেবিল এখনো তৈরি হয়নি — migration 021 চালান।',
    });
  }

  await pool.execute(
    'INSERT INTO email_templates (`key`, data, updated_by) VALUES (?, ?, ?) ' +
    'ON DUPLICATE KEY UPDATE data=VALUES(data), updated_by=VALUES(updated_by)',
    [key, json, updatedBy],
  );

  store.setLocal(key, data);
  res.json({ ok: true, value: mergeWithDefaults(key, data) });
}));

// POST /email-templates/:key/reset → drop override, revert to defaults
router.post('/:key/reset', requireAuth, requireSuperAdmin, asyncH(async (req, res) => {
  const key = req.params.key;
  if (!KEYS.includes(key)) return res.status(404).json({ message: 'Unknown template' });
  if (await store.hasTable()) {
    await pool.execute('DELETE FROM email_templates WHERE `key`=?', [key]);
  }
  store.clearLocal(key);
  res.json({ ok: true, value: mergeWithDefaults(key) });
}));

// POST /email-templates/:key/preview  body: { subject?, slots?, raw? }
// Renders the template with the provided override (without persisting)
// and returns the resulting HTML. When `raw:true`, variables are kept
// as {{placeholder}} strings AND html_override is forced empty — this
// is used by the editor to fetch the current default design for editing.
router.post('/:key/preview', requireAuth, requireSuperAdmin, asyncH(async (req, res) => {
  const key = req.params.key;
  if (!KEYS.includes(key)) return res.status(404).json({ message: 'Unknown template' });

  const def = TEMPLATES[key];
  const body = req.body || {};
  const raw = !!body.raw;
  const inSlots = body.slots && typeof body.slots === 'object' ? { ...body.slots } : {};
  if (raw) inSlots.html_override = '';
  const draft = mergeWithDefaults(key, { subject: body.subject, slots: inSlots });

  // Temporarily inject the draft into the store, render, then restore.
  const before = store.get(key);
  store.setLocal(key, draft);
  let html = '';
  try {
    let sample = def.sample || {};
    if (raw) {
      // Replace every declared variable with a visible {{key}} placeholder.
      sample = Object.fromEntries((def.variables || []).map((v) => [v.key, `{{${v.key}}}`]));
      // Some templates use aliased sample keys — mirror them.
      if (sample.reset_url) sample.resetUrl = sample.reset_url;
    }
    switch (key) {
      case 'admin_created':      html = tpl.tplAdminCreated(sample); break;
      case 'password_changed':   html = tpl.tplPasswordChanged(sample); break;
      case 'forgot_password':    html = tpl.tplForgotPassword({ resetUrl: sample.reset_url || sample.resetUrl }); break;
      case 'login_otp':          html = tpl.tplLoginOtp(sample); break;
      case 'donation_receipt':   html = tpl.tplDonationReceipt(sample); break;
      default: html = '<p>Preview unavailable.</p>';
    }
  } finally {
    store.setLocal(key, before);
  }
  res.type('html').send(html);
}));

module.exports = router;
