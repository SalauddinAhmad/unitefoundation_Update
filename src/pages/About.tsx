import { CheckCircle2, Heart, Target, Eye, Users, Sparkles, Sprout, TreeDeciduous, Facebook, Linkedin, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import about from "@/assets/about-mission.jpg";
import t1 from "@/assets/team-founder.jpg";
import t2 from "@/assets/team-2.jpg";
import t3 from "@/assets/team-3.jpg";
import { useTeam } from "@/hooks/api/useTeam";
import { useSettings } from "@/hooks/api/useDashboardData";

const TeamSection = () => {
  const { data = [] } = useTeam();
  const { t } = useTranslation();
  const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <section className="section-y">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">{t("aboutPage.teamEyebrow")}</span>
          <h2 className="heading-display mt-3">{t("aboutPage.teamHeading")}</h2>
          {sorted.length === 0 && (
            <p className="mt-4 text-muted-foreground">{t("aboutPage.teamEmpty")}</p>
          )}
        </div>
        {sorted.length > 0 && (
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {sorted.map((m) => (
              <div key={m.id} className="group text-center">
                <div className="mx-auto h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-secondary ring-4 ring-accent/40 shadow-sm group-hover:shadow-lg transition-all">
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <Users className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="mt-5">
                  <div className="font-bold text-foreground">{m.name}</div>
                  <div className="text-sm text-primary font-medium mt-1">{m.role}</div>
                  {m.bio && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{m.bio}</p>}
                  {(m.facebook || m.linkedin || m.email) && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {m.facebook && (
                        <a href={m.facebook} target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                          <Facebook className="h-4 w-4" />
                        </a>
                      )}
                      {m.linkedin && (
                        <a href={m.linkedin} target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {m.email && (
                        <a href={`mailto:${m.email}`} className="h-8 w-8 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
  const goals = t("aboutPage.goals", { returnObjects: true }) as string[];
  const values = t("aboutPage.values", { returnObjects: true }) as { t: string; d: string }[];
  const founderName = lang === "en" ? "Abdullah bin Ershad" : "আব্দুল্লাহ বিন এরশাদ";

  return (
  <SiteLayout>
    <Seo title={t("aboutPage.seoTitle")} description={t("aboutPage.seoDesc")} canonical="/about" />

    <PageHero
      image={about}
      eyebrow={t("aboutPage.eyebrow")}
      title={t("aboutPage.heroTitle")}
      subtitle={t("aboutPage.heroSubtitle")}
    />

    <section className="section-y">
      <div className="container-page grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-accent/40 -z-10" />
          <img
            src={about}
            alt={t("aboutPage.missionAlt")}
            className="w-full h-full rounded-2xl object-cover shadow-lg"
            loading="lazy"
          />
        </div>
        <div>
          <div className="h-11 w-11 rounded-full bg-accent flex items-center justify-center text-primary mb-4">
            <Target className="h-5 w-5" />
          </div>

          <h2 className="heading-display">{t("aboutPage.mission")}</h2>
          <ul className="mt-6 space-y-4">
            {goals.map((goal, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground leading-[1.9]">
                <span className="text-primary mt-1">•</span>
                <span>{goal}</span>
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
          <span className="eyebrow inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> {t("aboutPage.journey")}</span>
          <h2 className="heading-display mt-3">{t("aboutPage.milestones")}</h2>
          <p className="mt-5 text-muted-foreground leading-[1.95]">{t("aboutPage.milestonesIntro")}</p>
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
            {milestones.map((m, i) => {
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
            <p className="text-base md:text-lg leading-[1.95] text-foreground italic">
              {t("aboutPage.milestonesQuote")}
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
              <div className="relative overflow-hidden rounded-[22px] bg-primary/10 ring-1 ring-primary/10">
                <img src={t1} alt={founderName} loading="lazy" width={520} height={560} className="h-[360px] md:h-[420px] w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full gradient-donate-bg px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-donate">
                  <Sparkles className="h-3 w-3" /> Founder
                </span>
              </div>
              <div className="mt-5 flex items-center gap-2 px-1">
                <h3 className="text-xl md:text-2xl font-extrabold text-primary leading-tight">{founderName}</h3>
              </div>
              <p className="mt-2 px-1 text-sm text-foreground/70 leading-relaxed">{t("aboutPage.founderTagline")}</p>
              <div className="mt-4 mx-1 h-px bg-gradient-to-r from-primary/20 via-donate-orange/30 to-transparent" />
              <div className="mt-4 flex items-center gap-5 px-1 pb-1 text-foreground/70 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-semibold text-primary">{lang === "en" ? "2017" : "২০১৭"}</span>
                  <span className="text-foreground/50">— {t("aboutPage.founderStart")}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-semibold text-primary">{lang === "en" ? "5" : "৫"}</span>
                  <span className="text-foreground/50">{t("aboutPage.founderInstitutions")}</span>
                </span>
              </div>
            </article>
          </div>

          <div className="order-1 md:order-2 text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-bold tracking-[0.28em] uppercase text-white/70 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> {t("aboutPage.founderEyebrow")}
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1]">
              {t("aboutPage.founderTitle")}
            </h2>
            <div className="mt-5 flex items-center gap-3 justify-center md:justify-start">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-300/70 md:bg-gradient-to-l md:from-amber-300/70 md:to-transparent" />
              <span className="h-2 w-2 rotate-45 bg-amber-300" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-300/70 md:bg-gradient-to-r md:from-amber-300/70 md:to-transparent" />
            </div>
            <p className="mt-6 max-w-xl mx-auto md:mx-0 text-white/70 text-base md:text-lg leading-[1.9]">
              {t("aboutPage.founderBio")}
            </p>
          </div>
        </div>
      </div>
    </section>

    <TeamSection />
  </SiteLayout>
  );
};

export default About;
