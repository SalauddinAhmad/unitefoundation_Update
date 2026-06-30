import { Seo } from "@/components/Seo";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { AboutSection } from "@/components/home/AboutSection";
import { ProgramsSection } from "@/components/home/ProgramsSection";
import { GallerySection } from "@/components/home/GallerySection";
import { ImpactStats } from "@/components/home/ImpactStats";
import { PartnersSection } from "@/components/home/PartnersSection";
import { DonationChannelsSection } from "@/components/home/DonationChannelsSection";
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
      <TrustStrip />
      <AboutSection />
      <ProgramsSection />

      <ImpactStats />
      <DonationChannelsSection />
      <GallerySection />
      <PartnersSection />
    </SiteLayout>
  );
};

export default Index;
