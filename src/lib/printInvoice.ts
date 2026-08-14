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
  :root{ --ink:#1f2937; --muted:#555; --line:#ddd; --dark:#2c3e50; --bg-light:#f8f9fa; }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#fff;}
  body{font-family:'Noto Sans Bengali','SolaimanLipi',Arial,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact;line-height:1.55;}
  .sheet{
    width:210mm;min-height:297mm;margin:0 auto;background:#fff;position:relative;
    padding:16mm 15mm 14mm;display:flex;flex-direction:column;
  }
  /* Letterhead */
  .header-section{text-align:center;border-bottom:2px solid var(--dark);padding-bottom:12px;margin-bottom:18px}
  .header-section .logo{height:52px;margin-bottom:6px;object-fit:contain}
  .header-section h2{margin:0;color:var(--dark);font-size:24px;font-weight:700;letter-spacing:.2px}
  .header-section .en{font-size:10px;letter-spacing:3px;color:#666;margin-top:3px;text-transform:uppercase}
  .header-section p{margin:4px 0 0;color:#555;font-size:12px}
  /* Title */
  .form-title{
    display:flex;align-items:center;justify-content:space-between;gap:10px;
    border:1px solid var(--dark);padding:8px 14px;margin-bottom:16px;
  }
  .form-title .t{font-weight:700;font-size:15px;color:var(--dark)}
  .form-title .id{font-size:11px;color:#555;letter-spacing:.5px}
  /* Applicant block */
  .applicant{display:flex;gap:16px;align-items:flex-start;margin-bottom:6px}
  .photo{width:90px;height:110px;border:1px solid #bbb;object-fit:cover;flex:0 0 auto}
  .applicant-info,.questions-section{width:100%;border-collapse:collapse}
  .applicant-info td,.questions-section td{
    padding:7px 10px;vertical-align:top;font-size:12.5px;border-bottom:1px solid #e8e8e8;
  }
  .applicant-info tr:last-child td,.questions-section tr:last-child td{border-bottom:none}
  .questions-section{border:1px solid #ddd}
  .label{font-weight:700;width:36%;color:#444;border-right:1px solid #eee}
  .value{width:64%;color:#111;word-break:break-word}
  .section-heading{
    font-size:13.5px;font-weight:700;color:var(--dark);
    border-bottom:1px solid var(--dark);padding-bottom:4px;margin:20px 0 10px;
    text-transform:none;letter-spacing:.2px;
  }
  /* Signatures */
  .footer-section{margin-top:auto;padding-top:46px;display:flex;justify-content:space-between;text-align:center;gap:30px}
  .signature-box{border-top:1px solid #777;min-width:180px;padding-top:5px;font-size:11.5px;color:#555}
  .meta-foot{margin-top:14px;padding-top:8px;border-top:1px solid #e5e5e5;display:flex;justify-content:space-between;font-size:9.5px;color:#888}
  .toolbar{position:fixed;bottom:22px;right:22px;display:flex;gap:10px}
  .toolbar button{font-family:inherit;font-weight:700;font-size:13px;padding:11px 20px;border-radius:8px;border:none;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.18)}
  .btn-print{background:var(--dark);color:#fff}
  .btn-close{background:#fff;color:#334155;border:1px solid var(--line)}
  @page{size:A4;margin:0}
  @media print{
    html,body{background:#fff}
    .sheet{margin:0;box-shadow:none;border:none}
    .toolbar{display:none!important}
    tr,table,.applicant{page-break-inside:avoid}
    .section-heading{page-break-after:avoid}
  }
</style>
</head>
<body>
<div class="sheet">
  <div class="header-section">
    <img class="logo" src="/logo.png" alt="" onerror="this.remove()">
    <h2>${esc(organizationName)}</h2>
    <div class="en">${orgNameEn}</div>
    <p>${esc(address)} &nbsp;|&nbsp; ${esc(website)}</p>
    <p>${esc(contactLine)}</p>
  </div>

  <div class="form-title">
    <div class="t">${esc(app.type)} — আবেদন ফরম সারসংক্ষেপ</div>
    <div class="id">নং: ${esc(app.id)} · অবস্থা: ${esc(statusLabels[app.status] || app.status)}</div>
  </div>

  <div class="applicant">
    ${photo ? `<img class="photo" src="${esc(photo)}" alt="" onerror="this.remove()">` : ""}
    <table class="applicant-info">
      <tr>
        <td class="label">আবেদনকারীর পূর্ণ নাম</td>
        <td class="value">${esc(app.name)}</td>
      </tr>
      <tr>
        <td class="label">আবেদিত পদ / ধরন</td>
        <td class="value">${esc(app.type)}</td>
      </tr>
      <tr>
        <td class="label">মোবাইল (WhatsApp)</td>
        <td class="value">${esc(app.phone)}</td>
      </tr>
      <tr>
        <td class="label">ইমেইল ঠিকানা</td>
        <td class="value">${esc(app.email || "—")}</td>
      </tr>
      <tr>
        <td class="label">শহর / জেলা</td>
        <td class="value">${esc(app.city)}</td>
      </tr>
      <tr>
        <td class="label">আবেদনের তারিখ</td>
        <td class="value">${esc(app.date)}</td>
      </tr>
    </table>
  </div>

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
    <div class="signature-box">আবেদনকারীর স্বাক্ষর ও তারিখ</div>
    <div class="signature-box">যাচাইকারী কর্মকর্তা</div>
    <div class="signature-box">কর্তৃপক্ষের স্বাক্ষর ও সিলমোহর</div>
  </div>

  <div class="meta-foot">
    <span>ইউনাইট ফাউন্ডেশনের ডিজিটাল সিস্টেম থেকে স্বয়ংক্রিয়ভাবে তৈরি — স্বাক্ষর ছাড়া বৈধ নয়।</span>
    <span>প্রিন্ট: ${esc(printedAt)}</span>
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
