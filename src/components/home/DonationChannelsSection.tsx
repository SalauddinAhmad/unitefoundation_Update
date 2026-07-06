import { Copy, CreditCard, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";

const mobileNumbers = [
  { brand: "bKash", number: site.payments.bkash.number },
  { brand: "Nagad", number: site.payments.nagad.number },
  { brand: "Rocket", number: site.payments.rocket.number },
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
    <section
      className="relative py-16 md:py-24 overflow-hidden isolate"
      style={{
        background:
          "radial-gradient(1000px 550px at 50% -10%, hsl(var(--primary) / 0.18), transparent 60%), radial-gradient(700px 450px at 0% 100%, hsl(var(--donate-orange) / 0.14), transparent 55%), radial-gradient(700px 450px at 100% 100%, hsl(var(--donate-red) / 0.12), transparent 55%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(40 20% 96%) 50%, hsl(var(--background)) 100%)",
      }}
    >
      {/* Brand-tinted geometric pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23006837' stroke-width='1'><path d='M40 4l12 12-12 12-12-12z'/><path d='M40 40l12 12-12 12-12-12z'/><circle cx='40' cy='40' r='3'/></g></svg>")`,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Brand-color aurora blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-[hsl(var(--primary))]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-40 w-[420px] h-[420px] rounded-full bg-[hsl(var(--donate-orange))]/12 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full bg-[hsl(var(--donate-highlight))]/10 blur-3xl" />

      <div className="container-page relative">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            {t("channels.heading")}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed">
            {t("channels.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {/* Bank cards */}
          {bankCards.map((b, idx) => (
            <article
              key={idx}
              className="group relative rounded-3xl p-6 md:p-8 overflow-hidden bg-card border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--donate-highlight))] to-[hsl(var(--donate-orange))]" />
              <ShieldCheck className="pointer-events-none absolute -right-6 -bottom-6 h-44 w-44 text-[hsl(var(--primary))]/[0.04]" strokeWidth={1} />

              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-[11px] font-bold tracking-[0.22em] text-[hsl(var(--primary))]/70 uppercase">
                    {b.badge}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mt-2 tracking-tight">
                    {b.title}
                  </h3>
                  <div className="text-xs text-[hsl(var(--donate-orange))] mt-1.5 font-semibold">{b.fundLabel}</div>
                </div>
                <div className="h-12 w-16 rounded-lg bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
              </div>

              <div className="mb-4">
                <div className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-1">
                  {t("channels.labels.accountName")}
                </div>
                <div className="text-[hsl(var(--primary))] font-bold text-lg">{b.accountName}</div>
              </div>

              <div className="rounded-2xl bg-[hsl(var(--primary))]/[0.06] border border-[hsl(var(--primary))]/15 p-4 md:p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-1">
                    {t("channels.labels.accountNumber")}
                  </div>
                  <div className="font-mono font-bold text-foreground text-xl md:text-2xl tracking-wide" dir="ltr">
                    {formatAccount(b.accountNumber)}
                  </div>
                </div>
                <button
                  onClick={() => copy(b.accountNumber, t("channels.toast.accountNumber"))}
                  aria-label={t("channels.copyAccount")}
                  className="shrink-0 h-11 w-11 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] flex items-center justify-center transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-1">
                    {t("channels.labels.branch")}
                  </div>
                  <div className="text-foreground/90 text-sm font-medium">{b.branch}</div>
                </div>
                {b.routing ? (
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-1">
                      {t("channels.labels.routing")}
                    </div>
                    <div className="text-foreground/90 text-sm font-mono font-medium" dir="ltr">{b.routing}</div>
                  </div>
                ) : null}
                {b.swift ? (
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-1">
                      {t("channels.labels.swift")}
                    </div>
                    <div className="text-foreground/90 text-sm font-mono font-medium" dir="ltr">{b.swift}</div>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {/* Bottom row: mobile banking + QR — compact, centered */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-6 mt-5 md:mt-6 max-w-4xl mx-auto">
          <article className="group relative rounded-3xl p-6 overflow-hidden bg-card border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--donate-highlight))] to-[hsl(var(--donate-orange))]" />
            <Smartphone className="pointer-events-none absolute -right-6 -bottom-6 h-44 w-44 text-[hsl(var(--primary))]/[0.04]" strokeWidth={1} />

            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-[11px] font-bold tracking-[0.22em] text-[hsl(var(--primary))]/70 uppercase">
                  MOBILE BANKING
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mt-2 tracking-tight">
                  Personal Number
                </h3>
                <div className="text-xs text-[hsl(var(--donate-orange))] mt-1.5 font-semibold">{t("channels.personalAccount")}</div>
              </div>
              <div className="h-12 w-16 rounded-lg bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-1">
                {t("channels.labels.accountName")}
              </div>
              <div className="text-[hsl(var(--primary))] font-bold text-lg">{site.payments.bank.account}</div>
            </div>

            <div className="rounded-2xl bg-[hsl(var(--primary))]/[0.06] border border-[hsl(var(--primary))]/15 p-4 md:p-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-1">
                  {t("channels.labels.mobileNumber")}
                </div>
                <div className="font-mono font-bold text-foreground text-xl md:text-2xl tracking-wide" dir="ltr">
                  {site.payments.bkash.number}
                </div>
              </div>
              <button
                onClick={() => copy(site.payments.bkash.number, t("channels.toast.mobileNumber"))}
                aria-label={t("channels.copyMobile")}
                className="shrink-0 h-11 w-11 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] flex items-center justify-center transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5">
              {mobileNumbers.map((m) => (
                <span
                  key={m.brand}
                  className="text-center px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))]/[0.06] border border-[hsl(var(--primary))]/15 text-foreground/80 text-xs font-semibold"
                >
                  {m.brand}
                </span>
              ))}
            </div>
          </article>

          <article className="group relative rounded-3xl p-6 overflow-hidden bg-card border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--donate-highlight))] to-[hsl(var(--donate-orange))]" />
            <QrCode className="pointer-events-none absolute -right-6 -bottom-6 h-44 w-44 text-[hsl(var(--primary))]/[0.04]" strokeWidth={1} />

            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="text-[11px] font-bold tracking-[0.22em] text-[hsl(var(--primary))]/70 uppercase">
                  BANGLA QR
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mt-2 tracking-tight">
                  {t("channels.scanToDonate")}
                </h3>
                <div className="text-xs text-[hsl(var(--donate-orange))] mt-1.5 font-semibold">{t("channels.anyAppNote")}</div>
              </div>
              <div className="h-12 w-16 rounded-lg bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
            </div>

            <div className="rounded-2xl bg-[hsl(var(--primary))]/[0.06] p-3 flex items-center justify-center border border-[hsl(var(--primary))]/15 mx-auto w-40 h-40 md:w-44 md:h-44">
              {site.payments.qrImage ? (
                <img
                  src={site.payments.qrImage}
                  alt="Unite Foundation Bangla QR"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-[hsl(var(--primary))]/25 rounded-xl bg-card">
                  <QrCode className="h-10 w-10 text-[hsl(var(--primary))]/50" strokeWidth={1.2} />
                  <div className="text-[hsl(var(--primary))]/80 text-[10px] font-semibold px-2">
                    {t("channels.qrPending")}
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-[11px] text-muted-foreground mt-4 leading-relaxed">
              {t("channels.qrHint")}
            </p>
          </article>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10 italic max-w-xl mx-auto">
          {t("channels.quote")}
        </p>
      </div>
    </section>
  );
};
