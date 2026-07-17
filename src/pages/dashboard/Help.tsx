import { useMemo, useState } from "react";
import {
  LifeBuoy,
  Search,
  BookOpen,
  PlayCircle,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  Rocket,
  HandCoins,
  Users2,
  Shield,
  FileText,
  Settings as SettingsIcon,
  ExternalLink,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  RefreshCcw,
  ImageIcon,
  Inbox,
  Wifi,
  MonitorSmartphone,
  ShieldAlert,
  Lightbulb,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";


// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------
type Step = { title: string; detail?: string };
type Topic = {
  id: string;
  title: string;
  summary: string;
  steps: Step[];
  tip?: string;
};
type Category = {
  key: string;
  icon: typeof Rocket;
  label: string;
  desc: string;
  color: string;
  iconBg: string;
  topics: Topic[];
};

// ------------------------------------------------------------
// DETAILED CONTENT (Bangla, non-technical, step-by-step)
// ------------------------------------------------------------
const categories: Category[] = [
  {
    key: "getting-started",
    icon: Rocket,
    label: "শুরু করুন",
    desc: "প্রথমবার ড্যাশবোর্ড ব্যবহারের গাইড",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconBg: "bg-emerald-500/15 text-emerald-700",
    topics: [
      {
        id: "first-login",
        title: "প্রথমবার লগইন কীভাবে করব?",
        summary: "আপনি ইমেইলে একটি স্বয়ংক্রিয় পাসওয়ার্ড পেয়েছেন — সেটি দিয়ে ঢুকুন এবং নিজের পাসওয়ার্ড সেট করুন।",
        steps: [
          { title: "ইমেইল খুলুন", detail: "‘Unite Foundation Admin Access’ বিষয়ের ইমেইলটি খুঁজুন। না পেলে Spam / Junk ফোল্ডার দেখুন।" },
          { title: "লগইন পেজে যান", detail: "ব্রাউজারে সাইটের ঠিকানা লিখুন → ডান পাশে ‘লগইন’ বাটন। অথবা সরাসরি /login পেজে যান।" },
          { title: "ইমেইল ও অস্থায়ী পাসওয়ার্ড দিন", detail: "ইমেইল ফিল্ডে আপনার ইমেইল, পাসওয়ার্ড ফিল্ডে ইমেইলে পাওয়া কোডটি কপি-পেস্ট করুন।" },
          { title: "নতুন পাসওয়ার্ড সেট করুন", detail: "সেটিংস → অ্যাকাউন্ট → ‘পাসওয়ার্ড পরিবর্তন’ থেকে অন্তত ৮ অক্ষরের একটি শক্ত পাসওয়ার্ড দিন।" },
        ],
        tip: "পাসওয়ার্ডে অন্তত একটি বড় হাতের অক্ষর, একটি সংখ্যা ও একটি বিশেষ চিহ্ন (!@#$) রাখুন।",
      },
      {
        id: "dashboard-tour",
        title: "ড্যাশবোর্ডের কোন অংশে কী আছে?",
        summary: "বাম পাশের সাইডবারে সব মেনু, উপরে সার্চ ও নোটিফিকেশন, মাঝখানে মূল কনটেন্ট।",
        steps: [
          { title: "সাইডবার (বাম)", detail: "প্রতিটি সেকশনে (দান, স্বেচ্ছাসেবক, ব্লগ ইত্যাদি) যেতে ক্লিক করুন। আপনার রোল অনুযায়ী শুধু অনুমোদিত মেনু দেখাবে।" },
          { title: "টপবার (উপর)", detail: "সার্চ বক্স, মেসেজ আইকন, নোটিফিকেশন ঘণ্টা এবং প্রোফাইল ড্রপডাউন থেকে দ্রুত লগআউট করা যায়।" },
          { title: "মূল কনটেন্ট", detail: "যেই মেনুতে ক্লিক করবেন, তার তথ্য মাঝখানে দেখাবে — এখান থেকে যোগ, সম্পাদনা বা রিপোর্ট করা যাবে।" },
        ],
      },
      {
        id: "role-limits",
        title: "কিছু মেনু আমি কেন দেখছি না?",
        summary: "প্রতিটি অ্যাডমিনের একটি রোল (Admin / Editor / Moderator / Viewer) থাকে — শুধু অনুমোদিত অংশই দেখা যায়।",
        steps: [
          { title: "নিজের রোল দেখুন", detail: "উপরের ডান কোণে প্রোফাইল আইকনে ক্লিক করুন — নাম ও ইমেইলের নিচে রোল লেখা থাকবে।" },
          { title: "অ্যাক্সেস প্রয়োজন হলে", detail: "সুপার অ্যাডমিনকে অনুরোধ করুন — তিনি সেটিংস → নিরাপত্তা ও রোল থেকে আপনার রোল পরিবর্তন করতে পারেন।" },
        ],
        tip: "‘Forbidden’ বা ‘আপনার অনুমতি নেই’ মেসেজ আসলে বুঝবেন — এই কাজের জন্য আপনার রোলে অনুমতি নেই।",
      },
    ],
  },
  {
    key: "donations",
    icon: HandCoins,
    label: "দান ব্যবস্থাপনা",
    desc: "ডোনেশন, রিসিট, পেমেন্ট চ্যানেল",
    color: "from-amber-500/20 to-amber-500/5",
    iconBg: "bg-amber-500/15 text-amber-700",
    topics: [
      {
        id: "donation-not-showing",
        title: "একজন দাতা টাকা পাঠিয়েছেন কিন্তু ড্যাশবোর্ডে দেখাচ্ছে না",
        summary: "মোবাইল ব্যাংকিং / ব্যাংক ট্রান্সফার স্বয়ংক্রিয়ভাবে যুক্ত হয় না — ম্যানুয়ালি এন্ট্রি দিতে হয়।",
        steps: [
          { title: "ট্রানজেকশন নিশ্চিত করুন", detail: "bKash/Nagad/ব্যাংক থেকে SMS বা স্টেটমেন্টে টাকা পাওয়া গেছে কিনা যাচাই করুন।" },
          { title: "দানসমূহ পেজে যান", detail: "ড্যাশবোর্ড → দানসমূহ → উপরে ডানে ‘ম্যানুয়াল এন্ট্রি’ বাটনে ক্লিক করুন।" },
          { title: "তথ্য দিন", detail: "দাতার নাম, ফোন, পরিমাণ, মাধ্যম (bKash/Nagad/Bank), ট্রানজেকশন ID এবং তারিখ পূরণ করুন।" },
          { title: "সংরক্ষণ করুন", detail: "‘যোগ করুন’ চাপলে সাথে সাথে তালিকায় দেখাবে ও রিপোর্টে যুক্ত হবে।" },
        ],
        tip: "SSLCommerz গেটওয়ে দিয়ে আসা দান স্বয়ংক্রিয়ভাবে যুক্ত হয় — সেগুলোর জন্য ম্যানুয়াল এন্ট্রির দরকার নেই।",
      },
      {
        id: "payment-account-update",
        title: "bKash / ব্যাংক অ্যাকাউন্ট নম্বর পরিবর্তন করব কীভাবে?",
        summary: "সেটিংস → পেমেন্ট অ্যাকাউন্ট ট্যাব থেকে সব পেমেন্ট চ্যানেল একসাথে আপডেট করা যায়।",
        steps: [
          { title: "সেটিংসে যান", detail: "সাইডবার → সেটিংস → উপরে ‘পেমেন্ট অ্যাকাউন্ট’ ট্যাব বেছে নিন।" },
          { title: "চ্যানেল আপডেট করুন", detail: "bKash, Nagad, Rocket — প্রতিটির নতুন নম্বর দিন। ব্যাংকের জন্য ‘ব্যাংক যোগ করুন’ বাটন ব্যবহার করুন।" },
          { title: "QR কোড আপডেট", detail: "‘বাংলা QR’ সেকশনে ইমেজ পিকার থেকে নতুন QR ছবি আপলোড করুন।" },
          { title: "সংরক্ষণ করুন", detail: "নিচে ‘সংরক্ষণ করুন’ চাপলেই হোম, দান পেজ ও মোডালে সব জায়গায় আপডেট হয়ে যাবে।" },
        ],
        tip: "পরিবর্তনের পর ব্রাউজার রিফ্রেশ (Ctrl+F5 / Cmd+Shift+R) করে নিশ্চিত হোন।",
      },
      {
        id: "download-report",
        title: "মাসিক / বার্ষিক দানের রিপোর্ট ডাউনলোড",
        summary: "দানসমূহ পেজ থেকে যেকোনো তারিখের রেঞ্জ বেছে PDF বা Excel এক্সপোর্ট করা যায়।",
        steps: [
          { title: "দানসমূহ পেজে যান" },
          { title: "ফিল্টার প্রয়োগ করুন", detail: "উপরে ডেট রেঞ্জ, মাধ্যম, স্ট্যাটাস অনুযায়ী ফিল্টার করুন।" },
          { title: "এক্সপোর্ট বাটন", detail: "উপরে ডানে ‘এক্সপোর্ট’ ড্রপডাউন → PDF বা CSV / Excel বেছে নিন। ফাইল স্বয়ংক্রিয়ভাবে ডাউনলোড হবে।" },
        ],
      },
    ],
  },
  {
    key: "members",
    icon: Users2,
    label: "সদস্য ও স্বেচ্ছাসেবক",
    desc: "আবেদন যাচাই, অনুমোদন ও যোগাযোগ",
    color: "from-sky-500/20 to-sky-500/5",
    iconBg: "bg-sky-500/15 text-sky-700",
    topics: [
      {
        id: "verify-application",
        title: "নতুন আবেদন যাচাই ও অনুমোদন",
        summary: "স্বেচ্ছাসেবক / সদস্য / জেলা প্রতিনিধি — প্রতিটির আবেদন একই পদ্ধতিতে যাচাই করা যায়।",
        steps: [
          { title: "নতুন আবেদন খুলুন", detail: "সাইডবার → স্বেচ্ছাসেবক / সদস্যপদ / জেলা প্রতিনিধি পেজে যান। নতুন আবেদনগুলোতে ‘Pending’ ব্যাজ থাকবে।" },
          { title: "বিস্তারিত দেখুন", detail: "সারিতে ক্লিক করলে ডান পাশে ফুল প্রোফাইল, ছবি ও উত্তরসমূহ দেখাবে।" },
          { title: "সিদ্ধান্ত নিন", detail: "‘অনুমোদন’ বা ‘বাতিল’ বাটনে ক্লিক করুন — বাতিল করলে কারণ লিখতে পারবেন।" },
          { title: "ইমেইল যাবে", detail: "সিদ্ধান্ত হলে আবেদনকারীর কাছে স্বয়ংক্রিয়ভাবে ইমেইল যাবে।" },
        ],
        tip: "ভুয়া মনে হলে ইমেইল ও ফোন দুটোই যাচাই করুন — সিস্টেম test@, temp mail স্বয়ংক্রিয়ভাবে ব্লক করে, কিন্তু নতুন প্যাটার্ন আসতে পারে।",
      },
      {
        id: "contact-applicant",
        title: "কোনো আবেদনকারীর সাথে যোগাযোগ",
        summary: "প্রতিটি আবেদনে ইমেইল / ফোন আইকন থাকে — সরাসরি ক্লিক করে যোগাযোগ করা যায়।",
        steps: [
          { title: "আবেদনকারীর প্রোফাইল খুলুন" },
          { title: "যোগাযোগ পদ্ধতি বেছে নিন", detail: "ইমেইল আইকন → ডিফল্ট ইমেইল অ্যাপে খুলবে। ফোন আইকন → মোবাইল হলে সরাসরি কল যাবে।" },
          { title: "ইন্টারনাল নোট", detail: "প্রোফাইলের নিচে ‘নোট যোগ করুন’ থেকে অন্য অ্যাডমিনদের জন্য নোট রাখতে পারবেন।" },
        ],
      },
    ],
  },
  {
    key: "content",
    icon: FileText,
    label: "কনটেন্ট ও ব্লগ",
    desc: "ব্লগ, প্রকল্প, গ্যালারি ও টিম",
    color: "from-violet-500/20 to-violet-500/5",
    iconBg: "bg-violet-500/15 text-violet-700",
    topics: [
      {
        id: "publish-blog",
        title: "নতুন ব্লগ পোস্ট প্রকাশ করব কীভাবে?",
        summary: "ব্লগ ও কনটেন্ট মেনু থেকে একটি নতুন পোস্ট তৈরি, ছবি যোগ ও প্রকাশ করা যায়।",
        steps: [
          { title: "ব্লগ পেজে যান", detail: "সাইডবার → ব্লগ ও কনটেন্ট → উপরে ‘নতুন পোস্ট’ বাটন।" },
          { title: "শিরোনাম ও বিবরণ", detail: "শিরোনাম, সংক্ষিপ্ত বিবরণ (সর্বোচ্চ ১৬০ অক্ষর — SEO-এর জন্য) ও মূল কনটেন্ট লিখুন।" },
          { title: "কভার ছবি", detail: "‘কভার ইমেজ’ বাটন → মিডিয়া লাইব্রেরি থেকে বেছে নিন বা নতুন আপলোড করুন। ল্যান্ডস্কেপ (16:9) সবচেয়ে ভালো।" },
          { title: "প্রকাশ", detail: "‘Draft’ = শুধু সংরক্ষণ, ‘Publish’ = সরাসরি লাইভ। যেকোনো সময় আবার সম্পাদনা করা যাবে।" },
        ],
        tip: "শিরোনামে মূল কীওয়ার্ড রাখুন। ছবির সাইজ 500KB-এর কম হলে পেজ দ্রুত লোড হয়।",
      },
      {
        id: "upload-gallery",
        title: "গ্যালারিতে নতুন ছবি যোগ",
        summary: "একাধিক ছবি একসাথে আপলোড করা যায়। বড় ছবি স্বয়ংক্রিয়ভাবে কমপ্রেস হয়।",
        steps: [
          { title: "গ্যালারি পেজে যান" },
          { title: "‘ছবি যোগ করুন’ বাটন" },
          { title: "ফাইল বেছে নিন", detail: "একাধিক ছবি একসাথে সিলেক্ট করা যায় (Ctrl/Cmd চেপে ধরে)। JPG, PNG, WebP সাপোর্টেড।" },
          { title: "ক্যাপশন ও ক্যাটাগরি দিন", detail: "প্রতিটি ছবিতে বাংলা ক্যাপশন ও ক্যাটাগরি দিন — ওয়েবসাইটে ফিল্টার করার জন্য দরকার।" },
        ],
        tip: "১০ MB-এর বেশি ছবি আপলোড হবে না — আগে অনলাইন কমপ্রেসর দিয়ে ছোট করুন।",
      },
      {
        id: "edit-project",
        title: "চলমান প্রকল্পের অগ্রগতি আপডেট",
        summary: "প্রকল্পের রেইজড অ্যামাউন্ট, স্ট্যাটাস ও ছবি নিয়মিত আপডেট করা যায়।",
        steps: [
          { title: "প্রকল্প পেজ → প্রকল্প বেছে নিন" },
          { title: "‘সম্পাদনা’ বাটন" },
          { title: "সংগৃহীত অর্থ আপডেট করুন", detail: "‘Raised Amount’ ফিল্ডে নতুন মোট লিখুন — প্রোগ্রেস বার স্বয়ংক্রিয়ভাবে পরিবর্তন হবে।" },
          { title: "সংরক্ষণ করুন" },
        ],
      },
    ],
  },
  {
    key: "security",
    icon: Shield,
    label: "নিরাপত্তা ও রোল",
    desc: "পাসওয়ার্ড, 2FA, অ্যাডমিন ব্যবস্থাপনা",
    color: "from-rose-500/20 to-rose-500/5",
    iconBg: "bg-rose-500/15 text-rose-700",
    topics: [
      {
        id: "forgot-password",
        title: "পাসওয়ার্ড ভুলে গেছি — কী করব?",
        summary: "লগইন পেজ থেকেই রিসেট লিংক ইমেইলে পাঠানো যায়। ৩০ মিনিটের মধ্যে ব্যবহার করতে হবে।",
        steps: [
          { title: "লগইন পেজে যান" },
          { title: "‘পাসওয়ার্ড ভুলে গেছেন?’", detail: "ফর্মের নিচে এই লিংকে ক্লিক করুন।" },
          { title: "ইমেইল দিন", detail: "আপনার অ্যাডমিন ইমেইল লিখে ‘রিসেট লিংক পাঠান’ চাপুন।" },
          { title: "ইমেইল চেক করুন", detail: "১-২ মিনিটের মধ্যে ইনবক্সে লিংক আসবে। না এলে Spam ফোল্ডার দেখুন।" },
          { title: "নতুন পাসওয়ার্ড সেট করুন" },
        ],
        tip: "লিংক ৩০ মিনিটে এক্সপায়ার হয়। এক লিংক শুধু একবারই কাজ করে।",
      },
      {
        id: "enable-2fa",
        title: "2FA (দ্বি-স্তর নিরাপত্তা) চালু",
        summary: "চালু করলে প্রতিবার লগইনে ইমেইলে একটি 6-digit OTP পাঠানো হবে।",
        steps: [
          { title: "সেটিংস → নিরাপত্তা ও রোল" },
          { title: "‘2FA চালু করুন’ টগল অন করুন" },
          { title: "একটি টেস্ট OTP পাবেন", detail: "সেটি বসিয়ে নিশ্চিত করুন — সিস্টেম যাচাই হয়ে গেলে 2FA সক্রিয়।" },
        ],
        tip: "পাবলিক কম্পিউটার / শেয়ার্ড ডিভাইস ব্যবহার করলে 2FA অবশ্যই চালু রাখুন।",
      },
      {
        id: "add-admin",
        title: "নতুন অ্যাডমিন যোগ (শুধু সুপার অ্যাডমিন)",
        summary: "নাম, ইমেইল ও রোল দিয়ে অ্যাডমিন তৈরি — সিস্টেম স্বয়ংক্রিয়ভাবে পাসওয়ার্ড ইমেইল করবে।",
        steps: [
          { title: "সেটিংস → নিরাপত্তা ও রোল → ‘নতুন অ্যাডমিন যোগ’" },
          { title: "তথ্য পূরণ করুন", detail: "নাম, ইমেইল, এবং রোল (Admin / Editor / Moderator / Viewer) বেছে নিন।" },
          { title: "সাবমিট করুন", detail: "সিস্টেম একটি স্বয়ংক্রিয় পাসওয়ার্ড তৈরি করে ওই ইমেইলে পাঠাবে।" },
        ],
        tip: "রোল সম্পর্কে নিশ্চিত না হলে ‘Viewer’ দিন — পরে বাড়ানো যাবে, কিন্তু ভুল করে বেশি অনুমতি দিলে সমস্যা।",
      },
      {
        id: "suspicious-activity",
        title: "সন্দেহজনক লগইন দেখলে",
        summary: "অ্যাক্টিভিটি লগে অচেনা IP বা সময় দেখলে সাথে সাথে পাসওয়ার্ড বদলান।",
        steps: [
          { title: "সাইডবার → অ্যাক্টিভিটি লগে যান" },
          { title: "সাম্প্রতিক লগইন দেখুন", detail: "IP, সময় ও ডিভাইস অনুযায়ী সাজানো থাকবে।" },
          { title: "সন্দেহ হলে", detail: "১) পাসওয়ার্ড পরিবর্তন করুন। ২) 2FA চালু করুন। ৩) সুপার অ্যাডমিনকে জানান।" },
        ],
      },
    ],
  },
  {
    key: "settings",
    icon: SettingsIcon,
    label: "সেটিংস ও কনফিগ",
    desc: "সাইট তথ্য, SMTP, নোটিফিকেশন",
    color: "from-teal-500/20 to-teal-500/5",
    iconBg: "bg-teal-500/15 text-teal-700",
    topics: [
      {
        id: "update-site-info",
        title: "সাইটের নাম / লোগো / যোগাযোগ পরিবর্তন",
        summary: "সেটিংস → সাধারণ ট্যাব থেকে সব সাইট-ব্যাপী তথ্য একসাথে বদলানো যায়।",
        steps: [
          { title: "সেটিংস → সাধারণ" },
          { title: "লোগো / ফেভিকন আপলোড", detail: "PNG / SVG ফরম্যাট, সর্বোচ্চ 1 MB।" },
          { title: "যোগাযোগ তথ্য", detail: "ঠিকানা, ফোন, ইমেইল, সোশ্যাল লিংক আপডেট করুন।" },
          { title: "সংরক্ষণ করুন — সাইটে সাথে সাথে পরিবর্তন দেখাবে" },
        ],
      },
      {
        id: "smtp-issue",
        title: "ইমেইল যাচ্ছে না — SMTP ঠিক আছে তো?",
        summary: "SMTP তথ্য ভুল থাকলে পাসওয়ার্ড রিসেট, রিপ্লাই, নতুন অ্যাডমিন — কোনো ইমেইলই যাবে না।",
        steps: [
          { title: "সেটিংস → SMTP ট্যাব খুলুন" },
          { title: "তথ্য যাচাই করুন", detail: "Host (যেমন smtp.gmail.com), Port (587 বা 465), Username, Password।" },
          { title: "‘টেস্ট ইমেইল পাঠান’ বাটন", detail: "নিজের ইমেইলে টেস্ট মেইল পাঠান — না এলে Password বা App-Password ভুল।" },
          { title: "Gmail ব্যবহার করলে", detail: "Gmail-এ App Password তৈরি করে ব্যবহার করুন, নিজের সাধারণ পাসওয়ার্ড দিলে হবে না।" },
        ],
        tip: "টেস্ট মেইল পেলেই বুঝবেন — সব ধরনের সিস্টেম মেইল কাজ করবে।",
      },
    ],
  },
];

// ------------------------------------------------------------
// COMMON ISSUES (Quick fix cards)
// ------------------------------------------------------------
const quickFixes = [
  {
    icon: KeyRound,
    title: "লগইন করতে পারছি না",
    fix: "পাসওয়ার্ড ভুলে গেছেন লিংক থেকে রিসেট করুন। ৩০ মিনিটে লিংক এক্সপায়ার হয়।",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  {
    icon: RefreshCcw,
    title: "পরিবর্তন সাইটে দেখাচ্ছে না",
    fix: "ব্রাউজারে Ctrl+F5 (Windows) বা Cmd+Shift+R (Mac) চেপে হার্ড রিফ্রেশ দিন।",
    color: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  {
    icon: ImageIcon,
    title: "ছবি আপলোড হচ্ছে না",
    fix: "ফাইল সাইজ 10 MB-এর নিচে ও ফরম্যাট JPG/PNG/WebP হওয়া লাগবে।",
    color: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  },
  {
    icon: Inbox,
    title: "মেসেজের ইমেইল যাচ্ছে না",
    fix: "সেটিংস → SMTP থেকে ‘টেস্ট ইমেইল’ পাঠিয়ে যাচাই করুন।",
    color: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  },
  {
    icon: Wifi,
    title: "পেজ লোড হচ্ছে না / স্লো",
    fix: "ইন্টারনেট চেক করুন। VPN বন্ধ করুন। অন্য ব্রাউজার (Chrome/Edge) দিয়ে চেষ্টা করুন।",
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  {
    icon: ShieldAlert,
    title: "‘Forbidden’ / অনুমতি নেই",
    fix: "আপনার রোলে এই কাজের অনুমতি নেই। সুপার অ্যাডমিনকে অনুরোধ করুন।",
    color: "bg-slate-500/10 text-slate-700 border-slate-500/20",
  },
];

// ------------------------------------------------------------
// GLOSSARY (Non-tech friendly)
// ------------------------------------------------------------
const glossary = [
  { term: "রোল (Role)", def: "একজন অ্যাডমিন কী কী করতে পারবেন — যেমন Admin সব পারে, Viewer শুধু দেখতে পারে।" },
  { term: "2FA", def: "দ্বি-স্তর নিরাপত্তা — পাসওয়ার্ডের সাথে ইমেইলে আসা OTP দিয়ে লগইন।" },
  { term: "SMTP", def: "সিস্টেম থেকে ইমেইল পাঠানোর সেটিং (যেমন Gmail-এর মাধ্যমে)।" },
  { term: "OTP", def: "One-Time Password — শুধু একবার ব্যবহারযোগ্য 6-digit কোড।" },
  { term: "Draft / Publish", def: "Draft = খসড়া (গোপন), Publish = ওয়েবসাইটে সবার জন্য প্রকাশিত।" },
  { term: "কমপ্রেস (Compress)", def: "ছবির মান ঠিক রেখে ফাইলের আকার ছোট করা।" },
];

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------
export default function Help() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("getting-started");
  const [openTopic, setOpenTopic] = useState<string | null>("first-login");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter topics across categories by search
  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    const out: Array<{ cat: Category; topic: Topic }> = [];
    categories.forEach((c) =>
      c.topics.forEach((t) => {
        const hay = (t.title + " " + t.summary + " " + t.steps.map((s) => s.title + " " + (s.detail || "")).join(" ")).toLowerCase();
        if (hay.includes(q)) out.push({ cat: c, topic: t });
      }),
    );
    return out;
  }, [query]);

  const current = categories.find((c) => c.key === activeCat)!;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "অনুগ্রহ করে সকল ফিল্ড পূরণ করুন", variant: "destructive" });
      return;
    }
    setSent(true);
    toast({ title: "✓ আপনার বার্তা পাঠানো হয়েছে", description: "আমরা ২৪ ঘন্টার মধ্যে যোগাযোগ করব।" });
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("support@unitefoundation.bd");
    setCopied(true);
    toast({ title: "ইমেইল কপি হয়েছে" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* ============ HERO ============ */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary via-primary to-emerald-900 text-primary-foreground p-8 md:p-12">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            সাহায্য কেন্দ্র
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.3]">
            কীভাবে সাহায্য করতে পারি?
          </h1>
          <p className="mt-3 text-white/85 text-base md:text-lg leading-relaxed">
            টেকনিক্যাল জ্ঞান ছাড়াই সমস্যার সমাধান খুঁজুন — নিচের যেকোনো ক্যাটাগরি বেছে নিন, অথবা সরাসরি সার্চ করুন।
          </p>
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="যেমন — পাসওয়ার্ড, দান যোগ, ছবি আপলোড, SMTP..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-foreground placeholder:text-muted-foreground shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30"
            />
          </div>
          {searchResults && (
            <div className="mt-2 text-xs text-white/80">
              {searchResults.length} টি ফলাফল পাওয়া গেছে
            </div>
          )}
        </div>
      </div>

      {/* ============ SEARCH RESULTS ============ */}
      {searchResults && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" /> সার্চ ফলাফল — “{query}”
          </h2>
          {searchResults.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              কোনো ফলাফল পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন অথবা নিচের যোগাযোগ ফর্ম ব্যবহার করুন।
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map(({ cat, topic }) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setQuery("");
                    setActiveCat(cat.key);
                    setOpenTopic(topic.id);
                    window.scrollTo({ top: 500, behavior: "smooth" });
                  }}
                  className="w-full text-left rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition group"
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <cat.icon className="h-3.5 w-3.5" /> {cat.label}
                  </div>
                  <div className="mt-1 font-bold group-hover:text-primary transition">{topic.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{topic.summary}</div>
                  <div className="mt-2 text-xs font-semibold text-primary inline-flex items-center gap-1">
                    বিস্তারিত পড়ুন <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ QUICK FIX CARDS ============ */}
      {!searchResults && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" /> সাধারণ সমস্যার দ্রুত সমাধান
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickFixes.map((q) => (
              <div key={q.title} className={`rounded-2xl border p-4 ${q.color}`}>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                    <q.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm">{q.title}</div>
                    <div className="text-xs mt-1 text-foreground/70 leading-relaxed">{q.fix}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ CATEGORY TABS + TOPICS ============ */}
      {!searchResults && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> বিষয় অনুযায়ী গাইড
          </h2>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {categories.map((c) => {
              const active = c.key === activeCat;
              return (
                <button
                  key={c.key}
                  onClick={() => {
                    setActiveCat(c.key);
                    setOpenTopic(c.topics[0]?.id || null);
                  }}
                  className={
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition border " +
                    (active
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-foreground/70 border-border hover:border-primary/40 hover:text-foreground")
                  }
                >
                  <c.icon className="h-4 w-4" /> {c.label}
                </button>
              );
            })}
          </div>

          {/* Topics for current category */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
              <div className={`h-12 w-12 rounded-xl ${current.iconBg} flex items-center justify-center shrink-0`}>
                <current.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{current.label}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{current.desc}</p>
                <div className="text-[11px] font-semibold text-primary mt-2">
                  {current.topics.length} টি বিষয়
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {current.topics.map((t) => {
                const open = openTopic === t.id;
                return (
                  <div
                    key={t.id}
                    className={`rounded-xl border transition-all ${open ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}
                  >
                    <button
                      onClick={() => setOpenTopic(open ? null : t.id)}
                      className="w-full flex items-start justify-between gap-3 p-4 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm md:text-base">{t.title}</div>
                        {!open && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.summary}</div>
                        )}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 mt-1 transition-transform ${open ? "rotate-180 text-primary" : "text-muted-foreground"}`}
                      />
                    </button>
                    {open && (
                      <div className="px-4 pb-5">
                        <p className="text-sm text-foreground/80 leading-relaxed mb-4">{t.summary}</p>

                        <ol className="space-y-3">
                          {t.steps.map((s, i) => (
                            <li key={i} className="flex gap-3">
                              <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                                {i + 1}
                              </div>
                              <div className="pt-0.5">
                                <div className="text-sm font-semibold">{s.title}</div>
                                {s.detail && (
                                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.detail}</div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ol>

                        {t.tip && (
                          <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                            <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                              <span className="font-bold">টিপস: </span>{t.tip}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============ GLOSSARY ============ */}
      {!searchResults && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MonitorSmartphone className="h-5 w-5 text-primary" /> শব্দকোষ — কঠিন কথার সহজ মানে
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {glossary.map((g) => (
              <div key={g.term} className="rounded-xl border border-border bg-card p-4">
                <div className="font-bold text-sm text-primary">{g.term}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{g.def}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ WHATSAPP SUPPORT ============ */}
      {(() => {
        const waNumber = "8801866090980";
        const waDisplay = "০১৮৬৬-০৯০৯৮০";
        const waMessage = encodeURIComponent("আসসালামু আলাইকুম, আমার ড্যাশবোর্ডে একটি সমস্যা হয়েছে —");
        return (
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-2xl shadow-emerald-900/20">
            {/* decorative blobs */}
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

            <div className="relative grid lg:grid-cols-2 gap-8 p-8 md:p-12 items-center">
              {/* LEFT — pitch */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  লাইভ সাপোর্ট
                </div>
                <h3 className="mt-4 text-3xl md:text-4xl font-extrabold leading-[1.3] tracking-tight">
                  এখনও সমাধান পাননি?
                </h3>
                <p className="mt-3 text-white/90 text-sm md:text-base leading-relaxed max-w-md">
                  সরাসরি হোয়াটসঅ্যাপে আমাদের সাথে চ্যাট করুন। সাধারণত <span className="font-bold">১-২ ঘন্টার</span> মধ্যে বাংলায় ব্যক্তিগত উত্তর দেওয়া হয়।
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2 max-w-md">
                  <div className="rounded-xl bg-white/10 backdrop-blur px-3 py-2.5 text-center">
                    <div className="text-lg font-extrabold">২৪/৭</div>
                    <div className="text-[10px] text-white/80 mt-0.5">উপলব্ধ</div>
                  </div>
                  <div className="rounded-xl bg-white/10 backdrop-blur px-3 py-2.5 text-center">
                    <div className="text-lg font-extrabold">১-২ ঘণ্টা</div>
                    <div className="text-[10px] text-white/80 mt-0.5">গড় উত্তর</div>
                  </div>
                  <div className="rounded-xl bg-white/10 backdrop-blur px-3 py-2.5 text-center">
                    <div className="text-lg font-extrabold">বাংলায়</div>
                    <div className="text-[10px] text-white/80 mt-0.5">কথা বলুন</div>
                  </div>
                </div>
              </div>

              {/* RIGHT — number card + CTA */}
              <div className="relative">
                <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-7 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-lg">
                      {/* WhatsApp glyph */}
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-white/70">হোয়াটসঅ্যাপ নাম্বার</div>
                      <div className="text-2xl md:text-3xl font-extrabold tracking-tight mt-0.5">{waDisplay}</div>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${waNumber}?text=${waMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-emerald-700 font-extrabold px-6 py-3.5 text-sm md:text-base hover:bg-emerald-50 transition shadow-lg"
                  >
                    <MessageCircle className="h-5 w-5" />
                    হোয়াটসঅ্যাপে চ্যাট শুরু করুন
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <div className="mt-4 flex items-start gap-2 text-xs text-white/80 leading-relaxed">
                    <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>দ্রুত সমাধানের জন্য বার্তায় কোন পেজে সমস্যা, কী চাপলেন এবং স্ক্রিনশট দিন।</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
