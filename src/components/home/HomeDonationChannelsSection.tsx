import { ArrowRight, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePaymentsData } from "@/hooks/usePaymentsData";

export const HomeDonationChannelsSection = () => {
  const { t } = useTranslation();
  const payments = usePaymentsData();

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
          <span className="inline-flex items-center gap-2 rounded-full border border-donate-highlight/30 bg-donate-highlight/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-donate-highlight">
            <QrCode className="h-3.5 w-3.5" /> Bangla QR
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-primary-foreground leading-tight">
            স্ক্যান করে সহজেই দান করুন
          </h2>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-primary-foreground/75 md:px-8">
            যেকোনো মোবাইল ব্যাংকিং বা ব্যাংক অ্যাপ থেকে নিচের QR কোডটি স্ক্যান করুন — মুহূর্তেই আপনার দান পৌঁছে যাবে ইনশাআল্লাহ।
          </p>
        </div>

        {/* Bangla QR only */}
        <div className="mx-auto max-w-md">
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

            <div className="relative mt-8 mx-auto w-56 rounded-2xl bg-card p-3 border border-donate-highlight/20">
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

            {/* Smart CTA to full donate page */}
            <div className="relative mt-6 flex justify-center">
              <Link
                to="/donate"
                className="group inline-flex items-center gap-2 rounded-full bg-donate-highlight px-5 py-2.5 text-sm font-bold text-[hsl(152_65%_8%)] shadow-lg shadow-donate-highlight/20 transition-all hover:shadow-donate-highlight/40 hover:-translate-y-0.5"
              >
                সব দানের মাধ্যম দেখুন
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </article>
        </div>

        <p className="text-center text-xs text-primary-foreground/60 mt-10 italic max-w-xl mx-auto">
          {t("channels.quote")}
        </p>
      </div>
    </section>
  );
};
