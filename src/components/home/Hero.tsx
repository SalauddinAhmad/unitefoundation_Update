import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import hero1 from "@/assets/hero-relief.jpg";
import hero2 from "@/assets/hero-water.jpg";
import hero3 from "@/assets/hero-mosque.jpg";

const slides = [
  {
    image: hero1,
    eyebrow: "সুন্নাহর অনুসরণে, মানবতার কল্যাণে",
    title: "ইউনাইট ফাউন্ডেশন — কুরআন ও সহীহ হাদীছের আলোকে",
    subtitle:
      "দাওয়াহ, তালীম, সমাজকল্যাণ ও জরুরি ত্রাণে আপনার পাশে। একটি অরাজনৈতিক ইসলামিক প্ল্যাটফর্ম — স্বচ্ছ, দায়িত্বশীল ও নিবেদিত।",
    primaryCta: { label: "এখনই দান করুন", to: "/donate" },
    secondaryCta: { label: "প্রকল্পসমূহ দেখুন", to: "/projects" },
  },
  {
    image: hero2,
    eyebrow: "জরুরি ক্যাম্পেইন",
    title: "ফিলিস্তিনে খাদ্য পৌঁছে দিন — তাদের পাশে দাঁড়ান",
    subtitle:
      "অবরুদ্ধ গাজা ও পশ্চিম তীরে ক্ষুধার্ত মুসলিম পরিবারের কাছে আপনার দান পৌঁছে দেব ইনশাআল্লাহ।",
    primaryCta: { label: "ফিলিস্তিনে দান করুন", to: "/donate?project=palestine-food" },
    secondaryCta: { label: "বিস্তারিত জানুন", to: "/projects/palestine-food" },
  },
  {
    image: hero3,
    eyebrow: "সদকায়ে জারিয়া",
    title: "মাসজিদ ও মাদরাসা নির্মাণে অংশ নিন",
    subtitle:
      "প্রত্যন্ত গ্রামে মসজিদ-মাদরাসা গড়ে তুলে স্থায়ী সওয়াবের অংশীদার হোন। একটি উদ্যোগ — অসংখ্য জীবনে পরিবর্তন।",
    primaryCta: { label: "মসজিদে দান করুন", to: "/donate?project=masjid-project" },
    secondaryCta: { label: "আরও দেখুন", to: "/projects" },
  },
];

export const Hero = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative h-[78vh] min-h-[560px] max-h-[780px] w-full overflow-hidden bg-foreground">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
          aria-hidden={idx !== i}
        >
          <img
            src={s.image}
            alt=""
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
            fetchPriority={idx === 0 ? "high" : "low"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
        </div>
      ))}

      <div className="relative h-full container-page flex items-center">
        <div className="max-w-2xl text-white">
          <div key={`eb-${i}`} className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-donate-highlight text-donate-highlight-foreground text-xs font-bold uppercase tracking-wider">
              <Heart className="h-3.5 w-3.5" />
              {slides[i].eyebrow}
            </span>
          </div>
          <h1
            key={`t-${i}`}
            className="animate-fade-up mt-5 text-4xl md:text-6xl font-extrabold leading-[1.1] text-white"
          >
            {slides[i].title}
          </h1>
          <p
            key={`s-${i}`}
            className="animate-fade-up mt-5 text-base md:text-lg text-white/85 leading-relaxed max-w-xl"
          >
            {slides[i].subtitle}
          </p>
          <div key={`c-${i}`} className="animate-fade-up mt-8 flex flex-wrap gap-3">
            <Link to={slides[i].primaryCta.to} className="btn-donate text-base">
              <Heart className="h-5 w-5" /> {slides[i].primaryCta.label}
            </Link>
            <Link
              to={slides[i].secondaryCta.to}
              className="inline-flex items-center gap-2 rounded-btn px-6 py-3 bg-white/10 backdrop-blur border border-white/30 text-white font-semibold hover:bg-white/20 transition-colors"
            >
              {slides[i].secondaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2">
        <button
          onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)}
          aria-label="পূর্বের"
          className="p-2.5 rounded-full bg-white/10 backdrop-blur text-white border border-white/20 hover:bg-white/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setI((v) => (v + 1) % slides.length)}
          aria-label="পরের"
          className="p-2.5 rounded-full bg-white/10 backdrop-blur text-white border border-white/20 hover:bg-white/20"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:bottom-8 md:right-32 flex gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`স্লাইড ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-donate-highlight" : "w-4 bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
};
