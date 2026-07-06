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

const Index = () => {
  return (
    <SiteLayout>
      <Seo
        title="ইউনাইট ফাউন্ডেশন | সুন্নাহর অনুসরণে, মানবতার কল্যাণে"
        description="বাংলাদেশের সবচেয়ে স্বচ্ছ ইসলামিক চ্যারিটি প্ল্যাটফর্ম। খাদ্য, পানি, এতিম স্পনসরশিপ, শিক্ষা ও মসজিদ নির্মাণে সরাসরি দান করুন।"
        canonical="/"
      />
      <h1 className="sr-only">ইউনাইট ফাউন্ডেশন — সুন্নাহর অনুসরণে, মানবতার কল্যাণে</h1>
      <Hero />
      
      <AboutSection />
      <ProgramsSection />

      <ImpactStats />
      <HomeDonationChannelsSection />
      <GallerySection />
      <PartnersSection />
      <VisitorCounter />
    </SiteLayout>
  );
};

export default Index;
