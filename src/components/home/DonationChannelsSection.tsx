import { Copy, CreditCard, ShieldCheck, Heart } from "lucide-react";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";

const bankCards = [
  {
    badge: "BANK TRANSFER",
    title: "Islami Bank",
    accountName: site.payments.bank.account,
    accountNumber: site.payments.bank.number,
    branch: site.payments.bank.branch,
    routing: site.payments.bank.routing,
    fundLabel: "সাধারণ ফান্ড",
  },
  {
    badge: "BANK TRANSFER",
    title: "Islami Bank",
    accountName: `${site.payments.bank.account} (Zakat)`,
    accountNumber: "20502070205708219",
    branch: site.payments.bank.branch,
    routing: site.payments.bank.routing,
    fundLabel: "শিক্ষাবৃত্তি (যাকাত ফান্ড)",
  },
];

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
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:26px_26px]" />
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

        <div className="grid lg:grid-cols-2 gap-5 md:gap-6">
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

              {/* Branch + Routing */}
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase mb-1">
                    Branch
                  </div>
                  <div className="text-white/90 text-sm font-medium">{b.branch}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase mb-1">
                    Routing
                  </div>
                  <div className="text-white/90 text-sm font-mono font-medium" dir="ltr">{b.routing}</div>
                </div>
              </div>
            </article>
          ))}

          {/* Mobile banking card */}
          <article
            className="group relative rounded-3xl p-6 md:p-8 overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:-translate-y-1 lg:col-span-2"
            style={{
              background:
                "linear-gradient(145deg, hsl(152 60% 8% / 0.6), hsl(152 70% 6% / 0.75))",
            }}
          >
            {/* Decorative heart */}
            <Heart className="pointer-events-none absolute -right-6 -bottom-6 h-44 w-44 text-white/[0.03]" strokeWidth={1} />

            {/* Top */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-[11px] font-bold tracking-[0.22em] text-white/50 uppercase">
                  MOBILE BANKING
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-tight">
                  Personal Number
                </h3>
                <div className="text-xs text-white/50 mt-1.5">পার্সোনাল অ্যাকাউন্ট</div>
              </div>
              <div className="flex -space-x-2">
                <span className="h-8 w-8 rounded-full bg-pink-500 border-2 border-[hsl(152_70%_8%)]" />
                <span className="h-8 w-8 rounded-full bg-[hsl(var(--donate-highlight))] border-2 border-[hsl(152_70%_8%)]" />
                <span className="h-8 w-8 rounded-full bg-purple-500 border-2 border-[hsl(152_70%_8%)]" />
              </div>
            </div>

            {/* Big number */}
            <button
              onClick={() => copy(site.payments.bkash.number, "মোবাইল নম্বর")}
              className="w-full rounded-2xl bg-black/30 border border-white/5 hover:border-white/15 p-6 md:p-8 text-center transition-colors"
            >
              <div className="font-mono font-bold text-white text-3xl md:text-5xl tracking-wider" dir="ltr">
                {site.payments.bkash.number}
              </div>
              <div className="text-[hsl(var(--donate-highlight))]/90 text-xs mt-3 inline-flex items-center gap-1.5">
                <Copy className="h-3 w-3" /> কপি করতে ট্যাপ করুন
              </div>
            </button>

            {/* Brand pills */}
            <div className="flex items-center justify-center gap-2.5 mt-5 flex-wrap">
              {mobileNumbers.map((m) => (
                <span
                  key={m.brand}
                  className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium"
                >
                  {m.brand}
                </span>
              ))}
            </div>

            <div className="text-center text-xs text-white/50 mt-5">
              রেফারেন্স: <span className="text-[hsl(var(--donate-highlight))] font-medium">আপনার নাম / প্রকল্প</span>
            </div>
          </article>
        </div>

        <p className="text-center text-xs text-white/40 mt-10 italic max-w-xl mx-auto">
          "যে ব্যক্তি ভালো কাজে উদ্যোগী হয়, সে ঐ কাজ সম্পাদনকারীর সমান সওয়াব পায়।"
        </p>
      </div>
    </section>
  );
};
