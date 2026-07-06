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
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, hsl(152 100% 14%) 0%, hsl(152 100% 9%) 55%, hsl(152 100% 6%) 100%)",
      }}
    >
      {/* Islamic geometric pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23FBB03B' stroke-width='1'><path d='M40 4 L76 40 L40 76 L4 40 Z'/><path d='M40 16 L64 40 L40 64 L16 40 Z'/><circle cx='40' cy='40' r='6'/></g></svg>")`,
          backgroundSize: "80px 80px",
        }}
      />
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

        {/* Aligned 3-column grid */}
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 items-stretch">
            {/* Bank */}
            <article className="group relative flex flex-col rounded-[28px] bg-card border border-donate-highlight/20 shadow-2xl p-6 md:p-7 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-donate-orange">
                    ব্যাংক ট্রান্সফার
                  </p>
                  <h3 className="mt-1.5 text-xl md:text-2xl font-extrabold text-foreground leading-tight">
                    ব্যাংক অ্যাকাউন্ট
                  </h3>
                </div>
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="relative flex-1 space-y-5 pl-5 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                {bankCards.map((bank, index) => (
                  <div key={bank.title} className="relative">
                    <span className="absolute -left-[25px] top-1 h-4 w-4 rounded-full border-4 border-card bg-primary" />
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                            Bank · 0{index + 1}
                          </p>
                          <h4 className="mt-1 text-base font-extrabold text-foreground leading-snug">
                            {bank.title}
                          </h4>
                        </div>
                        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-primary">
                          {bank.branch}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-primary">
                        {bank.accountName}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-secondary/80 border border-border/60 px-3 py-2.5">
                        <p className="font-mono text-sm font-extrabold text-foreground tracking-wide" dir="ltr">
                          {formatAccount(bank.accountNumber)}
                        </p>
                        <button
                          onClick={() => copy(bank.accountNumber, t("channels.toast.accountNumber"))}
                          aria-label={t("channels.copyAccount")}
                          className="h-8 w-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-colors hover:bg-primary/90"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {(bank.routing || bank.swift) && (
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-muted-foreground" dir="ltr">
                          {bank.routing && <span>Routing: {bank.routing}</span>}
                          {bank.swift && <span>SWIFT: {bank.swift}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* QR */}
            <article className="group relative flex flex-col rounded-[28px] overflow-hidden border border-donate-highlight/30 shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "linear-gradient(160deg, hsl(152 100% 20%) 0%, hsl(152 100% 12%) 100%)",
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(hsl(var(--donate-highlight)) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
              <div className="relative flex flex-col flex-1 p-6 md:p-7 text-center">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-donate-highlight">
                      Bangla QR
                    </p>
                    <h3 className="mt-1.5 text-xl md:text-2xl font-extrabold text-primary-foreground leading-tight">
                      {t("channels.scanToDonate")}
                    </h3>
                  </div>
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-donate-highlight/20 flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-donate-highlight" />
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="mx-auto w-52 max-w-full rounded-[24px] bg-card p-3 shadow-2xl">
                    <div className="aspect-square rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
                      {site.payments.qrImage ? (
                        <img
                          src={site.payments.qrImage}
                          alt="Unite Foundation Bangla QR"
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-primary/25 rounded-2xl p-3">
                          <QrCode className="h-12 w-12 text-primary/45" strokeWidth={1.4} />
                          <p className="text-xs font-semibold text-primary/75 leading-snug">
                            {t("channels.qrPending")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-xs font-semibold text-donate-highlight">
                  {t("channels.anyAppNote")}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-primary-foreground/70">
                  {t("channels.qrHint")}
                </p>
              </div>
            </article>

            {/* Mobile */}
            <article className="group relative flex flex-col rounded-[28px] bg-card border border-donate-highlight/20 shadow-2xl p-6 md:p-7 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-donate-orange">
                    মোবাইল ব্যাংকিং
                  </p>
                  <h3 className="mt-1.5 text-xl md:text-2xl font-extrabold text-foreground leading-tight">
                    {t("channels.personalAccount")}
                  </h3>
                </div>
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-donate-red/10 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-donate-red" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {mobileNumbers.map((mobile, index) => (
                  <div key={mobile.brand} className="rounded-2xl bg-secondary/80 border border-border/70 p-3 text-center">
                    <div
                      className={`mx-auto h-11 w-11 rounded-2xl flex items-center justify-center text-sm font-extrabold ${
                        index === 0
                          ? "bg-donate-red text-primary-foreground"
                          : index === 1
                            ? "bg-donate-orange text-primary-foreground"
                            : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {mobile.brand.charAt(0)}
                    </div>
                    <p className="mt-2 text-[11px] font-extrabold text-foreground">{mobile.brand}</p>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-5 space-y-3">
                {mobileNumbers.map((mobile) => (
                  <div key={mobile.brand} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/80 border border-border/70 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {mobile.brand} · পার্সোনাল
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-extrabold text-foreground tracking-wide" dir="ltr">
                        {mobile.number}
                      </p>
                    </div>
                    <button
                      onClick={() => copy(mobile.number, t("channels.toast.mobileNumber"))}
                      aria-label={t("channels.copyMobile")}
                      className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-colors hover:bg-primary/90"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
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
