// ============================================================
// Shared helpers for i18n render tests.
// Renders a component under a real i18next instance in a given
// language, and exposes assertions that catch "translate flash"
// (Google Translate re-processing dynamic/ticking content).
// ============================================================
import { render, type RenderResult } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18next, { type i18n as I18nType } from "i18next";
import { initReactI18next } from "react-i18next";
import type { ReactElement } from "react";

import bn from "@/i18n/locales/bn.json";
import en from "@/i18n/locales/en.json";

export const BENGALI_DIGITS = /[০-৯]/;
export const BENGALI_LETTERS = /[\u0980-\u09FF]/;

/** Create an isolated i18n instance (no detector, no localStorage writes). */
export async function makeI18n(lng: "bn" | "en"): Promise<I18nType> {
  const instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    lng,
    fallbackLng: "bn",
    resources: { bn: { translation: bn }, en: { translation: en } },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}

export async function renderWithLang(
  ui: ReactElement,
  lng: "bn" | "en",
): Promise<RenderResult> {
  const instance = await makeI18n(lng);
  return render(<I18nextProvider i18n={instance}>{ui}</I18nextProvider>);
}

/**
 * A subtree is "flash-safe" when it opts out of Google Translate, so the
 * browser extension/widget never re-writes rapidly updating nodes.
 */
export function expectFlashSafe(el: HTMLElement | null) {
  expect(el).not.toBeNull();
  expect(el!.getAttribute("translate")).toBe("no");
  expect(el!.className).toContain("notranslate");
}

/** In English mode a notranslate subtree must render English itself. */
export function expectNoBengali(el: HTMLElement) {
  const text = el.textContent ?? "";
  expect(BENGALI_DIGITS.test(text)).toBe(false);
  expect(BENGALI_LETTERS.test(text)).toBe(false);
}
