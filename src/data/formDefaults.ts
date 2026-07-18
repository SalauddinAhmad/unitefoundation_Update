// Default schemas for every dashboard-editable public form.
// Used as fallback when the backend has no row yet, and as "reset to default".

export type FieldType =
  | "text" | "email" | "tel" | "number" | "url" | "date"
  | "textarea" | "select" | "radio-group" | "checkbox-group" | "checkbox" | "section";

export type FormField = {
  key: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  help?: string;
  full?: boolean;
  system?: boolean; // system fields: key locked, cannot delete
};

export type FormStat = { v: string; l: string };

export type FormExtras = {
  intro?: string;
  bullets_title?: string;
  bullets?: string[];
  quote_text?: string;
  quote_source?: string;
  stats?: FormStat[];
  banner_type?: "none" | "image" | "video";
  banner_url?: string; // data URI, absolute URL, or YouTube URL for video
};

export type FormSchema = {
  form_key: string;
  title: string;
  subtitle: string;
  fields: FormField[];
  extras?: FormExtras;
};

export const EMPTY_EXTRAS: FormExtras = {
  intro: "",
  bullets_title: "",
  bullets: [],
  quote_text: "",
  quote_source: "",
  stats: [],
  banner_type: "none",
  banner_url: "",
};

export const FORM_KEYS = [
  "volunteer",
  "representative",
  "donor",
  "member",
] as const;
export type FormKey = (typeof FORM_KEYS)[number];

export const FORM_LABEL: Record<FormKey, string> = {
  volunteer: "স্বেচ্ছাসেবক আবেদন",
  representative: "জেলা প্রতিনিধি আবেদন",
  donor: "নিয়মিত দাতা",
  member: "সদস্যপদ (আজীবন / দাতা)",
};

const volunteer: FormSchema = {
  form_key: "volunteer",
  title: "স্বেচ্ছাসেবক ফর্ম",
  subtitle: "নিচের তথ্য পূরণ করে আবেদন জমা দিন — আমরা যাচাই করে যোগাযোগ করব।",
  fields: [
    { key: "name", label: "পূর্ণ নাম", placeholder: "আপনার নাম", type: "text", required: true, system: true },
    { key: "phone", label: "মোবাইল নম্বর", placeholder: "01XXXXXXXXX", type: "tel", required: true, system: true },
    { key: "email", label: "ইমেইল (ঐচ্ছিক)", placeholder: "example@mail.com", type: "email", system: true },
    { key: "age", label: "বয়স", placeholder: "১৮-৬০", type: "number", required: true },
    { key: "city", label: "শহর / জেলা", placeholder: "যেমন: ঢাকা", type: "text", required: true },
    { key: "profession", label: "পেশা / শ্রেণি", placeholder: "যেমন: ছাত্র / শিক্ষক", type: "text" },
    { key: "area", label: "আগ্রহের ক্ষেত্র", type: "select", required: true,
      options: ["ত্রাণ বিতরণ", "শিক্ষা মেন্টরশিপ", "মিডিয়া ও কনটেন্ট", "স্বাস্থ্যসেবা ক্যাম্প", "ফান্ডরাইজিং", "অন্যান্য"] },
    { key: "availability", label: "প্রতি সপ্তাহে সময় দিতে পারবেন", type: "select", required: true,
      options: ["১-৩ ঘণ্টা", "৪-৭ ঘণ্টা", "৮-১৫ ঘণ্টা", "১৫+ ঘণ্টা"] },
    { key: "motivation", label: "কেন যুক্ত হতে চান?", placeholder: "সংক্ষেপে বলুন…", type: "textarea", required: true, full: true },
  ],
  extras: {
    intro: "স্বেচ্ছাসেবা শুধু সময়দান নয় — এটি একটি ইবাদত। আপনার ছোট প্রচেষ্টা বদলে দিতে পারে কারো জীবনের গল্প।",
    bullets_title: "স্বেচ্ছাসেবকের কাজের ক্ষেত্র",
    bullets: [
      "বন্যা, শীত ও দুর্যোগে মাঠপর্যায়ে ত্রাণ",
      "এতিম শিশুদের শিক্ষায় সাপ্তাহিক সময়দান",
      "ফ্রি মেডিকেল ক্যাম্পে অংশগ্রহণ",
      "ফান্ডরাইজিং প্রচারণায় সহযোগিতা",
      "ফটোগ্রাফি, ভিডিও ও সোশ্যাল মিডিয়া",
      "দাওয়াহ ও মসজিদ কেন্দ্রিক কার্যক্রম",
    ],
    quote_text: "আল্লাহর কাছে সর্বাধিক প্রিয় আমল হলো, যা সদাসর্বদা নিয়মিত করা হয়, যদিও তা অল্প হয়।",
    quote_source: "(সহীহ বুখারী, হাদীস ৬৪৬৪)",
    stats: [
      { v: "৩,৪৫০+", l: "স্বেচ্ছাসেবক" },
      { v: "১৪", l: "জেলা নেটওয়ার্ক" },
      { v: "১২৮০+", l: "প্রকল্প" },
    ],
    banner_type: "none",
    banner_url: "",
  },
};

const representative: FormSchema = {
  form_key: "representative",
  title: "জেলা প্রতিনিধি ফর্ম",
  subtitle: "নিজ এলাকায় ফাউন্ডেশনের প্রতিনিধিত্ব করতে চাইলে আবেদন করুন।",
  fields: [
    { key: "_sec1", label: "ব্যক্তিগত তথ্য", type: "section", full: true },
    { key: "fullName", label: "পূর্ণ নাম", type: "text", required: true, system: true },
    { key: "guardianName", label: "পিতা/অভিভাবকের নাম", type: "text", required: true },
    { key: "dob", label: "জন্ম তারিখ", type: "date", required: true },
    { key: "nid", label: "জাতীয় পরিচয়পত্র নং", placeholder: "10-17 digits", type: "text", required: true },
    { key: "district", label: "জেলা", placeholder: "যেমন: কুমিল্লা", type: "text", required: true },
    { key: "profession", label: "পেশা", type: "select", required: true,
      options: ["ছাত্র", "শিক্ষক", "চাকরিজীবী", "ব্যবসায়ী", "কৃষক", "অন্যান্য"] },
    { key: "currentAddress", label: "বর্তমান ঠিকানা", type: "textarea", required: true },
    { key: "permanentAddress", label: "স্থায়ী ঠিকানা", type: "textarea", required: true },

    { key: "_sec2", label: "শিক্ষা", type: "section", full: true },
    { key: "educationMediums", label: "শিক্ষার মাধ্যম", type: "checkbox-group", required: true, full: true,
      options: ["সাধারণ (বাংলা)", "ইংরেজি", "মাদ্রাসা", "কারিগরি"] },
    { key: "educationDetails", label: "সর্বোচ্চ শিক্ষাগত যোগ্যতা", type: "textarea", required: true, full: true },

    { key: "_sec3", label: "যোগাযোগ", type: "section", full: true },
    { key: "whatsapp", label: "WhatsApp নম্বর", placeholder: "01XXXXXXXXX", type: "tel", required: true, system: true },
    { key: "email", label: "ইমেইল (ঐচ্ছিক)", type: "email", system: true },
    { key: "socialLink", label: "ফেসবুক / সোশ্যাল লিংক", type: "url", full: true },

    { key: "_sec4", label: "অভিজ্ঞতা ও প্রেরণা", type: "section", full: true },
    { key: "experience", label: "পূর্ব সাংগঠনিক অভিজ্ঞতা (ঐচ্ছিক)", type: "textarea", full: true },
    { key: "whyJoin", label: "কেন জেলা প্রতিনিধি হতে চান?", type: "textarea", required: true, full: true },
    { key: "emergencyName", label: "জরুরি যোগাযোগ (নাম)", type: "text", required: true },
    { key: "emergencyPhone", label: "জরুরি যোগাযোগ (মোবাইল)", type: "tel", required: true },

    { key: "_sec5", label: "রাজনৈতিক পরিচয়", type: "section", full: true },
    { key: "political", label: "কোনো রাজনৈতিক দলের সাথে জড়িত?", type: "radio-group", required: true, full: true,
      options: ["না", "হ্যাঁ"] },

    { key: "agree", label: "আমি নিয়ম-শর্তে সম্মত এবং প্রদত্ত তথ্য সঠিক", type: "checkbox", required: true, full: true },
  ],
  extras: {
    intro: "আল-হামদুলিল্লাহ! ইউনাইট ফাউন্ডেশনের পরিবারে নতুন করে যুক্ত হওয়ার সুযোগ তৈরি হয়েছে। দেশব্যাপী আমাদের সেবামূলক কাজগুলোকে আরও বেগবান করতে প্রতিটি জেলা থেকে ১ জন করে নিবেদিত প্রাণ প্রতিনিধি খুঁজে নিচ্ছি আমরা। মহান আল্লাহর সন্তুষ্টির জন্য নিজ এলাকায় মানবতার সেবায় এগিয়ে আসুন।",
    bullets_title: "জেলা প্রতিনিধি",
    bullets: [
      "দ্বীনি জ্ঞান: ইসলামের মৌলিক ইলম ও দ্বীনি বিষয়ে জ্ঞান",
      "সমকালীন সচেতনতা: মিডিয়া ও প্রচারমাধ্যম সম্পর্কে স্বচ্ছ ধারণা",
      "আমল ও সুন্নাহ: মুত্তাকি এবং সুন্নাহর একনিষ্ঠ অনুসারী",
      "নিষ্ঠা: মুখলিস, আত্মপ্রচারণা ও পার্থিব মোহমুক্ত",
      "প্রতিটি জেলা থেকে মাত্র ১ জন — আবেদন গুরুত্বের সাথে পূরণ করুন",
    ],
    quote_text: "তোমাদের মধ্যে সেই ব্যক্তিই শ্রেষ্ঠ, যে মানুষের কল্যাণে নিয়োজিত থাকে।",
    quote_source: "(হাদীস)",
    stats: [
      { v: "৬৪", l: "জেলা" },
      { v: "১ জন", l: "প্রতি জেলা" },
      { v: "১০০%", l: "গোপনীয়তা" },
    ],
    banner_type: "none",
    banner_url: "",
  },
};

const donor: FormSchema = {
  form_key: "donor",
  title: "নিয়মিত দাতা নিবন্ধন",
  subtitle: "মাসিক দানের মাধ্যমে টেকসই সহায়তায় অংশ নিন।",
  fields: [
    { key: "name", label: "পূর্ণ নাম", type: "text", required: true, system: true },
    { key: "phone", label: "মোবাইল নম্বর", type: "tel", required: true, system: true },
    { key: "email", label: "ইমেইল (ঐচ্ছিক)", type: "email", system: true },
    { key: "city", label: "শহর / জেলা", type: "text", required: true },
    { key: "area", label: "দানের ক্ষেত্র", type: "select", required: true, full: true,
      options: ["এতিম শিশু", "শিক্ষা", "খাদ্য সহায়তা", "চিকিৎসা", "মসজিদ নির্মাণ", "যেখানে প্রয়োজন"] },
    { key: "amount", label: "মাসিক দানের পরিমাণ (৳)", type: "select", required: true,
      options: ["৳ ৫০০", "৳ ১,০০০", "৳ ২,৫০০", "৳ ৫,০০০", "৳ ১০,০০০", "কাস্টম"] },
    { key: "method", label: "পেমেন্ট মাধ্যম", type: "select", required: true,
      options: ["bKash", "Nagad", "Rocket", "ব্যাংক", "কার্ড"] },
    { key: "note", label: "বার্তা (ঐচ্ছিক)", type: "textarea", full: true },
  ],
};

const member: FormSchema = {
  form_key: "member",
  title: "সদস্যপদ আবেদন",
  subtitle: "আজীবন অথবা দাতা সদস্যপদ গ্রহণ করুন।",
  fields: [
    { key: "name", label: "পূর্ণ নাম", type: "text", required: true, system: true },
    { key: "phone", label: "মোবাইল নম্বর", type: "tel", required: true, system: true },
    { key: "email", label: "ইমেইল (ঐচ্ছিক)", type: "email", system: true },
    { key: "city", label: "শহর / জেলা", type: "text", required: true },
    { key: "profession", label: "পেশা", type: "text" },
    { key: "type", label: "সদস্যপদের ধরন", type: "select", required: true,
      options: ["আজীবন সদস্য (৳৫০,০০০)", "দাতা সদস্য (৳২৫,০০০)", "সম্মানিত সদস্য (৳১,০০,০০০)"] },
    { key: "address", label: "সম্পূর্ণ ঠিকানা", type: "textarea", required: true, full: true },
    { key: "note", label: "বার্তা (ঐচ্ছিক)", type: "textarea", full: true },
  ],
};

export const FORM_DEFAULTS: Record<FormKey, FormSchema> = {
  volunteer,
  representative,
  donor,
  member,
};
