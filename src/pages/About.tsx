import { CheckCircle2, Heart, Target, Eye, Users, Sparkles, Sprout, TreeDeciduous } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import about from "@/assets/about-mission.jpg";
import t1 from "@/assets/team-founder.jpg";
import t2 from "@/assets/team-2.jpg";
import t3 from "@/assets/team-3.jpg";

const values = [
  { icon: Heart, t: "সুন্নাহর অনুসরণে, মানবতার কল্যাণে", d: "কুরআন ও সহীহ হাদীছের আলোকে জীবন গঠনে নিবেদিত।" },
  { icon: CheckCircle2, t: "স্বচ্ছতা", d: "প্রতিটি টাকার সম্পূর্ণ ও প্রকাশ্য হিসাব।" },
  { icon: Target, t: "প্রভাব", d: "দাওয়াহ, তালীম ও সমাজকল্যাণে মাপযোগ্য ফলাফল।" },
  { icon: Users, t: "অংশগ্রহণ", d: "দাতা, স্বেচ্ছাসেবক ও সুবিধাভোগীর যৌথ যাত্রা।" },
];

const team = [
  { img: t1, name: "আবদুল্লাহ বিন এরশাদ", role: "প্রতিষ্ঠাতা ও চেয়ারম্যান" },
  { img: t2, name: "আবদুল্লাহ বিন এরশাদ", role: "নির্বাহী পরিচালক" },
  { img: t3, name: "তানভীর আহমেদ", role: "অপারেশনস প্রধান" },
];

const milestones: { y: string; t?: string; items: string[] }[] = [
  {
    y: "২০১৭",
    t: "যাত্রা শুরু",
    items: [
      "০৭ মার্চ ২০১৭ — মাত্র ১০ জন স্বেচ্ছাসেবক নিয়ে শিক্ষানগরী রাজশাহীর নওদাপাড়ায় ‘ইসলামিক রিসার্চ সেন্টার বাংলাদেশ’ নামে আনুষ্ঠানিক কার্যক্রমের শুভ সূচনা।",
      "মানবতার কল্যাণে অনলাইন ভিত্তিক মিডিয়া ‘ইউনাইট টিভি’-এর কার্যক্রম শুরু।",
    ],
  },
  {
    y: "২০১৭–২০১৮",
    t: "রোহিঙ্গা শরণার্থী সহায়তা",
    items: [
      "মিয়ানমার থেকে নির্যাতিত হয়ে বাংলাদেশে (বান্দরবান ও কক্সবাজার) আশ্রয় নেওয়া রোহিঙ্গা মুসলিমদের মাঝে প্রাথমিক খাদ্য, বস্ত্র ও আবাসন ব্যবস্থার সুনিপুণ আয়োজন।",
    ],
  },
  {
    y: "২০১৮",
    t: "নিজস্ব ঠিকানার সূচনা",
    items: ["রাজধানী ঢাকার উত্তরা-উত্তরখানে নিজস্ব অফিস ভবনের নির্মাণকাজ শুরু।"],
  },
  {
    y: "২০১৯",
    t: "ঈদ সামগ্রী বিতরণ",
    items: [
      "সুবিধাবঞ্চিত ইয়াতিম, বিধবা, গরিব, মিসকিন ও অসহায় মানুষদের মাঝে প্রতি ঈদে ‘ঈদ সামগ্রী বিতরণ’ কর্মসূচির সূচনা।",
    ],
  },
  {
    y: "২০২০",
    t: "সম্প্রসারণ ও নবরূপ",
    items: [
      "উত্তরা-উত্তরখানে নিজস্ব অফিস ভবনের নির্মাণকাজ সফলভাবে সমাপ্ত।",
      "প্রধান কার্যালয় রাজশাহী থেকে সফলভাবে রাজধানী ঢাকায় স্থানান্তর।",
      "সেবার পরিধি বাড়াতে সংগঠনের নাম পরিবর্তন করে ‘ইসলামিক ফেইথ অ্যান্ড ওয়েলফেয়ার ফাউন্ডেশন’ নামকরণ।",
    ],
  },
  {
    y: "২০২১",
    t: "মহামারীর পাশে",
    items: [
      "করোনা মহামারীর বৈশ্বিক সংকটে শত-শত কর্মহীন ও অসহায় পরিবারে জরুরি ত্রাণ সহায়তা প্রদান।",
    ],
  },
  {
    y: "২০২২",
    t: "ইউনাইট কনফারেন্স ও সাবলম্বীকরণ",
    items: [
      "ইউনাইট টিভির আয়োজনে ‘ইউনাইট কনফারেন্স’-এর শুভ সূচনা; যা প্রতি বছর পবিত্র রামাযান মাসে রাজধানী ঢাকায় সফলভাবে আয়োজিত হয়ে আসছে।",
      "সাবলম্বীকরণ প্রকল্প — নারীদের মাঝে উপকরণ হস্তান্তর।",
    ],
  },
  {
    y: "২০২৩",
    t: "দুর্যোগে পাশে, নতুন উদ্যোগ",
    items: [
      "দেশজুড়ে তীব্র শীতে অসহায় শীতার্তদের মাঝে উন্নতমানের শীতবস্ত্র বিতরণ কর্মসূচির সূচনা।",
      "বন্যা কবলিত এলাকায় জরুরি খাদ্য, বস্ত্র সরবরাহ এবং ক্ষতিগ্রস্ত বাসস্থানের পুনর্বাসন।",
      "‘আত-ত্বাইয়্যেবা ট্রাভেল এজেন্সি’ ও ‘আত-ত্বাইয়্যেবা প্রকাশনী’-এর কার্যক্রম শুরু।",
    ],
  },
  {
    y: "২০২৪",
    t: "ইউনাইট ফাউন্ডেশন",
    items: [
      "সংগঠনের নাম পুনর্নির্ধারণ করে চূড়ান্তভাবে ‘ইউনাইট ফাউন্ডেশন’ রূপান্তর ও নামকরণ।",
      "আন্তর্জাতিক অঙ্গনে সেবার পরিধি বিস্তৃত করে ফিলিস্তিনে নির্যাতিত মুসলিম ভাই-বোনদের মাঝে খাদ্য ও আবাসন সহযোগিতা কার্যক্রমের সূচনা।",
      "দেশজুড়ে বৃক্ষ রোপন কর্মসূচী শুরু।",
    ],
  },
  {
    y: "২০২৫",
    t: "কর্জে হাসানাহ ও ইফতার",
    items: [
      "সম্পূর্ণ সুদমুক্ত ও আত্মনির্ভরশীল সমাজ গঠনে ‘কর্জে হাসানাহ’ প্রজেক্টের পথচলা শুরু।",
      "পবিত্র রামাযান মাসব্যাপী অসহায় ও রোজাদারদের মাঝে ‘ইফতার বিতরণ’ কর্মসূচি শুরু।",
    ],
  },
  {
    y: "২০২৬",
    t: "নতুন দিগন্ত",
    items: [
      "অসহায় ও ইয়াতিম শিশুদের মাঝে নতুন বস্ত্র বিতরণ।",
      "পবিত্র ঈদুল আজহায় সুবিধাবঞ্চিতদের মাঝে ‘কুরবানী প্রজেক্ট’ সফলভাবে বাস্তবায়ন।",
      "বিধবা, ইয়াতিম ও দরিদ্র পরিবারের জন্য ‘আবাসন প্রকল্প’-এর শুভ সূচনা।",
      "দক্ষ জনশক্তি ও কর্মসংস্থান সৃষ্টির লক্ষ্যে ‘ইউনাইট ট্রেনিং সেন্টার’-এর কার্যক্রম শুরু।",
      "মানসম্মত শিক্ষার প্রসারে ‘ইউনাইট একাডেমি’-এর গৌরবময় ঘোষণা।",
    ],
  },
];

const About = () => (
  <SiteLayout>
    <Seo title="আমাদের সম্পর্কে | ইউনাইট ফাউন্ডেশন" description="ইউনাইট ফাউন্ডেশনের যাত্রা, লক্ষ্য, মূল্যবোধ ও টিম।" canonical="/about" />

    <PageHero
      image={about}
      eyebrow="আমাদের সম্পর্কে"
      title="সুন্নাহর অনুসরণে, মানবতার কল্যাণে"
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

    <section className="section-y relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background">
      {/* subtle Islamic pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, hsl(var(--primary)) 1px, transparent 1px), radial-gradient(circle at 75% 75%, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="container-page relative">
        <div className="text-center max-w-3xl mx-auto">
          <span className="eyebrow inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> আমাদের যাত্রা</span>
          <h2 className="heading-display mt-3">মাইলফলকসমূহ</h2>
          <p className="mt-5 text-muted-foreground leading-[1.95]">
            ইউনাইট ফাউন্ডেশন-এর পথচলা শুরু হয়েছিল একটি সুন্দর স্বপ্ন ও মানবতার কল্যাণে
            কিছু করার দৃঢ় প্রত্যয় নিয়ে। ২০১৭ সালের ক্ষুদ্র সেই সূচনা আজ এক বিশাল মানবিক
            মহীরুহে পরিণত হয়েছে। নিচে আমাদের উল্লেখযোগ্য মাইলফলকগুলো তুলে ধরা হলো —
          </p>
        </div>

        <div className="mt-16 relative max-w-5xl mx-auto">
          {/* central vertical line with gradient */}
          <div
            className="absolute left-5 md:left-1/2 top-0 bottom-0 w-[2px] md:-translate-x-1/2"
            aria-hidden
            style={{
              background:
                "linear-gradient(to bottom, transparent, hsl(var(--primary)/0.5) 6%, hsl(var(--primary)/0.5) 94%, transparent)",
            }}
          />
          {/* start marker (sprout) */}
          <div className="absolute left-5 md:left-1/2 -top-4 md:-translate-x-1/2 h-9 w-9 rounded-full gradient-donate-bg text-white flex items-center justify-center shadow-card ring-4 ring-background z-10">
            <Sprout className="h-4 w-4" />
          </div>

          <div className="space-y-12 pt-12 pb-8">
            {milestones.map((m, i) => {
              const right = i % 2 === 1;
              return (
                <div key={m.y} className="relative pl-14 md:pl-0 md:grid md:grid-cols-2 md:gap-10 md:items-center">
                  {/* connector dot */}
                  <div
                    className="absolute left-5 md:left-1/2 top-6 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 h-4 w-4 rounded-full gradient-donate-bg ring-4 ring-background z-10"
                    style={{ boxShadow: "0 0 0 6px hsl(var(--primary) / 0.08)" }}
                    aria-hidden
                  />

                  {/* Year label */}
                  <div className={`${right ? "md:order-2 md:text-left md:pl-6" : "md:text-right md:pr-6"}`}>
                    <div className="inline-flex flex-col">
                      <span className="font-en text-3xl md:text-5xl font-extrabold gradient-donate-text leading-none tracking-tight">
                        {m.y}
                      </span>
                      {m.t && (
                        <span className="mt-2 text-sm md:text-base font-semibold text-foreground/80">
                          {m.t}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`mt-3 md:mt-0 ${right ? "md:order-1 md:pr-6" : "md:pl-6"}`}>
                    <div className="group relative rounded-card border border-border bg-card p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all">
                      {/* accent bar */}
                      <div
                        className={`absolute top-4 bottom-4 w-1 rounded-full gradient-donate-bg opacity-70 ${
                          right ? "left-0" : "right-0"
                        }`}
                        aria-hidden
                      />
                      <ul className="space-y-2.5">
                        {m.items.map((it, k) => (
                          <li key={k} className="flex items-start gap-2.5 text-sm md:text-[15px] leading-[1.75] text-foreground/85">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full gradient-donate-bg shrink-0" aria-hidden />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* end marker (tree) */}
          <div className="absolute left-5 md:left-1/2 md:-translate-x-1/2 -bottom-4 h-11 w-11 rounded-full gradient-donate-bg text-white flex items-center justify-center shadow-card-hover ring-4 ring-background z-10">
            <TreeDeciduous className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-20 max-w-3xl mx-auto text-center">
          <div className="rounded-card border border-donate-highlight/30 bg-card p-8 md:p-10 shadow-card">
            <p className="text-base md:text-lg leading-[1.95] text-foreground italic">
              ২০১৭ সালে মাত্র ১০ জন স্বেচ্ছাসেবক নিয়ে যে ছোট চারাগাছটি রোপণ করা হয়েছিল,
              ২০২৬ সালে এসে সেটি অসংখ্য মানুষের সেবার এক বিশাল{" "}
              <span className="gradient-donate-text font-bold not-italic">‘মহীরুহে’</span> পরিণত হয়েছে।
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="relative section-y overflow-hidden bg-[#0C2B1D] text-white">
      {/* Layered decorative background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 60%, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px, 72px 72px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, transparent 46%, #ffffff 47%, #ffffff 53%, transparent 54%), linear-gradient(45deg, transparent 46%, #ffffff 47%, #ffffff 53%, transparent 54%)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="pointer-events-none absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-donate-red/15 blur-3xl" />

      {/* Huge editorial watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 select-none font-en text-[16rem] md:text-[22rem] font-black leading-none tracking-tighter text-white/[0.03]"
      >
        Founder
      </div>

      <div className="container-page relative">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.28em] uppercase text-amber-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Est. 2017 · প্রতিষ্ঠাতা
          </span>
          <h2 className="mt-5 text-4xl md:text-6xl font-extrabold leading-[1.05]">
            প্রতিষ্ঠাতা ও{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-donate-orange bg-clip-text text-transparent">
              চেয়ারম্যান
            </span>
          </h2>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-300/70" />
            <span className="h-2 w-2 rotate-45 bg-amber-300" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-300/70" />
          </div>
        </div>

        {/* Editorial card */}
        <div className="relative mt-16 mx-auto max-w-6xl">
          {/* corner ornaments */}
          <div className="pointer-events-none absolute -top-3 -left-3 h-10 w-10 border-t-2 border-l-2 border-amber-300/60 rounded-tl-2xl" />
          <div className="pointer-events-none absolute -top-3 -right-3 h-10 w-10 border-t-2 border-r-2 border-amber-300/60 rounded-tr-2xl" />
          <div className="pointer-events-none absolute -bottom-3 -left-3 h-10 w-10 border-b-2 border-l-2 border-amber-300/60 rounded-bl-2xl" />
          <div className="pointer-events-none absolute -bottom-3 -right-3 h-10 w-10 border-b-2 border-r-2 border-amber-300/60 rounded-br-2xl" />

          <div className="relative grid md:grid-cols-[minmax(0,380px)_1fr] gap-10 md:gap-14 items-stretch rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
            {/* Portrait column */}
            <div className="relative">
              {/* Serial number */}
              <div className="absolute -top-2 -left-2 z-20 flex flex-col items-center rounded-xl bg-[#0C2B1D] border border-amber-300/40 px-2.5 py-1.5 shadow-lg">
                <span className="text-[9px] font-bold tracking-widest text-amber-300/80">NO.</span>
                <span className="text-lg font-extrabold text-amber-300 leading-none">০১</span>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-amber-400/40 via-primary/25 to-donate-red/30 blur-2xl" />
                <div className="relative rounded-[24px] p-[2px] bg-gradient-to-br from-amber-200 via-amber-400/50 to-donate-red">
                  <div className="rounded-[22px] overflow-hidden bg-[#0C2B1D] relative">
                    <img
                      src={team[0].img}
                      alt={team[0].name}
                      loading="lazy"
                      width={520}
                      height={640}
                      className="h-[420px] w-full md:h-[500px] object-cover object-center"
                    />
                    {/* bottom gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0C2B1D] via-[#0C2B1D]/40 to-transparent" />
                    {/* Arabic seal */}
                    <div className="absolute bottom-3 right-3 flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/60 bg-[#0C2B1D]/70 backdrop-blur-sm">
                      <span className="text-amber-300 text-xl font-bold" style={{ fontFamily: "serif" }}>
                        ﷽
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 text-[#0C2B1D] text-[11px] font-extrabold tracking-widest uppercase px-5 py-2 shadow-xl ring-1 ring-amber-200/50">
                  Founder · Chairman
                </div>
              </div>
            </div>

            {/* Content column */}
            <div className="relative flex flex-col justify-center text-center md:text-left">
              <p className="text-amber-300 text-[11px] font-bold tracking-[0.28em] uppercase">
                প্রতিষ্ঠাতা ও চেয়ারম্যান
              </p>
              <h3 className="mt-2 text-4xl md:text-5xl font-extrabold text-white leading-[1.05]">
                {team[0].name}
              </h3>
              <p className="mt-2 font-en text-sm text-white/50 tracking-wide">
                Abdullah Bin Ershad — Unite Foundation
              </p>

              <div className="mt-5 flex items-center gap-3 justify-center md:justify-start">
                <span className="h-px w-10 bg-amber-300/60" />
                <span className="text-[10px] tracking-[0.3em] font-bold text-amber-300/80 uppercase">
                  Vision Statement
                </span>
                <span className="h-px w-10 bg-amber-300/60" />
              </div>

              <blockquote className="relative mt-5 text-white/90 text-base md:text-lg leading-[1.9] italic pl-6 border-l-2 border-amber-300/40">
                <span className="absolute -left-1 -top-6 text-6xl text-amber-300/50 font-serif leading-none select-none">
                  “
                </span>
                সুন্নাহর অনুসরণে মানবতার কল্যাণই আমাদের পথ। একটি সুশৃঙ্খল, স্বচ্ছ ও
                দীর্ঘমেয়াদি ইসলামিক প্লাটফর্ম গড়ে তোলাই ইউনাইট ফাউন্ডেশনের স্বপ্ন — যা
                প্রজন্ম থেকে প্রজন্মে কল্যাণ পৌঁছে দেবে ইনশাআল্লাহ।
              </blockquote>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg mx-auto md:mx-0">
                {[
                  { k: "২০১৭", v: "যাত্রা শুরু" },
                  { k: "১০+", v: "বছরের নেতৃত্ব" },
                  { k: "৫", v: "অঙ্গ প্রতিষ্ঠান" },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="group relative rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center transition-all hover:border-amber-300/40 hover:bg-white/[0.07]"
                  >
                    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
                    <div className="text-xl md:text-2xl font-extrabold bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent">
                      {s.k}
                    </div>
                    <div className="mt-1 text-[11px] md:text-xs text-white/70 leading-tight">
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                {["দাওয়াহ", "শিক্ষা", "সমাজকল্যাণ", "নেতৃত্ব", "স্বচ্ছতা"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Signature line */}
              <div className="mt-8 flex items-center gap-4 justify-center md:justify-start">
                <div
                  className="text-2xl md:text-3xl text-amber-200/90"
                  style={{ fontFamily: "'Brush Script MT', cursive", transform: "rotate(-4deg)" }}
                >
                  Abdullah
                </div>
                <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-amber-300/50 to-transparent" />
                <span className="text-[10px] tracking-[0.28em] font-bold text-white/50 uppercase">
                  Signature
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="section-y">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">টিম</span>
          <h2 className="heading-display mt-3">আমাদের টিম</h2>
          <p className="mt-4 text-muted-foreground">শীঘ্রই আসছে ইনশাআল্লাহ।</p>
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
