import { Link } from "react-router-dom";
import { Facebook, Youtube, Mail, Phone, MapPin, Heart, Tv } from "lucide-react";
import { useTranslation } from "react-i18next";
import { site } from "@/data/site";
import logo from "@/assets/logo-white.svg";
import footerBg from "@/assets/footer-bg.svg";

export const Footer = () => {
  const { t } = useTranslation();
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
                আজই হোক একটি ভালো কাজের শুরু
              </h3>
              <p className="mt-2 text-white/70 max-w-xl">
                আপনার ছোট্ট দান কারো জীবনে বড় পরিবর্তন আনতে পারে — ইনশাআল্লাহ।
              </p>
            </div>
            <Link to="/donate" className="btn-donate text-base whitespace-nowrap">
              <Heart className="h-5 w-5" /> দান করুন
            </Link>
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
              সুন্নাহর অনুসরণে, মানবতার কল্যাণে। পবিত্র কুরআন ও সহীহ হাদীছের আলোকে
              পরিচালিত একটি অরাজনৈতিক ইসলামিক প্ল্যাটফর্ম।
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <a href={site.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 ring-1 ring-white/5 transition-colors"><Facebook className="h-4 w-4 text-white" /></a>
              <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 ring-1 ring-white/5 transition-colors"><Youtube className="h-4 w-4 text-white" /></a>
              <a href={site.socials.tvFacebook} target="_blank" rel="noopener noreferrer" aria-label="Unite TV Facebook" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 ring-1 ring-white/5 transition-colors"><Tv className="h-4 w-4 text-white" /></a>
              <a href={site.socials.tvYoutube} target="_blank" rel="noopener noreferrer" aria-label="Unite TV YouTube" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 ring-1 ring-white/5 transition-colors"><Youtube className="h-4 w-4 text-white" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li><Link to="/" className="hover:text-white transition-colors">হোম</Link></li>
              <li><Link to="/projects" className="hover:text-white transition-colors">কার্যক্রম</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">আমাদের সম্পর্কে</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">ব্লগ</Link></li>
              <li><Link to="/donate" className="hover:text-white transition-colors">দান করুন</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">আমাদের প্রকল্প</h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li><Link to="/projects/madrasa-project" className="hover:text-white transition-colors">মাদরাসা ও মসজিদ</Link></li>
              <li><Link to="/projects/yatim-project" className="hover:text-white transition-colors">ইয়াতিম স্পনসরশিপ</Link></li>
              <li><Link to="/projects/palestine-food" className="hover:text-white transition-colors">ফিলিস্তিন খাদ্য</Link></li>
              <li><Link to="/projects/qarz-e-hasanah" className="hover:text-white transition-colors">কর্জ-এ-হাসানাহ</Link></li>
              <li><Link to="/projects/unite-tv" className="hover:text-white transition-colors">ইউনাইট টিভি</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-white mb-4">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-donate-highlight" /> <span>{site.address}</span></li>
              <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-donate-highlight" /> <a href={`tel:${site.phone}`} className="hover:text-white transition-colors" dir="ltr">{site.phone}</a></li>
              <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-donate-highlight" /> <a href={`mailto:${site.email}`} className="hover:text-white transition-colors">{site.email}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-page py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
            <div>© {new Date().getFullYear()} {site.nameEn}. সর্বস্বত্ব সংরক্ষিত।</div>
            <a
              href="https://wa.me/message/IKFP3JMMZ66MJ1"
              target="_blank"
              rel="noopener noreferrer"
              className="font-en hover:text-white transition-colors"
            >
              Designed & Developed by Salauddin Ahmad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
