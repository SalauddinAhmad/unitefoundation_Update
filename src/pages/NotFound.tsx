import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Seo } from "@/components/Seo";

const NotFound = () => {
  return (
    <SiteLayout>
      <Seo title="পেজ পাওয়া যায়নি | ইউনাইট ফাউন্ডেশন" />
      <section className="container-page py-24 md:py-32 text-center">
        <div className="text-7xl md:text-9xl font-extrabold gradient-donate-text">৪০৪</div>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold">পেজটি খুঁজে পাওয়া যায়নি</h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          আপনি যে পেজটি খুঁজছেন সেটি স্থানান্তরিত বা মুছে ফেলা হয়েছে।
        </p>
        <Link to="/" className="btn-donate mt-8 text-base">
          <Home className="h-5 w-5" /> হোমে ফিরে যান
        </Link>
      </section>
    </SiteLayout>
  );
};

export default NotFound;
