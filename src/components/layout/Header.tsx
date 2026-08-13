import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { site } from "@/data/site";
import logo from "@/assets/logo.svg";
import { LanguageToggle } from "@/components/LanguageToggle";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { key: "home", href: "/" },
    { key: "projects", href: "/projects" },
    { key: "about", href: "/about" },
    { key: "gallery", href: "/gallery" },
    { key: "blog", href: "/blog" },
    { key: "volunteer", href: "/member" },
    { key: "contact", href: "/contact" },
    { key: "donate", href: "/donate" },
  ] as const;

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "pt-2" : "pt-3 md:pt-4"
      }`}
    >
      <div className="mx-auto w-full max-w-[1480px] px-3 md:px-5">
        <div
          className={`relative flex items-center justify-between gap-4 rounded-2xl transition-all duration-500 animate-fade-up overflow-hidden border border-white/40 ${
            scrolled ? "px-4 md:px-6 py-2" : "px-5 md:px-8 py-2.5"
          }`}
          style={{
            background:
              "linear-gradient(135deg, hsl(0 0% 100% / 0.55) 0%, hsl(0 0% 100% / 0.35) 100%)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow:
              "0 10px 40px -10px hsl(0 0% 0% / 0.18), inset 0 1px 0 hsl(0 0% 100% / 0.6), inset 0 -1px 0 hsl(0 0% 100% / 0.15)",
          }}
        >
          {/* Glossy highlight */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl"
            style={{
              background:
                "linear-gradient(180deg, hsl(0 0% 100% / 0.45) 0%, hsl(0 0% 100% / 0) 100%)",
            }}
          />

          {/* Logo */}
          <Link
            to="/"
            className="relative flex items-center shrink-0 transition-transform duration-300 hover:scale-[1.03]"
            aria-label={site.nameEn}
          >
            <img
              src={logo}
              alt={site.nameEn}
              className={`w-auto transition-all duration-500 ${scrolled ? "h-9" : "h-11 md:h-12"}`}
            />
          </Link>

          {/* Nav */}
          <nav className="relative hidden lg:flex items-center gap-0.5" aria-label={t("nav.menu")}>
            {navItems.map((item) => {
              if (item.key === "donate") {
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className="relative ml-2 inline-flex items-center px-4 py-2 rounded-md text-[14px] font-semibold text-white gradient-donate-bg shadow-[0_8px_20px_-6px_hsl(var(--donate-red)/0.6)] hover:shadow-[0_12px_28px_-6px_hsl(var(--donate-red)/0.75)] hover:-translate-y-0.5 hover:brightness-110 transition-all duration-300 ring-1 ring-white/30 animate-pulse-slow"
                  >
                    {t(`nav.${item.key}`)}
                  </NavLink>
                );
              }
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    `relative px-3.5 py-2 text-[15px] font-medium transition-colors duration-300 group ${
                      isActive
                        ? "text-donate-red"
                        : "text-foreground/75 hover:text-foreground"
                    }`
                  }
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              );
            })}
          </nav>

          {/* Right side: language toggle + mobile donate + mobile menu */}
          <div className="relative flex items-center gap-2">
            <LanguageToggle className="hidden sm:inline-flex" />
            <NavLink
              to="/donate"
              className="lg:hidden inline-flex items-center px-4 py-2 rounded-md text-[14px] font-semibold text-white gradient-donate-bg shadow-[0_6px_16px_-6px_hsl(var(--donate-red)/0.7)] ring-1 ring-white/30 animate-pulse-slow"
            >
              {t("nav.donate")}
            </NavLink>
            <button
              className="lg:hidden p-2 rounded-full text-foreground hover:bg-accent transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label={t("nav.openMenu")}
              aria-expanded={open}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden mt-2 rounded-3xl bg-card/95 backdrop-blur-xl shadow-card-hover overflow-hidden animate-fade-up">
            <nav className="p-3 flex flex-col gap-1">
              {navItems.map((item) => {
                if (item.key === "donate") {
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className="mt-2 px-4 py-3 rounded-lg text-[15px] font-semibold text-white gradient-donate-bg shadow-[0_8px_20px_-6px_hsl(var(--donate-red)/0.6)] text-center inline-flex items-center justify-center gap-1.5"
                    >
                      {t(`nav.${item.key}`)}
                    </NavLink>
                  );
                }
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === "/"}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-full text-[15px] font-medium transition-colors ${
                        isActive ? "text-primary bg-accent" : "text-foreground/80 hover:bg-accent/60"
                      }`
                    }
                  >
                    {t(`nav.${item.key}`)}
                  </NavLink>
                );
              })}
              <LanguageToggle variant="mobile" className="sm:hidden mt-1" />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
