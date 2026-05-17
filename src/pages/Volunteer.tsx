import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HandHeart,
  HeartHandshake,
  Users,
  Briefcase,
  Repeat,
  Send,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { z } from "zod";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import volunteerImg from "@/assets/program-food.jpg";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";

const areas = [
  "ত্রাণ বিতরণ",
  "শিক্ষা ও মেন্টরশিপ",
  "স্বাস্থ্যসেবা ক্যাম্প",
  "ক্যাম্পেইন ও ফান্ডরাইজিং",
  "মিডিয়া ও কনটেন্ট",
  "মসজিদ ও দাওয়াহ",
];

const scopeList = [
  "বন্যা, শীত ও দুর্যোগে মাঠপর্যায়ে ত্রাণ পৌঁছে দেওয়া",
  "এতিম ও সুবিধাবঞ্চিত শিশুদের শিক্ষায় সাপ্তাহিক সময়দান",
  "ফ্রি মেডিকেল ক্যাম্পে ডাক্তার, নার্স ও সহকারী হিসেবে অংশগ্রহণ",
  "অনলাইন ও অফলাইন ফান্ডরাইজিং প্রচারণায় সহযোগিতা",
  "ফটোগ্রাফি, ভিডিও, গ্রাফিক ও সোশ্যাল মিডিয়া কন্টেন্ট তৈরি",
  "দাওয়াহ ও মসজিদ কেন্দ্রিক সামাজিক কার্যক্রম পরিচালনা",
];

const tabs = [
  { key: "regular", label: "নিয়মিত দাতা", icon: Repeat, href: "/donate" },
  { key: "member", label: "আজীবন ও দাতা সদস্য", icon: HeartHandshake, href: "/donate" },
  { key: "volunteer", label: "স্বেচ্ছাসেবক", icon: HandHeart, href: "/volunteer" },
  { key: "career", label: "ক্যারিয়ার", icon: Briefcase, href: "/contact" },
] as const;

const schema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন").max(80),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন"),
  email: z.string().trim().email("সঠিক ই-মেইল দিন").max(255).or(z.literal("")),
  age: z.string().trim().min(1, "বয়স দিন"),
  city: z.string().trim().min(2, "শহর/জেলা লিখুন").max(80),
  profession: z.string().trim().max(120).or(z.literal("")),
  area: z.string().min(1, "আগ্রহের ক্ষেত্র নির্বাচন করুন"),
  availability: z.string().min(1, "সময় নির্বাচন করুন"),
  motivation: z.string().trim().min(10, "অন্তত ১০ অক্ষর লিখুন").max(1000),
});

const Volunteer = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    city: "",
    profession: "",
    area: "",
    availability: "",
    motivation: "",
  });

  const upd =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast({
        title: "তথ্য যাচাই করুন",
        description: r.error.issues[0]?.message,
        variant: "destructive",
      });
      return;
    }
    const text =
      `*স্বেচ্ছাসেবক আবেদন — ইউনাইট ফাউন্ডেশন*\n\n` +
      `নাম: ${form.name}\nফোন: ${form.phone}\nই-মেইল: ${form.email || "—"}\n` +
      `বয়স: ${form.age}\nশহর/জেলা: ${form.city}\nপেশা: ${form.profession || "—"}\n` +
      `আগ্রহের ক্ষেত্র: ${form.area}\nসময়: ${form.availability}\n\n` +
      `কেন যুক্ত হতে চান:\n${form.motivation}`;
    window.open(
      `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    toast({
      title: "ধন্যবাদ!",
      description: "আপনার আবেদন WhatsApp-এ পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।",
    });
    setForm({
      name: "",
      phone: "",
      email: "",
      age: "",
      city: "",
      profession: "",
      area: "",
      availability: "",
      motivation: "",
    });
  };

  return (
    <SiteLayout>
      <Seo
        title="আমাদের সাথে যুক্ত হোন | ইউনাইট ফাউন্ডেশন"
        description="ইউনাইট ফাউন্ডেশনের সাথে স্বেচ্ছাসেবক হিসেবে যুক্ত হোন। ত্রাণ, শিক্ষা, স্বাস্থ্য, মিডিয়া ও দাওয়াহ — যেকোনো ক্ষেত্রে অবদান রাখার সুযোগ।"
        canonical="/volunteer"
      />

      {/* HERO — image with deep green overlay, centered title (As-Sunnah style) */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <img
            src={volunteerImg}
            alt="স্বেচ্ছাসেবক কার্যক্রম"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--primary) / 0.78) 0%, hsl(var(--primary) / 0.88) 100%)",
            }}
          />
        </div>
        <div className="container-page py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            আমাদের সাথে যুক্ত হোন
          </h1>
          <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-white/70" />
        </div>
      </section>

      {/* INTRO + TAB SELECTOR */}
      <section className="py-14 md:py-20">
        <div className="container-page">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
              আমাদের সঙ্গে যুক্ত হতে পারেন বিভিন্নভাবে
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              আপনি যদি ইউনাইট ফাউন্ডেশনের কল্যাণকর কাজসমূহের অংশীদার হতে চান, নিচের
              যেকোনো একটি উপায়ে আমাদের সঙ্গে যুক্ত হতে পারেন। আপনার আগ্রহ অনুযায়ী
              যেকোনো অপশনে ক্লিক করুন।
            </p>
          </div>

          {/* Tab cards */}
          <div className="mt-10 rounded-card border border-border bg-card p-2 md:p-3 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tabs.map((t) => {
                const active = t.key === "volunteer";
                const Icon = t.icon;
                return (
                  <Link
                    key={t.key}
                    to={t.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      "group flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 py-5 md:py-6 px-3 rounded-xl text-sm md:text-base font-semibold text-center transition-colors " +
                      (active
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/70 hover:bg-secondary hover:text-foreground")
                    }
                  >
                    <span
                      className={
                        "h-10 w-10 rounded-full flex items-center justify-center transition-colors " +
                        (active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-primary group-hover:bg-accent")
                      }
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>{t.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Info strip */}
          <div className="mt-5 rounded-card bg-accent/60 border border-accent px-5 md:px-6 py-4 text-sm md:text-base text-foreground/80 text-center">
            স্বেচ্ছাসেবা সংক্রান্ত যেকোনো বিষয় বুঝতে অসুবিধা হলে, দয়া করে{" "}
            <a
              href={`mailto:${site.email || "info@unite.org"}`}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {site.email || "info@unite.org"}
            </a>{" "}
            — এ ইমেইল করুন।
          </div>

          {/* Two-column content */}
          <div className="mt-14 grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: scope */}
            <div>
              <p className="text-base md:text-lg leading-relaxed text-foreground/85">
                স্বেচ্ছাসেবা শুধু সময়দান নয় — এটি একটি ইবাদত, একটি দায়িত্ব। আপনার
                একটি ছোট প্রচেষ্টা বদলে দিতে পারে কারো জীবনের গল্প। আমাদের সঙ্গে যুক্ত
                হয়ে নিজের দক্ষতা, সময় ও ভালোবাসা দিয়ে মানবতার সেবায় হাত বাড়ান।
              </p>

              <blockquote className="mt-6 rounded-card border-l-4 border-primary bg-accent/40 p-5 text-foreground/80 italic leading-relaxed">
                আল্লাহর কাছে সর্বাধিক প্রিয় আমল হলো, যা সদাসর্বদা নিয়মিত করা হয়,
                যদিও তা অল্প হয়। <span className="not-italic text-sm text-muted-foreground">(সহীহ বুখারী, হাদীস ৬৪৬৪)</span>
              </blockquote>

              <h3 className="mt-8 text-xl font-bold">স্বেচ্ছাসেবকের কাজের ক্ষেত্র</h3>
              <ul className="mt-4 space-y-3">
                {scopeList.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/80 leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { v: "৩,৪৫০+", l: "স্বেচ্ছাসেবক" },
                  { v: "১৪", l: "জেলায় নেটওয়ার্ক" },
                  { v: "১২৮০+", l: "প্রকল্প" },
                ].map((s) => (
                  <div key={s.l} className="rounded-card bg-secondary/60 p-4 text-center">
                    <div className="text-xl md:text-2xl font-extrabold text-primary">{s.v}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: form card (green like reference) */}
            <div
              id="apply"
              className="rounded-card overflow-hidden shadow-[var(--shadow-card-hover)] scroll-mt-28"
              style={{
                background:
                  "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(142 56% 18%) 100%)",
              }}
            >
              <div className="p-7 md:p-9 text-white">
                <h3 className="text-xl md:text-2xl font-bold">
                  স্বেচ্ছাসেবক হিসেবে যুক্ত হোন
                </h3>
                <p className="text-white/85 text-sm mt-2 leading-relaxed">
                  ফর্মটি পূরণ করুন — আপনার তথ্য সরাসরি WhatsApp-এ পৌঁছাবে এবং আমাদের
                  টিম ২৪-৪৮ ঘণ্টার মধ্যে যোগাযোগ করবে।
                </p>

                <form onSubmit={submit} className="mt-6 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <FieldLight label="পূর্ণ নাম *">
                      <input required maxLength={80} value={form.name} onChange={upd("name")} className="vol-input" />
                    </FieldLight>
                    <FieldLight label="মোবাইল *">
                      <input
                        required
                        type="tel"
                        inputMode="numeric"
                        maxLength={11}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                        placeholder="01XXXXXXXXX"
                        className="vol-input"
                      />
                    </FieldLight>
                    <FieldLight label="ই-মেইল">
                      <input type="email" maxLength={255} value={form.email} onChange={upd("email")} className="vol-input" />
                    </FieldLight>
                    <FieldLight label="বয়স *">
                      <input required type="number" min={14} max={80} value={form.age} onChange={upd("age")} className="vol-input" />
                    </FieldLight>
                    <FieldLight label="শহর / জেলা *">
                      <input required maxLength={80} value={form.city} onChange={upd("city")} className="vol-input" />
                    </FieldLight>
                    <FieldLight label="পেশা / ছাত্রত্ব">
                      <input maxLength={120} value={form.profession} onChange={upd("profession")} className="vol-input" placeholder="যেমন: ছাত্র, ডাক্তার" />
                    </FieldLight>
                  </div>

                  <FieldLight label="আগ্রহের ক্ষেত্র *">
                    <select required value={form.area} onChange={upd("area")} className="vol-input">
                      <option value="">— নির্বাচন করুন —</option>
                      {areas.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </FieldLight>

                  <FieldLight label="সাপ্তাহিক সময় *">
                    <select required value={form.availability} onChange={upd("availability")} className="vol-input">
                      <option value="">— নির্বাচন করুন —</option>
                      <option>১-৪ ঘণ্টা / সপ্তাহ</option>
                      <option>৫-১০ ঘণ্টা / সপ্তাহ</option>
                      <option>১০+ ঘণ্টা / সপ্তাহ</option>
                      <option>প্রজেক্টভিত্তিক</option>
                      <option>শুধু উইকএন্ড</option>
                    </select>
                  </FieldLight>

                  <FieldLight label="কেন যুক্ত হতে চান? *">
                    <textarea required rows={4} maxLength={1000} value={form.motivation} onChange={upd("motivation")} className="vol-input resize-none" placeholder="আপনার অনুপ্রেরণা সংক্ষেপে লিখুন" />
                  </FieldLight>

                  <button
                    type="submit"
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-btn bg-white text-primary font-bold py-3.5 hover:bg-white/90 transition-colors"
                  >
                    <Send className="h-4 w-4" /> পরবর্তী ধাপ
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/80 pt-2">
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />তথ্য সুরক্ষিত</span>
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />২৪-৪৮ ঘণ্টায় উত্তর</span>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom helper row */}
          <div className="mt-14 grid md:grid-cols-3 gap-4">
            <div className="card-base p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                <HandHeart className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold">দ্রুত WhatsApp</h4>
                <a
                  href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("আসসালামু আলাইকুম, আমি স্বেচ্ছাসেবক হিসেবে যুক্ত হতে আগ্রহী।")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  সরাসরি মেসেজ পাঠান →
                </a>
              </div>
            </div>
            <div className="card-base p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold">অফিস ঠিকানা</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{site.address}</p>
              </div>
            </div>
            <div className="card-base p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold">অফিস সময়</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">শনি-বৃহঃ, সকাল ১০টা - সন্ধ্যা ৬টা</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .vol-input{width:100%;padding:0.7rem 0.9rem;border-radius:10px;border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.12);color:#fff;outline:none;transition:all .2s;font-size:0.95rem}
        .vol-input::placeholder{color:rgba(255,255,255,0.6)}
        .vol-input:focus{border-color:#fff;background:rgba(255,255,255,0.2);box-shadow:0 0 0 3px rgba(255,255,255,0.15)}
        .vol-input option{color:#1a1a1a}
      `}</style>
    </SiteLayout>
  );
};

const FieldLight = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs font-semibold text-white/90 mb-1.5 block">{label}</span>
    {children}
  </label>
);

export default Volunteer;
