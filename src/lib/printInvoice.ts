import { Application } from "@/data/dashboardMock";

export const generateApplicationInvoice = (app: Application) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const logoUrl = "/logo.png"; // Replace with actual logo path if different
  const organizationName = "ইউনাইট ফাউন্ডেশন";
  const address = "উত্তরা-উত্তরখান, ঢাকা, বাংলাদেশ";
  const website = "www.unitefoundation.bd";

  const statusLabels: Record<string, string> = {
    new: "নতুন",
    reviewing: "পর্যালোচনা",
    approved: "অনুমোদিত",
    rejected: "প্রত্যাখ্যাত",
  };

  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>Application - ${app.id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap');
        
        body {
          font-family: 'Noto Sans Bengali', sans-serif;
          margin: 0;
          padding: 40px;
          color: #1a1a1a;
          line-height: 1.6;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #e2e8f0;
          padding: 40px;
          border-radius: 8px;
          background: #fff;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #006837;
          padding-bottom: 20px;
        }

        .logo {
          height: 60px;
          margin-bottom: 10px;
        }

        .org-name {
          font-size: 24px;
          font-weight: 700;
          color: #006837;
          margin: 0;
        }

        .org-address {
          font-size: 14px;
          color: #64748b;
          margin: 5px 0;
        }

        .title-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .application-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }

        .meta-info {
          text-align: right;
          font-size: 14px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-item {
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 8px;
        }

        .label {
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .value {
          font-size: 15px;
          font-weight: 500;
        }

        .section-header {
          background: #f8fafc;
          padding: 8px 12px;
          font-weight: 700;
          font-size: 14px;
          border-left: 4px solid #006837;
          margin: 25px 0 15px 0;
        }

        .details-table {
          width: 100%;
          border-collapse: collapse;
        }

        .details-table td {
          padding: 10px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }

        .details-table td:first-child {
          width: 30%;
          font-weight: 700;
          font-size: 13px;
          color: #475569;
        }

        .details-table td:last-child {
          font-size: 14px;
        }

        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }

        @media print {
          body { padding: 0; }
          .invoice-container { border: none; max-width: 100%; padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <img src="${logoUrl}" alt="Logo" class="logo" onerror="this.style.display='none'">
          <h1 class="org-name">${organizationName}</h1>
          <p class="org-address">${address}</p>
          <p class="org-address">${website}</p>
        </div>

        <div class="title-section">
          <div>
            <h2 class="application-title">আবেদন ফরম: ${app.type}</h2>
            <p style="margin: 5px 0; font-size: 14px; color: #64748b;">আইডি: <strong>${app.id}</strong></p>
          </div>
          <div class="meta-info">
            <div>তারিখ: ${app.date}</div>
            <div style="margin-top: 5px;">স্ট্যাটাস: <strong>${statusLabels[app.status] || app.status}</strong></div>
          </div>
        </div>

        <div class="section-header">ব্যক্তিগত তথ্য</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="label">নাম</div>
            <div class="value">${app.name}</div>
          </div>
          <div class="info-item">
            <div class="label">ফোন</div>
            <div class="value">${app.phone}</div>
          </div>
          <div class="info-item">
            <div class="label">ইমেইল</div>
            <div class="value">${app.email || "—"}</div>
          </div>
          <div class="info-item">
            <div class="label">শহর / জেলা</div>
            <div class="value">${app.city}</div>
          </div>
        </div>

        ${(app.details || [])
          .map(
            (section) => `
          <div class="section-header">${section.title}</div>
          <table class="details-table">
            ${section.fields
              .map(
                (f) => `
              <tr>
                <td>${f.label}</td>
                <td>${f.value}</td>
              </tr>
            `
              )
              .join("")}
          </table>
        `
          )
          .join("")}

        <div class="footer">
          এই ডকুমেন্টটি ইউনাইট ফাউন্ডেশনের ডিজিটাল সিস্টেম থেকে স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।
        </div>
      </div>

      <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
        <button onclick="window.print()" style="background: #006837; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 700;">
          প্রিন্ট / PDF সেভ করুন
        </button>
      </div>

      <script>
        window.onload = () => {
          // Optional: Auto-trigger print
          // window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
