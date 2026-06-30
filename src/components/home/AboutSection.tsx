import { CheckCircle2 } from "lucide-react";
import about from "@/assets/about-mission.jpg";

const points = [
  "পবিত্র কুরআন ও সহীহ হাদীছের আলোকে পরিচালিত",
  "দাওয়াহ, তালীম, সমাজকল্যাণ ও জরুরি ত্রাণে নিবেদিত",
  "শতভাগ স্বচ্ছ ও শরীয়াহ-সম্মত আর্থিক ব্যবস্থাপনা",
  "প্রতিটি দানের জন্য বিস্তারিত প্রভাব প্রতিবেদন",
];

export const AboutSection = () => {
  return (
    <section className="section-y bg-background">
      <div className="container-page grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="rounded-card overflow-hidden shadow-card">
            <img src={about} alt="ইউনাইট ফাউন্ডেশনের স্বেচ্ছাসেবকরা মাঠে কাজ করছেন" loading="lazy" width={1200} height={900} className="w-full h-auto" />
          </div>
          <div className="absolute -bottom-6 -right-2 md:-right-6 hidden sm:block bg-card rounded-card p-5 shadow-card-hover max-w-[240px]">
            <div className="text-3xl font-bold text-primary">১৫+</div>
            <div className="text-sm text-muted-foreground mt-1">বছরের অভিজ্ঞতা ও বিশ্বাস</div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="heading-display text-left">
            সুন্নাহর অনুসরণে, মানবতার কল্যাণে{" "}
            <span className="gradient-donate-text">ইউনাইট ফাউন্ডেশন</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-[1.85]">
            ইউনাইট ফাউন্ডেশন একটি অরাজনৈতিক ও অলাভজনক ইসলামিক প্ল্যাটফর্ম। পবিত্র কুরআন
            ও সহীহ হাদীছের দাওয়াত পৌঁছে দেওয়া, তরুণ সমাজকে তাক্বওয়াশীল দাঈ হিসেবে গড়ে
            তোলা, বিশুদ্ধ আক্বীদা ও আমলের সচেতনতা সৃষ্টি এবং সমাজকল্যাণমূলক কার্যক্রম
            পরিচালনাই আমাদের প্রধান লক্ষ্য।
          </p>

          <blockquote className="mt-6 border-l-4 border-donate-highlight pl-5 py-2 bg-accent/40 rounded-r-card">
            <p className="text-foreground italic leading-relaxed">
              "তোমরা একটি খেজুরের টুকরা দান করে হলেও জাহান্নামের আগুন থেকে বাঁচো।"
            </p>
            <footer className="text-sm text-muted-foreground mt-2 font-en">— তিরমিযী, হা/২৯৫৩</footer>
          </blockquote>

          <ul className="mt-6 grid sm:grid-cols-2 gap-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
