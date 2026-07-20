import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { useSettings } from "@/hooks/api/useDashboardData";

import { site } from "@/data/site";
import { Shield, Lock, FileText, UserCheck, Mail, Phone, MapPin, Database, Share2, RefreshCw } from "lucide-react";

const lastUpdated = "২০ জুলাই, ২০২৬";

const sections = [
  {
    id: "articulation",
    icon: Shield,
    title: "গোপনীয়তার প্রতিশ্রুতি",
    body: (
      <>
        <p>
          {site.name} আপনার গোপনীয়তা রক্ষায় দৃঢ়প্রতিজ্ঞ। এই Statement of Privacy {site.name}-এর
          ওয়েবসাইট{" "}
          <a href={site.website} className="text-primary underline" target="_blank" rel="noopener noreferrer">
            {site.website}
          </a>{" "}
          এবং সংশ্লিষ্ট সকল সেবার ক্ষেত্রে প্রযোজ্য — এটি অন্য কোনো অনলাইন বা অফলাইন সাইট,
          পণ্য বা সেবার ক্ষেত্রে প্রযোজ্য নয়। অনুগ্রহ করে {site.name}-এর সম্পূর্ণ Statement of
          Privacy মনোযোগ সহকারে পড়ুন। {site.name} একটি সাধারণ দর্শক-দর্শনার্থীর ওয়েবসাইট, যা
          সকল শ্রেণির ব্যবহারকারীর জন্য উন্মুক্ত। সকল ব্যবহারকারীর ব্যক্তিগত তথ্য এই Statement
          of Privacy অনুযায়ী সংগ্রহ, ব্যবহার ও প্রকাশ করা হয়।
        </p>
      </>
    ),
  },
  {
    id: "collection",
    icon: Database,
    title: "ব্যক্তিগত তথ্য সংগ্রহ",
    body: (
      <>
        <p>
          একটি অলাভজনক ও দাতব্য প্ল্যাটফর্ম হিসেবে {site.name} আপনার ই-মেইল ঠিকানা, নাম,
          বাসা/অফিসের ঠিকানা বা ফোন নম্বরের মতো ব্যক্তিগত তথ্য সংগ্রহ করে। সংগৃহীত তথ্য
          মূলত দান/সদাকা গ্রহণ, প্রকল্প-ভিত্তিক কার্যক্রম পরিচালনা ও যোগাযোগের কাজে ব্যবহার
          করা হয়। {site.name} আপনার কম্পিউটার হার্ডওয়্যার বা সফটওয়্যার সংক্রান্ত কোনো তথ্য
          সংগ্রহ করে না।
        </p>
        <p>
          {site.name} আপনাকে অনুরোধ করছে — আমাদের সাইট থেকে যেসব বাহ্যিক সাইটে আপনি যান,
          সেগুলোর নিজস্ব গোপনীয়তা নীতিমালা পড়ে নিন। বাহ্যিক সাইটের কনটেন্ট বা গোপনীয়তা
          নীতির জন্য {site.name} দায়ী নয়।
        </p>
      </>
    ),
  },
  {
    id: "use",
    icon: UserCheck,
    title: "ব্যক্তিগত তথ্য ব্যবহার",
    body: (
      <>
        <p>
          {site.name} ও এর operational partner-রা আপনার প্রদত্ত ব্যক্তিগত তথ্য ব্যবহার করে —
          দান/সদাকা প্রক্রিয়া সম্পন্ন করতে এবং বিভিন্ন কার্যক্রম/অনুষ্ঠানের বিল প্রক্রিয়াকরণে।
          সময়ে সময়ে {site.name} আপনার তথ্য ব্যবহার করে অন্যান্য প্রকল্প, সেবা বা কার্যক্রম
          সম্পর্কে আপনাকে অবহিত করতে পারে। বিদ্যমান বা প্রস্তাবিত সেবার মান উন্নয়নে গবেষণার
          স্বার্থে আমরা survey-এর মাধ্যমে আপনার মতামত সংগ্রহ করতে পারি।
        </p>
        <p>
          {site.name} কখনোই তার ব্যবহারকারীদের তথ্য <strong>বিক্রি, ভাড়া বা ইজারা</strong> দেয় না।
          কখনো কখনো আমরা বহিরাগত সহযোগীদের পক্ষ থেকে বিশেষ কোনো বিষয়ে আপনার সাথে যোগাযোগ
          করতে পারি — এসব ক্ষেত্রেও আপনার ব্যক্তিগত তথ্য (নাম, ই-মেইল, ঠিকানা, ফোন) সেই তৃতীয়
          পক্ষকে হস্তান্তর করা হয় না।
        </p>
        <p>
          কখনো কখনো আমরা সীমিত পরিসরে কিছু সেবা (যেমন — mailing delivery, customer care, transaction
          processing, statistical analysis) সম্পন্ন করতে অন্য প্রতিষ্ঠানকে নিয়োগ করি। শুধুমাত্র
          সেবা সম্পাদনের জন্য প্রয়োজনীয় তথ্যই তাদের কাছে সরবরাহ করা হয় এবং তারা সেই তথ্যের
          গোপনীয়তা রক্ষায় বাধ্য থাকে।
        </p>
        <p>
          {site.name} আপনার স্পষ্ট সম্মতি ব্যতীত সংবেদনশীল ব্যক্তিগত তথ্য (যেমন — জাতি,
          রাজনৈতিক পরিচয়) প্রকাশ বা ব্যবহার করে না।
        </p>
        <p>নিম্নলিখিত অবস্থায় আইনি প্রয়োজনে আপনার তথ্য প্রকাশ করা হতে পারে:</p>
        <ul className="list-disc pr-6 space-y-2">
          <li>আদালতের আদেশ বা আইন প্রয়োগকারী সংস্থার বৈধ নির্দেশ পালনে।</li>
          <li>{site.name}-এর অধিকার বা সম্পত্তি সুরক্ষার প্রয়োজনে।</li>
          <li>ব্যবহারকারী বা জনসাধারণের ব্যক্তিগত নিরাপত্তা নিশ্চিতে জরুরি অবস্থায়।</li>
        </ul>
        <p>
          এই সাইটে সংগৃহীত ব্যক্তিগত তথ্য বাংলাদেশ বা {site.name}-এর কার্যক্রম রয়েছে এমন অন্য যেকোনো
          দেশে সংরক্ষণ ও প্রক্রিয়াকরণ করা হতে পারে। এই সাইট ব্যবহার করে আপনি এমন হস্তান্তরে
          সম্মতি প্রদান করছেন।
        </p>
      </>
    ),
  },
  {
    id: "control",
    icon: Share2,
    title: "নিজের তথ্যের নিয়ন্ত্রণ",
    body: (
      <>
        <p>
          {site.name} তার ব্যবহারকারীদেরকে ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার ও শেয়ার সংক্রান্ত
          পছন্দ প্রকাশের সুযোগ দেয়। আপনি আপনার পছন্দ জানাতে চাইলে{" "}
          <a href={`mailto:${site.email}`} className="text-primary underline">{site.email}</a>{" "}
          ঠিকানায় ই-মেইল করতে পারেন। অনুগ্রহ করে যথাযথ শনাক্তকরণের জন্য সম্পূর্ণ তথ্য উল্লেখ
          করুন।
        </p>
        <p>
          {site.name} থেকে পাঠানো যেকোনো প্রচারমূলক ই-মেইলের জবাবে "unsubscribe" অনুরোধ
          পাঠিয়ে ভবিষ্যতে এই ধরনের ই-মেইল প্রাপ্তি বন্ধ করতে পারেন।
        </p>
      </>
    ),
  },
  {
    id: "security",
    icon: Lock,
    title: "তথ্যের নিরাপত্তা",
    body: (
      <>
        <p>
          {site.name} আপনার ব্যক্তিগত তথ্যের নিরাপত্তা রক্ষায় প্রতিশ্রুতিবদ্ধ। অননুমোদিত
          অ্যাক্সেস, ব্যবহার বা প্রকাশ থেকে তথ্যকে সুরক্ষা দিতে আমরা বিভিন্ন নিরাপত্তা প্রযুক্তি
          ও পদ্ধতি ব্যবহার করি। আপনার প্রদত্ত তথ্য নিয়ন্ত্রিত ও সীমিত-এক্সেস সমৃদ্ধ কম্পিউটার
          সিস্টেমে সংরক্ষণ করা হয়। যখন কোনো সংবেদনশীল তথ্য (যেমন — কার্ড নম্বর) ইন্টারনেটের
          মাধ্যমে transmit করা হয়, তখন আমরা <strong>SSLCommerz</strong>-এর মতো নিরাপদ পেমেন্ট
          gateway ব্যবহার করি — ফলে আপনার তথ্য সুরক্ষিত থাকে।
        </p>
      </>
    ),
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "Statement পরিবর্তন",
    body: (
      <p>
        {site.name} সময়ে সময়ে সাংগঠনিক প্রয়োজন ও ব্যবহারকারীর মতামতের ভিত্তিতে এই Statement
        of Privacy আপডেট করতে পারে। উল্লেখযোগ্য পরিবর্তন হলে বাস্তবায়নের পূর্বে
        ওয়েবসাইটে দৃশ্যমানভাবে তা প্রকাশ করা হবে। {site.name} কীভাবে আপনার তথ্য সুরক্ষা দিচ্ছে
        সে বিষয়ে অবগত থাকতে সময়ে সময়ে এই Statement পুনরায় পড়ার অনুরোধ রইল।
      </p>
    ),
  },
];

const PrivacyPolicy = () => {
  const { data: settings } = useSettings();
  return (
    <SiteLayout>
      <Seo
        title={`প্রাইভেসি পলিসি | ${site.name}`}
        description={`${site.name}-এর গোপনীয়তা নীতিমালা — আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করি তার বিস্তারিত বিবরণ।`}
        canonical="/privacy-policy"
      />
      <PageHero
        image={settings?.page_heroes?.privacy || undefined}
        eyebrow="আইনগত"
        title="প্রাইভেসি পলিসি"
        subtitle="আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। এই পৃষ্ঠায় আমাদের তথ্য সংগ্রহ ও ব্যবহারের বিস্তারিত নীতিমালা তুলে ধরা হয়েছে।"
      />

      <section className="container-page py-14 md:py-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[260px,1fr] gap-10">
          <aside className="lg:sticky lg:top-32 h-fit">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                সূচিপত্র
              </div>
              <nav className="space-y-1.5 text-sm">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block px-3 py-2 rounded-lg text-foreground/75 hover:text-primary hover:bg-accent transition-colors"
                  >
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
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-32 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card"
                >
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

            <section
              id="contact"
              className="scroll-mt-32 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">যোগাযোগ</h2>
              </div>
              <p className="text-foreground/85 mb-5">
                গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্ন, অনুরোধ বা অভিযোগের জন্য আমাদের সাথে যোগাযোগ করুন:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <a href={`mailto:${site.email}`} className="hover:text-primary">{site.email}</a>
                </li>
                <li className="flex gap-3">
                  <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <a href={`tel:${site.phone}`} dir="ltr" className="hover:text-primary">{site.phone}</a>
                </li>
                <li className="flex gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>{site.address}</span>
                </li>
              </ul>
            </section>
          </article>
        </div>
      </section>
    </SiteLayout>
  );
};

export default PrivacyPolicy;
