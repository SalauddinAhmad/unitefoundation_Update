import { Header } from "./Header";
import { Footer } from "./Footer";
import { Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const SiteLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const onDonate = pathname === "/donate";
  const isHome = pathname === "/";
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className={`flex-1 ${isHome ? "" : "pt-28 md:pt-32"}`}>{children}</main>
      <Footer />
      {/* Mobile floating donate */}
      {!onDonate && (
        <Link
          to="/donate"
          className="sm:hidden fixed bottom-4 left-4 right-4 z-40 btn-donate text-base"
          aria-label="দান করুন"
        >
          <Heart className="h-5 w-5" /> এখনই দান করুন
        </Link>
      )}
    </div>
  );
};
