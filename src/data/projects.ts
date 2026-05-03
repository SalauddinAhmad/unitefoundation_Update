import food from "@/assets/program-food.jpg";
import orphan from "@/assets/program-orphan.jpg";
import water from "@/assets/program-water.jpg";
import education from "@/assets/program-education.jpg";
import mosque from "@/assets/program-mosque.jpg";
import winter from "@/assets/program-winter.jpg";
import relief from "@/assets/hero-relief.jpg";
import waterHero from "@/assets/hero-water.jpg";

export type Category = "ত্রাণ" | "এতিম" | "শিক্ষা" | "পানি" | "মসজিদ" | "শীত";

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: Category;
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
  target: number; // in BDT
  raised: number;
  donors: number;
  urgent?: boolean;
  location: string;
}

export const projects: Project[] = [
  {
    id: "p1",
    slug: "winter-blanket-2026",
    title: "শীতার্তদের পাশে — কম্বল বিতরণ ২০২৬",
    category: "শীত",
    shortDescription: "উত্তরবঙ্গের ১০,০০০ পরিবারের কাছে শীতবস্ত্র পৌঁছে দিতে আপনার সহযোগিতা প্রয়োজন।",
    description:
      "প্রতি বছর শীতের তীব্রতায় উত্তরবঙ্গের লক্ষাধিক মানুষ কষ্ট পায়। এ বছর আমরা রংপুর, কুড়িগ্রাম, লালমনিরহাট, পঞ্চগড় ও নীলফামারী জেলার ১০,০০০ অসহায় পরিবারের কাছে মানসম্মত কম্বল পৌঁছে দিতে চাই। প্রতিটি কম্বলের খরচ মাত্র ৬০০ টাকা — আপনার একটি দান একজন মানুষের রাত পাল্টে দিতে পারে।",
    image: winter,
    gallery: [winter, relief],
    target: 6000000,
    raised: 3850000,
    donors: 1247,
    urgent: true,
    location: "রংপুর বিভাগ",
  },
  {
    id: "p2",
    slug: "orphan-sponsorship",
    title: "এতিম শিশুদের মাসিক স্পনসরশিপ",
    category: "এতিম",
    shortDescription: "মাত্র ২,৫০০ টাকায় একজন এতিম শিশুর সম্পূর্ণ মাসিক খরচ বহন করুন।",
    description:
      "আমাদের তত্ত্বাবধানে থাকা ৪২০ জন এতিম শিশুর খাদ্য, বস্ত্র, শিক্ষা ও চিকিৎসার সম্পূর্ণ ব্যয় দাতাদের অনুদানে চলে। স্পনসর হলে আপনি প্রতি মাসে আপনার শিশুর অগ্রগতির রিপোর্ট ও ছবি পাবেন।",
    image: orphan,
    gallery: [orphan],
    target: 12600000,
    raised: 9450000,
    donors: 3128,
    location: "ঢাকা ও চট্টগ্রাম",
  },
  {
    id: "p3",
    slug: "deep-tubewell",
    title: "নিরাপদ পানির জন্য গভীর নলকূপ",
    category: "পানি",
    shortDescription: "একটি গভীর নলকূপ ৫০টি পরিবারের আজীবন বিশুদ্ধ পানির ব্যবস্থা করে।",
    description:
      "আর্সেনিক ও লবণাক্ত এলাকায় বিশুদ্ধ পানির অভাবে শিশুরা ডায়রিয়া, টাইফয়েডসহ নানা রোগে ভোগে। মাত্র ৩৫,০০০ টাকায় একটি গভীর নলকূপ স্থাপন করা যায়, যা একটি জনপদের জন্য সদকায়ে জারিয়া।",
    image: water,
    gallery: [water, waterHero],
    target: 3500000,
    raised: 1820000,
    donors: 562,
    location: "সাতক্ষীরা ও খুলনা",
  },
  {
    id: "p4",
    slug: "food-package",
    title: "মাসিক খাদ্য সহায়তা প্যাকেজ",
    category: "ত্রাণ",
    shortDescription: "একটি পরিবারের এক মাসের চাল, ডাল, তেল ও নিত্যপ্রয়োজনীয় সামগ্রী।",
    description:
      "প্রতিটি খাদ্য প্যাকেজে রয়েছে ২৫ কেজি চাল, ৩ কেজি ডাল, ২ লিটার সয়াবিন তেল, ১ কেজি লবণ, চিনি, সেমাই এবং অন্যান্য জরুরি সামগ্রী — যা একটি ৫ সদস্যের পরিবারের এক মাসের খাবার নিশ্চিত করে।",
    image: food,
    gallery: [food, relief],
    target: 4500000,
    raised: 2980000,
    donors: 1812,
    urgent: true,
    location: "সারা দেশে",
  },
  {
    id: "p5",
    slug: "girls-education",
    title: "মেয়েদের শিক্ষা বৃত্তি কর্মসূচি",
    category: "শিক্ষা",
    shortDescription: "দরিদ্র মেধাবী ছাত্রীদের বই, ইউনিফর্ম ও মাসিক বৃত্তি।",
    description:
      "৬ষ্ঠ থেকে দ্বাদশ শ্রেণির মেধাবী কিন্তু আর্থিকভাবে অসচ্ছল ছাত্রীদের পড়াশোনা যাতে অর্থের অভাবে থেমে না যায় — সেজন্য আমরা বার্ষিক বৃত্তি, পাঠ্যবই, ইউনিফর্ম এবং কোচিং সাপোর্ট প্রদান করি।",
    image: education,
    gallery: [education],
    target: 5500000,
    raised: 2200000,
    donors: 734,
    location: "১২টি জেলা",
  },
  {
    id: "p6",
    slug: "village-mosque",
    title: "গ্রামীণ মসজিদ নির্মাণ — সদকায়ে জারিয়া",
    category: "মসজিদ",
    shortDescription: "একটি মসজিদ নির্মাণে অংশ নিয়ে স্থায়ী সওয়াবের অংশীদার হোন।",
    description:
      "জামালপুরের একটি প্রত্যন্ত গ্রামে ১৫০ মুসল্লির ধারণক্ষমতাসম্পন্ন মসজিদ নির্মাণ চলমান। নামাজের জায়গা, অজুখানা, ইমামের কক্ষ ও মক্তবসহ সম্পূর্ণ প্রকল্পের ব্যয় ১৮ লক্ষ টাকা।",
    image: mosque,
    gallery: [mosque],
    target: 1800000,
    raised: 740000,
    donors: 218,
    location: "জামালপুর",
  },
  {
    id: "p7",
    slug: "qurbani-2026",
    title: "কুরবানির গোশত বিতরণ ২০২৬",
    category: "ত্রাণ",
    shortDescription: "দেশের অসহায় পরিবারের কাছে কুরবানির তাজা গোশত পৌঁছে দিন।",
    description:
      "ঈদুল আযহায় দেশের প্রত্যন্ত অঞ্চলের ৮,০০০ পরিবারের কাছে কুরবানির তাজা গোশত পৌঁছে দেওয়া হবে। আপনি একটি অংশ বা সম্পূর্ণ গরু/ছাগল কুরবানি দিতে পারেন।",
    image: relief,
    gallery: [relief, food],
    target: 8000000,
    raised: 1240000,
    donors: 96,
    location: "৩৪টি জেলা",
  },
  {
    id: "p8",
    slug: "medical-camp",
    title: "ভ্রাম্যমাণ চিকিৎসা ক্যাম্প",
    category: "ত্রাণ",
    shortDescription: "প্রত্যন্ত অঞ্চলে বিনামূল্যে চিকিৎসা ও ঔষধ বিতরণ।",
    description:
      "আমাদের চিকিৎসক দল প্রতি মাসে ৪টি প্রত্যন্ত অঞ্চলে গিয়ে বিনামূল্যে চিকিৎসা সেবা ও প্রয়োজনীয় ঔষধ বিতরণ করে। প্রতিটি ক্যাম্পে গড়ে ৩৫০ জন রোগী সেবা পান।",
    image: orphan,
    gallery: [orphan],
    target: 2400000,
    raised: 1680000,
    donors: 412,
    location: "হাওর ও উপকূলীয় অঞ্চল",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const formatBDT = (n: number) =>
  new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 0 }).format(n);

export const toBnNum = (n: number | string) =>
  String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
