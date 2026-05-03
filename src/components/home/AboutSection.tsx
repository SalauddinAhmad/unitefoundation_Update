import { CheckCircle2 } from "lucide-react";
import about from "@/assets/about-mission.jpg";

const points = [
  "১০০% শরীয়াহ-সম্মত ও স্বচ্ছ আর্থিক ব্যবস্থাপনা",
  "প্রতিটি দানের জন্য বিস্তারিত প্রভাব প্রতিবেদন",
  "নিজস্ব ফিল্ড টিম ও যাচাইকৃত সুবিধাভোগী",
  "প্রশাসনিক ব্যয় ৫% এর নিচে",
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
          <span className="eyebrow">আমরা কারা</span>
          <h2 className="heading-display mt-3">
            স্বচ্ছতা, আস্থা ও মানবতার সেবায়{" "}
            <span className="gradient-donate-text">নিবেদিত</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-[1.85]">
            ইউনাইট ফাউন্ডেশন একটি অরাজনৈতিক, অলাভজনক ইসলামিক চ্যারিটি প্ল্যাটফর্ম। আমরা
            বিশ্বাস করি — প্রকৃত দান সেটিই, যা সঠিক হাতে, সঠিক সময়ে পৌঁছায়। ২০১১ সাল থেকে
            আমরা দেশের প্রত্যন্ত অঞ্চলে কাজ করে চলেছি — আপনার বিশ্বাসকে সঙ্গী করে।
          </p>

          <blockquote className="mt-6 border-l-4 border-donate-highlight pl-5 py-2 bg-accent/40 rounded-r-card">
            <p className="text-foreground italic leading-relaxed">
              "যে ব্যক্তি একজন মুমিনের একটি দুনিয়াবি কষ্ট দূর করে দেয়, আল্লাহ কিয়ামতের
              দিন তার একটি কষ্ট দূর করে দেবেন।"
            </p>
            <footer className="text-sm text-muted-foreground mt-2 font-en">— সহীহ মুসলিম</footer>
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
