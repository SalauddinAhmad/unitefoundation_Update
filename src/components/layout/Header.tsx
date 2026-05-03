import { Link, NavLink, useLocation } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav, site } from "@/data/site";
import logo from "@/assets/logo.svg";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500`}
    >
      <div className="mx-auto w-full max-w-[1480px] px-3 md:px-5">
        <div
          className={`relative flex items-center justify-between gap-4 rounded-b-2xl transition-all duration-500 animate-fade-up overflow-hidden border border-t-0 border-white/40 ${
            scrolled ? "px-4 md:px-6 py-2" : "px-5 md:px-8 py-2.5"
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
          <nav className="relative hidden lg:flex items-center gap-0.5" aria-label="মূল মেনু">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  `relative px-3.5 py-2 rounded-full text-[15px] font-medium transition-all duration-300 group ${
                    isActive
                      ? "text-primary"
                      : "text-foreground/75 hover:text-primary"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">{item.label}</span>
                    <span
                      className={`absolute inset-0 rounded-full bg-accent transition-all duration-300 ${
                        isActive
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
                      }`}
                    />
                    <span
                      className={`absolute left-1/2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-donate-red to-donate-orange transition-all duration-300 -translate-x-1/2 ${
                        isActive ? "w-6 opacity-100" : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-100"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* CTAs */}
          <div className="relative flex items-center gap-2">
            <Link
              to="/donate"
              className="btn-donate text-sm rounded-full px-5 py-2.5"
            >
              <Heart className="h-4 w-4" aria-hidden /> দান করুন
            </Link>
            <button
              className="lg:hidden p-2 rounded-full text-foreground hover:bg-accent transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label="মেনু খুলুন"
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
              {nav.map((item) => (
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
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/donate"
                className="mt-2 btn-donate text-sm rounded-full px-5 py-3"
              >
                <Heart className="h-4 w-4" /> দান করুন
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
