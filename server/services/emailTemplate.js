// Premium branded email template for Unite Foundation
// All system emails should be rendered through renderEmail() so branding stays consistent.

const BRAND = {
  name: 'Unite Foundation',
  tagline: 'সুন্নাহর অনুসরণে, মানবতার কল্যাণে',
  primary: '#ED2324',      // brand red
  primaryDark: '#B71C1D',
  accent: '#F57E20',       // brand orange
  success: '#00A651',      // brand green (underline in logo)
  text: '#0F172A',
  muted: '#64748B',
  bg: '#F1F5F9',
  card: '#FFFFFF',
  border: '#E2E8F0',
};

function siteUrl() {
  return (process.env.FRONTEND_URL || 'https://unitefoundation.bd').replace(/\/$/, '');
}
function logoUrl() {
  return process.env.EMAIL_LOGO_URL || `${siteUrl()}/uf-logo.png`;
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/**
 * Render a premium branded email.
 * @param {object} opts
 * @param {string} opts.title      Big heading in the card
 * @param {string} [opts.preheader] Inbox preview text (hidden)
 * @param {string} opts.intro      Short paragraph HTML (already-escaped safe HTML)
 * @param {Array<{label:string,value:string}>} [opts.details] Key/value rows
 * @param {{label:string,url:string}} [opts.cta]  Primary button
 * @param {string} [opts.note]     Small note below CTA
 * @param {string} [opts.footerNote] Extra footer note above legal line
 */
function renderEmail(opts) {
  const {
    title, preheader = '', intro = '', details = [], cta, note = '', footerNote = '',
  } = opts;

  const site = siteUrl();
  const year = new Date().getFullYear();

  const detailsHtml = details.length ? `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0 8px;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;background:#F8FAFC;">
      ${details.map((d, i) => `
        <tr>
          <td style="padding:12px 16px;font:500 13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};width:38%;border-bottom:${i === details.length - 1 ? '0' : `1px solid ${BRAND.border}`};">${esc(d.label)}</td>
          <td style="padding:12px 16px;font:600 14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.text};border-bottom:${i === details.length - 1 ? '0' : `1px solid ${BRAND.border}`};word-break:break-all;">${esc(d.value)}</td>
        </tr>`).join('')}
    </table>` : '';

  const ctaHtml = cta ? `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 8px;">
      <tr>
        <td align="center" bgcolor="${BRAND.primary}" style="border-radius:10px;">
          <a href="${esc(cta.url)}" target="_blank" style="display:inline-block;padding:14px 32px;font:600 15px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:10px;background:${BRAND.primary};">
            ${esc(cta.label)}
          </a>
        </td>
      </tr>
    </table>
    ${note ? `<p style="margin:8px 0 0;font:400 12px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};">${note}</p>` : ''}
  ` : '';

  return `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.bg};padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;">
      <!-- Header bar with brand wordmark -->
      <tr>
        <td align="center" style="padding:4px 4px 22px;">
          <a href="${site}" target="_blank" style="text-decoration:none;">
            <img src="${logoUrl()}" width="260" height="96" alt="${esc(BRAND.name)}" style="display:block;border:0;height:96px;width:260px;background:transparent;" />
          </a>
          <div style="margin-top:8px;font:500 12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};letter-spacing:.2px;">${esc(BRAND.tagline)}</div>
        </td>
      </tr>
      <!-- Card -->
      <tr>
        <td style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04);overflow:hidden;">
          <div style="height:4px;background:linear-gradient(90deg,${BRAND.primary} 0%,${BRAND.accent} 100%);"></div>
          <div style="padding:36px 36px 32px;">
            <h1 style="margin:0 0 12px;font:700 22px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.text};">${esc(title)}</h1>
            <div style="font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#334155;">
              ${intro}
            </div>
            ${detailsHtml}
            ${ctaHtml}
          </div>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding:22px 12px 0;text-align:center;font:400 12px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};">
          ${footerNote ? `<div style="margin-bottom:10px;">${footerNote}</div>` : ''}
          <div>
            <a href="${site}" target="_blank" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">${site.replace(/^https?:\/\//, '')}</a>
          </div>
          <div style="margin-top:6px;">© ${year} ${esc(BRAND.name)} — সর্বস্বত্ব সংরক্ষিত</div>
          
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// -------- Ready-made templates --------

function tplAdminCreated({ name, email, password, loginUrl }) {
  return renderEmail({
    title: 'স্বাগতম! আপনার অ্যাডমিন অ্যাকাউন্ট প্রস্তুত',
    preheader: 'Unite Foundation ড্যাশবোর্ডে আপনার লগইন তথ্য',
    intro: `<p style="margin:0 0 8px;">আসসালামু আলাইকুম <b>${esc(name || '')}</b>,</p>
            <p style="margin:0;">Unite Foundation-এর ম্যানেজমেন্ট ড্যাশবোর্ডে আপনার জন্য একটি অ্যাকাউন্ট তৈরি করা হয়েছে। নিচের তথ্য দিয়ে লগইন করুন এবং প্রথম লগইনের পর অবশ্যই পাসওয়ার্ড পরিবর্তন করে নিন।</p>`,
    details: [
      { label: 'ইমেইল', value: email },
      { label: 'অস্থায়ী পাসওয়ার্ড', value: password },
    ],
    cta: { label: 'ড্যাশবোর্ডে লগইন করুন', url: loginUrl || `${siteUrl()}/login` },
    note: 'নিরাপত্তার স্বার্থে এই ইমেইলটি অন্য কারো সাথে শেয়ার করবেন না।',
  });
}

function tplPasswordChanged({ password, loginUrl }) {
  return renderEmail({
    title: 'আপনার নতুন পাসওয়ার্ড',
    preheader: 'অ্যাডমিন কর্তৃক আপনার পাসওয়ার্ড রিসেট করা হয়েছে',
    intro: `<p style="margin:0;">একজন সুপার অ্যাডমিন আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করেছেন। নিচের অস্থায়ী পাসওয়ার্ড দিয়ে লগইন করে দ্রুততম সময়ে নতুন একটি পাসওয়ার্ড সেট করে নিন।</p>`,
    details: [{ label: 'নতুন পাসওয়ার্ড', value: password }],
    cta: { label: 'এখনই লগইন করুন', url: loginUrl || `${siteUrl()}/login` },
    note: 'আপনি এই পরিবর্তনের অনুরোধ না করে থাকলে এখনই সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।',
  });
}

function tplForgotPassword({ resetUrl }) {
  return renderEmail({
    title: 'পাসওয়ার্ড রিসেট অনুরোধ',
    preheader: 'পাসওয়ার্ড রিসেট লিংক — ১ ঘণ্টায় মেয়াদ শেষ',
    intro: `<p style="margin:0;">আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার একটি অনুরোধ আমরা পেয়েছি। নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।</p>`,
    cta: { label: 'পাসওয়ার্ড রিসেট করুন', url: resetUrl },
    note: 'লিংকটি <b>১ ঘণ্টা</b> পর্যন্ত সক্রিয় থাকবে। আপনি এই অনুরোধ না করে থাকলে ইমেইলটি উপেক্ষা করুন।',
  });
}

function tplLoginOtp({ code }) {
  return renderEmail({
    title: 'আপনার লগইন কোড',
    preheader: `Unite Foundation OTP: ${code}`,
    intro: `<p style="margin:0;">নিচের ৬-সংখ্যার কোডটি ব্যবহার করে লগইন সম্পন্ন করুন। কোডটি <b>৫ মিনিটের</b> জন্য কার্যকর।</p>
            <p style="margin:20px 0 0;text-align:center;">
              <span style="display:inline-block;padding:14px 22px;background:#F1F5F9;border:1px dashed ${BRAND.border};border-radius:12px;font:700 28px/1 'Menlo',Consolas,monospace;letter-spacing:8px;color:${BRAND.primaryDark};">${esc(code)}</span>
            </p>`,
    note: 'কোডটি কারো সাথে শেয়ার করবেন না — আমাদের কোনো টিম মেম্বার আপনার কাছে এই কোড চাইবে না।',
  });
}

// Wrap arbitrary admin-composed content (reply to contact message or broadcast)
function tplWrapContent({ subject, bodyHtml }) {
  return renderEmail({
    title: subject,
    preheader: subject,
    intro: bodyHtml,
  });
}

function tplDonationReceipt({ name, tran_id, amount, method, purpose, date, bank_tran_id, card_type }) {
  const site = siteUrl();
  const year = new Date().getFullYear();
  const fmtAmt = Number(amount || 0).toLocaleString('bn-BD');
  const rows = [
    { label: 'দাতার নাম', value: name || '—' },
    { label: 'ট্রানজেকশন আইডি', value: tran_id },
    { label: 'মাধ্যম', value: method || 'SSLCommerz' },
  ];
  if (card_type) rows.push({ label: 'কার্ড / চ্যানেল', value: card_type });
  if (bank_tran_id) rows.push({ label: 'ব্যাংক রেফারেন্স', value: bank_tran_id });
  if (purpose) rows.push({ label: 'উদ্দেশ্য', value: purpose });
  if (date) rows.push({ label: 'তারিখ', value: date });

  const rowsHtml = rows.map((d, i) => `
        <tr>
          <td style="padding:12px 18px;font:500 13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};width:40%;border-bottom:${i === rows.length - 1 ? '0' : `1px dashed ${BRAND.border}`};">${esc(d.label)}</td>
          <td style="padding:12px 18px;font:600 14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.text};border-bottom:${i === rows.length - 1 ? '0' : `1px dashed ${BRAND.border}`};word-break:break-all;">${esc(d.value)}</td>
        </tr>`).join('');

  return `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>আপনার দানের রসিদ — ${esc(BRAND.name)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">রসিদ ${esc(tran_id)} — ৳ ${fmtAmt} সফলভাবে গৃহীত হয়েছে</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.bg};padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;">
      <!-- Brand header -->
      <tr>
        <td align="center" style="padding:4px 4px 22px;">
          <a href="${site}" target="_blank" style="text-decoration:none;">
            <img src="${logoUrl()}" width="260" height="96" alt="${esc(BRAND.name)}" style="display:block;border:0;height:96px;width:260px;background:transparent;" />
          </a>
          <div style="margin-top:8px;font:500 12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};letter-spacing:.2px;">${esc(BRAND.tagline)}</div>
        </td>
      </tr>

      <!-- Main card -->
      <tr>
        <td style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:20px;box-shadow:0 4px 16px rgba(15,23,42,.06);overflow:hidden;">

          <!-- Hero: success gradient with amount -->
          <div style="background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.accent} 100%);padding:36px 24px 30px;text-align:center;color:#ffffff;">
            <div style="width:64px;height:64px;line-height:64px;margin:0 auto 14px;background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.4);border-radius:50%;font:700 32px/64px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#ffffff;">✓</div>
            <div style="font:400 18px/1.4 'Amiri','Scheherazade New',serif;color:#fff;opacity:.95;margin-bottom:6px;" dir="rtl">جَزَاكُمُ اللهُ خَيْرًا</div>
            <h1 style="margin:0 0 6px;font:700 26px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#ffffff;">আল-হামদুলিল্লাহ!</h1>
            <p style="margin:0 0 20px;font:400 14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#fff;opacity:.92;">আপনার অনুদানটি আমরা সফলভাবে গ্রহণ করেছি। জাযাকাল্লাহু খাইরান!</p>
            <div style="display:inline-block;padding:14px 32px;background:#ffffff;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.15);">
              <div style="font:500 11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">দানের পরিমাণ</div>
              <div style="font:800 34px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.primary};">৳ ${fmtAmt}</div>
            </div>
          </div>

          <!-- Message -->
          <div style="padding:28px 32px 8px;">
            <p style="margin:0 0 8px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#334155;">
              আস-সালামু আলাইকুম, <b style="color:${BRAND.text};">${esc(name || '')}</b>
            </p>
            <p style="margin:0;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#334155;">
              ইউনাইট ফাউন্ডেশনের ওপর আস্থা রাখার জন্য জাযাকাল্লাহু খাইরান। আপনার এই মূল্যবান দান আমাদের দাওয়াহ ও সেবামূলক কাজকে আরও একধাপ এগিয়ে নিয়ে যেতে সহজ হবে ইনশাআল্লাহ। মহান আল্লাহ আপনার দান কবুল করুন এবং আপনার রিজিকে বারাকাহ দান করুন, আমীন!
            </p>
          </div>

          <!-- Receipt details -->
          <div style="padding:20px 32px 8px;">
            <div style="display:inline-block;padding:4px 12px;background:${BRAND.bg};border-radius:20px;font:600 11px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px;">ডিজিটাল রসিদ</div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 0;border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;background:#FAFBFC;">
              ${rowsHtml}
            </table>
          </div>

          <!-- CTA -->
          <div style="padding:20px 32px 32px;text-align:center;">
            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px auto 0;">
              <tr>
                <td align="center" bgcolor="${BRAND.primary}" style="border-radius:10px;">
                  <a href="${site}/payment/success?tran_id=${encodeURIComponent(tran_id)}" target="_blank" style="display:inline-block;padding:14px 32px;font:600 15px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:10px;background:${BRAND.primary};">
                    রসিদ অনলাইনে দেখুন
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:14px 0 0;font:400 12px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};">এই ইমেইলটি আপনার দানের অফিসিয়াল রসিদ হিসেবে সংরক্ষণ করে রাখুন।</p>
          </div>

          <!-- Dua ribbon -->
          <div style="background:linear-gradient(90deg,#FFF7ED 0%,#FEF2F2 100%);border-top:1px solid ${BRAND.border};padding:18px 24px;text-align:right;">
            <div style="font:400 13px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};">শুভেচ্ছান্তে,</div>
            <div style="margin-top:6px;font:700 15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.primaryDark};">আব্দুল্লাহ বিন এরশাদ</div>
            <div style="margin-top:2px;font:400 12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};">চেয়ারম্যান, ইউনাইট ফাউন্ডেশন, ঢাকা</div>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:22px 12px 0;text-align:center;font:400 12px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.muted};">
          <div><a href="${site}" target="_blank" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">${site.replace(/^https?:\/\//, '')}</a></div>
          <div style="margin-top:6px;">© ${year} ${esc(BRAND.name)} — সর্বস্বত্ব সংরক্ষিত</div>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

module.exports = {
  renderEmail,
  tplAdminCreated,
  tplPasswordChanged,
  tplForgotPassword,
  tplLoginOtp,
  tplWrapContent,
  tplDonationReceipt,
};
