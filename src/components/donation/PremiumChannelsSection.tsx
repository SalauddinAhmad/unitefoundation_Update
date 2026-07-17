import { Copy, CreditCard, QrCode, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";
import { usePaymentsData } from "@/hooks/usePaymentsData";

/**
 * Premium editorial donation channels — deep emerald + cream, gold hairlines,
 * Islamic geometric ornament. Used only on /donate.
 */

const CREAM = "#F5F0E0";
const CREAM_SOFT = "#FBF7EA";
const EMERALD_DEEP = "#0A2417";
const EMERALD = "#0F3D24";
const GOLD = "#C9A84C";

const formatAccount = (n: string) => n.replace(/(\d{4})(?=\d)/g, "$1 ").trim();


// Small SVG ornament — 8-point Islamic star inside a circle
const Ornament = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
  >
    <circle cx="32" cy="32" r="28" />
    <path d="M32 4l6 22 22 6-22 6-6 22-6-22-22-6 22-6z" />
    <path d="M12 12l40 40M52 12L12 52" opacity="0.4" />
  </svg>
);

export const PremiumChannelsSection = () => {
  const { t } = useTranslation();
  const payments = usePaymentsData();

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t("common.copied"), description: t("common.copiedDesc", { label }) });
  };

  const banks = payments.banks;
  const mobileBrands = [
    { brand: "bKash", number: payments.mobiles.bkash },
    { brand: "Nagad", number: payments.mobiles.nagad },
    { brand: "Rocket", number: payments.mobiles.rocket },
  ];


  return (
    <section
      className="relative overflow-hidden isolate py-20 md:py-28"
      style={{ backgroundColor: CREAM }}
    >
      {/* Islamic geometric pattern — very subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='%230A2417' stroke-width='0.8'><path d='M60 6l16 16 22 6-16 16 6 22-22-6-16 16-16-16-22 6 6-22-16-16 22-6z'/><circle cx='60' cy='60' r='14'/><circle cx='60' cy='60' r='28'/></g></svg>")`,
          backgroundSize: "160px 160px",
        }}
      />

      {/* Top hairline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}66, transparent)` }}
      />

      <div className="container-page relative">
        {/* Editorial header */}
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div
            className="inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.32em] uppercase mb-6"
            style={{ color: GOLD }}
          >
            <span className="h-px w-8" style={{ background: GOLD }} />
            {t("channels.badge") || "সহযোগিতার মাধ্যম"}
            <span className="h-px w-8" style={{ background: GOLD }} />
          </div>

          <h2
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
            style={{ color: EMERALD_DEEP }}
          >
            {t("channels.heading")}
          </h2>

          <div className="flex justify-center my-6" style={{ color: GOLD }}>
            <Ornament className="h-8 w-8" />
          </div>

          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: `${EMERALD_DEEP}B3` }}
          >
            {t("channels.subtitle")}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mt-14 md:mt-20">
          {banks.map((b, idx) => (
            <article
              key={idx}
              className="group relative rounded-2xl p-7 md:p-8 transition-all duration-500 hover:-translate-y-1"
              style={{
                backgroundColor: CREAM_SOFT,
                border: `1px solid ${EMERALD_DEEP}1A`,
                boxShadow: `0 1px 0 ${GOLD}33, 0 20px 40px -30px ${EMERALD_DEEP}66`,
              }}
            >
              {/* Corner ornaments */}
              <span
                className="pointer-events-none absolute top-3 left-3 h-4 w-4 border-t border-l"
                style={{ borderColor: `${GOLD}99` }}
              />
              <span
                className="pointer-events-none absolute top-3 right-3 h-4 w-4 border-t border-r"
                style={{ borderColor: `${GOLD}99` }}
              />
              <span
                className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l"
                style={{ borderColor: `${GOLD}99` }}
              />
              <span
                className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r"
                style={{ borderColor: `${GOLD}99` }}
              />

              <div className="flex items-start justify-between mb-5">
                <div
                  className="text-[10px] font-bold tracking-[0.24em] uppercase"
                  style={{ color: GOLD }}
                >
                  Bank · 0{idx + 1}
                </div>
                <CreditCard className="h-4 w-4" style={{ color: `${EMERALD}99` }} />
              </div>

              <h3
                className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight"
                style={{ color: EMERALD_DEEP }}
              >
                {b.bank}
              </h3>
              <div className="text-xs mt-1 font-medium" style={{ color: `${EMERALD}CC` }}>
                {t("channels.generalFund")}
              </div>

              <div
                className="my-5 h-px w-full"
                style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
              />

              <div className="space-y-4">
                <div>
                  <div
                    className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1"
                    style={{ color: `${EMERALD_DEEP}80` }}
                  >
                    {t("channels.labels.accountName")}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: EMERALD_DEEP }}>
                    {b.account}
                  </div>
                </div>

                <div>
                  <div
                    className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5"
                    style={{ color: `${EMERALD_DEEP}80` }}
                  >
                    {t("channels.labels.accountNumber")}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="font-mono font-bold text-lg tracking-wide"
                      style={{ color: EMERALD_DEEP }}
                      dir="ltr"
                    >
                      {formatAccount(b.number)}
                    </div>
                    <button
                      onClick={() => copy(b.number, t("channels.toast.accountNumber"))}
                      aria-label={t("channels.copyAccount")}
                      className="shrink-0 h-8 w-8 rounded-md flex items-center justify-center transition-colors"
                      style={{
                        border: `1px solid ${EMERALD_DEEP}22`,
                        color: EMERALD,
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}22`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div
                      className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1"
                      style={{ color: `${EMERALD_DEEP}80` }}
                    >
                      {t("channels.labels.branch")}
                    </div>
                    <div className="text-xs font-medium" style={{ color: EMERALD_DEEP }}>
                      {b.branch}
                    </div>
                  </div>
                  {b.routing ? (
                    <div>
                      <div
                        className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1"
                        style={{ color: `${EMERALD_DEEP}80` }}
                      >
                        {t("channels.labels.routing")}
                      </div>
                      <div
                        className="text-xs font-mono font-medium"
                        style={{ color: EMERALD_DEEP }}
                        dir="ltr"
                      >
                        {b.routing}
                      </div>
                    </div>
                  ) : null}
                  {b.swift ? (
                    <div>
                      <div
                        className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1"
                        style={{ color: `${EMERALD_DEEP}80` }}
                      >
                        {t("channels.labels.swift")}
                      </div>
                      <div
                        className="text-xs font-mono font-medium"
                        style={{ color: EMERALD_DEEP }}
                        dir="ltr"
                      >
                        {b.swift}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}

          {/* Mobile banking card */}
          <article
            className="group relative rounded-2xl p-7 md:p-8 transition-all duration-500 hover:-translate-y-1"
            style={{
              backgroundColor: EMERALD_DEEP,
              border: `1px solid ${GOLD}55`,
              boxShadow: `0 1px 0 ${GOLD}44, 0 20px 40px -30px ${EMERALD_DEEP}CC`,
            }}
          >
            <span
              className="pointer-events-none absolute top-3 left-3 h-4 w-4 border-t border-l"
              style={{ borderColor: `${GOLD}` }}
            />
            <span
              className="pointer-events-none absolute top-3 right-3 h-4 w-4 border-t border-r"
              style={{ borderColor: `${GOLD}` }}
            />
            <span
              className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l"
              style={{ borderColor: `${GOLD}` }}
            />
            <span
              className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r"
              style={{ borderColor: `${GOLD}` }}
            />

            <div className="flex items-start justify-between mb-5">
              <div
                className="text-[10px] font-bold tracking-[0.24em] uppercase"
                style={{ color: GOLD }}
              >
                Mobile Banking
              </div>
              <Smartphone className="h-4 w-4" style={{ color: `${GOLD}CC` }} />
            </div>

            <h3
              className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight"
              style={{ color: CREAM }}
            >
              Personal Number
            </h3>
            <div className="text-xs mt-1 font-medium" style={{ color: `${GOLD}` }}>
              {t("channels.personalAccount")}
            </div>

            <div
              className="my-5 h-px w-full"
              style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
            />

            <div>
              <div
                className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1"
                style={{ color: `${CREAM}99` }}
              >
                {t("channels.labels.accountName")}
              </div>
              <div className="text-sm font-semibold" style={{ color: CREAM }}>
                {payments.primaryBank.account}
              </div>
            </div>

            <div className="mt-4">
              <div
                className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5"
                style={{ color: `${CREAM}99` }}
              >
                {t("channels.labels.mobileNumber")}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div
                  className="font-mono font-bold text-lg tracking-wide"
                  style={{ color: CREAM }}
                  dir="ltr"
                >
                  {payments.mobiles.bkash}
                </div>
                <button
                  onClick={() => copy(payments.mobiles.bkash, t("channels.toast.mobileNumber"))}
                  aria-label={t("channels.copyMobile")}
                  className="shrink-0 h-8 w-8 rounded-md flex items-center justify-center transition-colors"
                  style={{
                    border: `1px solid ${GOLD}66`,
                    color: GOLD,
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}22`)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5">
              {mobileBrands.map((m) => (
                <span
                  key={m.brand}
                  className="text-center px-2 py-1.5 rounded text-[10px] font-semibold tracking-wide"
                  style={{
                    color: CREAM,
                    border: `1px solid ${GOLD}44`,
                    backgroundColor: `${GOLD}0F`,
                  }}
                >
                  {m.brand}
                </span>
              ))}
            </div>
          </article>

          {/* QR card */}
          <article
            className="group relative rounded-2xl p-7 md:p-8 transition-all duration-500 hover:-translate-y-1"
            style={{
              backgroundColor: CREAM_SOFT,
              border: `1px solid ${EMERALD_DEEP}1A`,
              boxShadow: `0 1px 0 ${GOLD}33, 0 20px 40px -30px ${EMERALD_DEEP}66`,
            }}
          >
            <span
              className="pointer-events-none absolute top-3 left-3 h-4 w-4 border-t border-l"
              style={{ borderColor: `${GOLD}99` }}
            />
            <span
              className="pointer-events-none absolute top-3 right-3 h-4 w-4 border-t border-r"
              style={{ borderColor: `${GOLD}99` }}
            />
            <span
              className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l"
              style={{ borderColor: `${GOLD}99` }}
            />
            <span
              className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r"
              style={{ borderColor: `${GOLD}99` }}
            />

            <div className="flex items-start justify-between mb-5">
              <div
                className="text-[10px] font-bold tracking-[0.24em] uppercase"
                style={{ color: GOLD }}
              >
                Bangla QR
              </div>
              <QrCode className="h-4 w-4" style={{ color: `${EMERALD}99` }} />
            </div>

            <h3
              className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight"
              style={{ color: EMERALD_DEEP }}
            >
              {t("channels.scanToDonate")}
            </h3>
            <div className="text-xs mt-1 font-medium" style={{ color: `${EMERALD}CC` }}>
              {t("channels.anyAppNote")}
            </div>

            <div
              className="my-5 h-px w-full"
              style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
            />

            <div
              className="rounded-xl p-3 flex items-center justify-center aspect-square"
              style={{
                backgroundColor: "#fff",
                border: `1px solid ${EMERALD_DEEP}1A`,
              }}
            >
              {payments.qrImage ? (
                <img
                  src={payments.qrImage}
                  alt="Unite Foundation Bangla QR"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center text-center gap-2 rounded-lg"
                  style={{ border: `2px dashed ${EMERALD_DEEP}22` }}
                >
                  <QrCode
                    className="h-12 w-12"
                    strokeWidth={1.2}
                    style={{ color: `${EMERALD}66` }}
                  />
                  <div
                    className="text-xs font-semibold px-3"
                    style={{ color: `${EMERALD_DEEP}99` }}
                  >
                    {t("channels.qrPending")}
                  </div>
                </div>
              )}
            </div>

            <p
              className="text-center text-[11px] mt-3 leading-relaxed"
              style={{ color: `${EMERALD_DEEP}88` }}
            >
              {t("channels.qrHint")}
            </p>
          </article>
        </div>

        {/* Closing quote */}
        <div className="mt-16 md:mt-20 flex flex-col items-center text-center">
          <div style={{ color: GOLD }}>
            <Ornament className="h-6 w-6" />
          </div>
          <p
            className="mt-4 italic max-w-xl text-sm md:text-base leading-relaxed"
            style={{ color: `${EMERALD_DEEP}B3` }}
          >
            {t("channels.quote")}
          </p>
        </div>
      </div>

      {/* Bottom hairline */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}66, transparent)` }}
      />
    </section>
  );
};
