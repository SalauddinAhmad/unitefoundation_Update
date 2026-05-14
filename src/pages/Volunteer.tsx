import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HandHeart,
  Users,
  GraduationCap,
  Megaphone,
  Camera,
  Stethoscope,
  Truck,
  HeartHandshake,
  Clock,
  MapPin,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldCheck,
  Award,
  BookOpen,
} from "lucide-react";
import { z } from "zod";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import volunteerImg from "@/assets/program-food.jpg";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";

const areas = [
  { icon: Truck, title: "ত্রাণ বিতরণ", desc: "বন্যা, শীত ও দুর্যোগে মাঠপর্যায়ে ত্রাণ পৌঁছে দিতে সহযোগিতা করুন।" },
  { icon: GraduationCap, title: "শিক্ষা ও মেন্টরশিপ", desc: "এতিম ও সুবিধাবঞ্চিত শিশুদের পড়ালেখায় সাপ্তাহিক সময় দিন।" },
  { icon: Stethoscope, title: "স্বাস্থ্যসেবা ক্যাম্প", desc: "ডাক্তার, নার্স ও সহকারী হিসেবে ফ্রি মেডিকেল ক্যাম্পে যুক্ত হোন।" },
  { icon: Megaphone, title: "ক্যাম্পেইন ও ফান্ডরাইজিং", desc: "অনলাইন ও অফলাইন প্রচারণায় অংশ নিয়ে তহবিল সংগ্রহে সহায়তা করুন।" },
  { icon: Camera, title: "মিডিয়া ও কনটেন্ট", desc: "ফটোগ্রাফি, ভিডিও, গ্রাফিক ও সোশ্যাল মিডিয়া কাজে দক্ষতা ব্যবহার করুন।" },
  { icon: HeartHandshake, title: "মসজিদ ও দাওয়াহ", desc: "মসজিদ নির্মাণ ও দাওয়াহ কার্যক্রমে সহায়ক ভূমিকা পালন করুন।" },
];

const benefits = [
  { icon: Award, title: "অভিজ্ঞতার সনদ", desc: "প্রতিটি কর্মসূচির পর প্রাতিষ্ঠানিক সনদপত্র।" },
  { icon: BookOpen, title: "ফ্রি প্রশিক্ষণ", desc: "নেতৃত্ব, প্রজেক্ট ম্যানেজমেন্ট ও দক্ষতা উন্নয়ন কর্মশালা।" },
  { icon: Users, title: "শক্তিশালী নেটওয়ার্ক", desc: "সমমনা স্বেচ্ছাসেবক ও পেশাজীবীদের কমিউনিটি।" },
  { icon: Sparkles, title: "আত্মিক প্রশান্তি", desc: "মানবতার সেবায় প্রকৃত আনন্দ ও আল্লাহর সন্তুষ্টি অর্জনের সুযোগ।" },
];

const steps = [
  { n: "১", t: "ফর্ম পূরণ", d: "নিচের ফর্মে আপনার তথ্য, আগ্রহ ও সময় উল্লেখ করুন।" },
  { n: "২", t: "ইন্টারভিউ", d: "আমাদের টিম আপনার সাথে ফোন বা WhatsApp-এ যোগাযোগ করবে।" },
  { n: "৩", t: "ওরিয়েন্টেশন", d: "অফিস বা অনলাইনে এক ঘণ্টার ওরিয়েন্টেশন সেশনে অংশ নিন।" },
  { n: "৪", t: "মাঠে যুক্ত হোন", d: "আপনার পছন্দের কার্যক্রমে সক্রিয় ভূমিকা শুরু করুন।" },
];

const faqs = [
  { q: "স্বেচ্ছাসেবক হতে কি কোনো ফি লাগে?", a: "না, সম্পূর্ণ বিনামূল্যে যেকোনো ব্যক্তি যুক্ত হতে পারেন।" },
  { q: "ন্যূনতম সময় কত দিতে হবে?", a: "মাসে ন্যূনতম ৪ ঘণ্টা সময় দেওয়ার পরামর্শ। প্রজেক্টভিত্তিক স্বল্পমেয়াদিও সম্ভব।" },
  { q: "ছাত্র/চাকরিজীবী হিসেবেও কি যুক্ত হওয়া যাবে?", a: "অবশ্যই। উইকএন্ড ও সান্ধ্যকালীন অনেক কার্যক্রম রয়েছে।" },
  { q: "নারী স্বেচ্ছাসেবক যুক্ত হতে পারবেন?", a: "অবশ্যই, পর্দাসম্মত ও পৃথক টিম পরিচালনার ব্যবস্থা রয়েছে।" },
  { q: "অন্য জেলা থেকে অংশ নেওয়া যাবে?", a: "হ্যাঁ, রিমোট কাজ (মিডিয়া, ডিজাইন, ফান্ডরাইজিং) এবং স্থানীয় চ্যাপ্টারে যুক্ত হওয়া যায়।" },
];

const schema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন").max(80),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন"),
  email: z.string().trim().email("সঠিক ই-মেইল দিন").max(255).or(z.literal("")),
  age: z.string().trim().min(1, "বয়স দিন"),
  city: z.string().trim().min(2, "শহর/জেলা লিখুন").max(80),
  profession: z.string().trim().max(120).or(z.literal("")),
  area: z.string().min(1, "আগ্রহের ক্ষেত্র নির্বাচন করুন"),
  availability: z.string().min(1, "সময় নির্বাচন করুন"),
  experience: z.string().trim().max(1000).or(z.literal("")),
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
    experience: "",
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
      `পূর্ব অভিজ্ঞতা:\n${form.experience || "—"}\n\nকেন যুক্ত হতে চান:\n${form.motivation}`;
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
      experience: "",
      motivation: "",
    });
  };

  return (
    <SiteLayout>
      <Seo
        title="স্বেচ্ছাসেবক হোন | ইউনাইট ফাউন্ডেশন"
        description="আপনার সময়, দক্ষতা ও ভালোবাসা দিয়ে মানবতার সেবায় যুক্ত হোন। ত্রাণ, শিক্ষা, স্বাস্থ্য, মিডিয়া ও দাওয়াহ — যেকোনো ক্ষেত্রে স্বেচ্ছাসেবক হিসেবে অবদান রাখুন।"
        canonical="/volunteer"
      />

      <PageHero
        image={volunteerImg}
        eyebrow="স্বেচ্ছাসেবক প্রোগ্রাম"
        title="স্বেচ্ছাসেবক হোন, পরিবর্তনের অংশীদার হোন"
        subtitle="আপনার একটি ছোট প্রচেষ্টা বদলে দিতে পারে কারো জীবনের গল্প। আমাদের সাথে যুক্ত হয়ে মানবতার সেবায় হাত বাড়ান।"
      >
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href="#apply" className="btn-donate text-sm rounded-full px-6 py-3">
            <HandHeart className="h-4 w-4" /> এখনই আবেদন করুন
          </a>
          <Link
            to="/about"
            className="text-sm rounded-full px-6 py-3 bg-white/15 text-white border border-white/30 backdrop-blur hover:bg-white/25 transition-colors"
          >
            আমাদের সম্পর্কে জানুন
          </Link>
        </div>
      </PageHero>

      {/* Quick stats */}
      <section className="py-10 bg-secondary/40 border-b border-border">
        <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: "৩,৪৫০+", l: "সক্রিয় স্বেচ্ছাসেবক" },
            { v: "১৪", l: "জেলায় নেটওয়ার্ক" },
            { v: "১২৮০+", l: "বাস্তবায়িত প্রকল্প" },
            { v: "১০০%", l: "প্রশিক্ষণপ্রাপ্ত টিম" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold gradient-donate-text">{s.v}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Areas */}
      <section className="py-14 md:py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow">আগ্রহের ক্ষেত্র</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">আপনি কোথায় অবদান রাখতে চান?</h2>
            <p className="text-muted-foreground mt-3">
              আপনার দক্ষতা ও আগ্রহ অনুযায়ী যেকোনো ক্ষেত্রে যুক্ত হতে পারেন।
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {areas.map((a) => (
              <div key={a.title} className="card-base p-6 hover:shadow-card-hover transition-shadow">
                <div className="h-12 w-12 rounded-card gradient-donate-bg text-white flex items-center justify-center">
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-bold text-lg">{a.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-14 md:py-20 bg-secondary/40">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow">যোগদানের ধাপ</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">কীভাবে যুক্ত হবেন</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s) => (
              <div key={s.n} className="card-base p-6 relative">
                <div className="h-10 w-10 rounded-full gradient-donate-bg text-white font-bold flex items-center justify-center">
                  {s.n}
                </div>
                <h3 className="mt-4 font-bold">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 md:py-20">
        <div className="container-page grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="eyebrow">কেন স্বেচ্ছাসেবক হবেন</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">আপনি যা পাবেন</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              স্বেচ্ছাসেবার মাধ্যমে আপনি শুধু অন্যকে সাহায্য করছেন না — নিজেকেও তৈরি করছেন একজন
              দক্ষ, সহানুভূতিশীল ও অনুপ্রাণিত মানুষ হিসেবে।
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "প্রকৃত মাঠ অভিজ্ঞতা ও দক্ষতা উন্নয়ন",
                "নেতৃত্ব ও দলীয় কাজের প্র্যাকটিক্যাল সুযোগ",
                "মানবিক প্রকল্পে সরাসরি অবদান",
                "জীবনব্যাপী বন্ধুত্ব ও পেশাগত নেটওয়ার্ক",
              ].map((p) => (
                <li key={p} className="flex gap-3 items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <div key={b.title} className="card-base p-5">
                <div className="h-10 w-10 rounded-card bg-accent text-primary flex items-center justify-center">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-bold">{b.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="py-14 md:py-20 bg-secondary/40 scroll-mt-28">
        <div className="container-page grid lg:grid-cols-[1fr_360px] gap-10">
          <form onSubmit={submit} className="card-base p-6 md:p-8 space-y-6">
            <div>
              <span className="eyebrow">আবেদন ফর্ম</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-2">স্বেচ্ছাসেবক রেজিস্ট্রেশন</h2>
              <p className="text-sm text-muted-foreground mt-2">
                সাবমিট করার পর আপনার তথ্য WhatsApp-এ আমাদের কাছে পৌঁছাবে। * চিহ্নিত ঘরগুলো বাধ্যতামূলক।
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="পূর্ণ নাম *">
                <input required maxLength={80} value={form.name} onChange={upd("name")} className="input-base" />
              </Field>
              <Field label="মোবাইল নম্বর *">
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                  placeholder="01XXXXXXXXX"
                  className="input-base"
                />
              </Field>
              <Field label="ই-মেইল (ঐচ্ছিক)">
                <input type="email" maxLength={255} value={form.email} onChange={upd("email")} className="input-base" />
              </Field>
              <Field label="বয়স *">
                <input required type="number" min={14} max={80} value={form.age} onChange={upd("age")} className="input-base" />
              </Field>
              <Field label="শহর / জেলা *">
                <input required maxLength={80} value={form.city} onChange={upd("city")} className="input-base" />
              </Field>
              <Field label="পেশা / ছাত্রত্ব">
                <input maxLength={120} value={form.profession} onChange={upd("profession")} className="input-base" placeholder="যেমন: ছাত্র, ডাক্তার, ডেভেলপার" />
              </Field>
              <Field label="আগ্রহের ক্ষেত্র *">
                <select required value={form.area} onChange={upd("area")} className="input-base">
                  <option value="">— নির্বাচন করুন —</option>
                  {areas.map((a) => (
                    <option key={a.title} value={a.title}>{a.title}</option>
                  ))}
                  <option value="অন্যান্য">অন্যান্য</option>
                </select>
              </Field>
              <Field label="সাপ্তাহিক সময় *">
                <select required value={form.availability} onChange={upd("availability")} className="input-base">
                  <option value="">— নির্বাচন করুন —</option>
                  <option>১-৪ ঘণ্টা / সপ্তাহ</option>
                  <option>৫-১০ ঘণ্টা / সপ্তাহ</option>
                  <option>১০+ ঘণ্টা / সপ্তাহ</option>
                  <option>প্রজেক্টভিত্তিক</option>
                  <option>শুধু উইকএন্ড</option>
                </select>
              </Field>
              <Field label="পূর্ব অভিজ্ঞতা (থাকলে)" className="sm:col-span-2">
                <textarea rows={3} maxLength={1000} value={form.experience} onChange={upd("experience")} className="input-base resize-none" placeholder="পূর্বে কোনো সংগঠন বা স্বেচ্ছাসেবী কাজে যুক্ত ছিলেন কি না" />
              </Field>
              <Field label="কেন যুক্ত হতে চান? *" className="sm:col-span-2">
                <textarea required rows={4} maxLength={1000} value={form.motivation} onChange={upd("motivation")} className="input-base resize-none" placeholder="আপনার অনুপ্রেরণা ও প্রত্যাশা সংক্ষেপে লিখুন" />
              </Field>
            </div>

            <button type="submit" className="btn-donate w-full text-base py-4">
              <Send className="h-5 w-5" /> আবেদন পাঠান
            </button>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-2">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />তথ্য সুরক্ষিত</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />২৪-৪৮ ঘণ্টায় উত্তর</span>
            </div>
          </form>

          <aside className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="card-base p-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <HandHeart className="h-5 w-5 text-primary" /> দ্রুত যোগাযোগ
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                ফর্ম পূরণ করতে সময় না হলে সরাসরি WhatsApp-এ মেসেজ দিন।
              </p>
              <a
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("আসসালামু আলাইকুম, আমি স্বেচ্ছাসেবক হিসেবে যুক্ত হতে আগ্রহী।")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-btn bg-[#25D366] text-white font-semibold hover:opacity-90 transition-opacity"
              >
                WhatsApp-এ মেসেজ
              </a>
            </div>
            <div className="card-base p-6">
              <h3 className="font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> অফিস ঠিকানা
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{site.address}</p>
              <p className="text-xs text-muted-foreground mt-2">শনি-বৃহঃ, সকাল ১০টা - সন্ধ্যা ৬টা</p>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-20">
        <div className="container-page max-w-3xl">
          <div className="text-center mb-10">
            <span className="eyebrow">প্রশ্নোত্তর</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">সাধারণ জিজ্ঞাসা</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="card-base p-5 group">
                <summary className="cursor-pointer font-semibold list-none flex items-center justify-between gap-3">
                  {f.q}
                  <span className="h-7 w-7 rounded-full bg-accent text-primary flex items-center justify-center group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <style>{`.input-base{width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid hsl(var(--input));background:hsl(var(--background));color:hsl(var(--foreground));outline:none;transition:all 0.2s}.input-base:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary)/0.1)}`}</style>
    </SiteLayout>
  );
};

const Field = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <label className={`block ${className}`}>
    <span className="text-sm font-semibold text-foreground mb-1.5 block">{label}</span>
    {children}
  </label>
);

export default Volunteer;
