import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { DonationChannelsSection } from "@/components/home/DonationChannelsSection";
import { MembershipDonorSection } from "@/components/donation/MembershipDonorSection";
import { SSLCommerzPayCard } from "@/components/donation/SSLCommerzPayCard";

const Donate = () => {
  const { t } = useTranslation();

  return (
    <SiteLayout>
      <Seo
        title={t("donatePage.seoTitle")}
        description={t("donatePage.seoDesc")}
        canonical="/donate"
      />

      <section className="bg-gradient-to-b from-primary/5 via-background to-background pt-10 pb-4">
        <div className="container mx-auto px-4">
          <figure className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-primary/20 bg-card/70 backdrop-blur-sm shadow-sm">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary to-primary/40" aria-hidden="true" />
            <div className="p-6 sm:p-8 text-center">
              <span aria-hidden="true" className="block text-4xl leading-none text-primary/40 font-serif">”</span>
              <blockquote className="mt-2 text-lg sm:text-xl md:text-2xl font-medium leading-relaxed text-foreground">
                তোমরা একটি খেজুরের টুকরা দান করে হলেও জাহান্নামের আগুন থেকে বাঁচো।
              </blockquote>
              <figcaption className="mt-4 text-sm sm:text-base text-muted-foreground">
                — তিরমিযী, হা/২৯৫৩
              </figcaption>
            </div>
          </figure>
        </div>
      </section>

      <SSLCommerzPayCard />
      <DonationChannelsSection />
      <MembershipDonorSection />
    </SiteLayout>
  );
};

export default Donate;
