// ============================================================
// i18n render tests for PrayerTimes.
// Goal: the ticking clock must render in the active language by
// itself and stay opted out of Google Translate, so switching to
// English never causes a Bangla→English flash every second.
// ============================================================
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, cleanup } from "@testing-library/react";
import { PrayerTimes } from "@/components/home/PrayerTimes";
import {
  renderWithLang,
  expectFlashSafe,
  expectNoBengali,
  BENGALI_DIGITS,
} from "./i18nRender";

const getSection = (container: HTMLElement) =>
  container.querySelector("section") as HTMLElement | null;

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date("2026-08-03T09:30:00Z"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("PrayerTimes i18n rendering", () => {
  it("opts the whole section out of Google Translate", async () => {
    const { container } = await renderWithLang(<PrayerTimes />, "bn");
    expectFlashSafe(getSection(container));
  });

  it("renders Bangla labels and Bangla digits in bn", async () => {
    const { container } = await renderWithLang(<PrayerTimes />, "bn");
    const section = getSection(container)!;
    expect(section.textContent).toContain("ফজর");
    expect(section.textContent).toContain("মাগরিব");
    expect(BENGALI_DIGITS.test(section.textContent ?? "")).toBe(true);
  });

  it("renders fully in English (no Bangla text or digits) in en", async () => {
    const { container } = await renderWithLang(<PrayerTimes />, "en");
    const section = getSection(container)!;
    expect(section.textContent).toContain("Fajr");
    expect(section.textContent).toContain("Maghrib");
    expect(section.textContent).toContain("Next");
    expectNoBengali(section);
  });

  it("keeps the clock in English across ticks (no per-second flash)", async () => {
    const { container } = await renderWithLang(<PrayerTimes />, "en");
    const section = getSection(container)!;

    for (let i = 0; i < 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      // still English, still notranslate — nothing for Google to re-process
      expectFlashSafe(getSection(container));
      expectNoBengali(section);
    }
  });

  it("keeps the clock in Bangla across ticks", async () => {
    const { container } = await renderWithLang(<PrayerTimes />, "bn");
    const section = getSection(container)!;
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(BENGALI_DIGITS.test(section.textContent ?? "")).toBe(true);
  });
});

describe("PrayerTimes locale isolation (flash regression)", () => {
  it("renders bn and en instances side by side without leaking language", async () => {
    const en = await renderWithLang(<PrayerTimes />, "en");
    const bn = await renderWithLang(<PrayerTimes />, "bn");

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    const enSection = en.container.querySelector("section") as HTMLElement;
    const bnSection = bn.container.querySelector("section") as HTMLElement;

    expectNoBengali(enSection);
    expect(enSection.textContent).toContain("Fajr");
    expect(BENGALI_DIGITS.test(bnSection.textContent ?? "")).toBe(true);
  });

  it("formatters are pure per locale", async () => {
    const { makeFmt } = await import("@/components/home/PrayerTimes");
    const enFmt = makeFmt(true);
    const bnFmt = makeFmt(false);
    expect(enFmt.toBn(12)).toBe("12");
    expect(bnFmt.toBn(12)).toBe("১২");
    // calling one must not affect the other
    expect(enFmt.toBn(9)).toBe("9");
    expect(bnFmt.L("বাংলা", "English")).toBe("বাংলা");
    expect(enFmt.L("বাংলা", "English")).toBe("English");
  });
});
