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
applyHtmlLang(i18n.language || "bn");
i18n.on("languageChanged", applyHtmlLang);

export default i18n;
