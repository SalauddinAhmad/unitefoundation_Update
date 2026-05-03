import { Copy, Landmark, Smartphone, ShieldCheck, Sparkles } from "lucide-react";
import bkashLogo from "@/assets/pay-bkash.png";
import nagadLogo from "@/assets/pay-nagad.png";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";

const banks = [
  {
    title: "সাধারণ ফান্ড",
    badge: "General Fund",
    rows: [
      ["Bank Name", site.payments.bank.bank],
      ["Branch", site.payments.bank.branch],
      ["Routing Number", site.payments.bank.routing],
      ["Account Name", site.payments.bank.account],
      ["Account No", site.payments.bank.number],
    ],
  },
  {
    title: "শিক্ষাবৃত্তি (যাকাত ফান্ড)",
    badge: "Zakat Fund",
    rows: [
      ["Bank Name", site.payments.bank.bank],
      ["Branch", site.payments.bank.branch],
      ["Routing Number", site.payments.bank.routing],
      ["Account Name", `${site.payments.bank.account} (Zakat Fund)`],
      ["Account No", "20502070205708219"],
    ],
  },
];

type Mobile = {
  logo: string | null;
  text?: string;
  label: string;
  number: string;
  brand: "bkash" | "nagad" | "rocket";
};

const mobileGeneral: Mobile[] = [
  { logo: bkashLogo, label: "বিকাশ পার্সোনাল", number: "01759-754265", brand: "bkash" },
  { logo: nagadLogo, label: "নগদ পার্সোনাল", number: "01759-754265", brand: "nagad" },
  { logo: null, text: "Rocket", label: "রকেট পার্সোনাল", number: "01759-754265-1", brand: "rocket" },
];

const mobileZakat: Mobile[] = [
  { logo: bkashLogo, label: "বিকাশ মার্চেন্ট (যাকাত ফান্ড)", number: "01759-754266", brand: "bkash" },
  { logo: nagadLogo, label: "নগদ মার্চেন্ট (যাকাত ফান্ড)", number: "01759-754266", brand: "nagad" },
];

const brandStyles: Record<Mobile["brand"], { ring: string; chip: string; glow: string }> = {
  bkash: {
    ring: "ring-pink-200/70",
    chip: "bg-pink-50 text-pink-700",
    glow: "from-pink-500/10 via-rose-400/5 to-transparent",
  },
  nagad: {
    ring: "ring-orange-200/70",
    chip: "bg-orange-50 text-orange-700",
    glow: "from-orange-500/10 via-amber-400/5 to-transparent",
  },
  rocket: {
    ring: "ring-purple-200/70",
    chip: "bg-purple-50 text-purple-700",
    glow: "from-purple-500/10 via-fuchsia-400/5 to-transparent",
  },
};

const copy = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast({ title: "কপি হয়েছে", description: `${label} কপি করা হয়েছে।` });
};

export const DonationChannelsSection = () => {
  return (
    <section
      className="relative py-12 md:py-16 overflow-hidden isolate"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -10%, hsl(var(--donate-highlight) / 0.18), transparent 60%), radial-gradient(800px 500px at 0% 100%, hsl(var(--donate-orange) / 0.18), transparent 55%), radial-gradient(800px 500px at 100% 100%, hsl(152 100% 14% / 0.55), transparent 55%), linear-gradient(180deg, hsl(152 80% 9%) 0%, hsl(152 100% 12%) 50%, hsl(152 80% 8%) 100%)",
      }}
    >
      {/* Subtle pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:26px_26px]" />
      {/* Glow accents */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-[hsl(var(--donate-highlight))]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-40 w-[420px] h-[420px] rounded-full bg-[hsl(var(--donate-orange))]/15 blur-3xl" />



      <div className="container-page">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--donate-highlight))]/15 text-[hsl(var(--donate-highlight))] text-xs font-bold tracking-wider uppercase ring-1 ring-[hsl(var(--donate-highlight))]/30">
            <Sparkles className="h-3.5 w-3.5" /> দানের মাধ্যম
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold mt-3 text-white tracking-tight leading-tight">
            আমাদের সাথে যুক্ত হোন
          </h2>
          <p className="text-white/70 mt-2 text-sm md:text-base leading-relaxed">
            নিচের যে কোনো পদ্ধতিতে আমাদের সঙ্গে যুক্ত হয়ে আর্তমানবতার সেবায় ভূমিকা রাখতে পারেন।
          </p>
        </div>

        {/* Bank section */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-white/10 text-[hsl(var(--donate-highlight))] flex items-center justify-center ring-1 ring-white/15">
            <Landmark className="h-4.5 w-4.5" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white">ব্যাংক ট্রান্সফার</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {banks.map((b) => (
            <div
              key={b.title}
              className="group relative bg-card rounded-2xl p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/60 hover:-translate-y-1 hover:border-primary/30"
            >
              {/* corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-tr-2xl rounded-bl-[4rem] -z-0" />

              <div className="relative flex flex-col items-center mb-4">
                <span className="text-[10px] font-en font-bold tracking-[0.2em] text-primary/70 uppercase">
                  {b.badge}
                </span>
                <h3 className="text-center font-extrabold text-foreground text-base md:text-lg mt-1 tracking-tight">
                  {b.title}
                </h3>
                <div className="mt-2 h-1 w-10 rounded-full bg-gradient-to-r from-primary to-primary/30" />
              </div>

              <div className="relative rounded-xl border border-border/60 overflow-hidden bg-background/50">
                <table className="w-full text-xs md:text-sm">
                  <tbody>
                    {b.rows.map(([k, v], i) => (
                      <tr
                        key={k}
                        className={`${i % 2 ? "bg-secondary/40" : "bg-card"} ${
                          i !== b.rows.length - 1 ? "border-b border-border/50" : ""
                        }`}
                      >
                        <td className="px-3 py-2 text-muted-foreground font-medium border-r border-border/50 w-[44%] align-middle">
                          {k}
                        </td>
                        <td className="px-3 py-2 font-semibold text-foreground" dir="ltr">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{v}</span>
                            {(k === "Account No" || k === "Routing Number") && (
                              <button
                                onClick={() => copy(String(v), k)}
                                aria-label={`${k} কপি করুন`}
                                className="p-1.5 rounded-md text-primary hover:bg-accent shrink-0 transition-colors"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile banking section */}
        <div className="flex items-center gap-3 mt-8 md:mt-10 mb-4">
          <div className="h-9 w-9 rounded-xl bg-[hsl(var(--donate-orange))]/20 text-[hsl(var(--donate-highlight))] flex items-center justify-center ring-1 ring-white/15">
            <Smartphone className="h-4.5 w-4.5" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white">মোবাইল ব্যাংকিং</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
        </div>

        {/* General mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {mobileGeneral.map((m) => (
            <MobileCard key={m.label} {...m} />
          ))}
        </div>




        {/* Footer note */}
        <p className="text-center text-xs text-white/60 mt-6 md:mt-8 italic max-w-xl mx-auto">
          "যে ব্যক্তি ভালো কাজে উদ্যোগী হয়, সে ঐ কাজ সম্পাদনকারীর সমান সওয়াব পায়।"
        </p>
      </div>
    </section>
  );
};

const MobileCard = ({ logo, label, number, brand, text }: Mobile) => {
  const s = brandStyles[brand];
  return (
    <div
      className={`group relative bg-card rounded-xl p-3 md:p-4 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/60 ring-1 ${s.ring} hover:-translate-y-1 overflow-hidden`}
    >
      {/* glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${s.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0`} />

      <div className="relative flex items-center gap-3 md:gap-4">
        <div className="shrink-0 h-12 w-16 md:h-14 md:w-20 bg-white rounded-lg flex items-center justify-center shadow-sm border border-border/40 overflow-hidden p-2 transition-transform duration-300 group-hover:scale-105">
          {logo ? (
            <img src={logo} alt={label} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="font-extrabold text-purple-700 text-xl tracking-tight">{text}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${s.chip} mb-1.5`}>
            {brand === "bkash" ? "bKash" : brand === "nagad" ? "Nagad" : "Rocket"}
          </span>
          <div className="text-sm md:text-[15px] font-bold text-foreground leading-snug">{label}</div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-mono font-extrabold text-foreground text-sm md:text-base tracking-tight" dir="ltr">
              {number}
            </span>
            <button
              onClick={() => copy(number, label)}
              aria-label={`${label} নম্বর কপি করুন`}
              className="p-1.5 rounded-md text-primary hover:bg-accent transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
