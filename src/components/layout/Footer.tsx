import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Heart } from "lucide-react";
import { site } from "@/data/site";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="bg-footer text-footer-foreground">
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
            <Heart className="h-5 w-5" /> এখনই দান করুন
          </Link>
        </div>
      </div>

      <div className="container-page py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="" width={40} height={40} className="h-10 w-10" />
            <div>
              <div className="font-bold text-white">{site.name}</div>
              <div className="font-en text-[10px] uppercase tracking-[0.18em] text-white/60">
                {site.nameEn}
              </div>
            </div>
          </Link>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            স্বচ্ছতা, আস্থা ও মানবতার সেবায় নিবেদিত একটি অরাজনৈতিক ইসলামিক চ্যারিটি প্ল্যাটফর্ম।
          </p>
          <div className="flex gap-3 mt-5">
            <a href={site.socials.facebook} aria-label="Facebook" className="p-2 rounded-btn bg-white/5 hover:bg-white/10 transition-colors"><Facebook className="h-4 w-4" /></a>
            <a href={site.socials.youtube} aria-label="YouTube" className="p-2 rounded-btn bg-white/5 hover:bg-white/10 transition-colors"><Youtube className="h-4 w-4" /></a>
            <a href={site.socials.instagram} aria-label="Instagram" className="p-2 rounded-btn bg-white/5 hover:bg-white/10 transition-colors"><Instagram className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">দ্রুত লিংক</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><Link to="/" className="hover:text-white transition-colors">হোম</Link></li>
            <li><Link to="/projects" className="hover:text-white transition-colors">প্রকল্পসমূহ</Link></li>
            <li><Link to="/blog" className="hover:text-white transition-colors">ব্লগ</Link></li>
            <li><Link to="/donate" className="hover:text-white transition-colors">দান করুন</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">প্রকল্প বিভাগ</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><Link to="/projects" className="hover:text-white transition-colors">খাদ্য সহায়তা</Link></li>
            <li><Link to="/projects" className="hover:text-white transition-colors">এতিম স্পনসরশিপ</Link></li>
            <li><Link to="/projects" className="hover:text-white transition-colors">গভীর নলকূপ</Link></li>
            <li><Link to="/projects" className="hover:text-white transition-colors">শিক্ষা বৃত্তি</Link></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h4 className="font-semibold text-white mb-4">যোগাযোগ</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-donate-highlight" /> <span>{site.address}</span></li>
            <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-donate-highlight" /> <span dir="ltr">{site.phone}</span></li>
            <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-donate-highlight" /> <a href={`mailto:${site.email}`} className="hover:text-white transition-colors">{site.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <div>© {new Date().getFullYear()} {site.nameEn}. সর্বস্বত্ব সংরক্ষিত।</div>
          <div className="font-en">Built with care · Trust · Transparency</div>
        </div>
      </div>
    </footer>
  );
};
