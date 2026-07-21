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

      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.07] via-background to-background pt-12 pb-6">
        {/* Decorative background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(var(--primary)/0.4), transparent 40%), radial-gradient(circle at 80% 80%, hsl(var(--primary)/0.3), transparent 45%)",
          }}
        />
        <div className="container relative mx-auto px-4">
          <figure className="relative mx-auto max-w-3xl">
            {/* Outer glow */}
            <div aria-hidden="true" className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-primary/30 via-primary/10 to-primary/30 blur-xl opacity-60" />

            <div className="relative rounded-3xl border border-primary/25 bg-card/90 backdrop-blur-sm shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)] overflow-hidden">
              {/* Ornamental corners */}
              <div aria-hidden="true" className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40 rounded-tl-3xl" />
              <div aria-hidden="true" className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/40 rounded-tr-3xl" />
              <div aria-hidden="true" className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/40 rounded-bl-3xl" />
              <div aria-hidden="true" className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/40 rounded-br-3xl" />

              <div className="px-6 py-10 sm:px-12 sm:py-12 text-center">
                {/* Top ornament: divider with star */}
                <div className="flex items-center justify-center gap-3 mb-6" aria-hidden="true">
                  <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-primary/50" />
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary/70 fill-current">
                    <path d="M12 2l2.39 6.96H22l-6.19 4.5L18.18 22 12 17.27 5.82 22l2.37-8.54L2 8.96h7.61z" />
                  </svg>
                  <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-primary/50" />
                </div>

                <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-primary/80 mb-5">
                  হাদীসে নববী ﷺ
                </p>

                {/* Quote */}
                <div className="relative">
                  <span aria-hidden="true" className="absolute -top-6 -left-1 sm:-left-4 text-6xl sm:text-7xl leading-none text-primary/20 font-serif select-none">“</span>
                  <blockquote className="relative text-xl sm:text-2xl md:text-3xl font-medium leading-[1.9] text-foreground px-2 sm:px-6">
                    তোমরা একটি খেজুরের টুকরা দান করে হলেও জাহান্নামের আগুন থেকে বাঁচো।
                  </blockquote>
                  <span aria-hidden="true" className="absolute -bottom-10 -right-1 sm:-right-4 text-6xl sm:text-7xl leading-none text-primary/20 font-serif select-none">”</span>
                </div>

                {/* Attribution */}
                <div className="mt-8 flex items-center justify-center gap-3" aria-hidden="true">
                  <span className="h-px w-8 bg-primary/40" />
                  <figcaption className="text-sm sm:text-base font-medium text-primary tracking-wide">
                    সহীহ্‌ তিরমিযী · হাদীস নং ২৯৫৩
                  </figcaption>
                  <span className="h-px w-8 bg-primary/40" />
                </div>
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
