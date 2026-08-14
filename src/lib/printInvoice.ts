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
    html,body{background:#fff}
    .sheet{margin:0;box-shadow:none;width:auto;min-height:auto}
    .toolbar{display:none!important}
    tr,.applicant,table{page-break-inside:avoid}
    h3.sec{page-break-after:avoid}
  }
</style>
</head>
<body>
<div class="sheet">
  <div class="watermark">${esc(organizationName)}</div>

  <header class="head">
    <div class="head-in">
      <div class="mark"><img src="/logo.png" alt="" onerror="this.remove()"><span>ইউ</span></div>
      <div class="org">
        <h1>${esc(organizationName)}</h1>
        <div class="en">${orgNameEn}</div>
        <div class="meta">${esc(address)} &nbsp;·&nbsp; ${esc(website)}</div>
        <div class="meta">${esc(contactLine)}</div>
      </div>
      <div class="doc-tag">
        <div class="kind">APPLICATION RECORD</div>
        <div class="id">${esc(app.id)}</div>
      </div>
    </div>
  </header>

  <div class="titlebar">
    <div>
      <h2>আবেদন ফরম — ${esc(app.type)}</h2>
      <div class="sub">জমাদানের তারিখ: ${esc(app.date)}</div>
    </div>
    <div class="pill">${esc(statusLabels[app.status] || app.status)}</div>
  </div>

  <main class="body">
    <section class="applicant">
      ${photo ? `<img class="photo" src="${esc(photo)}" alt="" onerror="this.remove()">` : ""}
      <div class="grid">
        <div class="cell"><div class="label">আবেদনকারীর পূর্ণ নাম</div><div class="value">${esc(app.name)}</div></div>
        <div class="cell"><div class="label">আবেদিত পদ / ধরন</div><div class="value">${esc(app.type)}</div></div>
        <div class="cell"><div class="label">মোবাইল (WhatsApp)</div><div class="value">${esc(app.phone)}</div></div>
        <div class="cell"><div class="label">ইমেইল ঠিকানা</div><div class="value">${esc(app.email || "—")}</div></div>
        <div class="cell"><div class="label">শহর / জেলা</div><div class="value">${esc(app.city)}</div></div>
        <div class="cell"><div class="label">আবেদনের তারিখ</div><div class="value">${esc(app.date)}</div></div>
      </div>
    </section>

    ${sections
      .filter((s) => s.fields.length)
      .map(
        (s) => `
    <h3 class="sec">${esc(s.title)}</h3>
    <table>
      ${s.fields
        .map((f) => `<tr><td class="k">${esc(f.label)}</td><td>${esc(f.value)}</td></tr>`)
        .join("")}
    </table>`
      )
      .join("")}

    <div class="signs">
      <div class="sign"><div class="line"></div><span>আবেদনকারীর স্বাক্ষর</span></div>
      <div class="sign"><div class="line"></div><span>যাচাইকারী কর্মকর্তা</span></div>
      <div class="sign"><div class="line"></div><span>অনুমোদনকারী / সিলমোহর</span></div>
    </div>
  </main>

  <footer class="foot">
    <div>ইউনাইট ফাউন্ডেশনের ডিজিটাল সিস্টেম থেকে স্বয়ংক্রিয়ভাবে তৈরি — স্বাক্ষর ছাড়া বৈধ নয়।</div>
    <div>প্রিন্ট: ${esc(printedAt)} · ${esc(app.id)}</div>
  </footer>
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
