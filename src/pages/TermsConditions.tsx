import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { useSettings } from "@/hooks/api/useDashboardData";
import { site } from "@/data/site";
import { FileText, Mail, Phone, MapPin, ShieldCheck, AlertTriangle, CreditCard, Scale, UserCheck, RefreshCw } from "lucide-react";

const lastUpdated = "২০ জুলাই, ২০২৬";

const sections = [
  {
    id: "intro",
    icon: FileText,
    title: "ভূমিকা",
    body: (
      <>
        <p>
          {site.name} ("আমরা", "আমাদের", "সংস্থা") পরিচালিত ওয়েবসাইট{" "}
          <a href={site.website} className="text-primary underline" target="_blank" rel="noopener noreferrer">
            {site.website}
          </a>{" "}
          ব্যবহার করে আপনি নিম্নোক্ত শর্তাবলী মেনে চলতে সম্মত হচ্ছেন। অনুগ্রহ করে সম্পূর্ণ পলিসি
          মনোযোগ সহকারে পড়ুন।
        </p>
        <p>
          এই পলিসি আপনার ও সংস্থার মধ্যে একটি আইনি চুক্তি হিসেবে গণ্য হবে। যদি আপনি এই শর্তাবলীর
          সাথে একমত না হন, তাহলে অনুগ্রহ করে আমাদের সেবা ব্যবহার থেকে বিরত থাকুন।
        </p>
      </>
    ),
  },
  {
    id: "org",
    icon: ShieldCheck,
    title: "সংস্থার পরিচিতি",
    body: (
      <ul className="list-disc pr-6 space-y-2">
        <li><strong>সংস্থার নাম:</strong> {site.name} ({site.nameEn})</li>
        <li><strong>ঠিকানা:</strong> {site.address}</li>
        <li><strong>ট্রেড লাইসেন্স নম্বর:</strong> <span className="font-en">{site.tradeLicense}</span></li>
        <li><strong>TIN নম্বর:</strong> <span className="font-en">{site.tin}</span></li>
        <li><strong>যোগাযোগ:</strong> {site.email} · <span dir="ltr">{site.phone}</span></li>
      </ul>
    ),
  },
  {
    id: "services",
    icon: UserCheck,
    title: "আমাদের সেবা",
    body: (
      <>
        <p>
          {site.name} একটি অরাজনৈতিক ও অলাভজনক ইসলামিক প্ল্যাটফর্ম যা দান/সদাকা গ্রহণ, স্বেচ্ছাসেবক
          ব্যবস্থাপনা, শিক্ষা, দাওয়াহ, এতিম পৃষ্ঠপোষকতা এবং বিভিন্ন সমাজসেবামূলক প্রকল্প পরিচালনা করে।
        </p>
        <p>
          ওয়েবসাইটের মাধ্যমে ব্যবহারকারী দান করতে, সদস্য হতে, স্বেচ্ছাসেবক হিসেবে যোগ দিতে এবং
          বিভিন্ন প্রকল্প সম্পর্কে জানতে পারেন।
        </p>
      </>
    ),
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "পেমেন্ট ও দান",
    body: (
      <ul className="list-disc pr-6 space-y-2">
        <li>সকল দান/পেমেন্ট বাংলাদেশি টাকায় (BDT) গ্রহণ করা হয়।</li>
        <li>পেমেন্ট গেটওয়ে হিসেবে <strong>SSLCommerz</strong> ব্যবহার করা হয় — যা ভিসা, মাস্টারকার্ড, বিকাশ, নগদ, রকেট, ইন্টারনেট ব্যাংকিং সহ সকল প্রচলিত মাধ্যম সমর্থন করে।</li>
        <li>মোবাইল ব্যাংকিং (bKash / Nagad / Rocket) ও ব্যাংক ট্রান্সফারের মাধ্যমেও সরাসরি দান করা যায়।</li>
        <li>পেমেন্ট সফল হলে ইমেইলে একটি নিশ্চিতকরণ (Confirmation) প্রেরণ করা হবে।</li>
        <li>পেমেন্ট সংক্রান্ত সকল লেনদেনের রেকর্ড কমপক্ষে ৭ বছর সংরক্ষণ করা হয়।</li>
      </ul>
    ),
  },
  {
    id: "user-conduct",
    icon: AlertTriangle,
    title: "ব্যবহারকারীর দায়িত্ব",
    body: (
      <ul className="list-disc pr-6 space-y-2">
        <li>ফর্ম পূরণের সময় সঠিক ও সত্য তথ্য প্রদান করতে হবে।</li>
        <li>অন্যের নাম/পরিচয় ব্যবহার করে দান বা আবেদন করা যাবে না।</li>
        <li>ওয়েবসাইটে কোনো ধরনের ক্ষতিকর কোড (Malware/Virus) আপলোড করা নিষিদ্ধ।</li>
        <li>Automated bot বা scraping tool দিয়ে সাইট এক্সেস করা যাবে না।</li>
        <li>সাইটের content বিনা অনুমতিতে বাণিজ্যিক উদ্দেশ্যে ব্যবহার করা যাবে না।</li>
      </ul>
    ),
  },
  {
    id: "ip",
    icon: Scale,
    title: "মেধাস্বত্ব (Intellectual Property)",
    body: (
      <p>
        ওয়েবসাইটের সকল content — লেখা, ছবি, লোগো, ভিডিও, ডিজাইন — {site.name}-এর মেধাস্বত্ব। শিক্ষামূলক
        উদ্দেশ্যে সূত্র উল্লেখপূর্বক শেয়ার করা যাবে। বাণিজ্যিক ব্যবহারের জন্য পূর্ব লিখিত অনুমতি প্রয়োজন।
      </p>
    ),
  },
  {
    id: "liability",
    icon: AlertTriangle,
    title: "দায়সীমাবদ্ধতা",
    body: (
      <p>
        আমরা সেবার সঠিকতা ও নিরাপত্তা নিশ্চিত করতে যথাসাধ্য চেষ্টা করি। তবে technical failure, network
        issue, বা third-party (পেমেন্ট গেটওয়ে, হোস্টিং) সমস্যার কারণে সৃষ্ট কোনো পরোক্ষ ক্ষতির জন্য
        সংস্থা দায়ী থাকবে না।
      </p>
    ),
  },
  {
    id: "law",
    icon: Scale,
    title: "প্রযোজ্য আইন",
    body: (
      <p>
        এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের প্রচলিত আইন অনুযায়ী পরিচালিত হবে। যেকোনো বিরোধ
        নিষ্পত্তির ক্ষেত্রে ঢাকার আদালতসমূহ এখতিয়ারভুক্ত থাকবে।
      </p>
    ),
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "শর্তাবলী পরিবর্তন",
    body: (
      <p>
        {site.name} যেকোনো সময় এই শর্তাবলী পরিবর্তনের অধিকার সংরক্ষণ করে। উল্লেখযোগ্য পরিবর্তন হলে
        ওয়েবসাইটে নোটিশ প্রকাশ করা হবে। পরিবর্তনের পর সেবা ব্যবহার অব্যাহত রাখলে ধরে নেওয়া হবে
        আপনি নতুন শর্তাবলীতে সম্মত।
      </p>
    ),
  },
];

const TermsConditions = () => {
  const { data: settings } = useSettings();
  return (
    <SiteLayout>
      <Seo
        title={`টার্মস অ্যান্ড কন্ডিশনস | ${site.name}`}
        description={`${site.name}-এর সেবা ব্যবহারের শর্তাবলী, দান/পেমেন্ট নীতি, এবং আইনি বাধ্যবাধকতা সম্পর্কিত সম্পূর্ণ তথ্য।`}
        canonical="/terms-conditions"
      />
      <PageHero
        image={settings?.page_heroes?.terms || undefined}
        eyebrow="আইনগত"
        title="টার্মস অ্যান্ড কন্ডিশনস"
        subtitle="আমাদের ওয়েবসাইট ও সেবা ব্যবহারের পূর্বে অনুগ্রহ করে নিম্নোক্ত শর্তাবলী মনোযোগ সহকারে পড়ুন।"
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

            <section id="contact" className="scroll-mt-32 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">যোগাযোগ</h2>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" /><a href={`mailto:${site.email}`} className="hover:text-primary">{site.email}</a></li>
                <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" /><a href={`tel:${site.phone}`} dir="ltr" className="hover:text-primary">{site.phone}</a></li>
                <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" /><span>{site.address}</span></li>
              </ul>
            </section>
          </article>
        </div>
      </section>
    </SiteLayout>
  );
};

export default TermsConditions;
