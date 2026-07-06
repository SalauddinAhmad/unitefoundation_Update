import { Copy, CreditCard, QrCode, Smartphone } from "lucide-react";
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
    <section className="relative py-12 md:py-16 overflow-hidden bg-secondary">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--primary) / 0.08) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="container-page relative">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <div className="mx-auto mb-4 h-1 w-16 rounded-full gradient-donate-bg" />
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            {t("channels.heading")}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed md:px-8">
            {t("channels.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
          <article className="lg:col-span-5 rounded-[28px] bg-card border border-border shadow-card p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-donate-orange">
                  Bank Transfer
                </p>
                <h3 className="mt-1 text-2xl font-extrabold text-foreground leading-tight">
                  ব্যাংক অ্যাকাউন্ট
                </h3>
              </div>
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="relative mt-5 space-y-4 pl-5 before:absolute before:left-[14px] before:top-4 before:bottom-4 before:w-px before:bg-border">
              {bankCards.map((bank, index) => (
                <div key={bank.title} className="relative">
                  <span className="absolute -left-[26px] top-4 h-4 w-4 rounded-full border-4 border-card bg-primary" />
                  <div className="rounded-2xl bg-secondary/80 border border-border/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                          Bank · 0{index + 1}
                        </p>
                        <h4 className="mt-1 text-lg md:text-xl font-extrabold text-foreground leading-snug">
                          {bank.title}
                        </h4>
                        <p className="mt-1 text-xs font-semibold text-primary">
                          {bank.fundLabel} · {bank.accountName}
                        </p>
                      </div>
                      <span className="rounded-full bg-card px-3 py-1 text-[10px] font-bold text-donate-orange border border-border">
                        {bank.branch}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-card border border-border p-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                          {t("channels.labels.accountNumber")}
                        </p>
                        <p className="mt-1 font-mono text-base md:text-lg font-extrabold text-foreground tracking-wide" dir="ltr">
                          {formatAccount(bank.accountNumber)}
                        </p>
                      </div>
                      <button
                        onClick={() => copy(bank.accountNumber, t("channels.toast.accountNumber"))}
                        aria-label={t("channels.copyAccount")}
                        className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center transition-colors hover:bg-primary/90"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {(bank.routing || bank.swift) && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        {bank.routing && (
                          <div className="rounded-xl bg-card/70 px-3 py-2 border border-border/70">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                              {t("channels.labels.routing")}
                            </p>
                            <p className="mt-0.5 font-mono font-semibold text-foreground" dir="ltr">
                              {bank.routing}
                            </p>
                          </div>
                        )}
                        {bank.swift && (
                          <div className="rounded-xl bg-card/70 px-3 py-2 border border-border/70">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                              {t("channels.labels.swift")}
                            </p>
                            <p className="mt-0.5 font-mono font-semibold text-foreground" dir="ltr">
                              {bank.swift}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="lg:col-span-3 rounded-[28px] bg-card border border-border shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
            <div className="relative h-32 bg-primary overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, hsl(var(--donate-highlight) / 0.7) 25%, transparent 25%), linear-gradient(225deg, hsl(var(--donate-highlight) / 0.7) 25%, transparent 25%)",
                  backgroundSize: "38px 38px",
                }}
              />
              <div className="relative flex items-center justify-between p-5">
                <span className="rounded-full bg-card/95 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
                  Bangla QR
                </span>
                <QrCode className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>

            <div className="px-5 pb-5 -mt-10 relative">
              <div className="mx-auto w-44 max-w-full rounded-[24px] bg-card p-3 shadow-card border border-border">
                <div className="aspect-square rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
                  {site.payments.qrImage ? (
                    <img
                      src={site.payments.qrImage}
                      alt="Unite Foundation Bangla QR"
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-primary/20 rounded-2xl p-3">
                      <QrCode className="h-11 w-11 text-primary/45" strokeWidth={1.4} />
                      <p className="text-xs font-semibold text-primary/75 leading-snug">
                        {t("channels.qrPending")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-xl font-extrabold text-foreground leading-tight">
                  {t("channels.scanToDonate")}
                </h3>
                <p className="mt-1 text-xs font-semibold text-donate-orange">
                  {t("channels.anyAppNote")}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {t("channels.qrHint")}
                </p>
              </div>
            </div>
          </article>

          <article className="lg:col-span-4 rounded-[28px] bg-card border border-border shadow-card p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-donate-orange">
                  Mobile Banking
                </p>
                <h3 className="mt-1 text-2xl font-extrabold text-foreground leading-tight">
                  {t("channels.personalAccount")}
                </h3>
                <p className="mt-1 text-xs font-semibold text-primary">
                  {site.payments.bank.account}
                </p>
              </div>
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-donate-highlight/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-donate-orange" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              {mobileNumbers.map((mobile, index) => (
                <div
                  key={mobile.brand}
                  className="rounded-2xl bg-secondary/80 border border-border/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center text-sm font-extrabold ${
                          index === 0
                            ? "bg-donate-red text-primary-foreground"
                            : index === 1
                              ? "bg-donate-orange text-primary-foreground"
                              : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {mobile.brand.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-foreground">{mobile.brand}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          {t("channels.labels.mobileNumber")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => copy(mobile.number, t("channels.toast.mobileNumber"))}
                      aria-label={t("channels.copyMobile")}
                      className="h-9 w-9 shrink-0 rounded-xl bg-card border border-border text-primary flex items-center justify-center transition-colors hover:bg-accent"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-3 rounded-2xl bg-card border border-border px-3 py-2 font-mono text-base font-extrabold text-foreground tracking-wide" dir="ltr">
                    {mobile.number}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 italic max-w-xl mx-auto">
          {t("channels.quote")}
        </p>
      </div>
    </section>
  );
};
