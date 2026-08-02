const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');
const { sendMail } = require('../services/mailer');
const { tplWrapContent, renderEmail } = require('../services/emailTemplate');
const { validateEmail } = require('../utils/emailValidator');

router.get('/', requireAuth, asyncH(async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM messages ORDER BY created_at DESC');
  res.json(rows);
}));

router.post('/', asyncH(async (req, res) => {
  const d = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    subject: z.string().optional(),
    body: z.string().min(1),
  }).parse(req.body);
  const ev = validateEmail(d.email);
  if (!ev.ok) return res.status(400).json({ message: ev.message, code: ev.code });
  const id = uuid();
  await pool.execute(
    'INSERT INTO messages (id,name,email,phone,subject,body) VALUES (?,?,?,?,?,?)',
    [id, d.name, d.email, d.phone || null, d.subject || null, d.body]
  );

  // Background emails — never block or fail the API response
  try {
    const details = [
      { label: 'নাম', value: d.name },
      { label: 'ইমেইল', value: d.email },
    ];
    if (d.phone) details.push({ label: 'মোবাইল', value: d.phone });
    if (d.subject) details.push({ label: 'বিষয়', value: d.subject });

    // 1) Confirmation to sender
    const ackHtml = renderEmail({
      title: 'আপনার বার্তা আমরা পেয়েছি',
      preheader: 'জাযাকাল্লাহু খাইরান — আমরা শীঘ্রই যোগাযোগ করব',
      intro: `<p style="margin:0 0 8px;">আসসালামু আলাইকুম <b>${d.name}</b>,</p>
              <p style="margin:0;">Unite Foundation-এর সাথে যোগাযোগ করার জন্য ধন্যবাদ। আপনার বার্তাটি আমরা সফলভাবে পেয়েছি এবং যত দ্রুত সম্ভব উত্তর দেব ইন শা আল্লাহ।</p>
              <p style="margin:12px 0 0;color:#64748B;font-size:13px;">আপনার পাঠানো বার্তা:</p>
              <div style="margin-top:6px;padding:12px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;white-space:pre-wrap;">${String(d.body).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</div>`,
      details,
    });
    sendMail({ to: d.email, subject: 'বার্তা গৃহীত | Unite Foundation', html: ackHtml })
      .catch((err) => console.error('[messages] sender ack email failed:', err && err.message));

    // 2) Notification to admin inbox
    const adminTo = process.env.APPLICATIONS_NOTIFY_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
    if (adminTo) {
      const notifyHtml = renderEmail({
        title: 'নতুন যোগাযোগ বার্তা',
        preheader: `${d.name} — ${d.subject || 'নতুন বার্তা'}`,
        intro: `<p style="margin:0;">ওয়েবসাইট থেকে একটি নতুন যোগাযোগ বার্তা এসেছে।</p>
                <div style="margin-top:10px;padding:12px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;white-space:pre-wrap;">${String(d.body).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</div>`,
        details,
        cta: { label: 'ড্যাশবোর্ডে দেখুন', url: `${(process.env.FRONTEND_URL || 'https://unitefoundation.bd').replace(/\/$/, '')}/dashboard/messages` },
      });
      sendMail({ to: adminTo, subject: `[নতুন বার্তা] ${d.subject || d.name}`, html: notifyHtml })
        .catch((err) => console.error('[messages] admin notify email failed:', err && err.message));
    }
  } catch (err) {
    console.error('[messages] email dispatch error:', err && err.message);
  }

  res.status(201).json({ id });
}));

router.patch('/:id', requireAuth, asyncH(async (req, res) => {
  const { status } = z.object({ status: z.enum(['new','read','replied']) }).parse(req.body);
  await pool.execute('UPDATE messages SET status=? WHERE id=?', [status, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth, asyncH(async (req, res) => {
  await pool.execute('DELETE FROM messages WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

router.post('/:id/reply', requireAuth, asyncH(async (req, res) => {
  const d = z.object({ to: z.string().email(), subject: z.string(), body: z.string().min(1) }).parse(req.body);
  try {
    await sendMail({ to: d.to, subject: d.subject, html: tplWrapContent({ subject: d.subject, bodyHtml: d.body }) });
  } catch (err) {
    return res.status(502).json({ message: 'SMTP পাঠাতে ব্যর্থ', error: String(err && err.message || err) });
  }
  await pool.execute(
    'INSERT INTO message_replies (message_id,to_email,subject,body) VALUES (?,?,?,?)',
    [req.params.id, d.to, d.subject, d.body]
  );
  await pool.execute('UPDATE messages SET status="replied" WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

// Admin-composed outbound email (not a public contact-form submission)
router.post('/compose', requireAuth, asyncH(async (req, res) => {
  const d = z.object({
    to: z.array(z.string().email()).min(1),
    cc: z.array(z.string().email()).optional().default([]),
    bcc: z.array(z.string().email()).optional().default([]),
    subject: z.string().min(1),
    html: z.string().min(1),
  }).parse(req.body);
  try {
    await sendMail({
      to: d.to.join(','),
      cc: d.cc.join(','),
      bcc: d.bcc.join(','),
      subject: d.subject,
      html: tplWrapContent({ subject: d.subject, bodyHtml: d.html }),
    });
  } catch (err) {
    return res.status(502).json({ message: 'SMTP পাঠাতে ব্যর্থ', error: String(err && err.message || err) });
  }
  await pool.execute(
    'INSERT INTO message_replies (message_id,to_email,subject,body) VALUES (?,?,?,?)',
    [null, d.to[0], d.subject, d.html]
  );
  res.json({ ok: true });
}));

// SMTP diagnostic — verifies transporter can connect & authenticate
router.get('/smtp/test', requireAuth, asyncH(async (_req, res) => {
  const { resolveTransporter, getActiveConfig } = require('../services/mailer');
  try {
    await resolveTransporter(true);
    const cfg = getActiveConfig() || {};
    res.json({
      ok: true,
      host: cfg.host || null,
      port: cfg.port || null,
      secure: cfg.secure,
      from: process.env.SMTP_FROM || process.env.SMTP_USER || null,
    });
  } catch (err) {
    res.status(502).json({ ok: false, error: String(err && err.message || err) });
  }
}));


module.exports = router;
