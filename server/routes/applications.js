const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');
const { sendMail } = require('../services/mailer');
const { renderEmail } = require('../services/emailTemplate');

const KINDS = ['volunteer','member','career','donor'];

// Bangla labels for each kind — used in the confirmation email
const KIND_LABEL = {
  volunteer: 'স্বেচ্ছাসেবক আবেদন',
  career:    'জেলা প্রতিনিধি আবেদন',
  member:    'সদস্যপদ আবেদন',
  donor:     'নিয়মিত দাতা নিবন্ধন',
};

const KIND_INTRO = {
  volunteer: 'আপনার স্বেচ্ছাসেবক আবেদনটি আমরা সফলভাবে পেয়েছি। আপনার আগ্রহ ও সময়ের জন্য আমরা কৃতজ্ঞ — ইন শা আল্লাহ, ২৪-৪৮ ঘণ্টার মধ্যে আমাদের টিম আপনার সাথে যোগাযোগ করবে।',
  career:    'আপনার জেলা প্রতিনিধি আবেদনটি আমরা সফলভাবে পেয়েছি। আবেদনটি যাচাই-বাছাই শেষে আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবে ইন শা আল্লাহ।',
  member:    'আপনার সদস্যপদ আবেদনটি আমরা সফলভাবে পেয়েছি। যাচাই-বাছাই শেষে আমাদের টিম আপনার সাথে যোগাযোগ করবে ইন শা আল্লাহ।',
  donor:     'নিয়মিত দাতা হিসেবে আপনার নিবন্ধনটি সফলভাবে গ্রহণ করা হয়েছে। জাযাকাল্লাহু খাইরান — শীঘ্রই আমাদের টিম পেমেন্ট সংক্রান্ত বিস্তারিত জানাবে।',
};

function humaniseKey(k) {
  return String(k || '')
    .replace(/^_/, '')
    .replace(/[_\-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Fire-and-forget confirmation email; never blocks the API response.
function sendConfirmationEmails(kind, payload) {
  const to = (payload.email || '').trim();
  const kindLabel = KIND_LABEL[kind] || 'আবেদন';
  const intro = KIND_INTRO[kind] || 'আপনার আবেদনটি আমরা সফলভাবে পেয়েছি।';

  // Build a short details block from what we know
  const details = [];
  if (payload.name) details.push({ label: 'নাম', value: payload.name });
  if (payload.phone) details.push({ label: 'মোবাইল', value: payload.phone });
  if (payload.email) details.push({ label: 'ইমেইল', value: payload.email });
  if (payload.address) details.push({ label: 'ঠিকানা', value: payload.address });
  if (payload.profession) details.push({ label: 'পেশা', value: payload.profession });
  if (payload.extra && typeof payload.extra === 'object') {
    Object.entries(payload.extra).forEach(([k, v]) => {
      if (v == null || v === '' || k.startsWith('_')) return;
      if (['name','phone','email','address','profession'].includes(k)) return;
      const val = Array.isArray(v) ? v.join(', ') : String(v);
      if (val.length > 200) return;
      details.push({ label: humaniseKey(k), value: val });
    });
  }

  // 1) Confirmation to applicant
  if (to && /.+@.+\..+/.test(to)) {
    const html = renderEmail({
      title: `${kindLabel} — সফলভাবে গৃহীত`,
      preheader: 'জাযাকাল্লাহু খাইরান — আপনার আবেদন আমরা পেয়েছি',
      intro: `<p style="margin:0 0 8px;">আসসালামু আলাইকুম <b>${payload.name || ''}</b>,</p>
              <p style="margin:0;">${intro}</p>`,
      details,
      footerNote: 'কোনো প্রশ্ন থাকলে সরাসরি এই ইমেইলে জবাব দিন অথবা আমাদের ওয়েবসাইটে যোগাযোগ পাতা ব্যবহার করুন।',
    });
    sendMail({ to, subject: `${kindLabel} — গৃহীত | Unite Foundation`, html })
      .catch((err) => console.error('[applications] applicant email failed:', err && err.message));
  }

  // 2) Notification to admin inbox (if configured)
  const adminTo = process.env.APPLICATIONS_NOTIFY_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
  if (adminTo) {
    const html = renderEmail({
      title: `নতুন ${kindLabel}`,
      preheader: `${payload.name || ''} — ${payload.phone || ''}`,
      intro: `<p style="margin:0;">ওয়েবসাইট থেকে একটি নতুন ${kindLabel} জমা হয়েছে।</p>`,
      details,
      cta: { label: 'ড্যাশবোর্ডে দেখুন', url: `${(process.env.FRONTEND_URL || 'https://unitefoundation.bd').replace(/\/$/, '')}/dashboard` },
    });
    sendMail({ to: adminTo, subject: `[নতুন] ${kindLabel} — ${payload.name || ''}`, html })
      .catch((err) => console.error('[applications] admin email failed:', err && err.message));
  }
}

router.get('/:kind', requireAuth, asyncH(async (req, res) => {
  if (!KINDS.includes(req.params.kind)) return res.status(400).json({ message: 'Invalid kind' });
  const [rows] = await pool.execute('SELECT * FROM applications WHERE kind=? ORDER BY created_at DESC', [req.params.kind]);
  res.json(rows);
}));

// pluralised list endpoints for spec compatibility
['volunteers','members','careers','donors'].forEach(p => {
  const kind = p.replace(/s$/, '');
  router.get('/' + p, requireAuth, asyncH(async (_req, res) => {
    const [rows] = await pool.execute('SELECT * FROM applications WHERE kind=? ORDER BY created_at DESC', [kind]);
    res.json(rows);
  }));
});

router.post('/:kind', asyncH(async (req, res) => {
  if (!KINDS.includes(req.params.kind)) return res.status(400).json({ message: 'Invalid kind' });
  const data = z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    profession: z.string().optional(),
    message: z.string().optional(),
    extra: z.any().optional(),
  }).parse(req.body);
  const id = uuid();
  await pool.execute(
    `INSERT INTO applications (id,kind,name,phone,email,address,profession,message,extra)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, req.params.kind, data.name, data.phone || null, data.email || null, data.address || null,
     data.profession || null, data.message || null, data.extra ? JSON.stringify(data.extra) : null]
  );
  res.status(201).json({ id, status: 'new' });
}));

router.patch('/:kind/:id', requireAuth, asyncH(async (req, res) => {
  const { status } = z.object({ status: z.enum(['new','reviewing','approved','rejected']) }).parse(req.body);
  await pool.execute('UPDATE applications SET status=? WHERE id=? AND kind=?', [status, req.params.id, req.params.kind]);
  res.json({ ok: true });
}));

module.exports = router;
