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
