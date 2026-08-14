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
  const address = "উত্তরখান, উত্তরা, ঢাকা";
  const website = "www.unitefoundation.bd";
  const contactLine = "ইমেইল: info@unitefoundation.org · হেল্পলাইন: +৮৮ ০১৬১৪-২৬৪৯০১";

  const statusLabels: Record<string, string> = {
    new: "নতুন",
    reviewing: "পর্যালোচনাধীন",
    approved: "অনুমোদিত",
    rejected: "প্রত্যাখ্যাত",
  };

  // Human-friendly Bengali labels for the raw field keys stored in extras.
  const labelMap: Record<string, string> = {
    name: "নাম",
    fullName: "পূর্ণ নাম",
    phone: "মোবাইল",
    whatsapp: "WhatsApp",
    mobile: "মোবাইল",
    email: "ই-মেইল",
    city: "শহর",
    district: "জেলা",
    address: "ঠিকানা",
    profession: "পেশা",
    age: "বয়স",
    dob: "জন্ম তারিখ",
    bloodGroup: "রক্তের গ্রুপ",
    nid: "জাতীয় পরিচয়পত্র নং",
    father: "পিতার নাম",
    mother: "মাতার নাম",
    education: "শিক্ষাগত যোগ্যতা",
    facebook: "ফেসবুক প্রোফাইল",
    reference: "রেফারেন্স",
    area: "আগ্রহের ক্ষেত্র",
    motivation: "আবেদনের উদ্দেশ্য",
    experience: "অভিজ্ঞতা",
    availability: "সময় উপলব্ধতা",
    plan: "পরিকল্পনা",
    type: "ধরন",
    paymentMethod: "পেমেন্ট মাধ্যম",
    transactionId: "ট্রানজেকশন আইডি",
    field_10: "অতিরিক্ত তথ্য",
  };

  // Skip fields that are already shown in the top applicant summary table.
  const duplicateLabels = new Set([
    "name",
    "নাম",
    "পূর্ণ নাম",
    "আবেদনকারীর পূর্ণ নাম",
    "phone",
    "মোবাইল",
    "whatsapp",
    "mobile",
    "email",
    "ই-মেইল",
    "ইমেইল",
    "city",
    "district",
    "শহর",
    "জেলা",
    "শহর / জেলা",
    "date",
    "তারিখ",
    "আবেদনের তারিখ",
    "created_at",
    "submittedAt",
    "status",
    "অবস্থা",
    "id",
    "নং",
  ]);

  const isDuplicate = (label: string) => {
    const normalized = label.trim().toLowerCase();
    return (
      duplicateLabels.has(label.trim()) ||
      duplicateLabels.has(normalized)
    );
  };


  // Applicant photo extraction disabled per user request
  const photo = "";
  const sections = (app.details || [])
    .map((s) => ({
      title: s.title,
      fields: s.fields
        .filter((f) => {
          const v = String(f.value ?? "");
          if (isImage(v)) return false; // Hide images from the details list
          return v.trim() !== "";
        })
        .filter((f) => !isDuplicate(f.label))
        .map((f) => ({
          label: labelMap[f.label] || f.label,
          value: f.value,
        })),
    }))
    .filter((s) => s.fields.length);


  const printedAt = new Date().toLocaleString("bn-BD");
  const origin = window.location.origin;

  const formNameFromId = (id: string) => {
    if (id.startsWith("VOL-")) return "স্বেচ্ছাসেবক";
    if (id.startsWith("MEM-")) return "সদস্যপদ";
    if (id.startsWith("DR-")) return "প্রতিনিধি";
    return "আবেদন ফরম";
  };
  const titleText = app.formName || formNameFromId(app.id);


  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>${esc(organizationName)} - ${esc(titleText)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        @font-face {
            font-family: 'Bornomala BN';
            src: url('${origin}/fonts/Bornomala-Regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }
        @font-face {
            font-family: 'Bornomala BN';
            src: url('${origin}/fonts/Bornomala-Bold.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
            font-display: swap;
        }
    </style>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Bornomala BN', 'Hind Siliguri', Arial, sans-serif;
            color: #000000;
            line-height: 1.4;
            background-color: #f1f5f9;
            margin: 0;
            padding: 0;
        }
        
        .page {
            width: 210mm;
            min-height: 297mm;
            background: #ffffff;
            margin: 20px auto;
            padding: 15mm 20mm;
            box-sizing: border-box;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            display: flex; flex-direction: column;
            position: relative;
            color-adjust: exact;
            -webkit-print-color-adjust: exact;
        }
        
        .header-section {
            text-align: center;
            padding-bottom: 6px;
            margin-bottom: 18px;
            position: relative;
        }
        .header-section .logo { height: 50px; margin-bottom: 8px; }
        .header-section h1 {
            margin: 0 0 2px 0;
            color: #000000;
            font-size: 38px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            color: #000000;
            font-size: 12.5px;
            margin-top: 4px;
        }
        .contact-info .separator { font-size: 10px; }
        .header-divider {
            width: 100%;
            height: 1px;
            background-color: #000000;
            margin-top: 15px;
            position: relative;
        }
        .header-divider::after {
            content: '❖';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #ffffff;
            padding: 0 12px;
            color: #000000;
            font-size: 11px;
        }
        
        .title-bar {
            background-color: #000000;
            color: #ffffff;
            text-align: center;
            padding: 8px 10px;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 18px;
            border-radius: 2px;
            letter-spacing: 0.5px;
        }
        
        .meta-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #000000;
            border-bottom: 1px solid #000000;
            padding: 8px 4px;
            margin-bottom: 18px;
        }
        .meta-item {
            font-size: 13px;
            color: #000000;
            font-weight: 600;
        }
        
        .form-section { margin-bottom: 16px; }
        .section-title {
            font-size: 14.5px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 10px;
            border-bottom: 1.5px solid #000000;
            padding-bottom: 3px;
        }
        
        .applicant-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }
        .info-table td {
            padding: 7px 10px;
            border: 1px solid #000;
            font-size: 13px;
        }
        .info-table td.label {
            font-weight: 700;
            background: #f8f8f8;
            width: 35%;
        }
        
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 50px;
            font-weight: 700;
            color: #000000;
            opacity: 0.03;
            pointer-events: none;
            z-index: 0;
            white-space: nowrap;
        }
        
        .declaration-text {
            font-size: 12.5px;
            font-weight: 500;
            margin-bottom: 25px;
            border-left: 3px solid #000;
            padding-left: 8px;
        }
        
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: auto;
            padding-top: 40px;
            padding-bottom: 20px;
        }
        .signature-block {
            width: 220px;
            text-align: center;
        }
        .sign-line { font-size: 12px; margin-bottom: 4px; }
        .sign-label { font-size: 12.5px; font-weight: 600; }

        .toolbar {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 100;
        }
        .toolbar button {
            padding: 10px 20px;
            background: #000;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
        }
        
        @media print {
            @page { size: A4; margin: 0; }
            body { background-color: #fff; }
            .page { margin: 0; box-shadow: none; width: 210mm; height: 297mm; padding: 15mm 20mm; }
            .no-print, .toolbar { display: none; }
        }
    </style>
</head>
<body>

<div class="page">
    <div class="watermark">unitefoundation.bd</div>
    
    <div class="header-section">
        <img class="logo" src="${origin}/logo.png" alt="" onerror="this.remove()">
        <h1>${esc(organizationName)}</h1>
        <div class="contact-info">
            <span>${esc(address)}</span>
            <span class="separator">•</span>
            <span>${esc(website)}</span>
        </div>
        <div class="contact-info">
            <span>${esc(contactLine)}</span>
        </div>
        <div class="header-divider"></div>
    </div>

    <div class="title-bar">
        ${esc(titleText)} আবেদন ফরম
    </div>

    <div class="meta-section">
        <div class="meta-item">আবেদন নম্বর: ${esc(app.id)}</div>
        <div class="meta-item">আবেদনের তারিখ: ${esc(app.date)}</div>
    </div>

    <div class="form-section">
        <div class="section-title">১. ব্যক্তিগত তথ্য</div>
        <div class="applicant-row">
            <table class="info-table">
                <tr><td class="label">নাম</td><td>${esc(app.name)}</td></tr>
                <tr><td class="label">মোবাইল (WhatsApp)</td><td>${esc(app.phone)}</td></tr>
                <tr><td class="label">ইমেইল ঠিকানা</td><td>${esc(app.email || "—")}</td></tr>
                <tr><td class="label">শহর / জেলা</td><td>${esc(app.city)}</td></tr>
            </table>
        </div>
    </div>

    ${sections.map(s => `
        <div class="form-section">
            <div class="section-title">${esc(s.title)}</div>
            <table class="info-table">
                ${s.fields.map(f => `
                    <tr><td class="label">${esc(f.label)}</td><td>${esc(f.value)}</td></tr>
                `).join('')}
            </table>
        </div>
    `).join('')}

    <div class="signature-section">
        <div class="signature-block">
            <div class="sign-line">..................................................</div>
            <div class="sign-label">আবেদনকারীর স্বাক্ষর</div>
        </div>
        <div class="signature-block">
            <div class="sign-line">..................................................</div>
            <div class="sign-label">কর্তৃপক্ষের স্বাক্ষর ও সিলমোহর</div>
        </div>
    </div>
</div>

<div class="toolbar">
    <button onclick="window.close()" style="background:#eee;color:#000">বন্ধ করুন</button>
    <button onclick="window.print()">প্রিন্ট / PDF সেভ</button>
</div>

</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
};
