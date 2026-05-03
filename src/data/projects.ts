import food from "@/assets/program-food.jpg";
import orphan from "@/assets/program-orphan.jpg";
import water from "@/assets/program-water.jpg";
import education from "@/assets/program-education.jpg";
import mosque from "@/assets/program-mosque.jpg";
import winter from "@/assets/program-winter.jpg";
import relief from "@/assets/hero-relief.jpg";
import waterHero from "@/assets/hero-water.jpg";

export type Category =
  | "দাওয়াহ"
  | "মাদরাসা"
  | "মাসজিদ"
  | "ইয়াতিম"
  | "শিক্ষা"
  | "ফিলিস্তিন"
  | "পথশিশু"
  | "দুর্যোগ"
  | "শীতবস্ত্র"
  | "কুরবানী"
  | "কর্জ-এ-হাসানাহ"
  | "ইউনাইট টিভি";

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
    slug: "madrasa-project",
    title: "মাদরাসা প্রজেক্ট",
    category: "মাদরাসা",
    shortDescription: "সহীহ দ্বীনি শিক্ষার প্রসারে মাদরাসা পরিচালনা ও অবকাঠামোগত উন্নয়ন।",
    description:
      "ইউনাইট ফাউন্ডেশনের তত্ত্বাবধানে পরিচালিত মাদরাসাগুলোতে শিক্ষার্থীরা কুরআন, সহীহ হাদীছ ও আধুনিক বিষয়ে যুগোপযোগী শিক্ষা গ্রহণ করছে। আপনার দান শ্রেণিকক্ষ সম্প্রসারণ, শিক্ষক বেতন, পাঠ্যবই ও ছাত্রদের আবাসন নিশ্চিত করতে ব্যয় হবে।",
    image: education,
    gallery: [education, mosque],
    target: 5000000,
    raised: 1850000,
    donors: 642,
    location: "ঢাকা ও সিলেট",
  },
  {
    id: "p2",
    slug: "masjid-project",
    title: "মাসজিদ প্রজেক্ট — সদকায়ে জারিয়া",
    category: "মাসজিদ",
    shortDescription: "প্রত্যন্ত অঞ্চলে মসজিদ নির্মাণ ও সংস্কারে অংশ নিয়ে স্থায়ী সওয়াবের অংশীদার হোন।",
    description:
      "প্রত্যন্ত অঞ্চলে যেখানে মসজিদ নেই কিংবা জরাজীর্ণ, সেখানে নতুন মসজিদ নির্মাণ ও পুরাতন মসজিদ সংস্কারের মাধ্যমে সালাত কায়েমের পরিবেশ গড়ে তোলা হচ্ছে। একটি সম্পূর্ণ মসজিদের আনুমানিক ব্যয় ১৮ লক্ষ টাকা।",
    image: mosque,
    gallery: [mosque],
    target: 1800000,
    raised: 740000,
    donors: 218,
    location: "জামালপুর, কুড়িগ্রাম",
  },
  {
    id: "p3",
    slug: "dawah-project",
    title: "দাওয়াহ প্রজেক্ট",
    category: "দাওয়াহ",
    shortDescription: "সাধারণ মানুষের মাঝে কুরআন ও সহীহ হাদীছের সঠিক বার্তা পৌঁছে দেওয়ার বিশেষ কার্যক্রম।",
    description:
      "বিজ্ঞ আলেমের মাধ্যমে সাপ্তাহিক দাওয়াতী কার্যক্রম, মাসিক প্রশিক্ষণ, সেমিনার, লিফলেট ও পুস্তিকা প্রকাশনার মাধ্যমে আমরা সমাজে সঠিক ইসলামের বার্তা ছড়িয়ে দিচ্ছি।",
    image: relief,
    gallery: [relief],
    target: 1500000,
    raised: 620000,
    donors: 312,
    location: "সারা দেশে",
  },
  {
    id: "p4",
    slug: "unite-tv",
    title: "ইউনাইট টিভি (অনলাইন)",
    category: "ইউনাইট টিভি",
    shortDescription: "আধুনিক প্রযুক্তির মাধ্যমে সুস্থ বিনোদন ও নির্ভরযোগ্য ইসলামিক শিক্ষার উৎস।",
    description:
      "ইউনাইট টিভি একটি অনলাইন ভিত্তিক ইসলামিক চ্যানেল — যেখানে কুরআন তাফসীর, হাদীছ পাঠ, ইসলামী জীবনধারা, শিশু-কিশোরদের জন্য কন্টেন্ট ও সমকালীন বিশ্লেষণ প্রচারিত হয়।",
    image: education,
    gallery: [education],
    target: 3000000,
    raised: 950000,
    donors: 428,
    location: "অনলাইন",
  },
  {
    id: "p5",
    slug: "yatim-project",
    title: "ইয়াতিম প্রজেক্ট — স্পনসরশিপ",
    category: "ইয়াতিম",
    shortDescription: "এতিম শিশুদের অভিভাবকত্ব গ্রহণ, ভরণপোষণ ও সুশিক্ষার ব্যবস্থা।",
    description:
      "মাত্র ২,৫০০ টাকায় একজন এতিম শিশুর সম্পূর্ণ মাসিক খরচ — খাদ্য, বস্ত্র, শিক্ষা ও চিকিৎসা — বহন করুন। প্রতি মাসে আপনার শিশুর অগ্রগতির রিপোর্ট ও ছবি পাবেন।",
    image: orphan,
    gallery: [orphan],
    target: 12600000,
    raised: 9450000,
    donors: 3128,
    location: "ঢাকা ও চট্টগ্রাম",
  },
  {
    id: "p6",
    slug: "palestine-food",
    title: "ফিলিস্তিনে খাদ্য প্রজেক্ট",
    category: "ফিলিস্তিন",
    shortDescription: "নির্যাতিত ও ক্ষুধার্ত ফিলিস্তিনি ভাই-বোনদের জন্য জরুরি খাদ্য সহায়তা।",
    description:
      "অবরুদ্ধ গাজা ও পশ্চিম তীরে আমাদের পার্টনার সংস্থার মাধ্যমে খাদ্য, পানি ও জরুরি ত্রাণ সামগ্রী পৌঁছে দেওয়া হচ্ছে। আপনার প্রতিটি দান একটি ক্ষুধার্ত পরিবারের জীবন বাঁচাতে পারে।",
    image: food,
    gallery: [food, relief],
    target: 10000000,
    raised: 6420000,
    donors: 4280,
    urgent: true,
    location: "ফিলিস্তিন",
  },
  {
    id: "p7",
    slug: "street-children",
    title: "পথশিশু প্রজেক্ট",
    category: "পথশিশু",
    shortDescription: "সুবিধাবঞ্চিত শিশুদের জীবনমান উন্নয়ন ও মৌলিক অধিকার নিশ্চিত করা।",
    description:
      "পথশিশুদের জন্য নিয়মিত খাবার, পোশাক, চিকিৎসা ও মৌলিক শিক্ষার ব্যবস্থা করছি। লক্ষ্য — তাদের একটি মর্যাদাপূর্ণ জীবন ফিরিয়ে দেওয়া।",
    image: orphan,
    gallery: [orphan],
    target: 2400000,
    raised: 980000,
    donors: 412,
    location: "ঢাকা মহানগরী",
  },
  {
    id: "p8",
    slug: "education-scholarship",
    title: "শিক্ষা প্রজেক্ট — শিক্ষাবৃত্তি",
    category: "শিক্ষা",
    shortDescription: "অর্থাভাবে শিক্ষা থেমে যাওয়া শিক্ষার্থীদের শিক্ষাবৃত্তি ও সহযোগিতা।",
    description:
      "মাধ্যমিক থেকে উচ্চশিক্ষা পর্যন্ত মেধাবী কিন্তু আর্থিকভাবে অসচ্ছল শিক্ষার্থীদের বার্ষিক বৃত্তি, পাঠ্যবই, ইউনিফর্ম ও কোচিং সাপোর্ট প্রদান করা হচ্ছে।",
    image: education,
    gallery: [education],
    target: 5500000,
    raised: 2200000,
    donors: 734,
    location: "১২টি জেলা",
  },
  {
    id: "p9",
    slug: "flood-relief",
    title: "বন্যা দুর্গত পুনর্বাসন",
    category: "দুর্যোগ",
    shortDescription: "বন্যা কবলিত মানুষের উদ্ধার, খাদ্য ও পুনর্বাসনে জরুরি সহায়তা।",
    description:
      "বন্যা কবলিত এলাকায় উদ্ধার তৎপরতা, শুকনো খাবার, বিশুদ্ধ পানি, ঔষধ ও অস্থায়ী আশ্রয় ব্যবস্থা — পরবর্তীতে ঘর পুনর্নির্মাণ ও জীবিকা পুনর্বাসনের সহায়তা।",
    image: water,
    gallery: [water, waterHero],
    target: 7500000,
    raised: 3120000,
    donors: 1418,
    urgent: true,
    location: "সিলেট ও ফেনী",
  },
  {
    id: "p10",
    slug: "winter-blanket",
    title: "শীতবস্ত্র বিতরণ",
    category: "শীতবস্ত্র",
    shortDescription: "তীব্র শীতে অসহায় মানুষের মাঝে উন্নতমানের কম্বল ও শীতবস্ত্র বিতরণ।",
    description:
      "প্রতি বছর শীতের তীব্রতায় উত্তরবঙ্গের লক্ষাধিক মানুষ কষ্ট পায়। প্রতিটি কম্বলের খরচ মাত্র ৬০০ টাকা — আপনার একটি দান একজন মানুষের রাত পাল্টে দিতে পারে।",
    image: winter,
    gallery: [winter, relief],
    target: 6000000,
    raised: 3850000,
    donors: 1247,
    urgent: true,
    location: "রংপুর বিভাগ",
  },
  {
    id: "p11",
    slug: "qurbani-project",
    title: "কুরবানী প্রজেক্ট",
    category: "কুরবানী",
    shortDescription: "ত্যাগের মহিমায় দরিদ্র ও দুর্গম এলাকায় কুরবানীর তাজা গোশত পৌঁছে দিন।",
    description:
      "ঈদুল আযহায় দেশের প্রত্যন্ত অঞ্চলের অসহায় পরিবারের কাছে কুরবানির তাজা গোশত পৌঁছে দেওয়া হবে। আপনি একটি অংশ বা সম্পূর্ণ গরু/ছাগল কুরবানি দিতে পারেন।",
    image: relief,
    gallery: [relief, food],
    target: 8000000,
    raised: 1240000,
    donors: 96,
    location: "৩৪টি জেলা",
  },
  {
    id: "p12",
    slug: "qarz-e-hasanah",
    title: "কর্জ-এ-হাসানাহ প্রজেক্ট",
    category: "কর্জ-এ-হাসানাহ",
    shortDescription: "অভাবী মানুষকে সুদমুক্ত ঋণে স্বাবলম্বী করা — সুদের অভিশাপ থেকে মুক্তি।",
    description:
      "ছোট ব্যবসা শুরু কিংবা চিকিৎসার মতো জরুরি প্রয়োজনে সুদমুক্ত ঋণ (কর্জ-এ-হাসানাহ) প্রদান করা হয়। ঋণগ্রহীতা সক্ষমতা অনুযায়ী কিস্তিতে পরিশোধ করেন — আপনার দান বারবার বহু পরিবারের কাজে আসে।",
    image: food,
    gallery: [food],
    target: 5000000,
    raised: 1920000,
    donors: 286,
    location: "সারা দেশে",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const formatBDT = (n: number) =>
  new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 0 }).format(n);

export const toBnNum = (n: number | string) =>
  String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
