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
  :root{ --brand:#006837; --brand-dark:#004926; --gold:#c9a227; --ink:#0f172a; --muted:#64748b; --line:#e5e7eb; }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#eef2f0;}
  body{font-family:'Noto Sans Bengali',system-ui,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .sheet{
    width:210mm;min-height:297mm;margin:24px auto;background:#fff;position:relative;overflow:hidden;
    box-shadow:0 24px 60px rgba(2,32,20,.18);display:flex;flex-direction:column;
  }
  .sheet:before{content:"";position:absolute;inset:0;border:1px solid var(--line);pointer-events:none}
  .watermark{
    position:absolute;top:52%;left:50%;transform:translate(-50%,-50%) rotate(-24deg);
    font-family:'Noto Serif Bengali',serif;font-size:96px;font-weight:700;color:var(--brand);
    opacity:.045;white-space:nowrap;letter-spacing:4px;pointer-events:none;
  }
  /* Letterhead */
  .head{position:relative;padding:22px 28px 18px;background:linear-gradient(135deg,var(--brand-dark),var(--brand) 55%,#0b7a44);color:#fff}
  .head:after{content:"";position:absolute;left:0;right:0;bottom:0;height:4px;background:linear-gradient(90deg,var(--gold),#f3e0a0,var(--gold))}
  .head-in{display:flex;align-items:center;gap:16px}
  .mark{width:62px;height:62px;border-radius:14px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;overflow:hidden;flex:0 0 auto}
  .mark img{width:100%;height:100%;object-fit:contain;padding:6px}
  .mark span{font-family:'Noto Serif Bengali',serif;font-size:26px;font-weight:700}
  .org h1{margin:0;font-family:'Noto Serif Bengali',serif;font-size:26px;line-height:1.25;letter-spacing:.3px}
  .org .en{font-size:10.5px;letter-spacing:3.4px;opacity:.85;margin-top:2px}
  .org .meta{font-size:11.5px;opacity:.92;margin-top:5px}
  .doc-tag{margin-left:auto;text-align:right}
  .doc-tag .kind{font-size:10px;letter-spacing:2px;opacity:.8}
  .doc-tag .id{font-family:'Noto Serif Bengali',serif;font-size:19px;font-weight:700;margin-top:2px}
  /* Title bar */
  .titlebar{display:flex;align-items:center;gap:12px;padding:14px 28px;border-bottom:1px solid var(--line);background:#f8faf9}
  .titlebar h2{margin:0;font-size:16px;font-weight:700}
  .titlebar .sub{font-size:11.5px;color:var(--muted);margin-top:2px}
  .pill{margin-left:auto;font-size:11.5px;font-weight:700;padding:6px 14px;border-radius:999px;color:#fff;background:${statusColor}}
  /* Body */
  .body{padding:22px 28px 0;flex:1}
  .applicant{display:flex;gap:18px;align-items:flex-start;padding:16px;border:1px solid var(--line);border-radius:12px;background:linear-gradient(180deg,#fbfdfc,#fff)}
  .photo{width:96px;height:118px;border-radius:8px;border:1px solid var(--line);background:#f1f5f4;object-fit:cover;flex:0 0 auto}
  .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 22px;flex:1}
  .cell .label{font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted);font-weight:700}
  .cell .value{font-size:13.5px;font-weight:600;margin-top:2px;word-break:break-word}
  h3.sec{display:flex;align-items:center;gap:10px;font-size:12.5px;font-weight:700;margin:24px 0 10px;color:var(--brand-dark);text-transform:none}
  h3.sec:before{content:"";width:4px;height:15px;border-radius:2px;background:var(--gold)}
  h3.sec:after{content:"";flex:1;height:1px;background:var(--line)}
  table{width:100%;border-collapse:collapse;border:1px solid var(--line);border-radius:10px;overflow:hidden}
  tr:nth-child(even) td{background:#fafbfb}
  td{padding:8px 12px;border-bottom:1px solid var(--line);font-size:12.5px;vertical-align:top}
  tr:last-child td{border-bottom:none}
  td.k{width:34%;color:#475569;font-weight:700;font-size:11.5px}
  /* Sign + footer */
  .signs{display:flex;gap:40px;justify-content:space-between;margin:38px 0 8px;padding:0 6px}
  .sign{flex:1;text-align:center}
  .sign .line{border-top:1.5px dotted #94a3b8;margin-bottom:6px}
  .sign span{font-size:11px;color:var(--muted)}
  .foot{margin-top:auto;padding:12px 28px;border-top:2px solid var(--brand);display:flex;justify-content:space-between;font-size:10px;color:var(--muted);background:#f8faf9}
  .toolbar{position:fixed;bottom:22px;right:22px;display:flex;gap:10px}
  .toolbar button{font-family:inherit;font-weight:700;font-size:13px;padding:11px 20px;border-radius:10px;border:none;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.18)}
  .btn-print{background:var(--brand);color:#fff}
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
        <div class="cell"><div class="label">নাম</div><div class="value">${esc(app.name)}</div></div>
        <div class="cell"><div class="label">মোবাইল</div><div class="value">${esc(app.phone)}</div></div>
        <div class="cell"><div class="label">ইমেইল</div><div class="value">${esc(app.email || "—")}</div></div>
        <div class="cell"><div class="label">শহর / জেলা</div><div class="value">${esc(app.city)}</div></div>
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
