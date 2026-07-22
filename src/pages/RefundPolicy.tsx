import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { useSettings } from "@/hooks/api/useDashboardData";
import { site } from "@/data/site";
import { RefreshCw, Mail, Phone, MapPin, AlertTriangle, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";

const lastUpdated = "২০ জুলাই, ২০২৬";

const sections = [
  {
    id: "intro",
    icon: RefreshCw,
    title: "ভূমিকা",
    body: (
      <p>
        {site.name} একটি অলাভজনক ইসলামিক প্ল্যাটফর্ম। আপনার দানসমূহ বিভিন্ন সমাজসেবামূলক প্রকল্পে
        সরাসরি ব্যয় হয়। তবুও ভুলবশত বা technical কারণে যদি কোনো ভুল পেমেন্ট হয়, আমরা নিচের
        নীতিমালা অনুযায়ী তা সমাধানের চেষ্টা করি।
      </p>
    ),
  },
  {
    id: "eligibility",
    icon: CheckCircle2,
    title: "যেসব ক্ষেত্রে রিফান্ড প্রযোজ্য",
    body: (
      <ul className="list-disc pr-6 space-y-2">
        <li><strong>দ্বিগুণ পেমেন্ট (Duplicate Payment):</strong> Technical কারণে একই লেনদেন দুইবার হলে অতিরিক্ত অংশ রিফান্ড করা হবে।</li>
        <li><strong>ভুল পরিমাণ:</strong> ব্যবহারকারীর ভুলে অতিরিক্ত টাকা পাঠানো হলে (যেমন ৫০০ এর জায়গায় ৫০০০) — যদি ২৪ ঘন্টার মধ্যে অভিযোগ করা হয়।</li>
        <li><strong>Technical Failure:</strong> পেমেন্ট সফল হলেও রশিদ না পেলে বা লেনদেন incomplete দেখালে যাচাই সাপেক্ষে রিফান্ড।</li>
        <li><strong>Unauthorized Transaction:</strong> কার্ড/অ্যাকাউন্টের অননুমোদিত ব্যবহার প্রমাণিত হলে ব্যাংকের সাথে সমন্বয়ে রিফান্ড।</li>
      </ul>
    ),
  },
  {
    id: "non-refundable",
    icon: XCircle,
    title: "যেসব ক্ষেত্রে রিফান্ড প্রযোজ্য নয়",
    body: (
      <ul className="list-disc pr-6 space-y-2">
        <li>সফলভাবে সম্পন্ন ও গৃহীত দান — যা ইতোমধ্যে প্রকল্পে ব্যয় হয়েছে।</li>
        <li>স্বেচ্ছায় প্রদত্ত সদাকা/যাকাত — শরিয়াহ্‌ অনুযায়ী নিয়ত অনুসারে গণ্য হয়।</li>
        <li>সদস্যপদ ফি বা মাসিক দাতা কর্তৃক প্রদত্ত মাসিক দান — subscription cancel করার পর ভবিষ্যৎ payment বন্ধ হবে, তবে পূর্বের payment ফেরতযোগ্য নয়।</li>
        <li>৩০ দিনের বেশি পুরনো লেনদেনের অভিযোগ।</li>
      </ul>
    ),
  },
  {
    id: "process",
    icon: FileText,
    title: "রিফান্ড আবেদন প্রক্রিয়া",
    body: (
      <ol className="list-decimal pr-6 space-y-2">
        <li>ইমেইল বা ফোনে আমাদের সাথে যোগাযোগ করুন এবং প্রয়োজনীয় তথ্য দিন:
          <ul className="list-disc pr-6 mt-2 space-y-1 text-sm text-muted-foreground">
            <li>ট্রানজেকশন আইডি (Transaction ID)</li>
            <li>পেমেন্টের তারিখ ও পরিমাণ</li>
            <li>পেমেন্ট মাধ্যম (কার্ড / বিকাশ / নগদ / ব্যাংক ইত্যাদি)</li>
            <li>রিফান্ডের কারণ ও প্রমাণাদি (স্ক্রিনশট থাকলে)</li>
          </ul>
        </li>
        <li>আমাদের team ২-৩ কর্মদিবসের মধ্যে অভিযোগ যাচাই করবে।</li>
        <li>রিফান্ড অনুমোদিত হলে <strong>৭-১০ কর্মদিবসের মধ্যে</strong> মূল পেমেন্ট মাধ্যমে টাকা ফেরত পাঠানো হবে।</li>
        <li>রিফান্ডের সম্পূর্ণ প্রক্রিয়া ইমেইলে অবহিত করা হবে।</li>
      </ol>
    ),
  },
  {
    id: "timeline",
    icon: Clock,
    title: "রিফান্ডের সময়সীমা",
    body: (
      <ul className="list-disc pr-6 space-y-2">
        <li><strong>কার্ড পেমেন্ট (Visa / MasterCard):</strong> ৭-১০ কর্মদিবস (ব্যাংকের উপর নির্ভরশীল)</li>
        <li><strong>Mobile Banking (bKash / Nagad / Rocket):</strong> ৩-৫ কর্মদিবস</li>
        <li><strong>Internet Banking / ব্যাংক ট্রান্সফার:</strong> ৫-৭ কর্মদিবস</li>
        
      </ul>
    ),
  },
  {
    id: "cancellation",
    icon: AlertTriangle,
    title: "ক্যান্সেলেশন নীতি",
    body: (
      <>
        <p>
          <strong>এককালীন দান:</strong> লেনদেন সম্পন্ন হয়ে গেলে সাধারণত cancel করার সুযোগ থাকে না।
          পেমেন্ট আটকে থাকলে (Pending) ২৪ ঘন্টার মধ্যে যোগাযোগ করলে cancel করা যেতে পারে।
        </p>
        <p>
          <strong>মাসিক দাতা (Recurring):</strong> যেকোনো সময় dashboard থেকে বা আমাদের সাথে
          যোগাযোগ করে subscription cancel করা যাবে। Cancel এর পর পরবর্তী মাস থেকে আর payment
          কাটা হবে না।
        </p>
      </>
    ),
  },
  {
    id: "contact-block",
    icon: Mail,
    title: "রিফান্ড সংক্রান্ত যোগাযোগ",
    body: (
      <ul className="space-y-3 text-sm">
        <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" /><a href={`mailto:${site.email}`} className="hover:text-primary">{site.email}</a></li>
        <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" /><a href={`tel:${site.phone}`} dir="ltr" className="hover:text-primary">{site.phone}</a></li>
        <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" /><span>{site.address}</span></li>
      </ul>
    ),
  },
];

const RefundPolicy = () => {
  const { data: settings } = useSettings();
  return (
    <SiteLayout>
      <Seo
        title={`রিফান্ড ও রিটার্ন পলিসি | ${site.name}`}
        description={`${site.name}-এর দান ও পেমেন্ট রিফান্ড নীতিমালা, ক্যান্সেলেশন প্রক্রিয়া ও যোগাযোগের বিস্তারিত।`}
        canonical="/refund-policy"
      />
      <PageHero
        image={settings?.page_heroes?.refund || undefined}
        eyebrow="আইনগত"
        title="রিফান্ড ও রিটার্ন পলিসি"
        subtitle="ভুলবশত বা technical কারণে পেমেন্ট সংক্রান্ত সমস্যার সমাধানে আমাদের নীতিমালা।"
      />

      <section className="container-page py-14 md:py-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[260px,1fr] gap-10">
          <aside className="lg:sticky lg:top-32 h-fit">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">সূচিপত্র</div>
              <nav className="space-y-1.5 text-sm">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="block px-3 py-2 rounded-lg text-foreground/75 hover:text-primary hover:bg-accent transition-colors">
                    {s.title}
                  </a>
                ))}
              </nav>
              <div className="mt-5 pt-5 border-t border-border text-xs text-muted-foreground">
                সর্বশেষ হালনাগাদ:<br />
                <span className="font-semibold text-foreground">{lastUpdated}</span>
              </div>
            </div>
          </aside>

          <article className="space-y-10">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <section key={s.id} id={s.id} className="scroll-mt-32 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{s.title}</h2>
                  </div>
                  <div className="prose prose-sm max-w-none text-foreground/85 leading-relaxed space-y-3">
                    {s.body}
                  </div>
                </section>
              );
            })}
          </article>
        </div>
      </section>
    </SiteLayout>
  );
};

export default RefundPolicy;
