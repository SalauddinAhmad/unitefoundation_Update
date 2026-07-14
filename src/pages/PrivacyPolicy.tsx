import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import heroImg from "@/assets/hero-mosque.jpg";
import { site } from "@/data/site";
import { Shield, Lock, FileText, UserCheck, Mail, Phone, MapPin, Cookie, Database, Share2, AlertTriangle, RefreshCw } from "lucide-react";

const lastUpdated = "১৪ জুলাই, ২০২৬";

const sections = [
  {
    id: "intro",
    icon: Shield,
    title: "ভূমিকা",
    body: (
      <>
        <p>
          {site.name} ("আমরা", "আমাদের", "সংস্থা") আপনার গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ। এই প্রাইভেসি
          পলিসিতে ব্যাখ্যা করা হয়েছে — আমরা আমাদের ওয়েবসাইট{" "}
          <a href={site.website} className="text-primary underline" target="_blank" rel="noopener noreferrer">
            {site.website}
          </a>{" "}
          এবং সংশ্লিষ্ট সেবাসমূহের মাধ্যমে কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ ও সুরক্ষা করি।
        </p>
        <p>
          আমাদের সেবা ব্যবহার করে আপনি এই নীতিমালার সাথে সম্মত হচ্ছেন। অনুগ্রহ করে সম্পূর্ণ পলিসি
          মনোযোগ সহকারে পড়ুন।
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    icon: Database,
    title: "আমরা যে তথ্য সংগ্রহ করি",
    body: (
      <>
        <p>আপনি যখন আমাদের সাথে যোগাযোগ করেন, দান করেন, স্বেচ্ছাসেবক হিসেবে যুক্ত হন, বা ফর্ম পূরণ করেন — তখন আমরা নিম্নলিখিত তথ্য সংগ্রহ করতে পারি:</p>
        <ul className="list-disc pr-6 space-y-2 mt-3">
          <li><strong>ব্যক্তিগত পরিচয়:</strong> নাম, ইমেইল, মোবাইল নম্বর, ঠিকানা।</li>
          <li><strong>দান সংক্রান্ত তথ্য:</strong> পেমেন্ট মাধ্যম (বিকাশ/নগদ/ব্যাংক ট্রান্সফার), লেনদেন নম্বর, দানের পরিমাণ ও উদ্দেশ্য।</li>
          <li><strong>স্বেচ্ছাসেবক/সদস্যপদ তথ্য:</strong> পেশা, দক্ষতা, অভিজ্ঞতা, ছবি (যদি আপলোড করেন)।</li>
          <li><strong>যোগাযোগ:</strong> মেসেজ, ফিডব্যাক, ইমেইল যোগাযোগের বিষয়বস্তু।</li>
          <li><strong>প্রযুক্তিগত তথ্য:</strong> IP address, ব্রাউজার টাইপ, ডিভাইস তথ্য, পেজ ভিজিটের সময়।</li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          <strong>দ্রষ্টব্য:</strong> আমরা কখনোই আপনার পাসওয়ার্ড, পূর্ণ কার্ড নম্বর বা OTP সংরক্ষণ করি না।
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    icon: UserCheck,
    title: "তথ্য কীভাবে ব্যবহার করি",
    body: (
      <>
        <ul className="list-disc pr-6 space-y-2">
          <li>দান গ্রহণ, রসিদ প্রদান ও অ্যামানত সঠিক প্রকল্পে পৌঁছে দেওয়ার জন্য।</li>
          <li>আপনার প্রশ্ন/মেসেজের উত্তর দিতে ও প্রয়োজনীয় যোগাযোগ রক্ষা করতে।</li>
          <li>স্বেচ্ছাসেবক ও সদস্যপদ প্রক্রিয়া পরিচালনায়।</li>
          <li>সেবার মান উন্নয়ন, নিরাপত্তা যাচাই ও প্রতারণা প্রতিরোধে।</li>
          <li>আইনি বাধ্যবাধকতা পূরণে (যেমন সরকারি নিরীক্ষা, কর সংক্রান্ত রিপোর্ট)।</li>
          <li>আপনার সম্মতি সাপেক্ষে প্রকল্পের আপডেট ও নিউজলেটার প্রেরণে।</li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    icon: Share2,
    title: "তৃতীয় পক্ষের সাথে তথ্য শেয়ার",
    body: (
      <>
        <p>আমরা আপনার ব্যক্তিগত তথ্য <strong>বিক্রি করি না</strong>। শুধুমাত্র নিম্নলিখিত ক্ষেত্রে শেয়ার হতে পারে:</p>
        <ul className="list-disc pr-6 space-y-2 mt-3">
          <li><strong>পেমেন্ট প্রসেসর:</strong> বিকাশ, নগদ, ইসলামী ব্যাংক ইত্যাদি (শুধুমাত্র লেনদেন সম্পাদনের জন্য)।</li>
          <li><strong>সেবা প্রদানকারী:</strong> হোস্টিং, ইমেইল ডেলিভারি (SMTP), অ্যানালিটিক্স — যারা আমাদের গোপনীয়তা চুক্তিতে আবদ্ধ।</li>
          <li><strong>আইনি প্রয়োজনে:</strong> আদালত বা সরকারি সংস্থার বৈধ আদেশ পালনে।</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "কুকিজ ও ট্র্যাকিং",
    body: (
      <>
        <p>
          আমাদের ওয়েবসাইট সীমিত পরিসরে <strong>কুকিজ</strong> ব্যবহার করে — মূলত সেশন পরিচালনা, ভাষার
          পছন্দ সংরক্ষণ এবং ভিজিটর পরিসংখ্যানের জন্য। আপনি ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকিজ
          নিষ্ক্রিয় করতে পারেন, তবে এতে কিছু ফিচার সঠিকভাবে কাজ নাও করতে পারে।
        </p>
      </>
    ),
  },
  {
    id: "security",
    icon: Lock,
    title: "তথ্য নিরাপত্তা",
    body: (
      <>
        <ul className="list-disc pr-6 space-y-2">
          <li>সম্পূর্ণ ওয়েবসাইট <strong>HTTPS (SSL)</strong> এনক্রিপশনে সুরক্ষিত।</li>
          <li>পাসওয়ার্ড <strong>bcrypt hashing</strong> দ্বারা সংরক্ষিত — কেউ পড়তে পারে না।</li>
          <li>Admin dashboard-এ <strong>রোল-ভিত্তিক অ্যাক্সেস কন্ট্রোল (RBAC)</strong> সক্রিয়।</li>
          <li>প্রতিটি সংবেদনশীল কাজ <strong>Activity Log</strong>-এ রেকর্ড হয়।</li>
          <li>Rate limiting ও ব্রুট-ফোর্স প্রোটেকশন সক্রিয়।</li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          তবে ইন্টারনেটে কোনো ট্রান্সমিশনই ১০০% ঝুঁকিমুক্ত নয়। আমরা যথাসাধ্য নিরাপত্তা নিশ্চিত করি।
        </p>
      </>
    ),
  },
  {
    id: "retention",
    icon: FileText,
    title: "তথ্য সংরক্ষণের মেয়াদ",
    body: (
      <p>
        দান ও আর্থিক তথ্য কর/অডিট নীতিমালা অনুযায়ী কমপক্ষে <strong>৭ বছর</strong> সংরক্ষণ করা হয়। যোগাযোগের
        তথ্য উদ্দেশ্য পূরণের পর মুছে ফেলা হয় বা অজ্ঞাতনামা করা হয়। আপনি যেকোনো সময় নিজের তথ্য
        মুছে ফেলার অনুরোধ করতে পারেন।
      </p>
    ),
  },
  {
    id: "rights",
    icon: UserCheck,
    title: "আপনার অধিকার",
    body: (
      <ul className="list-disc pr-6 space-y-2">
        <li>নিজের সংরক্ষিত তথ্য দেখার অধিকার।</li>
        <li>ভুল তথ্য সংশোধনের অধিকার।</li>
        <li>তথ্য মুছে ফেলার (Right to be forgotten) অনুরোধের অধিকার।</li>
        <li>মার্কেটিং যোগাযোগ থেকে যেকোনো সময় unsubscribe করার অধিকার।</li>
        <li>অভিযোগ দাখিলের অধিকার।</li>
      </ul>
    ),
  },
  {
    id: "children",
    icon: AlertTriangle,
    title: "শিশুদের গোপনীয়তা",
    body: (
      <p>
        আমাদের সেবা <strong>১৩ বছরের নিচে</strong> শিশুদের জন্য নয়। যদি আমরা জানতে পারি অভিভাবকের
        সম্মতি ছাড়া কোনো শিশুর তথ্য সংগ্রহ হয়েছে, তা অবিলম্বে মুছে ফেলা হবে।
      </p>
    ),
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "নীতিমালা পরিবর্তন",
    body: (
      <p>
        এই প্রাইভেসি পলিসি সময়ে সময়ে আপডেট হতে পারে। উল্লেখযোগ্য পরিবর্তন হলে ওয়েবসাইটে
        নোটিশ প্রকাশ করা হবে। সর্বশেষ হালনাগাদের তারিখ পৃষ্ঠার শীর্ষে দেখানো হয়।
      </p>
    ),
  },
];

const PrivacyPolicy = () => {
  return (
    <SiteLayout>
      <Seo
        title={`প্রাইভেসি পলিসি | ${site.name}`}
        description={`${site.name}-এর গোপনীয়তা নীতিমালা — আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করি তার বিস্তারিত বিবরণ।`}
        canonical="/privacy-policy"
      />
      <PageHero
        image={heroImg}
        eyebrow="আইনগত"
        title="প্রাইভেসি পলিসি"
        subtitle="আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। এই পৃষ্ঠায় আমাদের তথ্য সংগ্রহ ও ব্যবহারের বিস্তারিত নীতিমালা তুলে ধরা হয়েছে।"
      />

      <section className="container-page py-14 md:py-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[260px,1fr] gap-10">
          {/* TOC */}
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

          {/* Content */}
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

            {/* Contact block */}
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
