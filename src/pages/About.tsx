import { CheckCircle2, Heart, Target, Eye, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import about from "@/assets/about-mission.jpg";
import t1 from "@/assets/team-1.jpg";
import t2 from "@/assets/team-2.jpg";
import t3 from "@/assets/team-3.jpg";

const values = [
  { icon: Heart, t: "অহিভিত্তিক জীবন", d: "কুরআন ও সহীহ হাদীছের আলোকে জীবন গঠনে নিবেদিত।" },
  { icon: CheckCircle2, t: "স্বচ্ছতা", d: "প্রতিটি টাকার সম্পূর্ণ ও প্রকাশ্য হিসাব।" },
  { icon: Target, t: "প্রভাব", d: "দাওয়াহ, তালীম ও সমাজকল্যাণে মাপযোগ্য ফলাফল।" },
  { icon: Users, t: "অংশগ্রহণ", d: "দাতা, স্বেচ্ছাসেবক ও সুবিধাভোগীর যৌথ যাত্রা।" },
];

const team = [
  { img: t1, name: "মাওলানা আবদুর রহমান", role: "প্রতিষ্ঠাতা ও চেয়ারম্যান" },
  { img: t2, name: "ড. ফারজানা আক্তার", role: "নির্বাহী পরিচালক" },
  { img: t3, name: "তানভীর আহমেদ", role: "অপারেশনস প্রধান" },
];

const milestones = [
  { y: "২০১১", t: "যাত্রা শুরু", d: "৫ জন স্বেচ্ছাসেবক নিয়ে ঢাকায় কার্যক্রম শুরু।" },
  { y: "২০১৪", t: "প্রথম এতিমখানা", d: "১২০ জন এতিম শিশুর স্থায়ী আবাসন চালু।" },
  { y: "২০১৭", t: "সরকারি নিবন্ধন", d: "সমাজসেবা অধিদপ্তর কর্তৃক স্বীকৃতি।" },
  { y: "২০২০", t: "করোনা সাড়া", d: "৫০,০০০ পরিবারে জরুরি ত্রাণ সহায়তা।" },
  { y: "২০২৩", t: "১০০তম নলকূপ", d: "উপকূলীয় এলাকায় বিশুদ্ধ পানির মাইলফলক।" },
  { y: "২০২৬", t: "১৫ বছর পূর্তি", d: "২.৫ লক্ষ মানুষের জীবনে পরিবর্তন।" },
];

const About = () => (
  <SiteLayout>
    <Seo title="আমাদের সম্পর্কে | ইউনাইট ফাউন্ডেশন" description="ইউনাইট ফাউন্ডেশনের যাত্রা, লক্ষ্য, মূল্যবোধ ও টিম।" canonical="/about" />

    <PageHero
      image={about}
      eyebrow="আমাদের সম্পর্কে"
      title="অহিভিত্তিক জীবন গড়ার দৃঢ় প্রত্যয়ে"
      subtitle="ইউনাইট ফাউন্ডেশন একটি অরাজনৈতিক ও অলাভজনক ইসলামিক প্ল্যাটফর্ম — কুরআন ও সহীহ হাদীছের আলোকে দাওয়াহ, তালীম ও সমাজকল্যাণে নিবেদিত।"
    />

    <section className="section-y">
      <div className="container-page grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-card overflow-hidden shadow-card">
          <img src={about} alt="স্বেচ্ছাসেবকদের কাজ" loading="lazy" width={1200} height={900} className="w-full h-auto" />
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-card bg-accent flex items-center justify-center text-primary"><Target className="h-5 w-5" /></div>
              <h2 className="text-2xl font-bold">আমাদের লক্ষ্য</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground leading-[1.85] text-sm">
              <li>• সকল মানুষের নিকট পবিত্র কুরআন ও সহীহ হাদীছের দাওয়াত পৌঁছানো।</li>
              <li>• তরুণ ও ছাত্র সমাজকে যোগ্য ও তাক্বওয়াশীল দাঈ ইলাল্লাহ হিসেবে গঠন করা।</li>
              <li>• বিশুদ্ধ আক্বীদা ও আমল সম্পর্কে সমাজে সচেতনতা সৃষ্টি করা।</li>
              <li>• ইসলামী শিক্ষা ও সংস্কৃতির নীতি প্রণয়ন ও বাস্তবায়ন।</li>
              <li>• ইসলামের বিভিন্ন বিষয়ে গ্রন্থ ও সটিক অনুবাদ প্রকাশ।</li>
              <li>• সমাজকল্যাণমূলক কার্যক্রম পরিচালনা।</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-card bg-accent flex items-center justify-center text-primary"><Eye className="h-5 w-5" /></div>
              <h2 className="text-2xl font-bold">আমাদের ভিশন</h2>
            </div>
            <p className="text-muted-foreground leading-[1.85]">
              মহান আল্লাহর সন্তুষ্টি অর্জন ও জান্নাতুল ফিরদাউস লাভের প্রত্যাশায় — এমন একটি
              সমাজ গড়ে তোলা, যেখানে কুরআন-সুন্নাহর আলোকে মানুষ সচেতনভাবে জীবনযাপন করবে এবং
              পারস্পরিক সহযোগিতার মাধ্যমে কেউ অভাবে কষ্ট পাবে না।
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="section-y bg-secondary/40">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">আমাদের মূল্যবোধ</span>
          <h2 className="heading-display mt-3">যে মূল্যবোধে আমরা পরিচালিত</h2>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v) => (
            <div key={v.t} className="card-base p-6 text-center">
              <div className="h-14 w-14 rounded-card gradient-donate-bg text-white flex items-center justify-center mx-auto"><v.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 font-bold text-lg">{v.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section-y">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">আমাদের যাত্রা</span>
          <h2 className="heading-display mt-3">মাইলফলকসমূহ</h2>
        </div>
        <div className="mt-12 relative max-w-3xl mx-auto">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" aria-hidden />
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <div key={m.y} className={`relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8 ${i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"}`}>
                <div className="absolute left-2.5 md:left-1/2 top-1.5 h-3 w-3 rounded-full gradient-donate-bg md:-translate-x-1/2 ring-4 ring-background" />
                <div className={`md:text-right ${i % 2 === 0 ? "" : "md:text-left"}`}>
                  <div className="font-en text-sm font-bold gradient-donate-text">{m.y}</div>
                  <h3 className="text-xl font-bold mt-1">{m.t}</h3>
                  <p className="text-muted-foreground text-sm mt-1.5">{m.d}</p>
                </div>
                <div />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="section-y bg-secondary/40">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">আমাদের টিম</span>
          <h2 className="heading-display mt-3">যারা এই যাত্রার নেতৃত্ব দিচ্ছেন</h2>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((m) => (
            <div key={m.name} className="card-base text-center p-6">
              <img src={m.img} alt={m.name} loading="lazy" width={400} height={400} className="h-32 w-32 rounded-full object-cover mx-auto" />
              <h3 className="mt-4 font-bold text-lg">{m.name}</h3>
              <p className="text-sm text-primary font-semibold mt-1">{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section-y">
      <div className="container-page">
        <div className="rounded-card gradient-donate-bg p-10 md:p-14 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold">আমাদের যাত্রায় অংশীদার হোন</h2>
          <p className="mt-3 text-white/90 max-w-xl mx-auto">আপনার একটি দান আমাদের পরবর্তী মাইলফলকের সূচনা হতে পারে।</p>
          <Link to="/donate" className="mt-6 inline-flex items-center gap-2 rounded-btn bg-white text-foreground font-bold px-6 py-3 hover:bg-white/90 transition-colors">
            <Heart className="h-5 w-5 text-donate-red" /> এখনই দান করুন
          </Link>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default About;
