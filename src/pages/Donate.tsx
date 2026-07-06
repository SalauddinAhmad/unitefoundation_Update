import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { DonationChannelsSection } from "@/components/home/DonationChannelsSection";
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

      <DonationChannelsSection />
      <MembershipDonorSection />
    </SiteLayout>
  );
};

export default Donate;
