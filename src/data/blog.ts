import ramadan from "@/assets/blog-ramadan.jpg";
import field from "@/assets/blog-field.jpg";
import finance from "@/assets/blog-finance.jpg";

export type ContentBlock =
  | { type: "paragraph"; text: string; lead?: boolean }
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "image"; src: string; caption?: string; alt?: string; float?: "left" | "right" | "full" }
  | { type: "gallery"; images: { src: string; alt?: string }[] }
  | { type: "quote"; text: string; author?: string }
  | { type: "callout"; title?: string; text: string; variant?: "info" | "success" | "warn" }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "cta"; title: string; text?: string; buttonLabel: string; href: string }
  | { type: "divider" };

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  cover: string;
  banner?: string;
  date: string;
  readMin: number;
  body: (string | ContentBlock)[];
}

export const posts: BlogPost[] = [
  {
    slug: "ramadan-2026-appeal",
    title: "রমজান ২০২৬: প্রতিটি ইফতার এক অসহায়ের মুখে হাসি",
    category: "ক্যাম্পেইন",
    excerpt:
      "এই রমজানে আমাদের লক্ষ্য ৫০,০০০ পরিবারের কাছে ইফতার সামগ্রী ও সেহরির খাবার পৌঁছে দেওয়া।",
    cover: ramadan,
    banner: ramadan,
    date: "১০ ফেব্রুয়ারি ২০২৬",
    readMin: 4,
    body: [
      { type: "paragraph", lead: true, text: "রমজান শুধু সিয়াম-সাধনার মাস নয়, এটি সহমর্মিতার মাসও। নবী করীম (সা.) এই মাসে দান-সদকা সবচেয়ে বেশি করতেন। আমরা আপনাকে আহ্বান জানাচ্ছি — এই বরকতময় মাসে অসহায় মানুষের পাশে দাঁড়ান।" },
      { type: "stats", items: [
        { value: "৫০,০০০", label: "লক্ষ্য পরিবার" },
        { value: "৪০+", label: "জেলা" },
        { value: "১,২০০৳", label: "প্রতি প্যাকেজ" },
        { value: "৩০ দিন", label: "সময়সীমা" },
      ]},
      { type: "heading", text: "আমাদের এই বছরের পরিকল্পনা" },
      { type: "paragraph", text: "এ বছর আমাদের লক্ষ্য দেশের ৪০টি জেলার ৫০,০০০ পরিবারের ঘরে ইফতার ও সেহরি সামগ্রী পৌঁছে দেওয়া। প্রতিটি প্যাকেজের আনুমানিক খরচ ১,২০০ টাকা।" },
      { type: "image", src: field, caption: "গত বছরের রমজানে কুড়িগ্রামে ইফতার প্যাকেজ বিতরণের মুহূর্ত।", alt: "ইফতার বিতরণ" },
      { type: "quote", text: "যে ব্যক্তি কোনো রোজাদারকে ইফতার করাবে, তার জন্য ঐ রোজাদারের সমপরিমাণ সওয়াব রয়েছে।", author: "সহীহ তিরমিযী" },
      { type: "heading", text: "প্রতিটি প্যাকেজে যা থাকবে" },
      { type: "list", items: [
        "চাল, ডাল, তেল ও ছোলা — ১০ কেজি",
        "খেজুর, চিনি, দুধ ও সেমাই",
        "মশলা ও প্রয়োজনীয় নিত্যপণ্য",
        "সেহরির জন্য অতিরিক্ত সামগ্রী",
      ]},
      { type: "callout", variant: "info", title: "স্বচ্ছতা নিশ্চিত", text: "প্রতিটি বিতরণের ছবি ও রিপোর্ট আপনি আমাদের ড্যাশবোর্ডে দেখতে পারবেন।" },
      { type: "paragraph", text: "আপনার একটি দান একটি পরিবারের পুরো রমজান বদলে দিতে পারে। চলুন একসাথে এই কাজ সম্পন্ন করি।" },
      { type: "cta", title: "এখনই অংশ নিন এই বরকতে", text: "১টি প্যাকেজ = ১টি পরিবারের ৩০ দিনের হাসি।", buttonLabel: "এখনই দান করুন", href: "/donate" },
    ],
  },
  {
    slug: "field-report-kurigram",
    title: "মাঠ থেকে প্রতিবেদন: কুড়িগ্রামের কম্বল বিতরণ",
    category: "ফিল্ড রিপোর্ট",
    excerpt:
      "কুড়িগ্রামের চিলমারী উপজেলায় ১,২০০ পরিবারকে কম্বল ও শীতবস্ত্র বিতরণ সম্পন্ন।",
    cover: field,
    banner: field,
    date: "২২ জানুয়ারি ২০২৬",
    readMin: 6,
    body: [
      { type: "paragraph", lead: true, text: "তীব্র শীতে কাঁপতে থাকা চরাঞ্চলের মানুষের কাছে আমরা পৌঁছেছি — শুধু কম্বল নয়, পৌঁছেছে দোয়া, ভালোবাসা এবং একটি বার্তা: 'তুমি একা নও।'" },
      { type: "image", src: field, caption: "চিলমারীর চরে কম্বল বিতরণের একটি মুহূর্ত।" },
      { type: "paragraph", text: "চিলমারী, রৌমারী ও রাজীবপুরের ১৪টি গ্রামে মোট ১,২০০ পরিবার এবার শীতবস্ত্র পেয়েছেন। আমাদের ৩২ জন স্বেচ্ছাসেবক টানা ৫ দিন কাজ করেছেন।",
      },
      { type: "paragraph", text: "এই কাজে অংশ নেওয়া প্রতিটি দাতার প্রতি আমরা কৃতজ্ঞ। আপনার দানের প্রতিটি টাকার হিসাব আমরা প্রকাশ করি — কারণ স্বচ্ছতা আমাদের সবচেয়ে বড় ওয়াদা।" },
    ],
  },
  {
    slug: "transparency-report-q4",
    title: "স্বচ্ছতা প্রতিবেদন: ২০২৫ সালের চতুর্থ ত্রৈমাসিক",
    category: "স্বচ্ছতা",
    excerpt:
      "অক্টোবর-ডিসেম্বর ২০২৫ সময়কালে সংগৃহীত ও ব্যয়িত প্রতিটি টাকার পূর্ণাঙ্গ হিসাব।",
    cover: finance,
    date: "১৫ জানুয়ারি ২০২৬",
    readMin: 8,
    body: [
      "চতুর্থ ত্রৈমাসিকে আমরা মোট ৩.৮৪ কোটি টাকা সংগ্রহ করেছি, যার ৯৩.২% সরাসরি প্রকল্পে ব্যয় হয়েছে।",
      "প্রশাসনিক ব্যয় মাত্র ৪.৫%, এবং ২.৩% তহবিল সংরক্ষিত রাখা হয়েছে ভবিষ্যৎ জরুরি প্রতিক্রিয়ার জন্য।",
      "সম্পূর্ণ অডিট রিপোর্ট পিডিএফ আকারে আমাদের ওয়েবসাইটে উপলব্ধ। যেকোনো প্রশ্নের জন্য সরাসরি যোগাযোগ করতে পারেন।",
    ],
  },
  {
    slug: "well-impact-satkhira",
    title: "সাতক্ষীরায় ১০০তম গভীর নলকূপ স্থাপন",
    category: "প্রভাব",
    excerpt:
      "লবণাক্ত উপকূলে আমাদের ১০০তম গভীর নলকূপ স্থাপন এক মাইলফলক।",
    cover: field,
    date: "৫ জানুয়ারি ২০২৬",
    readMin: 5,
    body: [
      "সাতক্ষীরার শ্যামনগর উপজেলায় গত সপ্তাহে আমাদের ১০০তম গভীর নলকূপ স্থাপন সম্পন্ন হয়েছে।",
      "এই একটি নলকূপ থেকে ৬৮টি পরিবার নিরাপদ পানি পাচ্ছে। মোট ১০০টি নলকূপ থেকে এখন ৫,৪০০-এর বেশি পরিবার উপকৃত হচ্ছেন।",
      "প্রত্যেক দাতার জন্য সদকায়ে জারিয়া হিসেবে এই কাজ চলমান থাকবে ইনশাআল্লাহ।",
    ],
  },
  {
    slug: "orphan-meet-2025",
    title: "এতিম শিশুদের সাথে বার্ষিক মিলনমেলা",
    category: "ইভেন্ট",
    excerpt: "৪২০ জন এতিম শিশুর সাথে দাতাদের পরিচয় ও দিনব্যাপী আনন্দ আয়োজন।",
    cover: ramadan,
    date: "২৮ ডিসেম্বর ২০২৫",
    readMin: 4,
    body: [
      "ঢাকার একটি মাঠে আয়োজিত এই অনুষ্ঠানে দাতারা সরাসরি তাদের স্পনসর করা শিশুদের সাথে দেখা করেছেন।",
      "শিশুরা পেয়েছে নতুন জামা, খেলনা এবং সবচেয়ে গুরুত্বপূর্ণ — ভালোবাসা ও সময়।",
    ],
  },
  {
    slug: "why-zakat-matters",
    title: "যাকাত: শুধু ফরজ নয়, একটি অর্থনৈতিক বিপ্লব",
    category: "শিক্ষা",
    excerpt: "যাকাত কীভাবে সমাজে সম্পদের ন্যায্য বণ্টন নিশ্চিত করে — একটি সংক্ষিপ্ত বিশ্লেষণ।",
    cover: finance,
    date: "১২ ডিসেম্বর ২০২৫",
    readMin: 7,
    body: [
      "ইসলামের পঞ্চম স্তম্ভ যাকাত শুধু একটি ইবাদত নয় — এটি একটি সামাজিক ও অর্থনৈতিক ব্যবস্থা।",
      "আপনার যাকাত সঠিক হাতে পৌঁছানো নিশ্চিত করতে আমাদের যাকাত-নির্দিষ্ট তহবিল ব্যবহার করুন।",
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
