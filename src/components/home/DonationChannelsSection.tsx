import { Copy, CreditCard, QrCode, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";

const mobileNumbers = [
  { brand: "bKash", number: site.payments.bkash.number, color: "hsl(340 75% 45%)" },
  { brand: "Nagad", number: site.payments.nagad.number, color: "hsl(24 91% 54%)" },
  { brand: "Rocket", number: site.payments.rocket.number, color: "hsl(280 55% 40%)" },
];

const formatAccount = (n: string) => n.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

export const DonationChannelsSection = () => {
  const { t } = useTranslation();

  const bankCards = site.payments.banks.map((b) => ({
    badge: "BANK TRANSFER",
    title: b.bank,
    accountName: b.account,
    accountNumber: b.number,
    branch: b.branch,
    routing: b.routing,
    swift: b.swift,
    fundLabel: t("channels.generalFund"),
  }));

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t("common.copied"), description: t("common.copiedDesc", { label }) });
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-[hsl(40_25%_97%)]">
      {/* Soft brand aurora blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[hsl(var(--primary))]/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-[hsl(var(--donate-orange))]/8 blur-3xl" />

      <div className="container-page relative">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            {t("channels.heading")}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed">
            {t("channels.subtitle")}
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5 auto-rows-auto">
          {/* Bank card 1 — white, col-span-3 */}
          {bankCards[0] && (
            <article className="md:col-span-3 rounded-[2rem] bg-card p-7 md:p-8 shadow-[0_10px_40px_-15px_hsl(152_60%_15%/0.15)] hover:shadow-[0_20px_50px_-15px_hsl(152_60%_15%/0.25)] hover:-translate-y-1 transition-all duration-300 border border-border/50">
              <div className="flex items-start justify-between mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  {bankCards[0].badge}
                </span>
              </div>
              <h3 className="text-2xl md:text-[26px] font-extrabold text-foreground tracking-tight leading-snug">
                {bankCards[0].title}
              </h3>
              <div className="text-xs text-[hsl(var(--donate-orange))] font-semibold mt-1.5">
                {bankCards[0].fundLabel} · {bankCards[0].accountName}
              </div>

              <div className="mt-5 rounded-2xl bg-[hsl(40_20%_96%)] p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase mb-1">
                    {t("channels.labels.accountNumber")}
                  </div>
                  <div className="font-mono font-bold text-foreground text-lg md:text-xl tracking-wide" dir="ltr">
                    {formatAccount(bankCards[0].accountNumber)}
                  </div>
                </div>
                <button
                  onClick={() => copy(bankCards[0].accountNumber, t("channels.toast.accountNumber"))}
                  aria-label={t("channels.copyAccount")}
                  className="shrink-0 h-11 w-11 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] flex items-center justify-center transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
                <div>
                  <div className="text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase">{t("channels.labels.branch")}</div>
                  <div className="text-foreground/90 font-medium mt-0.5">{bankCards[0].branch}</div>
                </div>
                {bankCards[0].routing && (
                  <div>
                    <div className="text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase">{t("channels.labels.routing")}</div>
                    <div className="text-foreground/90 font-mono font-medium mt-0.5" dir="ltr">{bankCards[0].routing}</div>
                  </div>
                )}
                {bankCards[0].swift && (
                  <div>
                    <div className="text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase">{t("channels.labels.swift")}</div>
                    <div className="text-foreground/90 font-mono font-medium mt-0.5" dir="ltr">{bankCards[0].swift}</div>
                  </div>
                )}
              </div>
            </article>
          )}

          {/* QR card — solid brand green, tall, col-span-3 row-span-2 */}
          <article
            className="md:col-span-3 md:row-span-2 rounded-[2rem] p-7 md:p-8 text-white shadow-[0_20px_50px_-15px_hsl(152_100%_15%/0.4)] relative overflow-hidden flex flex-col"
            style={{
              background:
                "linear-gradient(155deg, hsl(152 100% 18%) 0%, hsl(152 100% 12%) 100%)",
            }}
          >
            {/* Decorative pattern */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='%23FBB03B' stroke-width='0.8'><path d='M30 4l10 10-10 10-10-10z'/><circle cx='30' cy='30' r='2'/></g></svg>")`,
                backgroundSize: "60px 60px",
              }}
            />
            <div className="relative flex items-start justify-between mb-6">
              <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-[hsl(var(--donate-highlight))]" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase">
                Bangla QR
              </span>
            </div>

            <div className="relative">
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                {t("channels.scanToDonate")}
              </h3>
              <p className="text-white/70 text-sm mt-2 leading-relaxed">
                {t("channels.anyAppNote")}
              </p>
            </div>

            {/* QR image */}
            <div className="relative mt-6 md:mt-8 flex-1 flex items-center justify-center">
              <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                  {site.payments.qrImage ? (
                    <img
                      src={site.payments.qrImage}
                      alt="Unite Foundation Bangla QR"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-[hsl(var(--primary))]/25 rounded-xl">
                      <QrCode className="h-14 w-14 text-[hsl(var(--primary))]/40" strokeWidth={1.2} />
                      <div className="text-[hsl(var(--primary))]/70 text-xs font-semibold px-3">
                        {t("channels.qrPending")}
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[hsl(var(--donate-highlight))] text-[hsl(var(--donate-highlight-foreground))] text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg tracking-wider">
                  SCAN TO PAY
                </div>
              </div>
            </div>

            <p className="relative text-center text-[11px] text-white/50 mt-6 leading-relaxed">
              {t("channels.qrHint")}
            </p>
          </article>

          {/* Bank card 2 — white, col-span-3 */}
          {bankCards[1] && (
            <article className="md:col-span-3 rounded-[2rem] bg-card p-7 md:p-8 shadow-[0_10px_40px_-15px_hsl(152_60%_15%/0.15)] hover:shadow-[0_20px_50px_-15px_hsl(152_60%_15%/0.25)] hover:-translate-y-1 transition-all duration-300 border border-border/50">
              <div className="flex items-start justify-between mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[hsl(var(--donate-highlight))]/15 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-[hsl(var(--donate-orange))]" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  {bankCards[1].badge}
                </span>
              </div>
              <h3 className="text-2xl md:text-[26px] font-extrabold text-foreground tracking-tight leading-snug">
                {bankCards[1].title}
              </h3>
              <div className="text-xs text-[hsl(var(--donate-orange))] font-semibold mt-1.5">
                {bankCards[1].fundLabel} · {bankCards[1].accountName}
              </div>

              <div className="mt-5 rounded-2xl bg-[hsl(40_20%_96%)] p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase mb-1">
                    {t("channels.labels.accountNumber")}
                  </div>
                  <div className="font-mono font-bold text-foreground text-lg md:text-xl tracking-wide" dir="ltr">
                    {formatAccount(bankCards[1].accountNumber)}
                  </div>
                </div>
                <button
                  onClick={() => copy(bankCards[1].accountNumber, t("channels.toast.accountNumber"))}
                  aria-label={t("channels.copyAccount")}
                  className="shrink-0 h-11 w-11 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] flex items-center justify-center transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
                <div>
                  <div className="text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase">{t("channels.labels.branch")}</div>
                  <div className="text-foreground/90 font-medium mt-0.5">{bankCards[1].branch}</div>
                </div>
                {bankCards[1].routing && (
                  <div>
                    <div className="text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase">{t("channels.labels.routing")}</div>
                    <div className="text-foreground/90 font-mono font-medium mt-0.5" dir="ltr">{bankCards[1].routing}</div>
                  </div>
                )}
                {bankCards[1].swift && (
                  <div>
                    <div className="text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase">{t("channels.labels.swift")}</div>
                    <div className="text-foreground/90 font-mono font-medium mt-0.5" dir="ltr">{bankCards[1].swift}</div>
                  </div>
                )}
              </div>
            </article>
          )}

          {/* Mobile banking — gradient accent card, col-span-3 */}
          <article
            className="md:col-span-3 rounded-[2rem] p-7 md:p-8 text-white shadow-[0_20px_50px_-15px_hsl(24_91%_45%/0.4)] relative overflow-hidden"
            style={{ background: "var(--gradient-donate)" }}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">
                Mobile Banking
              </span>
            </div>

            <h3 className="text-2xl md:text-[26px] font-extrabold tracking-tight leading-snug">
              {t("channels.personalAccount")}
            </h3>
            <div className="text-xs text-white/80 font-semibold mt-1.5">
              {site.payments.bank.account}
            </div>

            <div className="mt-5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-bold tracking-[0.16em] text-white/70 uppercase mb-1">
                  {t("channels.labels.mobileNumber")}
                </div>
                <div className="font-mono font-bold text-white text-lg md:text-xl tracking-wide" dir="ltr">
                  {site.payments.bkash.number}
                </div>
              </div>
              <button
                onClick={() => copy(site.payments.bkash.number, t("channels.toast.mobileNumber"))}
                aria-label={t("channels.copyMobile")}
                className="shrink-0 h-11 w-11 rounded-xl bg-white text-[hsl(var(--donate-red))] hover:bg-white/90 flex items-center justify-center transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {mobileNumbers.map((m) => (
                <span
                  key={m.brand}
                  className="text-center px-3 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold"
                >
                  {m.brand}
                </span>
              ))}
            </div>
          </article>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10 italic max-w-xl mx-auto">
          {t("channels.quote")}
        </p>
      </div>
    </section>
  );
};
