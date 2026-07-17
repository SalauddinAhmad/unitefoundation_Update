import { Copy, CreditCard, Heart, QrCode, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";
import { usePaymentsData } from "@/hooks/usePaymentsData";

const formatAccount = (n: string) => n.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

export const HomeDonationChannelsSection = () => {
  const { t } = useTranslation();
  const payments = usePaymentsData();

  const mobileNumbers = [
    { brand: "bKash", number: payments.mobiles.bkash },
    { brand: "Nagad", number: payments.mobiles.nagad },
    { brand: "Rocket", number: payments.mobiles.rocket },
  ];

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t("common.copied"), description: t("common.copiedDesc", { label }) });
  };


  const cardBg =
    "linear-gradient(160deg, hsl(152 55% 13%) 0%, hsl(152 65% 8%) 100%)";

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, hsl(152 100% 14%) 0%, hsl(152 100% 9%) 55%, hsl(152 100% 6%) 100%)",
      }}
    >
      {/* Islamic diamond pattern watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='%23FBB03B' stroke-width='0.8'><path d='M30 2 L58 30 L30 58 L2 30 Z'/><path d='M30 14 L46 30 L30 46 L14 30 Z'/></g></svg>")`,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "hsl(var(--donate-highlight) / 0.18)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "hsl(var(--donate-red) / 0.18)" }}
      />

      <div className="container-page relative">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary-foreground leading-tight">
            {t("channels.heading")}
          </h2>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-primary-foreground/75 md:px-8">
            {t("channels.subtitle")}
          </p>
        </div>

        {/* 2-column grid, large cards */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Bank cards */}
          {payments.banks.map((bank) => (
            <article
              key={bank.bank}
              className="relative overflow-hidden rounded-[28px] border border-donate-highlight/20 shadow-2xl p-6 md:p-8"
              style={{ background: cardBg }}
            >
              {/* watermark shield */}
              <div
                aria-hidden
                className="pointer-events-none absolute right-4 top-16 opacity-[0.06]"
              >
                <CreditCard className="h-40 w-40 text-donate-highlight" strokeWidth={1} />
              </div>

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary-foreground/60">
                    Bank Transfer
                  </p>
                  <h3 className="mt-2 text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight">
                    {bank.bank}
                  </h3>
                </div>
                <div className="h-11 w-11 shrink-0 rounded-lg bg-donate-highlight/90 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-[hsl(152_65%_8%)]" strokeWidth={2.4} />
                </div>
              </div>

              <div className="relative mt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/55">
                  Account Name
                </p>
                <p className="mt-1.5 text-lg font-bold text-donate-highlight">
                  {bank.account}
                </p>
              </div>

              <div className="relative mt-5 rounded-2xl border border-donate-highlight/15 bg-black/30 px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/55">
                  Account Number
                </p>
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p
                    className="font-mono text-lg md:text-xl font-extrabold text-primary-foreground tracking-wider"
                    dir="ltr"
                  >
                    {formatAccount(bank.number)}
                  </p>
                  <button
                    onClick={() => copy(bank.number, t("channels.toast.accountNumber"))}
                    aria-label={t("channels.copyAccount")}
                    className="h-9 w-9 shrink-0 rounded-lg text-donate-highlight hover:bg-donate-highlight/10 transition-colors flex items-center justify-center"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/55">
                    Branch
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary-foreground/90">
                    {bank.branch}
                  </p>
                </div>
                {bank.routing && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/55">
                      Routing
                    </p>
                    <p
                      className="mt-1 font-mono text-sm font-semibold text-primary-foreground/90"
                      dir="ltr"
                    >
                      {bank.routing}
                    </p>
                  </div>
                )}
                {bank.swift && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/55">
                      Swift
                    </p>
                    <p
                      className="mt-1 font-mono text-sm font-semibold text-primary-foreground/90"
                      dir="ltr"
                    >
                      {bank.swift}
                    </p>
                  </div>
                )}
              </div>
            </article>
          ))}

          {/* Mobile banking */}
          <article
            className="relative overflow-hidden rounded-[28px] border border-donate-highlight/20 shadow-2xl p-6 md:p-8"
            style={{ background: cardBg }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute right-4 top-16 opacity-[0.06]"
            >
              <Heart className="h-40 w-40 text-donate-highlight" strokeWidth={1} />
            </div>

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary-foreground/60">
                  Mobile Banking
                </p>
                <h3 className="mt-2 text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight">
                  Personal Number
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="h-3 w-3 rounded-full bg-donate-red" />
                <span className="h-3 w-3 rounded-full bg-donate-orange" />
                <span className="h-3 w-3 rounded-full bg-donate-highlight" />
              </div>
            </div>

            <button
              onClick={() =>
                copy(payments.mobiles.bkash, t("channels.toast.mobileNumber"))
              }
              className="relative mt-8 w-full rounded-2xl border border-donate-highlight/15 bg-black/30 px-5 py-6 text-center transition-colors hover:bg-black/40"
            >
              <p
                className="font-mono text-2xl md:text-3xl font-extrabold text-primary-foreground tracking-wider"
                dir="ltr"
              >
                {payments.mobiles.bkash}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-donate-highlight">
                <Copy className="h-3 w-3" />
                কপি করতে ট্যাপ করুন
              </p>
            </button>

            <div className="relative mt-5 flex flex-wrap gap-2">
              {mobileNumbers.map((m) => (
                <span
                  key={m.brand}
                  className="rounded-full border border-donate-highlight/25 bg-donate-highlight/10 px-3.5 py-1 text-xs font-bold text-donate-highlight"
                >
                  {m.brand}
                </span>
              ))}
            </div>

            <p className="relative mt-4 text-xs text-primary-foreground/70">
              সব নম্বর <span className="font-semibold text-donate-highlight">পার্সোনাল</span>
            </p>
          </article>

          {/* Bangla QR */}
          <article
            className="relative overflow-hidden rounded-[28px] border border-donate-highlight/20 shadow-2xl p-6 md:p-8"
            style={{ background: cardBg }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.06]"
            >
              <QrCode className="h-48 w-48 text-donate-highlight" strokeWidth={1} />
            </div>

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary-foreground/60">
                  Bangla QR
                </p>
                <h3 className="mt-2 text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight">
                  {t("channels.scanToDonate")}
                </h3>
              </div>
              <div className="h-11 w-11 shrink-0 rounded-lg bg-donate-highlight/90 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-[hsl(152_65%_8%)]" strokeWidth={2.4} />
              </div>
            </div>

            <div className="relative mt-8 mx-auto w-44 rounded-2xl bg-card p-3 border border-donate-highlight/20">
              <div className="aspect-square rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                {payments.qrImage ? (
                  <img
                    src={payments.qrImage}
                    alt="Unite Foundation Bangla QR"
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/25 rounded-xl p-3 text-center">
                    <QrCode className="h-10 w-10 text-primary/50" strokeWidth={1.4} />
                    <p className="text-[11px] font-semibold text-primary/70">
                      {t("channels.qrPending")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="relative mt-5 text-center text-xs font-semibold text-donate-highlight">
              {t("channels.anyAppNote")}
            </p>
            <p className="relative mt-2 text-center text-xs text-primary-foreground/70 leading-relaxed">
              {t("channels.qrHint")}
            </p>
          </article>
        </div>

        <p className="text-center text-xs text-primary-foreground/60 mt-10 italic max-w-xl mx-auto">
          {t("channels.quote")}
        </p>
      </div>
    </section>
  );
};
