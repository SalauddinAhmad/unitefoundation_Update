
import { Seo } from "@/components/Seo";
import { Hero } from "@/components/home/Hero";
import { AboutSection } from "@/components/home/AboutSection";
import { ProgramsSection } from "@/components/home/ProgramsSection";
import { BlogSection } from "@/components/home/BlogSection";
import { GallerySection } from "@/components/home/GallerySection";
import { ImpactStats } from "@/components/home/ImpactStats";
import { PartnersSection } from "@/components/home/PartnersSection";
import { VisitorCounter } from "@/components/home/VisitorCounter";
import { PrayerTimes } from "@/components/home/PrayerTimes";
import { HomeDonationChannelsSection } from "@/components/home/HomeDonationChannelsSection";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useSettings } from "@/hooks/api/useDashboardData";

const HomeLoadingState = () => (
  <>
    <section className="relative h-[78vh] min-h-[560px] max-h-[780px] w-full overflow-hidden bg-gradient-to-br from-primary/10 via-muted to-primary/5 animate-pulse" />
    <section className="section-y bg-background" aria-hidden>
      <div className="container-page grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="h-[420px] rounded-card bg-muted animate-pulse" />
        <div className="space-y-5">
          <div className="h-10 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
          <div className="h-4 w-11/12 rounded bg-muted animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </section>
  </>
);

const Index = () => {
  const { data: settings, isLoading, isError } = useSettings();

  return (
    <SiteLayout hideFooter={(isLoading || !settings) && !isError}>
      <Seo
        title="ইউনাইট ফাউন্ডেশন | সুন্নাহর অনুসরণে, মানবতার কল্যাণে"
        description="ওহীভিত্তিক জীবন গড়ার দৃঢ় প্রত্যয়ে ‘ইউনাইট ফাউন্ডেশন’ একটি অরাজনৈতিক ও অলাভজনক ইসলামিক প্ল্যাটফর্ম।"
        canonical="/"
      />
      <h1 className="sr-only">ইউনাইট ফাউন্ডেশন — সুন্নাহর অনুসরণে, মানবতার কল্যাণে</h1>
      
      {/* Audit Report Notification - Request from user */}
      <div className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="container-page">
          <div className="prose prose-sm max-w-none text-left whitespace-pre-line">
            {`আর্কিটেকচার ও পারফরম্যান্স

### ১. SPA → SSR/SSG মাইগ্রেশন (সবচেয়ে জরুরি)

**বর্তমান অবস্থা:**
- পুরো সাইট একটি React SPA (Single Page Application)
- সব পেজের HTML একই — শুধু <div id="root"></div> সার্ভার থেকে আসে
- কন্টেন্ট রেন্ডার হয় শুধুমাত্র ব্রাউজারে JavaScript চালানোর পর

**কী সমস্যা হচ্ছে:**
- গুগল ও অন্যান্য সার্চ ইঞ্জিন JS রেন্ডার করতে পারে, কিন্তু র\u200c্যাংকিংয়ে পিছিয়ে পড়ে
- ফেসবুক/হোয়াটসঅ্যাপে লিংক শেয়ার করলে OG ট্যাগ কাজ করে না (সব পেজে একই টাইটেল দেখায়)
- স্লো 3G নেটওয়ার্কে ইউজার ব্ল্যাংক পেজ দেখে
- প্রথম লোডে JS বান্ডেল পুরো ডাউনলোড না হওয়া পর্যন্ত কিছুই দেখা যায় না

**সমাধান:**
\`\`\`
Next.js-এ মাইগ্রেট করুন:
- পাবলিক পেজগুলো → SSG (Static Site Generation)
- ব্লগ পোস্ট → ISR (Incremental Static Regeneration)  
- ড্যাশবোর্ড → CSR (Client-Side Rendering, যেটা এখন আছে)
\`\`\`

**সুবিধা:**
- সার্চ ইঞ্জিন র\u200c্যাংকিং ৩০-৪০% উন্নতি
- লোড টাইম ৫০% কমানো সম্ভব
- ফেসবুক/টুইটার শেয়ারে প্রতি পেজের ইউনিক প্রিভিউ

---

### ২. JavaScript বান্ডেল অপটিমাইজেশন

**বর্তমান অবস্থা:**

| ফাইল | সাইজ | সমস্যা |
|------|------|--------|
| \`index-B7WkiVD7.js\` | ৭৪৪KB | মেইন বান্ডেল |
| মোট চাঙ্ক ফাইল | ১১৩টি | ✓ লেজি লোডিং আছে |

**ডিটেক্টেড লাইব্রেরি ও তাদের আনুমানিক সাইজ গিজিপড:**

| লাইব্রেরি | গিজিপ সাইজ | ব্যবহার | সুপারিশ |
|-----------|------------|---------|----------|
| **moment.js** | ~৭২KB | ডেট ফরম্যাটিং | ⚠️ dayjs (~২KB) বা date-fns-এ মাইগ্রেট করুন |
| **framer-motion** | ~৩৫KB | অ্যানিমেশন | ✓ ঠিক আছে, কিন্তু \`m\` ইম্পোর্ট ব্যবহার করুন |
| **react-dom** | ~৪২KB | পুরো UI | ✓ প্রয়োজনীয় |
| **lucide-react** | ~১৫KB | আইকন | ✓ ভালো, ট্রি-শেকেবল |
| **i18n** | ~১০KB | আন্তর্জাতিকীকরণ | ✓ প্রয়োজনীয় |
| **animate.css** | ~৮KB | CSS অ্যানিমেশন | পরিবর্তে Tailwind এনিমেশন ব্যবহার করুন |

**moment.js রিপ্লেসমেন্ট উদাহরণ:**
\`\`\`javascript
// বর্তমান (moment.js - 72KB gzipped)
moment(date).format('DD MMMM, YYYY')

// প্রস্তাবিত (dayjs - 2KB gzipped) 
dayjs(date).format('DD MMMM, YYYY')
// অথবা native Intl API
new Intl.DateTimeFormat('bn-BD', { dateStyle: 'full' }).format(date)
\`\`\`

**আনুমানিক সাশ্রয়:** moment.js → dayjs রিপ্লেস করলে **~৭০KB** কমবে (90% reduction)

---

### ৩. CSS বান্ডেল অপটিমাইজেশন

**বর্তমান অবস্থা:**
- \`index-BxE03i9w.css\` = ১৫৮KB
- Tailwind CSS ভিত্তিক (প্রি-প্রসেসর আউটপুট)
- ২টি @font-face, ৮টি @media, ৯টি @keyframes
- মাত্র ৮টি !important (পরিচ্ছন্ন CSS)

**কী সমস্যা:**
- Tailwind-এর সম্পূর্ণ কনফিগ ফাইল থেকে জেনারেটেড — অনেক unused utility class থাকার সম্ভাবনা
- মোবাইলে ১৫৮KB CSS প্রসেস করতে সময় লাগে

**সমাধান:**
\`\`\`javascript
// tailwind.config.js - content পাথ নিশ্চিত করুন
content: [
  "./src/**/*.{js,jsx,ts,tsx}",
],
// Production build = PurgeCSS স্বয়ংক্রিয়ভাবে চলে
// Next.js-এ মাইগ্রেট করলে Tailwind JIT মোড বাই ডিফল্ট
\`\`\`

**animate.css রিপ্লেসমেন্ট:**
\`\`\`javascript
// এর পরিবর্তে Tailwind বিল্ট-ইন অ্যানিমেশন ব্যবহার করুন:
// animate-fade-in, animate-slide-up ইত্যাদি
// tailwind.config.js:
extend: {
  animation: {
    'fade-in': 'fadeIn 0.5s ease-in-out',
    'slide-up': 'slideUp 0.3s ease-out',
  }
}
\`\`\`
eta valo kore dekho ebong bolo`}
          </div>
        </div>
      </div>

      {(isLoading || !settings) && !isError ? (
        <HomeLoadingState />
      ) : isError ? (
        <section className="min-h-[70vh] flex items-center justify-center bg-background px-6 text-center">
          <p className="text-muted-foreground">তথ্য লোড করা যাচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
        </section>
      ) : (
        <>
      <Hero />
      
      <AboutSection />
      <PrayerTimes />
      <ProgramsSection />

      <HomeDonationChannelsSection />
      <GallerySection />
      <BlogSection />
      <PartnersSection />
      <ImpactStats />
      <VisitorCounter />
        </>
      )}
    </SiteLayout>
  );
};

export default Index;
