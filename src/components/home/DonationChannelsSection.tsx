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

        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-start">
            <div className="lg:col-span-4 space-y-4 md:space-y-5 lg:pt-4">
              <article className="rounded-[28px] bg-card border border-border shadow-card p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-donate-orange">
                      ব্যাংক ট্রান্সফার
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold text-foreground leading-tight">
                      ব্যাংক অ্যাকাউন্ট
                    </h3>
                  </div>
                  <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div className="relative space-y-5 pl-5 before:absolute before:left-[13px] before:top-5 before:bottom-5 before:w-px before:bg-border">
                  {bankCards.map((bank, index) => (
                    <div key={bank.title} className="relative">
                      <span className="absolute -left-[25px] top-1 h-4 w-4 rounded-full border-4 border-card bg-primary" />
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                              Bank · 0{index + 1}
                            </p>
                            <h4 className="mt-1 text-base md:text-lg font-extrabold text-foreground leading-snug">
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
                          <p className="font-mono text-sm md:text-base font-extrabold text-foreground tracking-wide" dir="ltr">
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
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold text-muted-foreground">
                            {bank.routing && <span dir="ltr">Routing: {bank.routing}</span>}
                            {bank.swift && <span dir="ltr">SWIFT: {bank.swift}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <div className="rounded-[24px] bg-card border border-border shadow-card p-4">
                <div className="grid grid-cols-4 gap-3">
                  {[CreditCard, Smartphone, QrCode, Copy].map((Icon, index) => (
                    <div
                      key={index}
                      className={`h-12 rounded-2xl flex items-center justify-center ${
                        index === 2 ? "bg-donate-red text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4 md:space-y-5">
              <article className="rounded-[28px] bg-card border border-border shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                <div className="relative h-36 bg-primary overflow-hidden">
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, hsl(var(--donate-highlight) / 0.85) 25%, transparent 25%), linear-gradient(225deg, hsl(var(--donate-highlight) / 0.85) 25%, transparent 25%)",
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

                <div className="px-6 pb-6 -mt-12 relative text-center">
                  <div className="mx-auto w-48 max-w-full rounded-[26px] bg-card p-3 shadow-card border border-border">
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
                          <QrCode className="h-12 w-12 text-primary/45" strokeWidth={1.4} />
                          <p className="text-xs font-semibold text-primary/75 leading-snug">
                            {t("channels.qrPending")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-5 text-2xl font-extrabold text-foreground leading-tight">
                    {t("channels.scanToDonate")}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-donate-orange">
                    {t("channels.anyAppNote")}
                  </p>
                  <button className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-donate transition-colors hover:bg-primary/90">
                    <QrCode className="h-4 w-4" />
                    স্ক্যান করুন
                  </button>
                </div>
              </article>

              <article className="rounded-[24px] bg-card border border-border shadow-card p-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <QrCode className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t("channels.qrHint")}
                  </p>
                </div>
              </article>
            </div>

            <div className="lg:col-span-4 space-y-4 md:space-y-5 lg:pt-7">
              <article className="rounded-[28px] bg-card border border-border shadow-card p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-donate-orange">
                      মোবাইল ব্যাংকিং
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold text-foreground leading-tight">
                      {t("channels.personalAccount")}
                    </h3>
                  </div>
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {mobileNumbers.map((mobile, index) => (
                    <div key={mobile.brand} className="rounded-2xl bg-secondary/80 border border-border/70 p-3 text-center">
                      <div
                        className={`mx-auto h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-extrabold ${
                          index === 0
                            ? "bg-donate-red text-primary-foreground"
                            : index === 1
                              ? "bg-donate-orange text-primary-foreground"
                              : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {mobile.brand.charAt(0)}
                      </div>
                      <p className="mt-2 text-xs font-extrabold text-foreground">{mobile.brand}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-secondary/80 border border-border/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {t("channels.labels.mobileNumber")}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="font-mono text-lg font-extrabold text-foreground tracking-wide" dir="ltr">
                      {site.payments.bkash.number}
                    </p>
                    <button
                      onClick={() => copy(site.payments.bkash.number, t("channels.toast.mobileNumber"))}
                      aria-label={t("channels.copyMobile")}
                      className="h-10 w-10 shrink-0 rounded-full bg-card border border-border text-primary flex items-center justify-center transition-colors hover:bg-accent"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-primary">
                    {site.payments.bank.account}
                  </p>
                </div>
              </article>

              <div className="grid grid-cols-2 gap-4">
                <article className="rounded-[24px] bg-card border border-border shadow-card p-5 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Copy className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-3 text-sm font-extrabold text-foreground">কপি করুন</p>
                </article>
                <article className="rounded-[24px] bg-donate-red shadow-card p-5 text-center text-primary-foreground">
                  <div className="mx-auto h-12 w-12 rounded-full bg-card flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-donate-red" />
                  </div>
                  <p className="mt-3 text-sm font-extrabold">দান করুন</p>
                </article>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 italic max-w-xl mx-auto">
          {t("channels.quote")}
        </p>
      </div>
    </section>
  );
};
