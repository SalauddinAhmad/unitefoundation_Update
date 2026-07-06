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
// When clearing, we must overwrite on EVERY path/domain variant Google
// may have set it on, otherwise mobile browsers keep translating.
const setGoogTrans = (value: string) => {
  const host = window.location.hostname;
  const parts = host.split(".");
  const parent = parts.slice(-2).join(".");
  const domains = [host, parent, `.${parent}`];
  const expires = value ? "" : "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const val = value || "";
  // no-domain (host-only) cookie
  document.cookie = `googtrans=${val}; path=/${expires}`;
  // every domain variant
  for (const d of domains) {
    if (!d || d === host.replace(/^\./, "")) {
      document.cookie = `googtrans=${val}; path=/; domain=${d}${expires}`;
    } else {
      document.cookie = `googtrans=${val}; path=/; domain=${d}${expires}`;
    }
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
    // Google Translate also stores its state in the URL hash
    // (e.g. `#googtrans(bn|en)`). If we don't strip it, reloading
    // to Bangla still triggers a re-translation to English on mobile.
    const url = new URL(window.location.href);
    if (url.hash && /googtrans/i.test(url.hash)) {
      url.hash = "";
    }
    // Also strip Google's `_x_tr_*` query params if present.
    ["_x_tr_sl", "_x_tr_tl", "_x_tr_hl", "_x_tr_pto"].forEach((k) => url.searchParams.delete(k));
    // Use replace so back-button doesn't return to the pre-toggle URL.
    window.location.replace(url.toString());
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
