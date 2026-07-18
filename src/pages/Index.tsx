import { Seo } from "@/components/Seo";
import { Hero } from "@/components/home/Hero";

import { AboutSection } from "@/components/home/AboutSection";
import { ProgramsSection } from "@/components/home/ProgramsSection";
import { GallerySection } from "@/components/home/GallerySection";
import { ImpactStats } from "@/components/home/ImpactStats";
import { PartnersSection } from "@/components/home/PartnersSection";
import { VisitorCounter } from "@/components/home/VisitorCounter";
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
      <ProgramsSection />

      <ImpactStats />
      <HomeDonationChannelsSection />
      <GallerySection />
      <PartnersSection />
      <VisitorCounter />
        </>
      )}
    </SiteLayout>
  );
};

export default Index;
