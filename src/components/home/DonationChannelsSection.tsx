import { Copy, CreditCard, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";

const bankCards = site.payments.banks.map((b) => ({
  badge: "BANK TRANSFER",
  title: b.bank,
  accountName: b.account,
  accountNumber: b.number,
  branch: b.branch,
  routing: b.routing,
  swift: b.swift,
  fundLabel: "সাধারণ ফান্ড",
}));

const mobileNumbers = [
  { brand: "bKash", number: site.payments.bkash.number },
  { brand: "Nagad", number: site.payments.nagad.number },
  { brand: "Rocket", number: site.payments.rocket.number },
];

const copy = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast({ title: "কপি হয়েছে", description: `${label} কপি করা হয়েছে।` });
};

const formatAccount = (n: string) => n.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

export const DonationChannelsSection = () => {
  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden isolate"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -10%, hsl(var(--donate-highlight) / 0.18), transparent 60%), radial-gradient(800px 500px at 0% 100%, hsl(var(--donate-orange) / 0.18), transparent 55%), radial-gradient(800px 500px at 100% 100%, hsl(152 100% 14% / 0.55), transparent 55%), linear-gradient(180deg, hsl(152 80% 9%) 0%, hsl(152 100% 12%) 50%, hsl(152 80% 8%) 100%)",
      }}
    >
      {/* Islamic geometric pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23FBB03B' stroke-width='1'><path d='M40 4l12 12-12 12-12-12z'/><path d='M40 40l12 12-12 12-12-12z'/><path d='M4 40l12 12-12 12-12-12z' transform='translate(-4)'/><path d='M76 40l12 12-12 12-12-12z' transform='translate(-12)'/><circle cx='40' cy='40' r='3'/></g></svg>")`,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Subtle mosque silhouette accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 240' preserveAspectRatio='xMidYEnd meet'><g fill='%23FBB03B'><rect x='140' y='170' width='6' height='70'/><rect x='1054' y='170' width='6' height='70'/><path d='M143 150c-6 0-10 6-10 12v8h20v-8c0-6-4-12-10-12z'/><path d='M1057 150c-6 0-10 6-10 12v8h20v-8c0-6-4-12-10-12z'/><path d='M600 90c-40 0-70 30-70 70v80h140v-80c0-40-30-70-70-70z'/><rect x='500' y='180' width='200' height='60'/><rect x='400' y='200' width='100' height='40'/><rect x='700' y='200' width='100' height='40'/><circle cx='600' cy='80' r='6'/></g></svg>")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "1400px auto",
        }}
      />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-[hsl(var(--donate-highlight))]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-40 w-[420px] h-[420px] rounded-full bg-[hsl(var(--donate-orange))]/15 blur-3xl" />

      <div className="container-page relative">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            আমাদের সাথে যুক্ত হোন
          </h2>
          <p className="text-white/60 mt-3 text-sm md:text-base leading-relaxed">
            নিচের যে কোনো পদ্ধতিতে আমাদের সঙ্গে যুক্ত হয়ে আর্তমানবতার সেবায় ভূমিকা রাখতে পারেন।
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {/* Bank cards */}
          {bankCards.map((b, idx) => (
            <article
              key={idx}
              className="group relative rounded-3xl p-6 md:p-8 overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              style={{
                background:
                  "linear-gradient(145deg, hsl(152 60% 8% / 0.6), hsl(152 70% 6% / 0.75))",
              }}
            >
              {/* Decorative shield icon */}
              <ShieldCheck className="pointer-events-none absolute -right-6 -bottom-6 h-44 w-44 text-white/[0.03]" strokeWidth={1} />

              {/* Top: badge + icon */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-[11px] font-bold tracking-[0.22em] text-white/50 uppercase">
                    {b.badge}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-tight">
                    {b.title}
                  </h3>
                  <div className="text-xs text-[hsl(var(--donate-highlight))]/90 mt-1.5 font-medium">{b.fundLabel}</div>
                </div>
                <div className="h-12 w-16 rounded-lg bg-gradient-to-br from-[hsl(var(--donate-highlight))]/30 to-[hsl(var(--donate-highlight))]/10 border border-[hsl(var(--donate-highlight))]/30 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-[hsl(var(--donate-highlight))]" />
                </div>
              </div>

              {/* Account name */}
              <div className="mb-4">
                <div className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase mb-1">
                  Account Name
                </div>
                <div className="text-[hsl(var(--donate-highlight))] font-bold text-lg">{b.accountName}</div>
              </div>

              {/* Account number — highlighted */}
              <div className="rounded-2xl bg-black/30 border border-white/5 p-4 md:p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase mb-1">
                    Account Number
                  </div>
                  <div className="font-mono font-bold text-white text-xl md:text-2xl tracking-wide" dir="ltr">
                    {formatAccount(b.accountNumber)}
                  </div>
                </div>
                <button
                  onClick={() => copy(b.accountNumber, "অ্যাকাউন্ট নম্বর")}
                  aria-label="অ্যাকাউন্ট নম্বর কপি করুন"
                  className="shrink-0 h-11 w-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              {/* Branch + Routing / SWIFT */}
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase mb-1">
                    Branch
                  </div>
                  <div className="text-white/90 text-sm font-medium">{b.branch}</div>
                </div>
                {b.routing ? (
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase mb-1">
                      Routing
                    </div>
                    <div className="text-white/90 text-sm font-mono font-medium" dir="ltr">{b.routing}</div>
                  </div>
                ) : null}
                {b.swift ? (
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase mb-1">
                      SWIFT
                    </div>
                    <div className="text-white/90 text-sm font-mono font-medium" dir="ltr">{b.swift}</div>
                  </div>
                ) : null}
              </div>
            </article>
          ))}

          {/* Mobile banking — same card style as bank */}
          <article
            className="group relative rounded-3xl p-6 md:p-8 overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            style={{
              background:
                "linear-gradient(145deg, hsl(152 60% 8% / 0.6), hsl(152 70% 6% / 0.75))",
            }}
          >
            <Smartphone className="pointer-events-none absolute -right-6 -bottom-6 h-44 w-44 text-white/[0.03]" strokeWidth={1} />

            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-[11px] font-bold tracking-[0.22em] text-white/50 uppercase">
                  MOBILE BANKING
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-tight">
                  Personal Number
                </h3>
                <div className="text-xs text-[hsl(var(--donate-highlight))]/90 mt-1.5 font-medium">পার্সোনাল অ্যাকাউন্ট</div>
              </div>
              <div className="h-12 w-16 rounded-lg bg-gradient-to-br from-[hsl(var(--donate-highlight))]/30 to-[hsl(var(--donate-highlight))]/10 border border-[hsl(var(--donate-highlight))]/30 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-[hsl(var(--donate-highlight))]" />
              </div>
            </div>

            {/* Account holder */}
            <div className="mb-4">
              <div className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase mb-1">
                Account Name
              </div>
              <div className="text-[hsl(var(--donate-highlight))] font-bold text-lg">{site.payments.bank.account}</div>
            </div>

            {/* Number — highlighted row */}
            <div className="rounded-2xl bg-black/30 border border-white/5 p-4 md:p-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase mb-1">
                  Mobile Number
                </div>
                <div className="font-mono font-bold text-white text-xl md:text-2xl tracking-wide" dir="ltr">
                  {site.payments.bkash.number}
                </div>
              </div>
              <button
                onClick={() => copy(site.payments.bkash.number, "মোবাইল নম্বর")}
                aria-label="মোবাইল নম্বর কপি করুন"
                className="shrink-0 h-11 w-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            {/* Brand pills row */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              {mobileNumbers.map((m) => (
                <span
                  key={m.brand}
                  className="text-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-xs font-medium"
                >
                  {m.brand}
                </span>
              ))}
            </div>
          </article>

          {/* Bangla QR — placeholder, replace src with real QR image */}
          <article
            className="group relative rounded-3xl p-6 md:p-8 overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            style={{
              background:
                "linear-gradient(145deg, hsl(152 60% 8% / 0.6), hsl(152 70% 6% / 0.75))",
            }}
          >
            <QrCode className="pointer-events-none absolute -right-6 -bottom-6 h-44 w-44 text-white/[0.03]" strokeWidth={1} />

            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-[11px] font-bold tracking-[0.22em] text-white/50 uppercase">
                  BANGLA QR
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-tight">
                  স্ক্যান করে দান
                </h3>
                <div className="text-xs text-[hsl(var(--donate-highlight))]/90 mt-1.5 font-medium">যেকোনো ব্যাংক/MFS অ্যাপ</div>
              </div>
              <div className="h-12 w-16 rounded-lg bg-gradient-to-br from-[hsl(var(--donate-highlight))]/30 to-[hsl(var(--donate-highlight))]/10 border border-[hsl(var(--donate-highlight))]/30 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-[hsl(var(--donate-highlight))]" />
              </div>
            </div>

            {/* QR image slot */}
            <div className="rounded-2xl bg-white p-4 flex items-center justify-center aspect-square border border-white/10">
              {site.payments.qrImage ? (
                <img
                  src={site.payments.qrImage}
                  alt="Unite Foundation Bangla QR"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-emerald-900/20 rounded-xl">
                  <QrCode className="h-14 w-14 text-emerald-900/40" strokeWidth={1.2} />
                  <div className="text-emerald-900/70 text-xs font-semibold px-3">
                    Bangla QR শীঘ্রই যুক্ত হবে
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-[11px] text-white/50 mt-4 leading-relaxed">
              মোবাইল ব্যাংকিং/ব্যাংক অ্যাপ থেকে QR স্ক্যান করে সরাসরি দান করুন
            </p>
          </article>
        </div>

        <p className="text-center text-xs text-white/40 mt-10 italic max-w-xl mx-auto">
          "যে ব্যক্তি ভালো কাজে উদ্যোগী হয়, সে ঐ কাজ সম্পাদনকারীর সমান সওয়াব পায়।"
        </p>
      </div>
    </section>
  );
};
