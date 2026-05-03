import { Link, NavLink, useLocation } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav, site } from "@/data/site";
import logo from "@/assets/logo.png";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-card/95 backdrop-blur shadow-card" : "bg-card"
      }`}
    >
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label={site.nameEn}>
          <img src={logo} alt="" width={40} height={40} className="h-10 w-10" />
          <div className="leading-tight">
            <div className="text-base font-bold text-foreground">{site.name}</div>
            <div className="font-en text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {site.nameEn}
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="মূল মেনু">
          {nav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-btn text-[15px] font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-accent"
                    : "text-foreground/80 hover:text-primary hover:bg-accent/60"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/donate" className="btn-donate hidden sm:inline-flex text-sm">
            <Heart className="h-4 w-4" aria-hidden /> দান করুন
          </Link>
          <button
            className="lg:hidden p-2 rounded-btn text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="মেনু খুলুন"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-card">
          <nav className="container-page py-4 flex flex-col gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-btn text-[15px] font-medium ${
                    isActive ? "text-primary bg-accent" : "text-foreground/80"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/donate" className="btn-donate mt-2 sm:hidden">
              <Heart className="h-4 w-4" /> দান করুন
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
