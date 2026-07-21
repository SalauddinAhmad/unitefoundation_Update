// SSLCommerz payment gateway integration
// Flow: client POST /sslcommerz/init -> returns GatewayPageURL ->
//       user pays -> SSLCommerz POSTs to /success|/fail|/cancel|/ipn ->
//       server validates via validator API -> updates donation -> redirects user.

const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { shortId } = require('../utils/uid');
const { validateEmail } = require('../utils/emailValidator');
const { sendMail } = require('../services/mailer');
const { tplDonationReceipt, subjectOf } = require('../services/emailTemplate');

// Send receipt email once per donation (idempotent — checks receipt_sent flag)
async function sendReceiptOnce(tran_id) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, email, amount, method, purpose, card_type, bank_tran_id, created_at, status, receipt_sent
         FROM donations WHERE id=?`, [tran_id]
    );
    const d = rows[0];
    if (!d || d.status !== 'completed' || !d.email || d.receipt_sent) return;
    const html = tplDonationReceipt({
      name: d.name,
      tran_id: d.id,
      amount: d.amount,
      method: d.method,
      purpose: d.purpose,
      card_type: d.card_type,
      bank_tran_id: d.bank_tran_id,
      date: d.created_at ? new Date(d.created_at).toLocaleString('bn-BD') : '',
    });
    await sendMail({
      to: d.email,
      subject: subjectOf('donation_receipt', { name: d.name, tran_id: d.id, amount: d.amount }),
      html,
    });
    await pool.execute(`UPDATE donations SET receipt_sent=1 WHERE id=?`, [tran_id]);
  } catch (e) {
    console.error('[sslcommerz] receipt email failed for', tran_id, e.message);
  }
}

const IS_LIVE = String(process.env.SSLCOMMERZ_LIVE || 'true').toLowerCase() === 'true';
const BASE = IS_LIVE
  ? 'https://securepay.sslcommerz.com'
  : 'https://sandbox.sslcommerz.com';

const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://unitefoundation.bd').replace(/\/$/, '');
const API_URL  = (process.env.PUBLIC_API_URL  || `${SITE_URL}/api`).replace(/\/$/, '');

function form(obj) {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) p.append(k, String(v));
  });
  return p;
}

// 1) INIT — create pending donation, get GatewayPageURL
router.post('/init', asyncH(async (req, res) => {
  const data = z.object({
    name: z.string().min(1).max(150),
    email: z.string().email(),
    phone: z.string().min(6).max(30),
    amount: z.number().positive(),
    address: z.string().optional(),
    purpose: z.string().max(190).optional(),
    note: z.string().optional(),
  }).parse(req.body);

  const ev = validateEmail(data.email);
  if (!ev.ok) return res.status(400).json({ message: ev.message, code: ev.code });

  if (!process.env.SSLCOMMERZ_STORE_ID || !process.env.SSLCOMMERZ_STORE_PASSWORD) {
    return res.status(500).json({ message: 'SSLCommerz credentials not configured' });
  }

  const id = shortId('TXN-');
  await pool.execute(
    `INSERT INTO donations (id,name,phone,email,amount,method,note,purpose,status,currency)
     VALUES (?,?,?,?,?, 'sslcommerz', ?, ?, 'pending', 'BDT')`,
    [id, data.name, data.phone, data.email, data.amount, data.note || null, data.purpose || null]
  );

  const body = form({
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
    total_amount: data.amount.toFixed(2),
    currency: 'BDT',
    tran_id: id,
    success_url: `${API_URL}/sslcommerz/success`,
    fail_url:    `${API_URL}/sslcommerz/fail`,
    cancel_url:  `${API_URL}/sslcommerz/cancel`,
    ipn_url:     `${API_URL}/sslcommerz/ipn`,
    shipping_method: 'NO',
    product_name: data.purpose || 'Donation',
    product_category: 'Donation',
    product_profile: 'non-physical-goods',
    cus_name: data.name,
    cus_email: data.email,
    cus_add1: data.address || 'N/A',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    cus_phone: data.phone,
  });

  const r = await fetch(`${BASE}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const j = await r.json().catch(() => ({}));

  if (j.status !== 'SUCCESS' || !j.GatewayPageURL) {
    await pool.execute(`UPDATE donations SET status='failed', raw_response=? WHERE id=?`,
      [JSON.stringify(j).slice(0, 60000), id]);
    return res.status(502).json({ message: j.failedreason || 'Gateway init failed', detail: j });
  }

  res.json({ id, gatewayUrl: j.GatewayPageURL });
}));

// Helper — validate transaction via SSLCommerz validator
async function validate(val_id) {
  const url = `${BASE}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(val_id)}` +
    `&store_id=${encodeURIComponent(process.env.SSLCOMMERZ_STORE_ID)}` +
    `&store_passwd=${encodeURIComponent(process.env.SSLCOMMERZ_STORE_PASSWORD)}&format=json`;
  const r = await fetch(url);
  return r.json().catch(() => ({}));
}

async function persistPayload(tran_id, payload, status) {
  await pool.execute(
    `UPDATE donations
        SET status=?, val_id=?, bank_tran_id=?, card_type=?, currency=?, transaction_id=?, raw_response=?
      WHERE id=?`,
    [
      status,
      payload.val_id || null,
      payload.bank_tran_id || null,
      payload.card_type || null,
      payload.currency || 'BDT',
      payload.bank_tran_id || payload.tran_id || null,
      JSON.stringify(payload).slice(0, 60000),
      tran_id,
    ]
  );
}

// 2) SUCCESS callback — SSLCommerz POSTs form-data here
router.post('/success', asyncH(async (req, res) => {
  const p = req.body || {};
  const tran_id = p.tran_id;
  if (!tran_id) return res.redirect(`${SITE_URL}/donate?payment=error`);

  let status = 'failed';
  if (p.val_id) {
    const v = await validate(p.val_id);
    if ((v.status === 'VALID' || v.status === 'VALIDATED') && v.tran_id === tran_id) {
      // amount sanity check
      const [rows] = await pool.execute('SELECT amount FROM donations WHERE id=?', [tran_id]);
      const expected = rows[0] ? Number(rows[0].amount) : 0;
      const paid = Number(v.amount || p.amount || 0);
      if (Math.abs(expected - paid) < 0.5) status = 'completed';
    }
    await persistPayload(tran_id, { ...p, ...v }, status);
  } else {
    await persistPayload(tran_id, p, status);
  }

  if (status === 'completed') await sendReceiptOnce(tran_id);

  const target = status === 'completed' ? 'success' : 'fail';
  res.redirect(`${SITE_URL}/payment/${target}?tran_id=${encodeURIComponent(tran_id)}`);
}));

// 3) FAIL
router.post('/fail', asyncH(async (req, res) => {
  const tran_id = req.body?.tran_id;
  if (tran_id) await persistPayload(tran_id, req.body, 'failed');
  res.redirect(`${SITE_URL}/payment/fail?tran_id=${encodeURIComponent(tran_id || '')}`);
}));

// 4) CANCEL
router.post('/cancel', asyncH(async (req, res) => {
  const tran_id = req.body?.tran_id;
  if (tran_id) await persistPayload(tran_id, req.body, 'cancelled');
  res.redirect(`${SITE_URL}/payment/cancel?tran_id=${encodeURIComponent(tran_id || '')}`);
}));

// 5) IPN — server-to-server notification (no redirect)
router.post('/ipn', asyncH(async (req, res) => {
  const p = req.body || {};
  const tran_id = p.tran_id;
  if (!tran_id || !p.val_id) return res.status(400).json({ ok: false });
  const v = await validate(p.val_id);
  let status = 'failed';
  if ((v.status === 'VALID' || v.status === 'VALIDATED') && v.tran_id === tran_id) {
    status = 'completed';
  } else if (p.status === 'CANCELLED') {
    status = 'cancelled';
  }
  await persistPayload(tran_id, { ...p, ...v }, status);
  if (status === 'completed') await sendReceiptOnce(tran_id);
  res.json({ ok: true });
}));

// 6) STATUS lookup (used by result page to display final state)
router.get('/status/:id', asyncH(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, name, email, phone, amount, currency, status, method, purpose,
            transaction_id, bank_tran_id, card_type, created_at
       FROM donations WHERE id=?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
}));

// 7) RECEIPT HTML — same design as email receipt, opened by "Download receipt" button
router.get('/receipt/:id', asyncH(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, name, email, amount, method, purpose, card_type, bank_tran_id, created_at, status
       FROM donations WHERE id=?`,
    [req.params.id]
  );
  const d = rows[0];
  if (!d) return res.status(404).send('Not found');
  if (d.status !== 'completed') return res.status(400).send('Donation not completed');

  const html = tplDonationReceipt({
    name: d.name,
    tran_id: d.id,
    amount: d.amount,
    method: d.method,
    purpose: d.purpose,
    card_type: d.card_type,
    bank_tran_id: d.bank_tran_id,
    date: d.created_at ? new Date(d.created_at).toLocaleString('bn-BD') : '',
  });

  // Optional ?print=1 → auto-open the browser print dialog (used by frontend button)
  const withPrint = req.query.print
    ? html.replace('</body>', `<script>window.addEventListener('load',()=>{setTimeout(()=>window.print(),300)});</script></body>`)
    : html;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(withPrint);
}));

module.exports = router;

