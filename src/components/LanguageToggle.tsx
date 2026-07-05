// ============================================================
// Language toggle — one-click switch between Bangla and English.
// Preference persists via i18next-browser-languagedetector (localStorage).
// ============================================================
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

interface Props {
  className?: string;
  variant?: "header" | "mobile";
}

// Set the Google Translate cookie for current host + parent domain.
const setGoogTrans = (value: string) => {
  const host = window.location.hostname;
  const parent = host.split(".").slice(-2).join(".");
  const expires = value ? "" : "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const val = value || "";
  // current host
  document.cookie = `googtrans=${val}; path=/${expires}`;
  // parent domain (e.g. .unitefoundation.bd) so subdomains share it
  if (parent && parent !== host) {
    document.cookie = `googtrans=${val}; path=/; domain=.${parent}${expires}`;
    document.cookie = `googtrans=${val}; path=/; domain=${parent}${expires}`;
  }
};

export const LanguageToggle = ({ className = "", variant = "header" }: Props) => {
  const { i18n, t } = useTranslation();
  const current = (i18n.language || "bn").startsWith("en") ? "en" : "bn";
  const next = current === "bn" ? "en" : "bn";

  const toggle = () => {
    i18n.changeLanguage(next);
    if (next === "en") {
      setGoogTrans("/bn/en");
    } else {
      setGoogTrans("");
    }
    // Reload so Google Translate re-processes the DOM with the new cookie.
    window.location.reload();
  };

  if (variant === "mobile") {
    return (
      <button
        onClick={toggle}
        aria-label={t("common.language")}
        className={
          "flex items-center justify-between gap-2 px-4 py-3 rounded-full text-[15px] font-medium text-foreground/80 hover:bg-accent/60 transition-colors " +
          className
        }
      >
        <span className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          {t("common.language")}
        </span>
        <span className="text-sm">
          <span className={current === "bn" ? "font-bold text-donate-red" : "opacity-50"}>বাংলা</span>
          <span className="mx-1.5 opacity-40">|</span>
          <span className={current === "en" ? "font-bold text-donate-red" : "opacity-50"}>EN</span>
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={t("common.language")}
      title={t("common.language")}
      className={
        "relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold " +
        "bg-white/40 hover:bg-white/60 border border-white/50 text-foreground transition-colors " +
        className
      }
    >
      <Languages className="h-3.5 w-3.5 opacity-70" />
      <span className={current === "bn" ? "text-donate-red" : "opacity-60"}>বাং</span>
      <span className="opacity-40">|</span>
      <span className={current === "en" ? "text-donate-red" : "opacity-60"}>EN</span>
    </button>
  );
};

export default LanguageToggle;
