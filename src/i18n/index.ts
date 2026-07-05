// ============================================================
// i18n setup — Bangla (primary) + English (secondary)
// Toggle language from header. Preference saved to localStorage.
// ============================================================
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import bn from "./locales/bn.json";
import en from "./locales/en.json";

export const SUPPORTED_LANGS = ["bn", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const LANG_STORAGE_KEY = "uf_lang";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      bn: { translation: bn },
      en: { translation: en },
    },
    fallbackLng: "bn",
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "htmlTag", "navigator"],
      lookupLocalStorage: LANG_STORAGE_KEY,
      caches: ["localStorage"],
    },
  });

// Keep <html lang="..."> in sync so screen readers / SEO see the right language
const applyHtmlLang = (lng: string) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
  }
};

// Keep Google Translate cookie in sync with i18n language.
// This ensures dynamic (DB-driven) content is auto-translated to English
// even on fresh page loads / deep links / after cookie was cleared.
const syncGoogTransCookie = (lng: string) => {
  if (typeof document === "undefined") return;
  const wantEn = lng.startsWith("en");
  const host = window.location.hostname;
  const parent = host.split(".").slice(-2).join(".");
  const value = wantEn ? "/bn/en" : "";
  const expires = wantEn ? "" : "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=${value}; path=/${expires}`;
  if (parent && parent !== host) {
    document.cookie = `googtrans=${value}; path=/; domain=.${parent}${expires}`;
    document.cookie = `googtrans=${value}; path=/; domain=${parent}${expires}`;
  }
};

const initialLang = i18n.language || "bn";
applyHtmlLang(initialLang);
syncGoogTransCookie(initialLang);

i18n.on("languageChanged", (lng) => {
  applyHtmlLang(lng);
  syncGoogTransCookie(lng);
});

export default i18n;
