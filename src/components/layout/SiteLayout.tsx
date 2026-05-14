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
      {/* Mobile floating donate removed per request */}
    </div>
  );
};
