import { Application } from "@/data/dashboardMock";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const isImage = (v: string) =>
  /^data:image\//i.test(v) || /^https?:\/\/\S+\.(png|jpe?g|webp|gif|svg)(\?\S*)?$/i.test(v);

export const generateApplicationInvoice = (app: Application) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const organizationName = "ইউনাইট ফাউন্ডেশন";
  const orgNameEn = "UNITE FOUNDATION";
  const address = "উত্তরা-উত্তরখান, ঢাকা, বাংলাদেশ";
  const website = "www.unitefoundation.bd";
  const contactLine = "ইমেইল: info@unitefoundation.org · হেল্পলাইন: +৮৮০ ১৩২৪-৪৩৯৬৯৮";

  const statusLabels: Record<string, string> = {
    new: "নতুন",
    reviewing: "পর্যালোচনাধীন",
    approved: "অনুমোদিত",
    rejected: "প্রত্যাখ্যাত",
  };
  const statusColors: Record<string, string> = {
    new: "#2563eb",
    reviewing: "#b45309",
    approved: "#047857",
    rejected: "#b91c1c",
  };
  const statusColor = statusColors[app.status] || "#334155";

  // Pull a photo out of the details, if any
  let photo = "";
  const sections = (app.details || []).map((s) => ({
    title: s.title,
    fields: s.fields.filter((f) => {
      const v = String(f.value ?? "");
      if (!photo && isImage(v)) {
        photo = v;
        return false;
      }
      return v.trim() !== "";
    }),
  }));

  const printedAt = new Date().toLocaleString("bn-BD");

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<title>${esc(app.id)} — ${esc(app.name)}</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@500;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{ --ink:#222; --muted:#555; --line:#ddd; --bg-light:#f8f9fa; }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#fff;}
  body{font-family:'SolaimanLipi',Arial,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact;line-height:1.6;}
  .sheet{
    width:210mm;min-height:297mm;margin:0 auto;background:#fff;position:relative;padding:30px;
    border:1px solid #eee;box-shadow:0 0 10px rgba(0,0,0,0.15);
  }
  .header-section {
    text-align: center;
    border-bottom: 2px solid #2c3e50;
    padding-bottom: 15px;
    margin-bottom: 25px;
  }
  .header-section h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 26px;
  }
  .header-section p {
    margin: 5px 0;
    color: #555;
    font-size: 14px;
  }
  .form-title {
    text-align: center;
    background-color: var(--bg-light);
    padding: 10px;
    font-weight: bold;
    font-size: 18px;
    color: #2c3e50;
    margin-bottom: 20px;
    border: 1px dashed #ccc;
  }
  .applicant-info, .questions-section {
    width: 100%;
    margin-bottom: 20px;
    border-collapse: collapse;
  }
  .applicant-info td, .questions-section td {
    padding: 8px 10px;
    vertical-align: top;
    font-size: 14px;
    border-bottom: 1px dotted #ddd;
  }
  .label {
    font-weight: bold;
    width: 35%;
    color: #444;
  }
  .value {
    width: 65%;
    color: #222;
  }
  .section-heading {
    font-size: 16px;
    font-weight: bold;
    color: #2c3e50;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
    margin-top: 25px;
    margin-bottom: 15px;
  }
  .footer-section {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    text-align: center;
    padding: 0 10px;
  }
  .signature-box {
    border-top: 1px solid #777;
    width: 200px;
    padding-top: 5px;
    font-size: 13px;
    color: #555;
  }
  .toolbar{position:fixed;bottom:22px;right:22px;display:flex;gap:10px}
  .toolbar button{font-family:inherit;font-weight:700;font-size:13px;padding:11px 20px;border-radius:10px;border:none;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.18)}
  .btn-print{background:#2c3e50;color:#fff}
  .btn-close{background:#fff;color:#334155;border:1px solid var(--line)}
  @page{size:A4;margin:0}
  @media print{
    html,body{background:#fff;padding:0}
    .sheet{margin:0;box-shadow:none;border:none;width:auto;min-height:auto}
    .toolbar{display:none!important}
  }
</style>
</head>
<body>
<div class="sheet">
  <div class="header-section">
    <h2>${esc(organizationName)}</h2>
    <p>${esc(address)}</p>
    <p>ইমেইল: info@unitefoundation.org | হেল্পলাইন: +৮৮০ ১৩২৪-৪৩৯৬৯৮</p>
  </div>

  <div class="form-title">
    ${esc(app.type)} আবেদন ফরম (Application Summary)
  </div>

  <table class="applicant-info">
    <tr>
      <td class="label">আবেদিত পদ / ধরন:</td>
      <td class="value">${esc(app.type)}</td>
    </tr>
    <tr>
      <td class="label">আবেদনের তারিখ:</td>
      <td class="value">${esc(app.date)}</td>
    </tr>
    <tr>
      <td class="label">আবেদনকারীর পূর্ণ নাম:</td>
      <td class="value">${esc(app.name)}</td>
    </tr>
    <tr>
      <td class="label">মোবাইল (WhatsApp):</td>
      <td class="value">${esc(app.phone)}</td>
    </tr>
    <tr>
      <td class="label">ইমেইল ঠিকানা:</td>
      <td class="value">${esc(app.email || "—")}</td>
    </tr>
    <tr>
      <td class="label">শহর / জেলা:</td>
      <td class="value">${esc(app.city)}</td>
    </tr>
  </table>

  ${sections
    .filter((s) => s.fields.length)
    .map(
      (s) => `
    <div class="section-heading">${esc(s.title)}</div>
    <table class="questions-section">
      ${s.fields
        .map((f) => `<tr><td class="label">${esc(f.label)}</td><td class="value">${esc(f.value)}</td></tr>`)
        .join("")}
    </table>`
    )
    .join("")}

  <div class="footer-section">
    <div>
      <br><br>
      <div class="signature-box">আবেদনকারীর স্বাক্ষর</div>
    </div>
    <div>
      <br><br>
      <div class="signature-box">কর্তৃপক্ষের স্বাক্ষর</div>
    </div>
  </div>

  <div style="margin-top: 40px; font-size: 10px; color: #777; text-align: right;">
    প্রিন্ট: ${esc(printedAt)} · ${esc(app.id)}
  </div>
</div>

<div class="toolbar">
  <button class="btn-close" onclick="window.close()">বন্ধ করুন</button>
  <button class="btn-print" onclick="window.print()">প্রিন্ট / PDF সেভ</button>
</div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
};
