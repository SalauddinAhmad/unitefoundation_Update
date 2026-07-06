import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PremiumChannelsSection } from "@/components/donation/PremiumChannelsSection";
import { MembershipDonorSection } from "@/components/donation/MembershipDonorSection";

const Donate = () => {
  const { t } = useTranslation();

  return (
    <SiteLayout>
      <Seo
        title={t("donatePage.seoTitle")}
        description={t("donatePage.seoDesc")}
        canonical="/donate"
      />

      <PremiumChannelsSection />
      <MembershipDonorSection />
    </SiteLayout>
  );
};

export default Donate;
