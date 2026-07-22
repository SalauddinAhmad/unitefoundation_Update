import { CheckCircle2, Heart, Target, Eye, Users, Sparkles, Sprout, TreeDeciduous, Facebook, Linkedin, Mail, Instagram, Youtube, ShieldCheck, FileText, MapPin, BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { useTeam } from "@/hooks/api/useTeam";
import { useSettings } from "@/hooks/api/useDashboardData";
import { site } from "@/data/site";

const TeamCard = ({ m }: { m: ReturnType<typeof useTeam>["data"] extends (infer U)[] | undefined ? U : never }) => (
  <article className="group relative">
    {/* Soft glow behind card */}
    <div aria-hidden className="pointer-events-none absolute -inset-1 rounded-[26px] bg-gradient-to-br from-primary/20 via-donate-orange/10 to-primary/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

    <div className="relative rounded-[22px] bg-card p-2.5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.35)] ring-1 ring-border/60 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_25px_60px_-25px_rgba(0,0,0,0.45)] group-hover:ring-primary/30">
      {/* Portrait */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-secondary ring-1 ring-primary/10">
        {m.photo ? (
          <img
            src={m.photo}
            alt={m.name}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <Users className="h-12 w-12" />
          </div>
        )}

        {/* Bottom gradient veil */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        {/* Name + role over image */}
        <div className="absolute inset-x-0 bottom-0 p-3.5 text-left">
          <div className="text-[15px] font-extrabold leading-tight text-white drop-shadow-sm">
            {m.name}
          </div>
          <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/80">
            {(() => {
              const raw = m.role || "";
              const [head, ...rest] = raw.split("|");
              const desig = rest.join("|").trim();
              return desig || head;
            })()}
          </div>
        </div>

        {/* Corner accent */}
        <div aria-hidden className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      </div>

      {/* Bio + socials */}
      {(m.bio || m.facebook || m.linkedin || m.email) && (
        <div className="px-2 pt-3 pb-1.5 text-left">
          {m.bio && (
            <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-2">{m.bio}</p>
          )}
          {(m.facebook || m.linkedin || m.email) && (
            <div className="mt-2.5 flex items-center gap-1.5">
              {m.facebook && (
                <a href={m.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="h-7 w-7 rounded-full border border-primary/15 bg-primary/5 text-primary flex items-center justify-center transition-all hover:-translate-y-0.5 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]">
                  <Facebook className="h-3.5 w-3.5" />
                </a>
              )}
              {m.linkedin && (
                <a href={m.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="h-7 w-7 rounded-full border border-primary/15 bg-primary/5 text-primary flex items-center justify-center transition-all hover:-translate-y-0.5 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]">
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
              )}
              {m.email && (
                <a href={`mailto:${m.email}`} aria-label="Email" className="h-7 w-7 rounded-full border border-primary/15 bg-primary/5 text-primary flex items-center justify-center transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground">
                  <Mail className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  </article>
);


const TeamSection = () => {
  const { data = [] } = useTeam();
  const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const advisors = sorted.filter((m) => /উপদেষ্টা|advisor/i.test(m.role || ""));
  const officers = sorted.filter((m) => !/উপদেষ্টা|advisor/i.test(m.role || ""));

  if (sorted.length === 0) return null;

  return (
    <section className="section-y relative overflow-hidden">
      {/* Decorative SVG watermark background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none opacity-[0.18]"
        style={{
          backgroundImage: "url('/background-overlay-3.svg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, hsl(var(--background) / 0.6) 100%)",
        }}
      />




      <div className="container-page relative space-y-16">
        {advisors.length > 0 && (
          <div>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="heading-display">উপদেষ্টা</h2>
            </div>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center lg:justify-center">
              {advisors.map((m) => <TeamCard key={m.id} m={m} />)}
            </div>
          </div>
        )}
        {officers.length > 0 && (
          <div>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="heading-display">দায়িত্বশীল</h2>
            </div>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
              {officers.map((m) => <TeamCard key={m.id} m={m} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};



// Milestones: bilingual data. Kept concise; renders using i18n active language.
type Milestone = { y: { bn: string; en: string }; t: { bn: string; en: string }; items: { bn: string; en: string }[] };
const milestones: Milestone[] = [
  { y: { bn: "২০১৭", en: "2017" }, t: { bn: "যাত্রা শুরু", en: "Journey begins" }, items: [
    { bn: "০৭ মার্চ ২০১৭ — মাত্র ১০ জন স্বেচ্ছাসেবক নিয়ে শিক্ষানগরী রাজশাহীর নওদাপাড়ায় ‘ইসলামিক রিসার্চ সেন্টার বাংলাদেশ’ নামে আনুষ্ঠানিক কার্যক্রমের শুভ সূচনা।", en: "7 March 2017 — Formal launch as 'Islamic Research Centre Bangladesh' in Naodapara, Rajshahi, with just 10 volunteers." },
    { bn: "মানবতার কল্যাণে অনলাইন ভিত্তিক মিডিয়া ‘ইউনাইট টিভি’-এর কার্যক্রম শুরু।", en: "Launch of the online media platform 'Unite TV' for humanitarian causes." },
  ]},
  { y: { bn: "২০১৭–২০১৮", en: "2017–2018" }, t: { bn: "রোহিঙ্গা শরণার্থী সহায়তা", en: "Rohingya refugee relief" }, items: [
    { bn: "মিয়ানমার থেকে নির্যাতিত হয়ে বাংলাদেশে (বান্দরবান ও কক্সবাজার) আশ্রয় নেওয়া রোহিঙ্গা মুসলিমদের মাঝে প্রাথমিক খাদ্য, বস্ত্র ও আবাসন ব্যবস্থার সুনিপুণ আয়োজন।", en: "Well-organised delivery of initial food, clothing and shelter to Rohingya Muslims who fled Myanmar to Bandarban and Cox's Bazar." },
  ]},
  { y: { bn: "২০১৮", en: "2018" }, t: { bn: "নিজস্ব ঠিকানার সূচনা", en: "Our own address" }, items: [{ bn: "রাজধানী ঢাকার উত্তরা-উত্তরখানে নিজস্ব অফিস ভবনের নির্মাণকাজ শুরু।", en: "Construction of our own office building begins in Uttara-Uttarkhan, Dhaka." }]},
  { y: { bn: "২০১৯", en: "2019" }, t: { bn: "ঈদ সামগ্রী বিতরণ", en: "Eid distribution" }, items: [{ bn: "সুবিধাবঞ্চিত ইয়াতিম, বিধবা, গরিব, মিসকিন ও অসহায় মানুষদের মাঝে প্রতি ঈদে ‘ঈদ সামগ্রী বিতরণ’ কর্মসূচির সূচনা।", en: "Launch of the 'Eid Distribution' programme for orphans, widows, the poor and destitute every Eid." }]},
  { y: { bn: "২০২০", en: "2020" }, t: { bn: "সম্প্রসারণ ও নবরূপ", en: "Expansion & rebrand" }, items: [
    { bn: "উত্তরা-উত্তরখানে নিজস্ব অফিস ভবনের নির্মাণকাজ সফলভাবে সমাপ্ত।", en: "Completion of our office building in Uttara-Uttarkhan." },
    { bn: "প্রধান কার্যালয় রাজশাহী থেকে সফলভাবে রাজধানী ঢাকায় স্থানান্তর।", en: "Head office relocated from Rajshahi to Dhaka." },
    { bn: "সেবার পরিধি বাড়াতে সংগঠনের নাম পরিবর্তন করে ‘ইসলামিক ফেইথ অ্যান্ড ওয়েলফেয়ার ফাউন্ডেশন’ নামকরণ।", en: "Renamed 'Islamic Faith and Welfare Foundation' to expand our scope." },
  ]},
  { y: { bn: "২০২১", en: "2021" }, t: { bn: "মহামারীর পাশে", en: "Standing by in the pandemic" }, items: [{ bn: "করোনা মহামারীর বৈশ্বিক সংকটে শত-শত কর্মহীন ও অসহায় পরিবারে জরুরি ত্রাণ সহায়তা প্রদান।", en: "Emergency relief for hundreds of jobless and helpless families during the COVID-19 crisis." }]},
  { y: { bn: "২০২২", en: "2022" }, t: { bn: "ইউনাইট কনফারেন্স ও সাবলম্বীকরণ", en: "Unite Conference & empowerment" }, items: [
    { bn: "ইউনাইট টিভির আয়োজনে ‘ইউনাইট কনফারেন্স’-এর শুভ সূচনা; যা প্রতি বছর পবিত্র রামাযান মাসে রাজধানী ঢাকায় সফলভাবে আয়োজিত হয়ে আসছে।", en: "Launch of the 'Unite Conference' by Unite TV, held annually in Dhaka during Ramadan." },
    { bn: "সাবলম্বীকরণ প্রকল্প — নারীদের মাঝে উপকরণ হস্তান্তর।", en: "Empowerment project — handing tools to women." },
  ]},
  { y: { bn: "২০২৩", en: "2023" }, t: { bn: "দুর্যোগে পাশে, নতুন উদ্যোগ", en: "Beside disasters, new initiatives" }, items: [
    { bn: "দেশজুড়ে তীব্র শীতে অসহায় শীতার্তদের মাঝে উন্নতমানের শীতবস্ত্র বিতরণ কর্মসূচির সূচনা।", en: "Launch of nationwide winter clothing distribution for those suffering the cold." },
    { bn: "বন্যা কবলিত এলাকায় জরুরি খাদ্য, বস্ত্র সরবরাহ এবং ক্ষতিগ্রস্ত বাসস্থানের পুনর্বাসন।", en: "Emergency food and clothing in flood-hit areas and rehabilitation of damaged homes." },
    { bn: "‘আত-ত্বাইয়্যেবা ট্রাভেল এজেন্সি’ ও ‘আত-ত্বাইয়্যেবা প্রকাশনী’-এর কার্যক্রম শুরু।", en: "Launch of 'At-Tayyiba Travel Agency' and 'At-Tayyiba Publications'." },
  ]},
  { y: { bn: "২০২৪", en: "2024" }, t: { bn: "ইউনাইট ফাউন্ডেশন", en: "Unite Foundation" }, items: [
    { bn: "সংগঠনের নাম পুনর্নির্ধারণ করে চূড়ান্তভাবে ‘ইউনাইট ফাউন্ডেশন’ রূপান্তর ও নামকরণ।", en: "Final renaming and rebranding as 'Unite Foundation'." },
    { bn: "আন্তর্জাতিক অঙ্গনে সেবার পরিধি বিস্তৃত করে ফিলিস্তিনে নির্যাতিত মুসলিম ভাই-বোনদের মাঝে খাদ্য ও আবাসন সহযোগিতা কার্যক্রমের সূচনা।", en: "Extended service internationally — food and shelter aid for oppressed Muslim brothers and sisters in Palestine." },
    { bn: "দেশজুড়ে বৃক্ষ রোপন কর্মসূচী শুরু।", en: "Launch of a nationwide tree-planting programme." },
  ]},
  { y: { bn: "২০২৫", en: "2025" }, t: { bn: "কর্জে হাসানাহ ও ইফতার", en: "Qarz-e-Hasanah & iftar" }, items: [
    { bn: "সম্পূর্ণ সুদমুক্ত ও আত্মনির্ভরশীল সমাজ গঠনে ‘কর্জে হাসানাহ’ প্রজেক্টের পথচলা শুরু।", en: "Launch of the 'Qarz-e-Hasanah' project to build an interest-free, self-reliant society." },
    { bn: "পবিত্র রামাযান মাসব্যাপী অসহায় ও রোজাদারদের মাঝে ‘ইফতার বিতরণ’ কর্মসূচি শুরু।", en: "Launch of the 'Iftar Distribution' programme for the needy and fasting people throughout Ramadan." },
  ]},
  { y: { bn: "২০২৬", en: "2026" }, t: { bn: "নতুন দিগন্ত", en: "New horizons" }, items: [
    { bn: "অসহায় ও ইয়াতিম শিশুদের মাঝে নতুন বস্ত্র বিতরণ।", en: "Distribution of new clothes to needy and orphan children." },
    { bn: "পবিত্র ঈদুল আজহায় সুবিধাবঞ্চিতদের মাঝে ‘কুরবানী প্রজেক্ট’ সফলভাবে বাস্তবায়ন।", en: "Successful execution of the 'Qurbani Project' for the underprivileged on Eid al-Adha." },
    { bn: "বিধবা, ইয়াতিম ও দরিদ্র পরিবারের জন্য ‘আবাসন প্রকল্প’-এর শুভ সূচনা।", en: "Launch of the 'Housing Project' for widows, orphans and poor families." },
    { bn: "দক্ষ জনশক্তি ও কর্মসংস্থান সৃষ্টির লক্ষ্যে ‘ইউনাইট ট্রেনিং সেন্টার’-এর কার্যক্রম শুরু।", en: "Launch of 'Unite Training Centre' for skilled workforce and employment." },
    { bn: "মানসম্মত শিক্ষার প্রসারে ‘ইউনাইট একাডেমি’-এর গৌরবময় ঘোষণা।", en: "Proud announcement of 'Unite Academy' for quality education." },
  ]},
];

const valueIcons = [Heart, CheckCircle2, Target, Users];

const About = () => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "bn").startsWith("en") ? "en" : "bn";
  const { data: settings } = useSettings();
  const dynamicMilestones: Milestone[] = (settings?.milestones && settings.milestones.length)
    ? settings.milestones.map((m) => ({
        y: { bn: m.yearBn || m.yearEn, en: m.yearEn || m.yearBn },
        t: { bn: m.titleBn || m.titleEn, en: m.titleEn || m.titleBn },
        items: Array.from({ length: Math.max(m.itemsBn?.length || 0, m.itemsEn?.length || 0) }).map((_, i) => ({
          bn: m.itemsBn?.[i] || m.itemsEn?.[i] || "",
          en: m.itemsEn?.[i] || m.itemsBn?.[i] || "",
        })),
      }))
    : milestones;
  const ms = settings?.milestones_section;
  const pick = (bn?: string, en?: string, fallback?: string) => {
    const v = lang === "en" ? (en || bn) : (bn || en);
    return v && v.trim() ? v : (fallback || "");
  };
  const msEyebrow = pick(ms?.eyebrowBn, ms?.eyebrowEn, t("aboutPage.journey"));
  const msHeading = pick(ms?.headingBn, ms?.headingEn, t("aboutPage.milestones"));
  const msIntro = pick(ms?.introBn, ms?.introEn, t("aboutPage.milestonesIntro"));
  const msQuote = pick(ms?.quoteBn, ms?.quoteEn, t("aboutPage.milestonesQuote"));
  const mss = settings?.mission_section;
  const missionImage = mss?.image && mss.image.trim() ? mss.image : "";
  const missionEyebrow = pick(mss?.eyebrowBn, mss?.eyebrowEn, t("aboutPage.mission"));
  const missionHeading = pick(mss?.headingBn, mss?.headingEn, "যে পথে আমরা");
  const missionHighlight = pick(mss?.headingHighlightBn, mss?.headingHighlightEn, "এগিয়ে যাচ্ছি");
  const missionIntro = pick(mss?.introBn, mss?.introEn, t("aboutPage.missionAlt"));
  const missionGoalsSetting = lang === "en"
    ? (mss?.goalsEn?.length ? mss.goalsEn : mss?.goalsBn)
    : (mss?.goalsBn?.length ? mss.goalsBn : mss?.goalsEn);
  const goals = (missionGoalsSetting && missionGoalsSetting.length
    ? missionGoalsSetting
    : (t("aboutPage.goals", { returnObjects: true }) as string[]));
  const values = t("aboutPage.values", { returnObjects: true }) as { t: string; d: string }[];
    const founderCfg = settings?.founder;
    const founderName = founderCfg
      ? (lang === "en" ? (founderCfg.nameEn || founderCfg.nameBn) : (founderCfg.nameBn || founderCfg.nameEn))
      : (lang === "en" ? "Abdullah bin Ershad" : "আব্দুল্লাহ বিন এরশাদ");
    const founderSubtitle = founderCfg
      ? (lang === "en" ? (founderCfg.subtitleEn || founderCfg.subtitleBn) : (founderCfg.subtitleBn || founderCfg.subtitleEn))
      : "দাঈ ইলাল্লাহ";
    const founderBadge = founderCfg?.badgeLabel || "Founder";
    const founderSectionTitle = founderCfg
      ? (lang === "en" ? (founderCfg.sectionTitleEn || founderCfg.sectionTitleBn) : (founderCfg.sectionTitleBn || founderCfg.sectionTitleEn))
      : t("aboutPage.founderTitle");
    const founderBio = founderCfg
      ? (lang === "en" ? (founderCfg.bioEn || founderCfg.bioBn) : (founderCfg.bioBn || founderCfg.bioEn))
      : "";
    const { data: teamData = [] } = useTeam();
    const founderMember = teamData.find((m) =>
      /প্রতিষ্ঠাতা|চেয়ারম্যান|founder|chairman/i.test(m.role || "")
    ) || teamData.find((m) => m.name === founderName);
    const founderPhoto = founderCfg?.photo || founderMember?.photo || "";

  return (
  <SiteLayout>
    <Seo title={t("aboutPage.seoTitle")} description={t("aboutPage.seoDesc")} canonical="/about" />

    <PageHero
      image={settings?.page_heroes?.about || undefined}
      eyebrow={t("aboutPage.eyebrow")}
      title={t("aboutPage.heroTitle")}
      subtitle={t("aboutPage.heroSubtitle")}
    />

    <section className="section-y relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="container-page relative grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left: image inside a decorative arch shape */}
        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-[440px]">
            {/* offset outline arch behind */}
            <div
              aria-hidden
              className="absolute -left-4 -top-4 w-full h-full border-2 border-primary/25"
              style={{ borderRadius: "50% 50% 16px 16px / 40% 40% 16px 16px" }}
            />
            {/* dot pattern accent */}
            <div
              aria-hidden
              className="absolute -right-6 -bottom-6 h-24 w-24 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(hsl(var(--primary)) 1.2px, transparent 1.2px)",
                backgroundSize: "10px 10px",
              }}
            />
            {/* small amber dot */}
            <div aria-hidden className="absolute -left-2 top-8 h-3 w-3 rounded-full bg-donate-highlight" />
            {/* the arch-shaped image */}
            <div
              className="relative overflow-hidden shadow-card-hover ring-1 ring-primary/10"
              style={{ borderRadius: "50% 50% 16px 16px / 40% 40% 16px 16px" }}
            >
              {missionImage ? (
                <img
                  src={missionImage}
                  alt={missionEyebrow}
                  className="w-full h-[480px] md:h-[540px] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-[480px] md:h-[540px] bg-muted animate-pulse" />
              )}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent"
              />
            </div>
          </div>
        </div>

        {/* Right: compact editorial list */}
        <div className="lg:col-span-7">
          <div className="max-w-xl">
            <span className="eyebrow inline-flex items-center gap-2">
              <Target className="h-3.5 w-3.5" /> {missionEyebrow}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold leading-[1.5] mt-3 text-foreground pb-1">
              {missionHeading}{" "}
              <span className="gradient-donate-text inline-block pb-1">{missionHighlight}</span>
            </h2>
            <p className="mt-3 text-sm md:text-[15px] text-muted-foreground leading-[1.85]">
              {missionIntro}
            </p>
          </div>

          <ul className="mt-8 divide-y divide-border/70 border-y border-border/70">
            {goals.map((goal, i) => (
              <li
                key={i}
                className="group flex items-start gap-4 py-3.5 transition-colors hover:bg-accent/30 px-1"
              >
                <span className="shrink-0 mt-0.5 text-[11px] font-bold tracking-[0.15em] text-primary/70 group-hover:text-primary w-6 tabular-nums font-en">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="h-4 w-px bg-border shrink-0 mt-1.5" aria-hidden />
                <p className="text-[13.5px] md:text-sm leading-[1.7] text-foreground/90 group-hover:text-foreground">
                  {goal}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section className="section-y bg-secondary/40">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">{t("aboutPage.valuesEyebrow")}</span>
          <h2 className="heading-display mt-3">{t("aboutPage.valuesHeading")}</h2>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => {
            const Icon = valueIcons[i] || Heart;
            return (
              <div key={v.t} className="card-base p-6 text-center">
                <div className="h-14 w-14 rounded-card gradient-donate-bg text-white flex items-center justify-center mx-auto"><Icon className="h-6 w-6" /></div>
                <h3 className="mt-4 font-bold text-lg">{v.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    <section className="section-y relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background">
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
          <span className="eyebrow inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> {msEyebrow}</span>
          <h2 className="heading-display mt-3">{msHeading}</h2>
          <p className="mt-5 text-muted-foreground leading-[1.95]">{msIntro}</p>
        </div>

        <div className="mt-16 relative max-w-5xl mx-auto">
          <div
            className="absolute left-5 md:left-1/2 top-0 bottom-0 w-[2px] md:-translate-x-1/2"
            aria-hidden
            style={{
              background:
                "linear-gradient(to bottom, transparent, hsl(var(--primary)/0.5) 6%, hsl(var(--primary)/0.5) 94%, transparent)",
            }}
          />
          <div className="absolute left-5 md:left-1/2 -top-4 md:-translate-x-1/2 h-9 w-9 rounded-full gradient-donate-bg text-white flex items-center justify-center shadow-card ring-4 ring-background z-10">
            <Sprout className="h-4 w-4" />
          </div>

          <div className="space-y-12 pt-12 pb-8">
            {dynamicMilestones.map((m, i) => {
              const right = i % 2 === 1;
              return (
                <div key={m.y[lang]} className="relative pl-14 md:pl-0 md:grid md:grid-cols-2 md:gap-10 md:items-center">
                  <div
                    className="absolute left-5 md:left-1/2 top-6 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 h-4 w-4 rounded-full gradient-donate-bg ring-4 ring-background z-10"
                    style={{ boxShadow: "0 0 0 6px hsl(var(--primary) / 0.08)" }}
                    aria-hidden
                  />
                  <div className={`${right ? "md:order-2 md:text-left md:pl-6" : "md:text-right md:pr-6"}`}>
                    <div className="inline-flex flex-col">
                      <span className="text-3xl md:text-5xl font-extrabold gradient-donate-text leading-none tracking-tight">
                        {m.y[lang]}
                      </span>
                      <span className="mt-2 text-sm md:text-base font-semibold text-foreground/80">
                        {m.t[lang]}
                      </span>
                    </div>
                  </div>
                  <div className={`mt-3 md:mt-0 ${right ? "md:order-1 md:pr-6" : "md:pl-6"}`}>
                    <div className="group relative rounded-card border border-border bg-card p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all">
                      <div
                        className={`absolute top-4 bottom-4 w-1 rounded-full gradient-donate-bg opacity-70 ${right ? "left-0" : "right-0"}`}
                        aria-hidden
                      />
                      <ul className="space-y-2.5">
                        {m.items.map((it, k) => (
                          <li key={k} className="flex items-start gap-2.5 text-sm md:text-[15px] leading-[1.75] text-foreground/85">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full gradient-donate-bg shrink-0" aria-hidden />
                            <span>{it[lang]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute left-5 md:left-1/2 md:-translate-x-1/2 -bottom-4 h-11 w-11 rounded-full gradient-donate-bg text-white flex items-center justify-center shadow-card-hover ring-4 ring-background z-10">
            <TreeDeciduous className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-20 max-w-3xl mx-auto text-center">
          <div className="rounded-card border border-donate-highlight/30 bg-card p-8 md:p-10 shadow-card">
            <p className="text-base md:text-lg leading-[1.95] text-foreground italic whitespace-pre-line">
              {msQuote}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="relative section-y overflow-hidden bg-[#0C2B1D] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute -top-40 right-1/4 h-[26rem] w-[26rem] rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-donate-red/10 blur-3xl" />

      <div className="container-page relative">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <div className="flex justify-center md:justify-start order-2 md:order-1">
            <article className="group relative w-full max-w-sm rounded-[32px] bg-white p-4 md:p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)] ring-1 ring-white/10 transition-transform duration-500 hover:-translate-y-1">
              <div aria-hidden className="pointer-events-none absolute -inset-px rounded-[32px] bg-gradient-to-br from-donate-red/25 via-donate-orange/15 to-primary/25 opacity-60 blur-xl -z-10" />
              <div className="relative overflow-hidden rounded-[22px] bg-primary/10 ring-1 ring-primary/10 h-[360px] md:h-[420px]">
                {founderPhoto ? (
                  <img
                    src={founderPhoto}
                    alt={founderName}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Users className="h-20 w-20 text-primary/40" />
                  </div>
                )}
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full gradient-donate-bg px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-donate">
                  <Sparkles className="h-3 w-3" /> {founderBadge}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 px-1">
                <h3 className="text-xl md:text-2xl font-extrabold text-primary leading-tight">{founderName}</h3>
                {founderSubtitle && (
                  <span className="text-sm md:text-base font-medium italic text-foreground/60">{founderSubtitle}</span>
                )}
              </div>
              {founderBio && (
                <p className="mt-3 px-1 text-sm leading-[1.8] text-foreground/75 whitespace-pre-line">
                  {founderBio}
                </p>
              )}
              <div className="mt-4 mx-1 h-px bg-gradient-to-r from-primary/20 via-donate-orange/30 to-transparent" />
              <div className="mt-4 flex flex-wrap items-center gap-2 px-1 pb-1">
                {[
                  { href: founderCfg?.facebook ?? "", label: "Facebook", Icon: Facebook, hover: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]" },
                  { href: founderCfg?.youtube ?? "", label: "YouTube", Icon: Youtube, hover: "hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]" },
                  { href: founderCfg?.instagram ?? "", label: "Instagram", Icon: Instagram, hover: "hover:bg-[linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)] hover:text-white hover:border-transparent" },
                  {
                    href: founderCfg?.tiktok ?? "",
                    label: "TikTok",
                    hover: "hover:bg-black hover:text-white hover:border-black",
                    Icon: (props: { className?: string }) => (
                      <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden><path d="M20.5 8.2a6.7 6.7 0 0 1-3.9-1.25v7.9a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6.03.9.08v2.9a2.75 2.75 0 1 0 1.95 2.62V2h2.85a3.85 3.85 0 0 0 3.8 3.4V8.2Z"/></svg>
                    ),
                  },
                  {
                    href: founderCfg?.whatsapp ?? "",
                    label: "WhatsApp",
                    hover: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
                    Icon: (props: { className?: string }) => (
                      <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden><path d="M12.04 2.5c-5.25 0-9.5 4.25-9.5 9.5 0 1.68.44 3.32 1.28 4.76L2.5 21.5l4.9-1.28a9.5 9.5 0 0 0 4.64 1.19h.01c5.24 0 9.5-4.26 9.5-9.5 0-2.54-.99-4.92-2.79-6.72a9.44 9.44 0 0 0-6.72-2.79Zm5.58 13.6c-.24.67-1.38 1.27-1.93 1.35-.49.07-1.11.1-1.79-.11-.41-.13-.95-.31-1.63-.61-2.87-1.24-4.75-4.13-4.89-4.32-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.29.57-.36.76-.36h.55c.18 0 .42-.07.65.5.24.58.82 1.99.89 2.13.07.14.12.31.02.5-.1.19-.14.31-.28.48-.14.17-.3.38-.42.51-.14.14-.29.29-.13.58.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.28 2.3 1.42.29.14.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.65-.14.26.1 1.66.78 1.95.92.29.14.48.21.55.33.07.12.07.7-.17 1.37Z"/></svg>
                    ),
                  },
                  {
                    href: founderCfg?.x ?? "",
                    label: "X (Twitter)",
                    hover: "hover:bg-black hover:text-white hover:border-black",
                    Icon: (props: { className?: string }) => (
                      <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden><path d="M17.53 3H20.9l-7.36 8.41L22 21h-6.79l-5.32-6.96L3.8 21H.42l7.87-8.99L0 3h6.96l4.81 6.36L17.53 3Zm-1.19 16h1.87L7.75 4.9H5.75L16.34 19Z"/></svg>
                    ),
                  },
                ].filter((s) => s.href && s.href.trim() !== "").map(({ href, label, Icon, hover }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary transition-all hover:-translate-y-0.5 ${hover}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>




            </article>
          </div>

          <div className="order-1 md:order-2 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1]">
              {founderSectionTitle}
            </h2>
            <div className="mt-5 flex items-center gap-3 justify-center md:justify-start">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-300/70 md:bg-gradient-to-l md:from-amber-300/70 md:to-transparent" />
              <span className="h-2 w-2 rotate-45 bg-amber-300" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-300/70 md:bg-gradient-to-r md:from-amber-300/70 md:to-transparent" />
            </div>
          </div>



        </div>
      </div>
    </section>

    <TeamSection />

    <section className="section-y bg-secondary/30">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> অনুমোদনসমূহ
          </div>
          <h2 className="heading-display mt-4">অনুমোদনসমূহ</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            ইউনাইট ফাউন্ডেশন একটি সম্পূর্ণ নিবন্ধিত ও অনুমোদিত অলাভজনক প্রতিষ্ঠান। নিচে আমাদের অনুমোদন সংক্রান্ত তথ্য দেওয়া হলো।
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          <div className="rounded-card bg-card border border-border p-6 shadow-card hover:shadow-card-hover transition-all">
            <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-sm text-muted-foreground">ট্রেড লাইসেন্স নম্বর</div>
            <div className="mt-1 text-lg font-bold text-foreground font-en break-all">{site.tradeLicense}</div>
            <div className="mt-2 text-xs text-muted-foreground">ঢাকা উত্তর সিটি কর্পোরেশন (DNCC) কর্তৃক ইস্যুকৃত</div>
          </div>

          <div className="rounded-card bg-card border border-border p-6 shadow-card hover:shadow-card-hover transition-all">
            <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div className="text-sm text-muted-foreground">TIN সার্টিফিকেট নম্বর</div>
            <div className="mt-1 text-lg font-bold text-foreground font-en break-all">{site.tin}</div>
            <div className="mt-2 text-xs text-muted-foreground">জাতীয় রাজস্ব বোর্ড (NBR) কর্তৃক ইস্যুকৃত</div>
          </div>

          <div className="rounded-card bg-card border border-border p-6 shadow-card hover:shadow-card-hover transition-all sm:col-span-2 lg:col-span-1">
            <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="text-sm text-muted-foreground">নিবন্ধিত ঠিকানা</div>
            <div className="mt-1 text-base font-semibold text-foreground leading-relaxed">{site.address}</div>
            <div className="mt-2 text-xs text-muted-foreground font-en">{site.addressEn}</div>
          </div>
        </div>
      </div>
    </section>
  </SiteLayout>
  );
};

export default About;
