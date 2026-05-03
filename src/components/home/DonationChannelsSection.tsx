import { Copy, Building2, Sparkles } from "lucide-react";
import bkashLogo from "@/assets/pay-bkash.png";
import nagadLogo from "@/assets/pay-nagad.png";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";

const banks = [
  {
    title: "সাধারণ ফান্ড",
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
    rows: [
      ["Bank Name", site.payments.bank.bank],
      ["Branch", site.payments.bank.branch],
      ["Routing Number", site.payments.bank.routing],
      ["Account Name", `${site.payments.bank.account} (Zakat Fund)`],
      ["Account No", "20502070205708219"],
    ],
  },
];

const mobileGeneral = [
  { logo: bkashLogo, label: "বিকাশ মার্চেন্ট", number: "01759-754265", tone: "from-pink-50 to-pink-100/50 ring-pink-200/60" },
  { logo: nagadLogo, label: "নগদ মার্চেন্ট", number: "01759-754265", tone: "from-orange-50 to-amber-100/40 ring-orange-200/60" },
  { logo: null, label: "রকেট মার্চেন্ট", number: "01759-754265-1", tone: "from-purple-50 to-fuchsia-100/40 ring-purple-200/60", text: "Rocket" },
];

const mobileZakat = [
  { logo: bkashLogo, label: "বিকাশ মার্চেন্ট (যাকাত ফান্ড)", number: "01759-754266", tone: "from-pink-50 to-pink-100/50 ring-pink-200/60" },
  { logo: nagadLogo, label: "নগদ মার্চেন্ট (যাকাত ফান্ড)", number: "01759-754266", tone: "from-orange-50 to-amber-100/40 ring-orange-200/60" },
];

const copy = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast({ title: "কপি হয়েছে", description: `${label} কপি করা হয়েছে।` });
};

export const DonationChannelsSection = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-background">
      {/* decorative bg */}
      <div className="absolute inset-0 -z-10 opacity-[0.04] [background-image:radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl -z-10" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-donate/10 blur-3xl -z-10" />

      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="eyebrow inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> দানের মাধ্যম</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3 text-foreground">যেভাবে দান করতে পারেন</h2>
          <p className="text-muted-foreground mt-3 text-base md:text-lg">
            ব্যাংক ট্রান্সফার অথবা মোবাইল ব্যাংকিং — যেকোনো সহজ মাধ্যমে আপনার দান পৌঁছে দিন।
          </p>
        </div>

        {/* Bank cards */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-7">
          {banks.map((b) => (
            <div
              key={b.title}
              className="group relative bg-card rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all border border-border/60 hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-2 mb-5">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="text-center font-bold text-foreground tracking-tight">{b.title}</h3>
              </div>
              <div className="rounded-xl border border-border/70 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {b.rows.map(([k, v], i) => (
                      <tr key={k} className={i % 2 ? "bg-secondary/30" : "bg-background"}>
                        <td className="px-4 py-3 text-muted-foreground font-medium border-r border-border/60 w-[42%] align-middle">{k}</td>
                        <td className="px-4 py-3 font-semibold text-foreground" dir="ltr">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{v}</span>
                            {(k === "Account No" || k === "Routing Number") && (
                              <button
                                onClick={() => copy(String(v), k)}
                                aria-label={`${k} কপি করুন`}
                                className="p-1.5 rounded-md text-primary hover:bg-accent shrink-0"
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

        {/* Mobile banking */}
        <div className="mt-6 md:mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {mobileGeneral.map((m) => (
            <MobileCard key={m.label} {...m} />
          ))}
        </div>

        <div className="mt-6 md:mt-7 grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-7 max-w-4xl mx-auto">
          {mobileZakat.map((m) => (
            <MobileCard key={m.label} {...m} />
          ))}
        </div>
      </div>
    </section>
  );
};

const MobileCard = ({
  logo,
  label,
  number,
  tone,
  text,
}: {
  logo: string | null;
  label: string;
  number: string;
  tone: string;
  text?: string;
}) => (
  <div
    className={`group relative bg-gradient-to-br ${tone} ring-1 rounded-2xl p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1`}
  >
    <div className="flex items-center gap-4 md:gap-5">
      <div className="shrink-0 h-16 w-24 md:h-20 md:w-28 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden p-2">
        {logo ? (
          <img src={logo} alt={label} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="font-extrabold text-purple-700 text-lg tracking-tight">{text}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm md:text-base font-bold text-foreground leading-snug">{label}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono font-extrabold text-foreground text-base md:text-lg tracking-tight" dir="ltr">
            {number}
          </span>
          <button
            onClick={() => copy(number, label)}
            aria-label={`${label} নম্বর কপি করুন`}
            className="p-1.5 rounded-md text-primary hover:bg-white/70"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);
