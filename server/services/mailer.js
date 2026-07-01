const nodemailer = require('nodemailer');

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

exports.sendMail = async ({ to, subject, html, text }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  return getTransporter().sendMail({ from, to, subject, html, text });
};
