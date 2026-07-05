import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Seo } from "@/components/Seo";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <SiteLayout>
      <Seo title={t("notFound.seoTitle")} />
      <section className="container-page py-24 md:py-32 text-center">
        <div className="text-7xl md:text-9xl font-extrabold gradient-donate-text">{t("notFound.code")}</div>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold">{t("notFound.title")}</h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          {t("notFound.subtitle")}
        </p>
        <Link to="/" className="btn-donate mt-8 text-base">
          <Home className="h-5 w-5" /> {t("notFound.backHome")}
        </Link>
      </section>
    </SiteLayout>
  );
};

export default NotFound;
