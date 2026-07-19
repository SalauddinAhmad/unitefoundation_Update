import { ArrowRight, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePaymentsData } from "@/hooks/usePaymentsData";

export const HomeDonationChannelsSection = () => {
  const { t } = useTranslation();
  const payments = usePaymentsData();

  const cardBg =
    "linear-gradient(160deg, #006B39 0%, #004d29 100%)";

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundColor: "#006B39",
          WebkitMaskImage: `url('/background-overlay-3.svg')`,
          maskImage: `url('/background-overlay-3.svg')`,
          WebkitMaskSize: "cover",
          maskSize: "cover",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      />

      <div className="container-page relative">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
            <QrCode className="h-3.5 w-3.5" /> Bangla QR
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            স্ক্যান করে সহজেই দান করুন
          </h2>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-muted-foreground md:px-8">
            যেকোনো মোবাইল ব্যাংকিং বা ব্যাংক অ্যাপ থেকে নিচের QR কোডটি স্ক্যান করুন — মুহূর্তেই আপনার দান পৌঁছে যাবে ইনশাআল্লাহ।
          </p>
        </div>

        {/* Bangla QR only */}
        <div className="mx-auto max-w-md">
          <article
            className="relative overflow-hidden rounded-[28px] shadow-[0_20px_60px_-20px_hsl(152_60%_20%/0.35)] p-6 md:p-8 text-white"
            style={{ background: cardBg }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08]"
            >
              <QrCode className="h-48 w-48 text-white" strokeWidth={1} />
            </div>

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
                  Bangla QR
                </p>
                <h3 className="mt-2 text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {t("channels.scanToDonate")}
                </h3>
              </div>
              <div
                className="h-11 w-11 shrink-0 rounded-lg bg-white flex items-center justify-center border-2"
                style={{ borderColor: "#006B39" }}
              >
                <QrCode className="h-5 w-5" strokeWidth={2.4} style={{ color: "#006B39" }} />
              </div>
            </div>

            <div className="relative mt-8 mx-auto w-56 rounded-2xl bg-white p-3 shadow-sm">
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

            <p className="relative mt-5 text-center text-xs font-semibold text-white">
              {t("channels.anyAppNote")}
            </p>
            <p className="relative mt-2 text-center text-xs text-white/80 leading-relaxed">
              {t("channels.qrHint")}
            </p>


            {/* Smart CTA to full donate page */}
            <div className="relative mt-7 flex justify-center">
              <Link
                to="/donate"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-donate-highlight via-donate-orange to-donate-highlight bg-[length:200%_100%] px-6 py-3 text-sm font-extrabold text-[hsl(152_65%_8%)] shadow-[0_10px_30px_-8px_hsl(var(--donate-highlight)/0.6)] transition-all duration-500 hover:bg-[position:100%_0] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-8px_hsl(var(--donate-highlight)/0.75)]"
              >
                <span className="relative z-10">সব দানের মাধ্যম দেখুন</span>
                <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(152_65%_8%)] text-donate-highlight transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.8} />
                </span>
              </Link>
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
