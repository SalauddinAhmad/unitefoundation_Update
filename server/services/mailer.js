const nodemailer = require('nodemailer');

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP env vars missing: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in cPanel Node.js App');
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

exports.getTransporter = getTransporter;

exports.sendMail = async ({ to, cc, bcc, subject, html, text }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  return getTransporter().sendMail({ from, to, cc, bcc, subject, html, text });
};
