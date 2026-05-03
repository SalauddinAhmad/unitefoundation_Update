import { ShieldCheck, Award, FileText, Users } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "সরকার-নিবন্ধিত", note: "সমাজসেবা অধিদপ্তর কর্তৃক স্বীকৃত" },
  { icon: FileText, title: "বার্ষিক অডিট", note: "স্বাধীন চার্টার্ড অ্যাকাউন্ট্যান্ট দ্বারা" },
  { icon: Award, title: "শরীয়াহ-অনুমোদিত", note: "শরীয়াহ বোর্ড দ্বারা যাচাইকৃত" },
  { icon: Users, title: "৫০,০০০+ দাতা", note: "বিশ্বব্যাপী বিশ্বস্ত পরিবার" },
];

export const TrustStrip = () => {
  return (
    <section className="py-12 md:py-16 bg-background border-y border-border">
      <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-card bg-accent flex items-center justify-center text-primary shrink-0">
              <it.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-foreground">{it.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{it.note}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
