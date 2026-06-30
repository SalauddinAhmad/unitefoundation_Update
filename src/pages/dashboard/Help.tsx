import { useState } from "react";
import {
  LifeBuoy,
  Search,
  BookOpen,
  PlayCircle,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  Rocket,
  HandCoins,
  Users2,
  Shield,
  FileText,
  Settings as SettingsIcon,
  ExternalLink,
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const categories = [
  { icon: Rocket, label: "শুরু করুন", desc: "ড্যাশবোর্ড সেটআপ ও বেসিক", color: "from-emerald-500/20 to-emerald-500/5", iconBg: "bg-emerald-500/15 text-emerald-700" },
  { icon: HandCoins, label: "দান ব্যবস্থাপনা", desc: "ডোনেশন, রিসিট, রিপোর্ট", color: "from-amber-500/20 to-amber-500/5", iconBg: "bg-amber-500/15 text-amber-700" },
  { icon: Users2, label: "সদস্য ও স্বেচ্ছাসেবক", desc: "প্রোফাইল, যোগ ও যাচাই", color: "from-sky-500/20 to-sky-500/5", iconBg: "bg-sky-500/15 text-sky-700" },
  { icon: FileText, label: "কনটেন্ট ও ব্লগ", desc: "পোস্ট, গ্যালারি, প্রকল্প", color: "from-violet-500/20 to-violet-500/5", iconBg: "bg-violet-500/15 text-violet-700" },
  { icon: Shield, label: "নিরাপত্তা ও রোল", desc: "2FA, অ্যাডমিন ও পারমিশন", color: "from-rose-500/20 to-rose-500/5", iconBg: "bg-rose-500/15 text-rose-700" },
  { icon: SettingsIcon, label: "সেটিংস", desc: "পেমেন্ট, নোটিফিকেশন, SMTP", color: "from-teal-500/20 to-teal-500/5", iconBg: "bg-teal-500/15 text-teal-700" },
];

const faqs = [
  {
    q: "নতুন অ্যাডমিন কীভাবে যোগ করব?",
    a: "সেটিংস → নিরাপত্তা ও রোল → 'নতুন অ্যাডমিন যোগ করুন' এ যান। নাম, ইমেইল ও রোল দিন — সিস্টেম স্বয়ংক্রিয়ভাবে পাসওয়ার্ড তৈরি করে SMTP-এর মাধ্যমে ইমেইলে পাঠাবে।",
  },
  {
    q: "টু-ফ্যাক্টর অথেন্টিকেশন (2FA) কীভাবে চালু করব?",
    a: "সেটিংস → নিরাপত্তা ও রোল → '2FA চালু করুন' টগল অন করুন। এরপর লগইনের সময় আপনার ইমেইলে 6-digit OTP পাঠানো হবে।",
  },
  {
    q: "ডোনেশনের রিপোর্ট কীভাবে ডাউনলোড করব?",
    a: "ড্যাশবোর্ড → দানসমূহ পেজে যান, ডেট রেঞ্জ সিলেক্ট করে 'PDF/Excel এক্সপোর্ট' বাটনে ক্লিক করুন।",
  },
  {
    q: "পেমেন্ট গেটওয়ে কনফিগার করব কীভাবে?",
    a: "সেটিংস → পেমেন্ট গেটওয়ে ট্যাবে গিয়ে bKash, Nagad, Rocket, Islami Bank ও SSLCommerz এর Merchant/API তথ্য দিন এবং সংরক্ষণ করুন।",
  },
  {
    q: "মেসেজের উত্তর দেওয়া যায় কি?",
    a: "হ্যাঁ, ড্যাশবোর্ড → মেসেজ থেকে যেকোনো মেসেজ খুলে 'রিপ্লাই' করুন — ইমেইল SMTP-এর মাধ্যমে পাঠানো হবে। 'কম্পোজ' দিয়ে নতুন মেসেজও পাঠানো যায়।",
  },
  {
    q: "পাসওয়ার্ড ভুলে গেলে কী করব?",
    a: "লগইন পেজ → 'পাসওয়ার্ড ভুলে গেছেন?' এ ক্লিক করুন। আপনার ইমেইল দিন — রিসেট লিংক পাঠানো হবে।",
  },
];

const guides = [
  { title: "ড্যাশবোর্ড দ্রুত শুরু", time: "৫ মিনিট", icon: Rocket },
  { title: "প্রথম প্রকল্প তৈরি করুন", time: "৩ মিনিট", icon: FolderIcon },
  { title: "ডোনেশন রিপোর্ট তৈরি", time: "৪ মিনিট", icon: HandCoins },
  { title: "অ্যাডমিন রোল ম্যানেজ করুন", time: "৬ মিনিট", icon: Shield },
];

function FolderIcon(props: any) {
  return <BookOpen {...props} />;
}

export default function Help() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const filtered = faqs.filter(
    (f) => !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()),
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "অনুগ্রহ করে সকল ফিল্ড পূরণ করুন", variant: "destructive" });
      return;
    }
    setSent(true);
    toast({ title: "✓ আপনার বার্তা পাঠানো হয়েছে", description: "আমরা ২৪ ঘন্টার মধ্যে যোগাযোগ করব।" });
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary via-primary to-emerald-900 text-primary-foreground p-8 md:p-12">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            সাহায্য কেন্দ্র
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            কীভাবে সাহায্য করতে পারি?
          </h1>
          <p className="mt-3 text-white/80 text-base md:text-lg">
            গাইড, প্রায়শই জিজ্ঞাসিত প্রশ্ন এবং সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ — সবকিছু এক জায়গায়।
          </p>
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="অনুসন্ধান করুন — দান, রিপোর্ট, পাসওয়ার্ড..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-foreground placeholder:text-muted-foreground shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> বিষয় অনুযায়ী খুঁজুন
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <button
              key={c.label}
              className={`group text-left rounded-2xl border border-border bg-gradient-to-br ${c.color} p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all`}
            >
              <div className={`h-11 w-11 rounded-xl ${c.iconBg} flex items-center justify-center mb-3`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div className="font-bold text-foreground">{c.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
              <div className="mt-3 text-xs font-semibold text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                বিস্তারিত দেখুন <ExternalLink className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two-column: FAQ + Side */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* FAQ */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" /> প্রায়শই জিজ্ঞাসিত প্রশ্ন
            </h2>
            <span className="text-xs text-muted-foreground">{filtered.length} টি প্রশ্ন</span>
          </div>
          <div className="space-y-3">
            {filtered.map((f, i) => {
              const open = openIdx === i;
              return (
                <div
                  key={i}
                  className={`rounded-xl border transition-all ${open ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}
                >
                  <button
                    onClick={() => setOpenIdx(open ? null : i)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left"
                  >
                    <span className="font-semibold text-sm md:text-base">{f.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180 text-primary" : "text-muted-foreground"}`}
                    />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                কোনো ফলাফল পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।
              </div>
            )}
          </div>
        </div>

        {/* Side */}
        <div className="space-y-6">
          {/* Quick guides */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <PlayCircle className="h-5 w-5 text-primary" /> দ্রুত গাইড
            </h3>
            <div className="space-y-2">
              {guides.map((g) => (
                <button
                  key={g.title}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary text-left transition"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <g.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{g.title}</div>
                    <div className="text-[11px] text-muted-foreground">{g.time}</div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Contact channels */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-4">সরাসরি যোগাযোগ</h3>
            <div className="space-y-3">
              <a
                href="https://wa.me/8801XXXXXXXXX"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 transition"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">হোয়াটসঅ্যাপ</div>
                  <div className="text-[11px] text-muted-foreground">২৪/৭ চ্যাট সাপোর্ট</div>
                </div>
              </a>
              <a
                href="mailto:contact@unitefoundation.bd"
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/15 transition"
              >
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">ইমেইল</div>
                  <div className="text-[11px] text-muted-foreground">contact@unitefoundation.bd</div>
                </div>
              </a>
              <a
                href="tel:+8801XXXXXXXXX"
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/70 transition"
              >
                <div className="h-10 w-10 rounded-xl bg-foreground/90 text-background flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">ফোন</div>
                  <div className="text-[11px] text-muted-foreground">সকাল ৯টা — রাত ৯টা</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-card to-secondary/40">
        <div className="grid md:grid-cols-5">
          <div className="md:col-span-2 p-8 md:p-10 bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <h3 className="text-2xl font-extrabold leading-tight">এখনও সমাধান<br />পাননি?</h3>
              <p className="mt-3 text-white/80 text-sm">
                আমাদের সাপোর্ট টিমের কাছে বিস্তারিত লিখে পাঠান — গড় উত্তর প্রদানের সময় ২৪ ঘন্টার মধ্যে।
              </p>
              <div className="mt-8 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 className="h-4 w-4" /> ব্যক্তিগত প্রতিউত্তর
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 className="h-4 w-4" /> ২৪ ঘন্টার মধ্যে সমাধান
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 className="h-4 w-4" /> সম্পূর্ণ গোপনীয়
                </div>
              </div>
            </div>
          </div>
          <form onSubmit={submit} className="md:col-span-3 p-8 md:p-10 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground/70 mb-1.5 block">নাম</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="আপনার নাম"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground/70 mb-1.5 block">ইমেইল</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="you@email.com"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1.5 block">বিষয়</label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="সংক্ষেপে বিষয়"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1.5 block">বার্তা</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="আপনার সমস্যা বা প্রশ্ন বিস্তারিত লিখুন..."
              />
            </div>
            <button
              type="submit"
              disabled={sent}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold px-6 py-3 text-sm hover:opacity-90 transition disabled:opacity-60"
            >
              {sent ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> পাঠানো হয়েছে
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> বার্তা পাঠান
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
