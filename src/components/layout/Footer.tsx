import { Link } from "react-router-dom";
import { Facebook, Youtube, Mail, Phone, MapPin, Heart, Tv, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { site } from "@/data/site";
import logo from "@/assets/logo-white.svg";
import footerBg from "@/assets/footer-bg.svg";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error("সঠিক ইমেইল ঠিকানা দিন");
      return;
    }
    setState("sending");
    try {
      await api.post("/newsletter/subscribe", { email: v, source: "footer" });
      setState("done");
      setEmail("");
      toast.success("সাবস্ক্রিপশন সফল — ইনবক্স চেক করুন ✅");
    } catch (err: unknown) {
      const anyE = err as { data?: { message?: string }; message?: string };
      toast.error(anyE?.data?.message || anyE?.message || "সাবস্ক্রাইব করা যায়নি");
      setState("idle");
    }
  };

  return (
    <footer className="relative bg-footer text-footer-foreground overflow-hidden">
      {/* Decorative SVG background */}
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none bg-no-repeat bg-cover bg-center mix-blend-screen"
        style={{ backgroundImage: `url(${footerBg})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-footer/40 via-footer/70 to-footer pointer-events-none" aria-hidden />

      <div className="relative">
        {/* Pre-footer CTA strip */}
        <div className="border-b border-white/10">
          <div className="container-page py-10 md:py-14 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                {t("footer.ctaTitle")}
              </h3>
              <p className="mt-2 text-white/70 max-w-xl">
                {t("footer.ctaSubtitle")}
              </p>
            </div>
            <Link to="/donate" className="btn-donate text-base whitespace-nowrap">
              <Heart className="h-5 w-5" /> {t("common.donate")}
            </Link>
          </div>
        </div>

        {/* Newsletter strip */}
        <div className="border-b border-white/10">
          <div className="container-page py-8 grid gap-6 md:grid-cols-[1fr_auto] items-center">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-donate-highlight" /> নিউজলেটার সাবস্ক্রাইব করুন
              </h4>
              <p className="mt-1.5 text-sm text-white/70 max-w-xl">
                আমাদের সাম্প্রতিক কাজ, প্রকল্প ও দাওয়াতি কার্যক্রমের আপডেট সরাসরি আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।
              </p>
            </div>
            <form onSubmit={subscribe} className="flex w-full md:w-auto items-stretch gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === "sending" || state === "done"}
                placeholder="আপনার ইমেইল ঠিকানা"
                className="flex-1 md:w-72 px-4 py-2.5 rounded-lg bg-white/10 text-white placeholder:text-white/50 text-sm ring-1 ring-white/15 focus:ring-2 focus:ring-donate-highlight focus:bg-white/15 focus:outline-none disabled:opacity-60"
                dir="ltr"
              />
              <button
                type="submit"
                disabled={state === "sending" || state === "done"}
                className="inline-flex items-center gap-2 bg-donate-highlight text-black font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-donate-highlight/90 transition-colors disabled:opacity-70 whitespace-nowrap"
              >
                {state === "sending" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> পাঠানো হচ্ছে…</>
                ) : state === "done" ? (
                  <><CheckCircle2 className="h-4 w-4" /> সফল</>
                ) : (
                  <><Send className="h-4 w-4" /> সাবস্ক্রাইব</>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="container-page py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src={logo}
                alt={site.nameEn}
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm text-white/80 leading-relaxed">
              {t("footer.about")}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <a href={site.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 ring-1 ring-white/5 transition-colors"><Facebook className="h-4 w-4 text-white" /></a>
              <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 ring-1 ring-white/5 transition-colors"><Youtube className="h-4 w-4 text-white" /></a>
              <a href={site.socials.tvFacebook} target="_blank" rel="noopener noreferrer" aria-label="Unite TV Facebook" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 ring-1 ring-white/5 transition-colors"><Tv className="h-4 w-4 text-white" /></a>
              <a href={site.socials.tvYoutube} target="_blank" rel="noopener noreferrer" aria-label="Unite TV YouTube" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 ring-1 ring-white/5 transition-colors"><Youtube className="h-4 w-4 text-white" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li><Link to="/" className="hover:text-white transition-colors">{t("nav.home")}</Link></li>
              <li><Link to="/projects" className="hover:text-white transition-colors">{t("nav.projects")}</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">{t("nav.about")}</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">{t("nav.blog")}</Link></li>
              <li><Link to="/donate" className="hover:text-white transition-colors">{t("nav.donate")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">নীতিমালা</h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">প্রাইভেসি পলিসি</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-white transition-colors">টার্মস অ্যান্ড কন্ডিশনস</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">রিফান্ড পলিসি</Link></li>
            </ul>
          </div>

          <div>

            <h4 className="font-semibold text-white mb-4">{t("footer.contact")}</h4>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-donate-highlight" /> <span>{site.address}</span></li>
              <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-donate-highlight" /> <a href={`tel:${site.phone}`} className="hover:text-white transition-colors" dir="ltr">{site.phone}</a></li>
              <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-donate-highlight" /> <a href={`mailto:${site.email}`} className="hover:text-white transition-colors">{site.email}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/20">
          <div className="container-page py-6 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-donate-highlight/15 ring-1 ring-donate-highlight/30">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-donate-highlight" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white tracking-wide">নিরাপদ ও এনক্রিপ্টেড পেমেন্ট</div>
                <div className="text-xs text-white/60 mt-0.5">SSL-সুরক্ষিত · PCI-DSS কমপ্লায়েন্ট গেটওয়ে</div>
              </div>
            </div>
            <div className="bg-white rounded-md p-2 inline-block shadow-sm">
              <img
                src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-01.png"
                alt="Pay with SSLCommerz — Visa, MasterCard, bKash, Nagad, Rocket, Internet Banking"
                loading="lazy"
                className="h-10 md:h-12 w-auto"
              />
            </div>
          </div>
        </div>


        <div className="border-t border-white/10">
          <div className="container-page py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/60 text-center">
            <div>© {new Date().getFullYear()} {site.nameEn}. {t("footer.rights")}</div>
            <div>
              Design &amp; Developed by{" "}
              <a
                href="https://wa.me/message/IKFP3JMMZ66MJ1"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white/90 hover:text-white transition-colors"
              >
                Salauddin Ahmad
              </a>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};
