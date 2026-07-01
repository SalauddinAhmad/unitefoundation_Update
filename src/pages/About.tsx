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
      {/* Layered ambience */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(45deg, transparent 48%, #ffffff 49%, #ffffff 51%, transparent 52%), linear-gradient(-45deg, transparent 48%, #ffffff 49%, #ffffff 51%, transparent 52%)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="pointer-events-none absolute -top-40 right-1/4 h-[26rem] w-[26rem] rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-donate-red/15 blur-3xl" />

      {/* Giant watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 md:-top-10 left-1/2 -translate-x-1/2 font-en font-black tracking-[-0.04em] text-white/[0.04] text-[22vw] leading-none select-none whitespace-nowrap"
      >
        FOUNDER
      </div>

      <div className="container-page relative">
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-4 mb-10 md:mb-14">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-[11px] font-bold tracking-[0.28em] uppercase text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Leadership
            </span>
            <span className="hidden sm:inline-block h-px w-16 bg-gradient-to-r from-white/30 to-transparent" />
          </div>
          <span className="font-en text-[11px] tracking-[0.3em] text-white/50">No. 01 / চেয়ারম্যান</span>
        </div>

        <div className="grid gap-14 md:gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-center">
          {/* LEFT: Portrait composition */}
          <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
            {/* Vertical rotated label */}
            <div className="hidden md:flex absolute -left-2 lg:-left-6 top-8 bottom-8 items-center">
              <span className="font-en text-[10px] tracking-[0.5em] uppercase text-white/40 [writing-mode:vertical-rl] rotate-180">
                Est. 2017 · Uttara, Dhaka
              </span>
            </div>

            <article className="group relative w-full max-w-md">
              {/* decorative offset frame */}
              <div aria-hidden className="absolute -inset-3 md:-inset-4 rounded-[36px] border border-white/10" />
              <div aria-hidden className="absolute -inset-6 md:-inset-8 rounded-[44px] border border-white/[0.06]" />

              {/* Glow */}
              <div aria-hidden className="pointer-events-none absolute -inset-10 rounded-[48px] bg-gradient-to-br from-donate-red/25 via-donate-orange/15 to-primary/30 opacity-70 blur-3xl -z-10" />

              {/* Corner ornaments */}
              {["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 left-0 -rotate-90", "bottom-0 right-0 rotate-180"].map((pos) => (
                <span key={pos} aria-hidden className={`absolute ${pos} h-6 w-6 -translate-x-1 -translate-y-1`}>
                  <span className="absolute top-0 left-0 h-full w-[2px] bg-donate-orange/70" />
                  <span className="absolute top-0 left-0 h-[2px] w-full bg-donate-orange/70" />
                </span>
              ))}

              {/* Portrait card */}
              <div className="relative overflow-hidden rounded-[28px] bg-primary/10 ring-1 ring-white/10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)]">
                <img
                  src={team[0].img}
                  alt={team[0].name}
                  loading="lazy"
                  width={640}
                  height={720}
                  className="h-[420px] md:h-[520px] w-full object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
                {/* Portrait gradient wash */}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0C2B1D]/85 via-[#0C2B1D]/10 to-transparent" />

                {/* ﷽ seal */}
                <span className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 text-amber-200 text-lg" aria-hidden>
                  ﷽
                </span>

                {/* Bottom identity plate */}
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full gradient-donate-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-donate">
                        <Sparkles className="h-3 w-3" /> Founder
                      </span>
                      <h3 className="mt-3 text-2xl md:text-[26px] font-extrabold leading-tight text-white drop-shadow">
                        {team[0].name}
                      </h3>
                      <p className="mt-1 text-[13px] text-white/75">প্রতিষ্ঠাতা ও চেয়ারম্যান</p>
                    </div>
                    <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center" aria-hidden>
                      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full text-donate-red" fill="currentColor">
                        <path d="M12 1.5l2.5 2.2 3.3-.4.9 3.2 3 1.4-.9 3.2 1.7 2.9-2.4 2.3.4 3.3-3.2.9-1.4 3-3.2-.9L12 22.5 9.5 20.3l-3.3.4-.9-3.2-3-1.4.9-3.2L1.5 10l2.4-2.3-.4-3.3 3.2-.9 1.4-3 3.2.9L12 1.5z" />
                      </svg>
                      <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="5 12 10 17 19 8" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature ticket */}
              <div className="relative mt-5 mx-2 md:mx-3 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/10 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-en text-[10px] tracking-[0.3em] uppercase text-white/50">Signature</p>
                  <p className="mt-1 text-lg text-amber-200/90" style={{ fontFamily: '"Brush Script MT", cursive' }}>
                    Abdullah Bin Ershad
                  </p>
                </div>
                <span className="h-10 w-px bg-white/15" />
                <div className="text-right">
                  <p className="font-en text-[10px] tracking-[0.3em] uppercase text-white/50">Since</p>
                  <p className="mt-1 font-en text-lg font-bold text-white">2017</p>
                </div>
              </div>
            </article>
          </div>

          {/* RIGHT: Editorial content */}
          <div className="order-1 lg:order-2 relative">
            {/* Giant serial */}
            <span aria-hidden className="absolute -top-10 -right-2 font-en text-[9rem] md:text-[12rem] leading-none font-black text-white/[0.05] select-none">
              01
            </span>

            <p className="font-en text-[11px] tracking-[0.4em] uppercase text-amber-300/80">
              The Chairman · প্রতিষ্ঠাতা
            </p>

            <h2 className="mt-5 text-4xl md:text-5xl lg:text-[3.75rem] font-extrabold leading-[1.05]">
              প্রতিষ্ঠাতা ও{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-donate-orange bg-clip-text text-transparent">
                  চেয়ারম্যান
                </span>
                <span aria-hidden className="absolute -bottom-2 left-0 h-[3px] w-full bg-gradient-to-r from-donate-red via-donate-orange to-transparent rounded-full" />
              </span>
            </h2>

            {/* Ornament divider */}
            <div className="mt-8 flex items-center gap-3">
              <span className="h-px w-14 bg-gradient-to-r from-amber-300/70 to-transparent" />
              <span className="h-1.5 w-1.5 rotate-45 bg-amber-300" />
              <span className="h-px w-6 bg-amber-300/40" />
              <span className="h-1 w-1 rounded-full bg-donate-orange" />
              <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            {/* Pull-quote */}
            <blockquote className="mt-8 relative pl-6 border-l-2 border-donate-orange/60">
              <span aria-hidden className="absolute -left-3 -top-4 text-6xl leading-none text-donate-orange/40 font-serif">
                “
              </span>
              <p className="text-white/85 text-lg md:text-xl leading-[1.9]">
                এক স্বপ্ন থেকে শুরু হওয়া যাত্রার পথপ্রদর্শক — সুন্নাহর অনুসরণে মানবতার
                কল্যাণে নিবেদিত একটি{" "}
                <span className="text-amber-200 font-semibold">সুশৃঙ্খল, স্বচ্ছ ও দীর্ঘমেয়াদি</span>{" "}
                ইসলামিক প্লাটফর্ম গড়ে তোলাই তাঁর স্বপ্ন।
              </p>
            </blockquote>

            {/* Highlight tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              {["দাঈ", "সংগঠক", "উদ্যোক্তা", "শিক্ষাবিদ"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-white/85 backdrop-blur"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Stats grid */}
            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                { k: "২০১৭", v: "যাত্রা শুরু" },
                { k: "১০+", v: "বছরের নেতৃত্ব" },
                { k: "৫", v: "প্রতিষ্ঠান" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm hover:bg-white/[0.07] transition-colors"
                >
                  <div aria-hidden className="absolute -top-8 -right-8 h-16 w-16 rounded-full bg-donate-orange/10 blur-2xl" />
                  <p className="font-en text-2xl md:text-3xl font-black bg-gradient-to-br from-amber-200 to-donate-orange bg-clip-text text-transparent">
                    {s.k}
                  </p>
                  <p className="mt-1 text-[12px] text-white/65">{s.v}</p>
                </div>
              ))}
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
