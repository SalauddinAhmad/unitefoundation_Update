import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { useSettings } from "@/hooks/api/useDashboardData";
import { site } from "@/data/site";
import { FileText, Mail, Phone, MapPin, ShieldCheck, Copyright, Lock, KeyRound, UserCheck, RefreshCw, Scale, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const lastUpdated = "২০ জুলাই, ২০২৬";

const sections = [
  {
    id: "terms-of-use",
    icon: FileText,
    title: "ব্যবহারের শর্তাবলী",
    body: (
      <p>
        {site.name}-এর ওয়েবসাইট{" "}
        <a href={site.website} className="text-primary underline" target="_blank" rel="noopener noreferrer">
          {site.website}
        </a>{" "}
        ভিজিট করার মাধ্যমে আপনি আমাদের ব্যবহার-শর্তাবলীতে সম্মত হচ্ছেন। অনুগ্রহ করে এই
        শর্তাবলী মনোযোগ সহকারে পড়ে নেওয়ার অনুরোধ রইল।
      </p>
    ),
  },
  {
    id: "trademark",
    icon: ShieldCheck,
    title: "ট্রেডমার্ক",
    body: (
      <p>
        {site.name} এবং এই সাইটে উল্লেখিত অন্যান্য চিহ্ন/লোগো সম্পূর্ণরূপে {site.name}-এর
        মালিকানাধীন ট্রেডমার্ক। {site.name}-এর অনুমতি ব্যতীত এমন কোনো পণ্য বা সেবার জন্য
        এই ট্রেডমার্ক ব্যবহার করা যাবে না, যা বিভ্রান্তি সৃষ্টি করতে পারে বা প্রতিষ্ঠানের
        সুনাম ক্ষুণ্ন করতে পারে।
      </p>
    ),
  },
  {
    id: "copyright",
    icon: Copyright,
    title: "কপিরাইট",
    body: (
      <p>
        এই ওয়েবসাইটে প্রদর্শিত সকল উপাদান — লেখা, গ্রাফিক্স, লোগো, আইকন, ছবি, অডিও-ভিডিও
        ক্লিপ, ডিজিটাল ডাউনলোড ও সফটওয়্যার — {site.name}-এর একক সম্পত্তি। এই উপাদানগুলো
        বাংলাদেশি ও আন্তর্জাতিক কপিরাইট আইন দ্বারা সুরক্ষিত। অননুমোদিত ব্যবহার, অনুলিপি বা
        বিতরণের ক্ষেত্রে {site.name} প্রয়োজনীয় আইনি ব্যবস্থা গ্রহণের অধিকার সংরক্ষণ করে।
      </p>
    ),
  },
  {
    id: "account-security",
    icon: Lock,
    title: "অ্যাকাউন্টের নিরাপত্তা",
    body: (
      <p>
        ওয়েবসাইটের নির্দিষ্ট কিছু সেবা ব্যবহার করতে ব্যবহারকারীকে অ্যাকাউন্ট তৈরি করতে হতে
        পারে। ইউজারনেম, পাসওয়ার্ডসহ অ্যাকাউন্টের গোপনীয়তা রক্ষার সম্পূর্ণ দায়িত্ব
        ব্যবহারকারীর নিজের। অ্যাকাউন্টের মাধ্যমে সম্পাদিত সকল কার্যকলাপের জন্য ব্যবহারকারী
        দায়ী থাকবেন।
      </p>
    ),
  },
  {
    id: "license",
    icon: KeyRound,
    title: "লাইসেন্স ও অ্যাক্সেস",
    body: (
      <p>
        {site.name} আপনাকে এই ওয়েবসাইট ব্যবহারের একটি সীমিত ও অ-হস্তান্তরযোগ্য অনুমতি
        প্রদান করে। {site.name}-এর পূর্ব অনুমতি ব্যতীত ওয়েবসাইটের কোনো উপাদান বাণিজ্যিক
        উদ্দেশ্যে ডাউনলোড (পেজ ক্যাশিং ব্যতীত), পরিবর্তন, পুনরুৎপাদন বা ব্যবহার সম্পূর্ণরূপে
        নিষিদ্ধ। এর মধ্যে meta tag বা hidden text-এ {site.name}-এর নাম ব্যবহারও অন্তর্ভুক্ত।
        এই নিয়ম লঙ্ঘন হলে ওয়েবসাইট ব্যবহারের অনুমতি তাৎক্ষণিকভাবে বাতিল হয়ে যাবে।
      </p>
    ),
  },
  {
    id: "user-content",
    icon: MessageSquare,
    title: "ব্যবহারকারীর কনটেন্ট",
    body: (
      <p>
        আপনি ওয়েবসাইটে কোনো কনটেন্ট (যেমন — মতামত, ভিডিও বা স্থিরচিত্র) submit করলে সেটির
        মালিকানা আপনারই থাকবে। তবে submit করার মাধ্যমে আপনি {site.name} ও এর অনুমোদিত
        সহযোগীদেরকে সেই কনটেন্ট ব্যবহারের একটি royalty-free, স্থায়ী ও অপরিবর্তনীয় লাইসেন্স
        প্রদান করছেন। submitted তথ্য বা কনটেন্টের সঠিকতা ও আইনি বৈধতা নিশ্চিত করার সম্পূর্ণ
        দায়িত্ব আপনার। জনস্বার্থ বা নীতিগত প্রয়োজনে {site.name} যেকোনো সময় যেকোনো কনটেন্ট
        সরিয়ে ফেলার অধিকার সংরক্ষণ করে।
      </p>
    ),
  },
  {
    id: "refund",
    icon: UserCheck,
    title: "রিফান্ড নীতি",
    body: (
      <>
        <p>দাতা যদি প্রদত্ত দান ফেরত পেতে চান, তাহলে নিম্নলিখিত শর্ত প্রযোজ্য হবে:</p>
        <ul className="list-disc pr-6 space-y-2">
          <li>
            <strong>সাধারণ দান:</strong> দান প্রদানের <strong>৭-১০ কর্মদিবসের</strong> মধ্যে
            যথাযথ প্রমাণসহ আবেদন করতে হবে। তবে এই সময়ের মধ্যে যদি অর্থ ইতোমধ্যে কোনো
            নির্দিষ্ট প্রকল্পে ব্যয় হয়ে যায়, তা আর ফেরতযোগ্য হবে না।
          </li>
          <li>
            <strong>কুরবানি/মৌসুমি দান:</strong> সংশ্লিষ্ট কার্যক্রম শুরুর অন্তত{" "}
            <strong>৭ দিন পূর্বে</strong> রিফান্ড আবেদন করতে হবে। এর পরের আবেদন গ্রহণযোগ্য
            হবে না।
          </li>
          <li>
            <strong>আবেদন প্রক্রিয়া:</strong> রিফান্ড পেতে নির্দিষ্ট কারণ ও লেনদেন-আইডি
            (Transaction ID) উল্লেখ করে আবেদন করতে হবে।
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          বিস্তারিত জানতে দেখুন —{" "}
          <Link to="/refund-policy" className="text-primary underline">
            রিফান্ড পলিসি
          </Link>
          ।
        </p>
      </>
    ),
  },
  {
    id: "law",
    icon: Scale,
    title: "প্রযোজ্য আইন",
    body: (
      <p>
        এই ওয়েবসাইট ব্যবহার করে আপনি স্বীকার করছেন যে, এই ব্যবহার-শর্তাবলী ও এর থেকে
        উদ্ভূত যেকোনো বিরোধ গণপ্রজাতন্ত্রী বাংলাদেশের প্রচলিত আইন অনুযায়ী নিষ্পত্তি হবে।
      </p>
    ),
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "নীতিমালা পরিবর্তন",
    body: (
      <p>
        {site.name} যেকোনো সময় এই শর্তাবলী ও নীতিমালা পরিবর্তন, সংশোধন বা পরিমার্জন করার
        অধিকার সংরক্ষণ করে। এই পরিবর্তনগুলো পূর্ববর্তী শর্তাবলীর অধীনে সংঘটিত কোনো লঙ্ঘনের
        ক্ষেত্রে প্রযোজ্য হবে না।
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
