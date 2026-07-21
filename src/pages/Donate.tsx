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

      <section className="lg:hidden relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-primary/[0.03] to-background pt-6 pb-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 15%, hsl(var(--primary)/0.5), transparent 45%), radial-gradient(circle at 85% 85%, hsl(var(--primary)/0.4), transparent 45%)",
          }}
        />
        <div className="container mx-auto px-4 relative">
          <figure className="relative mx-auto max-w-md">
            {/* Soft glow */}
            <div aria-hidden="true" className="absolute -inset-0.5 rounded-[1.25rem] bg-gradient-to-br from-primary/25 via-transparent to-primary/25 blur-md opacity-70" />

            <div className="relative rounded-[1.25rem] border border-primary/25 bg-card/90 backdrop-blur-sm px-5 py-5 shadow-[0_8px_24px_-10px_hsl(var(--primary)/0.35)] overflow-hidden">
              {/* Corner ornaments */}
              <div aria-hidden="true" className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-[1.25rem]" />
              <div aria-hidden="true" className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-[1.25rem]" />

              {/* Top divider with star */}
              <div className="flex items-center justify-center gap-2 mb-3" aria-hidden="true">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/50" />
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary/80 fill-current">
                  <path d="M12 2l2.39 6.96H22l-6.19 4.5L18.18 22 12 17.27 5.82 22l2.37-8.54L2 8.96h7.61z" />
                </svg>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/50" />
              </div>

              <blockquote className="relative text-center text-[15.5px] leading-[1.95] text-foreground font-medium px-2">
                <span aria-hidden="true" className="text-primary/30 font-serif text-2xl leading-none align-top mr-0.5">“</span>
                তোমরা একটি খেজুরের টুকরা দান করে হলেও জাহান্নামের আগুন থেকে বাঁচো।
                <span aria-hidden="true" className="text-primary/30 font-serif text-2xl leading-none align-bottom ml-0.5">”</span>
              </blockquote>

              <div className="mt-4 flex items-center justify-center gap-2" aria-hidden="true">
                <span className="h-px w-6 bg-primary/40" />
                <figcaption className="text-[11px] font-semibold tracking-wide text-primary">
                  সহীহ্‌ তিরমিযী · হা/২৯৫৩
                </figcaption>
                <span className="h-px w-6 bg-primary/40" />
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
