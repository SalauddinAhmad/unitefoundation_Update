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

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t("common.copied"), description: t("common.copiedDesc", { label }) });
  };

  const primaryBank = site.payments.banks[0];

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

        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bank */}
          <article className="rounded-[24px] bg-card border border-border shadow-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-donate-orange">
                  ব্যাংক ট্রান্সফার
                </p>
                <h3 className="mt-1 text-xl font-extrabold text-foreground">
                  {primaryBank.bank}
                </h3>
              </div>
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-xs font-semibold text-primary">{primaryBank.account}</p>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-secondary/80 border border-border/60 px-3 py-2.5">
              <p className="font-mono text-sm font-extrabold text-foreground tracking-wide" dir="ltr">
                {formatAccount(primaryBank.number)}
              </p>
              <button
                onClick={() => copy(primaryBank.number, t("channels.toast.accountNumber"))}
                aria-label={t("channels.copyAccount")}
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              শাখা: {primaryBank.branch}
            </p>
          </article>

          {/* Mobile */}
          <article className="rounded-[24px] bg-card border border-border shadow-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-donate-orange">
                  মোবাইল ব্যাংকিং
                </p>
                <h3 className="mt-1 text-xl font-extrabold text-foreground">
                  {t("channels.personalAccount")}
                </h3>
              </div>
              <div className="h-11 w-11 rounded-full bg-donate-red/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-donate-red" />
              </div>
            </div>
            <div className="space-y-2.5">
              {mobileNumbers.map((m, i) => (
                <div key={m.brand} className="flex items-center justify-between gap-2 rounded-xl bg-secondary/80 border border-border/60 px-3 py-2.5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {m.brand} · পার্সোনাল
                    </p>
                    <p className="font-mono text-sm font-extrabold text-foreground tracking-wide" dir="ltr">
                      {m.number}
                    </p>
                  </div>
                  <button
                    onClick={() => copy(m.number, t("channels.toast.mobileNumber"))}
                    aria-label={t("channels.copyMobile")}
                    className={`h-8 w-8 rounded-full text-primary-foreground flex items-center justify-center ${
                      i === 0 ? "bg-donate-red" : i === 1 ? "bg-donate-orange" : "bg-primary"
                    }`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </article>

          {/* QR */}
          <article className="rounded-[24px] bg-card border border-border shadow-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover text-center">
            <div className="flex items-center justify-between mb-4">
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-donate-orange">
                  Bangla QR
                </p>
                <h3 className="mt-1 text-xl font-extrabold text-foreground">
                  {t("channels.scanToDonate")}
                </h3>
              </div>
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mx-auto w-40 rounded-2xl bg-secondary p-2 border border-border">
              <div className="aspect-square rounded-xl bg-card flex items-center justify-center overflow-hidden">
                {site.payments.qrImage ? (
                  <img src={site.payments.qrImage} alt="Bangla QR" className="h-full w-full object-contain" loading="lazy" />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-1 border-2 border-dashed border-primary/25 rounded-xl p-2">
                    <QrCode className="h-8 w-8 text-primary/45" strokeWidth={1.4} />
                    <p className="text-[10px] font-semibold text-primary/70">{t("channels.qrPending")}</p>
                  </div>
                )}
              </div>
            </div>
            <p className="mt-3 text-[11px] font-semibold text-donate-orange">
              {t("channels.anyAppNote")}
            </p>
          </article>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 italic max-w-xl mx-auto">
          {t("channels.quote")}
        </p>
      </div>
    </section>
  );
};
