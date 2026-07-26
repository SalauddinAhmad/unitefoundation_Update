import { Copy, CreditCard, QrCode, Smartphone, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";
import { usePaymentsData } from "@/hooks/usePaymentsData";

const formatAccount = (n: string) => n.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

export const DonationChannelsSection = () => {
  const { t } = useTranslation();
  const payments = usePaymentsData();

  const mobileNumbers = [
    { brand: "bKash", number: payments.mobiles.bkash },
    { brand: "Nagad", number: payments.mobiles.nagad },
    { brand: "Rocket", number: payments.mobiles.rocket },
  ];

  const bankCards = payments.banks.map((b) => ({
    title: b.bank,
    accountName: b.account,
    accountNumber: b.number,
    branch: b.branch,
    routing: b.routing,
    swift: b.swift,
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
            <article
              className="group relative flex flex-col rounded-[28px] border border-primary/15 shadow-2xl p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              style={{
                background: "linear-gradient(155deg, hsl(152 45% 92%) 0%, hsl(152 55% 85%) 100%)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, hsl(152 100% 25% / 0.35), transparent 70%)" }}
              />
              <div className="relative flex items-center justify-between gap-4 mb-6">
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

              <div className="relative flex-1 flex flex-col gap-5">
                {bankCards.map((bank) => (
                  <div
                    key={bank.title}
                    className="relative rounded-2xl bg-card/70 backdrop-blur-sm border border-primary/15 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-lg font-extrabold text-foreground leading-snug">
                          {bank.title}
                        </h4>
                        <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                          {bank.branch}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                        Verified
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl bg-primary/5 border border-primary/10 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        Account Name
                      </p>
                      <p className="mt-0.5 text-sm font-extrabold text-primary">
                        {bank.accountName}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                        Account Number
                      </p>
                      <div className="flex items-center justify-between gap-2 rounded-2xl bg-secondary border border-border px-3.5 py-3">
                        <p className="font-mono text-base font-extrabold text-foreground tracking-wider" dir="ltr">
                          {formatAccount(bank.accountNumber)}
                        </p>
                        <button
                          onClick={() => copy(bank.accountNumber, t("channels.toast.accountNumber"))}
                          aria-label={t("channels.copyAccount")}
                          className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-colors hover:bg-primary/90 shadow-md"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {(bank.routing || bank.swift) && (
                      <div className="mt-3 grid grid-cols-2 gap-2" dir="ltr">
                        {bank.routing && (
                          <div className="rounded-lg bg-secondary/60 border border-border/60 px-2.5 py-1.5">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Routing</p>
                            <p className="text-[11px] font-mono font-bold text-foreground">{bank.routing}</p>
                          </div>
                        )}
                        {bank.swift && (
                          <div className="rounded-lg bg-secondary/60 border border-border/60 px-2.5 py-1.5">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">SWIFT</p>
                            <p className="text-[11px] font-mono font-bold text-foreground">{bank.swift}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </article>

            {/* QR */}
            <article
              className="group relative flex flex-col rounded-[28px] overflow-hidden border border-donate-highlight/30 shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "linear-gradient(160deg, hsl(152 100% 20%) 0%, hsl(152 100% 12%) 100%)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "radial-gradient(hsl(var(--donate-highlight)) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
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
                      {payments.qrImage ? (
                        <img
                          src={payments.qrImage}
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
            <article
              className="group relative flex flex-col rounded-[28px] border border-donate-orange/25 shadow-2xl p-6 md:p-7 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "linear-gradient(155deg, hsl(35 85% 93%) 0%, hsl(28 80% 86%) 100%)",
              }}
            >
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

        {/* India donors */}
        <div className="mx-auto max-w-6xl mt-8 md:mt-10">
          <article
            className="group relative rounded-[28px] border border-white/10 shadow-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, hsl(152 55% 14%) 0%, hsl(152 60% 10%) 60%, hsl(28 60% 14%) 100%)",
            }}
          >
            {/* India flag ribbon */}
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 flex">
              <span className="flex-1" style={{ background: "#FF9933" }} />
              <span className="flex-1 bg-white" />
              <span className="flex-1" style={{ background: "#138808" }} />
            </div>

            {/* Ashoka chakra watermark */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -bottom-20 opacity-[0.07]"
            >
              <svg width="320" height="320" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="0.6">
                <circle cx="50" cy="50" r="42" />
                <circle cx="50" cy="50" r="6" fill="white" stroke="none" />
                {Array.from({ length: 24 }).map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={50 + 42 * Math.cos((i * Math.PI) / 12)}
                    y2={50 + 42 * Math.sin((i * Math.PI) / 12)}
                  />
                ))}
              </svg>
            </div>

            {/* Glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-40"
              style={{ background: "hsl(var(--donate-highlight) / 0.5)" }}
            />

            <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8 p-6 md:p-8 lg:p-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-donate-highlight/40 bg-donate-highlight/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-donate-highlight"
                  >
                    <span className="text-sm leading-none" aria-hidden>🇮🇳</span>
                    India Donors
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-primary-foreground/70">
                    Google Pay · PhonePe · QR
                  </span>
                </div>

                <h3 className="mt-4 text-xl md:text-2xl lg:text-[26px] font-extrabold text-primary-foreground leading-snug">
                  ইন্ডিয়া থেকে দান করতে আগ্রহী দ্বীনি ভাই ও বোন
                </h3>
                <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-primary-foreground/75 max-w-2xl">
                  আপনারা হোয়াটসঅ্যাপে এসএমএস (SMS) করলে <span className="font-semibold text-primary-foreground">Google Pay / PhonePe</span> বা <span className="font-semibold text-primary-foreground">QR কোড</span> পাঠানো হবে। আপনার সুবিধামতো অপশন ব্যবহার করে দান করতে পারেন, ইনশাআল্লাহ।
                </p>
              </div>

              <div className="shrink-0 w-full lg:w-auto flex flex-col items-stretch lg:items-end gap-2.5">
                <a
                  href="https://wa.me/8801759754265"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn relative inline-flex items-center justify-center gap-3 rounded-2xl px-6 py-4 font-extrabold text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] hover:shadow-[0_14px_36px_-8px_rgba(37,211,102,0.8)] hover:-translate-y-0.5 active:translate-y-0 transition-all overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                    style={{ background: "linear-gradient(135deg, #2fdd72 0%, #159a8b 100%)" }}
                  />
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span className="relative flex flex-col items-start leading-tight">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">WhatsApp SMS</span>
                    <span className="text-base font-extrabold tracking-wide" dir="ltr">+88 017 5975 4265</span>
                  </span>
                </a>
                <p className="text-center lg:text-right text-[11px] text-primary-foreground/60">
                  ট্যাপ করলেই হোয়াটসঅ্যাপ চ্যাট খুলবে
                </p>
              </div>
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
