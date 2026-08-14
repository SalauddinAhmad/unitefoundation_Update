const nodemailer = require('nodemailer');

// Build a transporter for a specific host/port/secure combination.
function buildTransport({ host, port, secure }) {
  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Boolean(secure),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    debug: true,
    logger: true,
    pool: false,
    requireTLS: !secure,
    tls: { rejectUnauthorized: false },
    connectionTimeout: Number(process.env.SMTP_CONNECT_TIMEOUT_MS || 8000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 8000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 12000),
  });
}

function assertEnv() {
  const useSendmail = String(process.env.SMTP_TRANSPORT || 'sendmail').toLowerCase() === 'sendmail';
  if (useSendmail) {
    if (!process.env.SMTP_FROM && !process.env.SMTP_USER) {
      throw new Error('Mail sender missing: set SMTP_FROM or SMTP_USER in cPanel Node.js App');
    }
    return;
  }
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP env vars missing: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in cPanel Node.js App');
  }
}

// Candidate connection configs, in order.
// Many cPanel/LiteSpeed servers block outbound 465 from the Node app after an
// IP change — localhost / 587 STARTTLS almost always still works.
function candidates() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || 'true') === 'true';
  const list = [{ host, port, secure }];
  const push = (c) => {
    if (!list.some((x) => x.host === c.host && x.port === c.port)) list.push(c);
  };
  push({ host, port: 587, secure: false });
  push({ host: 'localhost', port: 465, secure: true });
  push({ host: 'localhost', port: 587, secure: false });
  push({ host: 'localhost', port: 25, secure: false });
  return list;
}

// cPanel normally exposes a local Exim-compatible sendmail binary. This route
// does not need an outbound SMTP socket, so it remains usable when the hosting
// firewall blocks ports 25/465/587 for Node.js applications.
function buildSendmailTransport() {
  return nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: process.env.SENDMAIL_PATH || '/usr/sbin/sendmail',
  });
}

let transporter = null;
let activeConfig = null;

function isConnError(err) {
  const code = err && (err.code || err.errno);
  return ['ETIMEDOUT', 'ECONNECTION', 'ECONNREFUSED', 'EHOSTUNREACH', 'ENOTFOUND', 'ESOCKET', 'EDNS'].includes(code)
    || /timeout|timed out|refused|unreachable/i.test(String(err && err.message));
}

// Verify candidates until one connects; cache it.
async function resolveTransporter(force = false) {
  assertEnv();
  if (transporter && !force) return transporter;

  // cPanel already has a local Exim mail transfer agent. Prefer it by default:
  // it does not open an outbound SMTP socket, so hosting firewall changes cannot
  // cause ETIMEDOUT. Set SMTP_TRANSPORT=smtp only when remote SMTP is required.
  if (String(process.env.SMTP_TRANSPORT || 'sendmail').toLowerCase() === 'sendmail') {
    transporter = buildSendmailTransport();
    activeConfig = {
      transport: 'sendmail',
      path: process.env.SENDMAIL_PATH || '/usr/sbin/sendmail',
      host: 'localhost',
      port: null,
      secure: false,
    };
    return transporter;
  }

  let lastErr = null;
  for (const cfg of candidates()) {
    const t = buildTransport(cfg);
    try {
      await t.verify();
      transporter = t;
      activeConfig = cfg;
      if (cfg.port !== Number(process.env.SMTP_PORT || 465) || cfg.host !== process.env.SMTP_HOST) {
        console.warn(`[mailer] primary SMTP unreachable — using fallback ${cfg.host}:${cfg.port} (secure=${cfg.secure})`);
      }
      return transporter;
    } catch (err) {
      lastErr = err;
      try { t.close(); } catch { /* ignore */ }
      if (!isConnError(err)) throw err; // auth errors etc. → don't keep trying
    }
  }

  // All SMTP routes timed out. Fall back to the local cPanel mail transfer
  // agent unless explicitly disabled. Sendmail transports have no meaningful
  // remote connection to verify; a real self-test is available with
  // /health/smtp?probe=1&send=1.
  if (String(process.env.SMTP_SENDMAIL_FALLBACK || 'true') !== 'false') {
    transporter = buildSendmailTransport();
    activeConfig = {
      transport: 'sendmail',
      path: process.env.SENDMAIL_PATH || '/usr/sbin/sendmail',
      host: 'localhost',
      port: null,
      secure: false,
    };
    console.warn('[mailer] all SMTP routes unreachable — using local sendmail transport');
    return transporter;
  }

  throw lastErr || new Error('SMTP connection failed');
}

// Legacy sync accessor (used by diagnostics) — returns the cached or primary transport.
function getTransporter() {
  assertEnv();
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || 'true') === 'true';
  transporter = buildTransport({ host, port, secure });
  activeConfig = { host, port, secure };
  return transporter;
}

exports.getTransporter = getTransporter;
exports.resolveTransporter = resolveTransporter;
exports.getActiveConfig = () => activeConfig;

exports.closeTransporter = () => {
  if (transporter && typeof transporter.close === 'function') transporter.close();
  transporter = null;
  activeConfig = null;
};

exports.sendMail = async ({ to, cc, bcc, subject, html, text }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const payload = { from, to, cc, bcc, subject, html, text };
  const t = await resolveTransporter();
  console.log('[mailer] Attempting send to:', to, 'via', (activeConfig && activeConfig.transport) || 'smtp');
  try {
    return await t.sendMail(payload);
  } catch (err) {
    if (!isConnError(err)) {
      console.error('[mailer] Non-connection error during sendMail:', err);
      throw err;
    }
    // Cached route died (IP/firewall change) — re-probe once.
    console.warn('[mailer] send failed, re-probing SMTP routes:', err && err.message);
    const t2 = await resolveTransporter(true);
    return t2.sendMail(payload);
  }
};
