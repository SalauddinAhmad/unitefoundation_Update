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

      <section className="lg:hidden relative bg-gradient-to-b from-primary/[0.05] to-background pt-6 pb-4 sm:pt-8 sm:pb-6">
        <div className="container mx-auto px-4">
          <figure className="relative mx-auto max-w-2xl">
            <div className="relative flex items-stretch gap-3 sm:gap-4 rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm px-4 py-3.5 sm:px-6 sm:py-4 shadow-sm">
              <div aria-hidden="true" className="w-1 shrink-0 rounded-full bg-gradient-to-b from-primary/70 via-primary/40 to-primary/70" />
              <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute -top-2.5 -right-2.5 h-6 w-6 text-primary/80 fill-current drop-shadow-sm">
                <path d="M12 2l2.39 6.96H22l-6.19 4.5L18.18 22 12 17.27 5.82 22l2.37-8.54L2 8.96h7.61z" />
              </svg>
              <div className="flex-1 min-w-0">
                <blockquote className="text-[15px] sm:text-base leading-[1.75] text-foreground font-medium">
                  <span aria-hidden="true" className="text-primary/40 font-serif mr-1">“</span>
                  তোমরা একটি খেজুরের টুকরা দান করে হলেও জাহান্নামের আগুন থেকে বাঁচো।
                  <span aria-hidden="true" className="text-primary/40 font-serif ml-0.5">”</span>
                </blockquote>
                <figcaption className="mt-1.5 text-[11px] sm:text-xs text-primary/90 font-medium">
                  — সহীহ্‌ তিরমিযী, হা/২৯৫৩
                </figcaption>
              </div>
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
