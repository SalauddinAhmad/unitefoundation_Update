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

export const HomeDonationChannelsSection = () => {
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
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, hsl(152 100% 14%) 0%, hsl(152 100% 9%) 55%, hsl(152 100% 6%) 100%)",
      }}
    >
      {/* Corner glow accents */}

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
          <span className="inline-flex items-center gap-2 rounded-full border border-donate-highlight/40 bg-donate-highlight/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-donate-highlight">
            <span className="h-1.5 w-1.5 rounded-full bg-donate-highlight" />
            দান ও সহযোগিতা
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-primary-foreground leading-tight">
            {t("channels.heading")}
          </h2>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-primary-foreground/70 md:px-8">
            {t("channels.subtitle")}
          </p>
        </div>

        {/* 4 dark bank-card style cards */}
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 items-stretch">
            {/* Bank cards — one per bank */}
            {site.payments.banks.map((bank) => (
              <article
                key={bank.bank}
                className="relative flex flex-col rounded-[24px] p-6 overflow-hidden border border-donate-highlight/25 shadow-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background:
                    "linear-gradient(160deg, hsl(152 60% 12%) 0%, hsl(152 70% 7%) 100%)",
                }}
              >
                {/* watermark shield */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-8 -right-8 opacity-[0.07]"
                >
                  <CreditCard className="h-56 w-56 text-donate-highlight" strokeWidth={1} />
                </div>

                <div className="relative flex items-start justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-donate-highlight/80">
                    Bank Transfer
                  </p>
                  <div className="h-9 w-9 rounded-lg bg-donate-highlight/15 border border-donate-highlight/30 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-donate-highlight" />
                  </div>
                </div>

                <h3 className="relative mt-3 text-2xl font-extrabold text-primary-foreground leading-tight">
                  {bank.bank}
                </h3>
                <p className="relative mt-1 text-[11px] font-semibold text-donate-highlight">
                  সাধারণ ফান্ড
                </p>

                <p className="relative mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
                  Account Name
                </p>
                <p className="relative mt-1 text-sm font-bold text-donate-highlight">
                  {bank.account}
                </p>

                <div className="relative mt-4 rounded-2xl border border-donate-highlight/20 bg-black/25 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
                    Account Number
                  </p>
                  <div className="mt-1 flex items-start justify-between gap-2">
                    <p className="font-mono text-xl font-extrabold text-primary-foreground leading-tight" dir="ltr">
                      {formatAccount(bank.number)}
                    </p>
                    <button
                      onClick={() => copy(bank.number, t("channels.toast.accountNumber"))}
                      aria-label={t("channels.copyAccount")}
                      className="h-9 w-9 shrink-0 rounded-lg bg-donate-highlight/15 border border-donate-highlight/30 text-donate-highlight flex items-center justify-center hover:bg-donate-highlight/25 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative mt-4 space-y-2 text-[11px]">
                  <div>
                    <p className="font-bold uppercase tracking-[0.16em] text-primary-foreground/55">Branch</p>
                    <p className="mt-0.5 font-semibold text-primary-foreground/90">{bank.branch}</p>
                  </div>
                  {bank.routing && (
                    <div>
                      <p className="font-bold uppercase tracking-[0.16em] text-primary-foreground/55">Routing</p>
                      <p className="mt-0.5 font-mono font-semibold text-primary-foreground/90" dir="ltr">{bank.routing}</p>
                    </div>
                  )}
                  {bank.swift && (
                    <div>
                      <p className="font-bold uppercase tracking-[0.16em] text-primary-foreground/55">Swift</p>
                      <p className="mt-0.5 font-mono font-semibold text-primary-foreground/90" dir="ltr">{bank.swift}</p>
                    </div>
                  )}
                </div>
              </article>
            ))}

            {/* Mobile banking card */}
            <article
              className="relative flex flex-col rounded-[24px] p-6 overflow-hidden border border-donate-highlight/25 shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background:
                  "linear-gradient(160deg, hsl(152 60% 12%) 0%, hsl(152 70% 7%) 100%)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-8 -right-8 opacity-[0.07]"
              >
                <Smartphone className="h-56 w-56 text-donate-highlight" strokeWidth={1} />
              </div>

              <div className="relative flex items-start justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-donate-highlight/80">
                  Mobile Banking
                </p>
                <div className="h-9 w-9 rounded-lg bg-donate-highlight/15 border border-donate-highlight/30 flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-donate-highlight" />
                </div>
              </div>

              <h3 className="relative mt-3 text-2xl font-extrabold text-primary-foreground leading-tight">
                Personal Number
              </h3>
              <p className="relative mt-1 text-[11px] font-semibold text-donate-highlight">
                পার্সোনাল অ্যাকাউন্ট
              </p>

              <p className="relative mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
                Account Name
              </p>
              <p className="relative mt-1 text-sm font-bold text-donate-highlight">
                {site.payments.bank.account}
              </p>

              <div className="relative mt-4 rounded-2xl border border-donate-highlight/20 bg-black/25 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
                  Mobile Number
                </p>
                <div className="mt-1 flex items-start justify-between gap-2">
                  <p className="font-mono text-xl font-extrabold text-primary-foreground leading-tight" dir="ltr">
                    {site.payments.bkash.number}
                  </p>
                  <button
                    onClick={() => copy(site.payments.bkash.number, t("channels.toast.mobileNumber"))}
                    aria-label={t("channels.copyMobile")}
                    className="h-9 w-9 shrink-0 rounded-lg bg-donate-highlight/15 border border-donate-highlight/30 text-donate-highlight flex items-center justify-center hover:bg-donate-highlight/25 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="relative mt-4 flex flex-wrap gap-2">
                {mobileNumbers.map((m) => (
                  <span
                    key={m.brand}
                    className="rounded-full border border-donate-highlight/30 bg-donate-highlight/10 px-3 py-1 text-[11px] font-bold text-donate-highlight"
                  >
                    {m.brand}
                  </span>
                ))}
              </div>
            </article>

            {/* QR card */}
            <article
              className="relative flex flex-col rounded-[24px] p-6 overflow-hidden border border-donate-highlight/25 shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background:
                  "linear-gradient(160deg, hsl(152 60% 12%) 0%, hsl(152 70% 7%) 100%)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-8 -right-8 opacity-[0.07]"
              >
                <QrCode className="h-56 w-56 text-donate-highlight" strokeWidth={1} />
              </div>

              <div className="relative flex items-start justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-donate-highlight/80">
                  Bangla QR
                </p>
                <div className="h-9 w-9 rounded-lg bg-donate-highlight/15 border border-donate-highlight/30 flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-donate-highlight" />
                </div>
              </div>

              <h3 className="relative mt-3 text-2xl font-extrabold text-primary-foreground leading-tight">
                স্ক্যান করে দান
              </h3>
              <p className="relative mt-1 text-[11px] font-semibold text-donate-highlight">
                যেকোনো ব্যাংক/MFS অ্যাপ
              </p>

              <div className="relative mt-4 flex-1 flex items-center justify-center">
                <div className="w-full rounded-2xl border border-donate-highlight/25 bg-card p-3">
                  <div className="aspect-square rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                    {site.payments.qrImage ? (
                      <img
                        src={site.payments.qrImage}
                        alt="Unite Foundation Bangla QR"
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/25 rounded-xl p-3 text-center">
                        <QrCode className="h-10 w-10 text-primary/50" strokeWidth={1.4} />
                        <p className="text-[11px] font-semibold text-primary/70">
                          Bangla QR শীঘ্রই যুক্ত হবে
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="relative mt-4 text-[11px] text-primary-foreground/70 text-center leading-relaxed">
                মোবাইল ব্যাংকিং/ব্যাংক অ্যাপ থেকে QR স্ক্যান করে সরাসরি দান করুন
              </p>
            </article>
          </div>
        </div>


        <p className="text-center text-xs text-primary-foreground/60 mt-10 italic max-w-xl mx-auto">
          {t("channels.quote")}
        </p>
      </div>
    </section>
  );
};
