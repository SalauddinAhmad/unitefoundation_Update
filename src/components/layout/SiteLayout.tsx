import { Header } from "./Header";
import { Footer } from "./Footer";
import { useLocation } from "react-router-dom";
import { useSettings } from "@/hooks/api/useDashboardData";
import { Seo } from "@/components/Seo";

export const SiteLayout = ({
  children,
  hideFooter = false,
}: {
  children: React.ReactNode;
  hideFooter?: boolean;
}) => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const { isError } = useSettings();

  // If nodejs server (API) is down, show maintenance page for all routes
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Seo
          title="ইউনাইট ফাউন্ডেশন | রক্ষণাবেক্ষণ"
          description="আমাদের সিস্টেমে রক্ষণাবেক্ষণ চলছে।"
        />
        <Header />
        <main className={`flex-1 ${isHome ? "" : "pt-28 md:pt-32"}`}>
          <section className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">জরুরি রক্ষণাবেক্ষণের কাজ চলছে</h2>
            <div className="w-16 h-1 bg-primary/20 rounded-full mb-6 mx-auto" />
            <p className="text-muted-foreground max-w-lg leading-relaxed text-lg">
              আমাদের সিস্টেমে বর্তমানে জরুরি রক্ষণাবেক্ষণের কাজ চলছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন। সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত।
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className={`flex-1 ${isHome ? "" : "pt-28 md:pt-32"}`}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};
