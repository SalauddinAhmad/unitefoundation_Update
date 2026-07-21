const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');
const { sendMail } = require('../services/mailer');
const { renderEmail } = require('../services/emailTemplate');
const { validateEmail } = require('../utils/emailValidator');

// --- Public: subscribe -------------------------------------------------------
router.post('/subscribe', asyncH(async (req, res) => {
  const d = z.object({
    email: z.string().trim().email().max(255),
    source: z.string().max(64).optional(),
  }).parse(req.body);

  const ev = validateEmail(d.email);
  if (!ev.ok) return res.status(400).json({ message: ev.message, code: ev.code });

  const email = d.email.toLowerCase();
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().slice(0, 64);
  const ua = String(req.headers['user-agent'] || '').slice(0, 512);

  // Upsert — reactivate if previously unsubscribed
  const id = uuid();
  await pool.execute(
    `INSERT INTO newsletter_subscribers (id, email, source, status, ip, user_agent)
     VALUES (?, ?, ?, 'active', ?, ?)
     ON DUPLICATE KEY UPDATE status = 'active', source = COALESCE(VALUES(source), source)`,
    [id, email, d.source || 'footer', ip, ua]
  );

  // Welcome email — background, never blocks response
  try {
    const html = renderEmail({
      title: 'সাবস্ক্রিপশন সফলভাবে গ্রহণ করা হয়েছে',
      preheader: 'জাযাকাল্লাহু খাইরান — Unite Foundation নিউজলেটারে আপনাকে স্বাগতম',
      intro: `<p style="margin:0 0 8px;">আসসালামু আলাইকুম,</p>
              <p style="margin:0;">Unite Foundation-এর নিউজলেটারে সাবস্ক্রাইব করার জন্য জাযাকাল্লাহু খাইরান। এখন থেকে আমাদের সাম্প্রতিক কাজ, প্রকল্প ও দাওয়াতি কার্যক্রমের আপডেট আপনার ইনবক্সে পৌঁছে যাবে ইন শা আল্লাহ।</p>
              <p style="margin:12px 0 0;color:#64748B;font-size:13px;">যেকোনো সময় নিউজলেটার বন্ধ করতে চাইলে আমাদের ইমেইল করলেই যথেষ্ট।</p>`,
    });
    sendMail({ to: email, subject: 'সাবস্ক্রিপশন নিশ্চিত | Unite Foundation', html })
      .catch((err) => console.error('[newsletter] welcome email failed:', err && err.message));
  } catch (e) {
    console.error('[newsletter] welcome render failed:', e && e.message);
  }

  res.json({ ok: true });
}));

// --- Admin: list -------------------------------------------------------------
router.get('/', requireAuth, asyncH(async (_req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, email, source, status, created_at FROM newsletter_subscribers ORDER BY created_at DESC'
  );
  res.json(rows);
}));

// --- Admin: delete -----------------------------------------------------------
router.delete('/:id', requireAuth, asyncH(async (req, res) => {
  await pool.execute('DELETE FROM newsletter_subscribers WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
}));

// --- Admin: CSV export -------------------------------------------------------
router.get('/export.csv', requireAuth, asyncH(async (_req, res) => {
  const [rows] = await pool.execute(
    'SELECT email, source, status, created_at FROM newsletter_subscribers ORDER BY created_at DESC'
  );
  const escape = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const header = ['email', 'source', 'status', 'created_at'].join(',');
  const body = rows.map((r) => [r.email, r.source, r.status, r.created_at].map(escape).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscribers.csv"');
  res.send('\uFEFF' + header + '\n' + body);
}));

// --- Admin: broadcast to all active subscribers (individual sends) ---------
router.post('/broadcast', requireAuth, asyncH(async (req, res) => {
  const d = z.object({
    subject: z.string().trim().min(1).max(200),
    title: z.string().trim().max(200).optional(),
    preheader: z.string().trim().max(200).optional(),
    message: z.string().trim().min(1),
    isHtml: z.boolean().optional(),
    testTo: z.string().trim().email().optional(),
  }).parse(req.body);

  const bodyHtml = d.isHtml
    ? d.message
    : `<div style="white-space:pre-wrap;line-height:1.7;">${
        d.message.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
      }</div>`;

  const buildHtml = () => renderEmail({
    title: d.title || d.subject,
    preheader: d.preheader || '',
    intro: bodyHtml,
  });

  // Test send — single recipient, immediate
  if (d.testTo) {
    await sendMail({ to: d.testTo, subject: d.subject, html: buildHtml() });
    return res.json({ ok: true, test: true, sentTo: d.testTo });
  }

  const [rows] = await pool.execute(
    "SELECT email FROM newsletter_subscribers WHERE status = 'active'"
  );
  const emails = rows.map((r) => r.email).filter(Boolean);
  if (emails.length === 0) return res.json({ ok: true, total: 0, sent: 0, failed: 0 });

  // Fire-and-forget: send individually in small batches so recipients never see each other
  const html = buildHtml();
  const BATCH = Number(process.env.NEWSLETTER_BATCH_SIZE || 10);
  const DELAY = Number(process.env.NEWSLETTER_BATCH_DELAY_MS || 500);

  (async () => {
    let sent = 0, failed = 0;
    for (let i = 0; i < emails.length; i += BATCH) {
      const chunk = emails.slice(i, i + BATCH);
      await Promise.all(chunk.map((to) =>
        sendMail({ to, subject: d.subject, html })
          .then(() => { sent++; })
          .catch((err) => { failed++; console.error('[newsletter] send failed:', to, err && err.message); })
      ));
      if (i + BATCH < emails.length) await new Promise((r) => setTimeout(r, DELAY));
    }
    console.log(`[newsletter] broadcast done — total=${emails.length} sent=${sent} failed=${failed}`);
  })();

  res.json({ ok: true, total: emails.length, queued: true });
}));

module.exports = router;

