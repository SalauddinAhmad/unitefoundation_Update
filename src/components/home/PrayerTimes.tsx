import { useEffect, useMemo, useState } from "react";
import {
  Coordinates,
  CalculationMethod,
  PrayerTimes as AdhanPrayerTimes,
  SunnahTimes,
  Prayer,
} from "adhan";

// Dhaka coordinates as default
const COORDS = new Coordinates(23.8103, 90.4125);

const METHODS: { value: keyof typeof CalculationMethod | string; label: string }[] = [
  { value: "MuslimWorldLeague", label: "মুসলিম ওয়ার্ল্ড লীগ" },
  { value: "Karachi", label: "করাচি (দক্ষিণ এশিয়া)" },
  { value: "Egyptian", label: "মিশরীয় (Egyptian)" },
  { value: "UmmAlQura", label: "উম্মুল কুরা (মক্কা)" },
  { value: "Dubai", label: "দুবাই" },
  { value: "NorthAmerica", label: "উত্তর আমেরিকা (ISNA)" },
  { value: "Kuwait", label: "কুয়েত" },
  { value: "Qatar", label: "কাতার" },
  { value: "Singapore", label: "সিঙ্গাপুর" },
  { value: "Turkey", label: "তুরস্ক (Diyanet)" },
];

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBn = (s: string | number) =>
  String(s).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

const BN_DAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const BN_MONTHS_BONGABDO = [
  "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন",
  "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র",
];

// Approximate Bengali calendar (Bangladesh reformed): 14 April = 1 Boishakh
function toBengaliDate(d: Date) {
  const year = d.getFullYear();
  const boishakhStart = new Date(year, 3, 14); // April 14
  const start = d >= boishakhStart ? boishakhStart : new Date(year - 1, 3, 14);
  const bnYear = (d >= boishakhStart ? year : year - 1) - 593;
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000);
  // Month lengths (reformed Bangla calendar, non-leap simplification)
  const lens = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
  let remaining = dayOfYear;
  let m = 0;
  for (; m < 12; m++) {
    if (remaining < lens[m]) break;
    remaining -= lens[m];
  }
  return { day: remaining + 1, month: BN_MONTHS_BONGABDO[Math.min(m, 11)], year: bnYear };
}

// Hijri via Intl
function toHijri(d: Date) {
  try {
    const parts = new Intl.DateTimeFormat("en-TN-u-ca-islamic-umalqura", {
      day: "numeric", month: "numeric", year: "numeric",
    }).formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const months = ["মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জুমাদাল উলা", "জুমাদাস সানিয়া", "রজব", "শাবান", "রমজান", "শাওয়াল", "জিলকদ", "জিলহজ"];
    return { day: Number(get("day")), month: months[Number(get("month")) - 1] ?? "", year: Number(get("year")) };
  } catch {
    return null;
  }
}

function fmtTime12(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${toBn(h)}:${toBn(String(m).padStart(2, "0"))} ${ampm === "AM" ? "AM" : "PM"}`;
}
function fmtTime12NoAmPm(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes();
  h = h % 12 || 12;
  return `${toBn(h)}:${toBn(String(m).padStart(2, "0"))}`;
}
function fmtTimeWithSec(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${toBn(h)}:${toBn(String(m).padStart(2, "0"))}:${toBn(String(s).padStart(2, "0"))} ${ampm}`;
}

const PRAYER_LABELS: Record<string, { label: string; icon: string; prefix?: string }> = {
  fajr: { label: "ফজর", icon: "🌅", prefix: "ভোর" },
  sunrise: { label: "সূর্যোদয়", icon: "🌤️", prefix: "সকাল" },
  dhuhr: { label: "যোহর", icon: "☀️", prefix: "দুপুর" },
  asr: { label: "আছর", icon: "🌇", prefix: "বিকাল" },
  maghrib: { label: "মাগরিব", icon: "🌄", prefix: "সন্ধ্যা" },
  isha: { label: "এশা", icon: "🌔", prefix: "রাত" },
};

export const PrayerTimes = () => {
  const [now, setNow] = useState(new Date());
  const [method, setMethod] = useState<string>(() => {
    return localStorage.getItem("uf_prayer_method") ?? "MuslimWorldLeague";
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("uf_prayer_method", method);
  }, [method]);

  const params = useMemo(() => {
    const fn = (CalculationMethod as any)[method] ?? CalculationMethod.MuslimWorldLeague;
    return fn();
  }, [method]);

  const today = useMemo(() => new AdhanPrayerTimes(COORDS, new Date(), params), [params, now.toDateString()]);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return new AdhanPrayerTimes(COORDS, d, params);
  }, [params, now.toDateString()]);
  const sunnah = useMemo(() => new SunnahTimes(today), [today]);

  const nextPrayer = today.nextPrayer(now);
  let nextTime: Date;
  let nextName: string;
  if (nextPrayer === Prayer.None) {
    nextTime = tomorrow.fajr;
    nextName = "fajr";
  } else {
    nextTime = today.timeForPrayer(nextPrayer)!;
    nextName = String(nextPrayer).toLowerCase();
  }
  const diff = Math.max(0, Math.floor((nextTime.getTime() - now.getTime()) / 1000));
  const hh = Math.floor(diff / 3600);
  const mm = Math.floor((diff % 3600) / 60);
  const ss = diff % 60;

  const bn = toBengaliDate(now);
  const hijri = toHijri(now);
  const gregorian = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const nextLabel = PRAYER_LABELS[nextName]?.label ?? nextName;
  const nextPrefix = PRAYER_LABELS[nextName]?.prefix ?? "";

  // Sehri = fajr - 3 min, Iftar = maghrib
  const sehri = new Date(today.fajr.getTime() - 3 * 60000);

  const prayers: { key: string; time: Date }[] = [
    { key: "fajr", time: today.fajr },
    { key: "sunrise", time: today.sunrise },
    { key: "dhuhr", time: today.dhuhr },
    { key: "asr", time: today.asr },
    { key: "maghrib", time: today.maghrib },
    { key: "isha", time: today.isha },
  ];

  return (
    <section className="section-y bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container-page">
        <div className="rounded-card border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border/60 bg-primary/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="text-sm font-semibold text-emerald-700">Live · এখনই সক্রিয়</span>
            </div>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="text-sm rounded-md border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="হিসাব পদ্ধতি"
            >
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Date + Countdown */}
          <div className="px-6 py-6 grid gap-6 md:grid-cols-2 items-center border-b border-border/60">
            <div className="space-y-2 text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                {BN_DAYS[now.getDay()]}, {toBn(bn.day)} {bn.month}, {toBn(bn.year)} বঙ্গাব্দ
              </p>
              <p className="text-sm text-muted-foreground">{gregorian}</p>
              {hijri && (
                <p className="text-sm text-muted-foreground">
                  {toBn(hijri.day)} {hijri.month}, {toBn(hijri.year)} হিজরি
                </p>
              )}
              <p className="text-3xl md:text-4xl font-bold text-primary tabular-nums pt-2">
                {fmtTimeWithSec(now)}
              </p>
            </div>
            <div className="text-center md:text-right space-y-1">
              <p className="text-sm text-muted-foreground">পরবর্তী: <span className="font-semibold text-foreground">{nextLabel}</span> · {nextPrefix} {fmtTime12NoAmPm(nextTime)}</p>
              <p className="text-lg font-semibold text-primary tabular-nums">
                {toBn(hh)} ঘন্টা {toBn(mm)} মিনিট {toBn(ss)} সেকেন্ড বাকি
              </p>
              <div className="flex flex-wrap justify-center md:justify-end gap-4 pt-2 text-sm">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">সাহরী {fmtTime12NoAmPm(sehri)}</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">ইফতার {fmtTime12NoAmPm(today.maghrib)}</span>
              </div>
            </div>
          </div>

          {/* Prayer grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-border/50">
            {prayers.map(({ key, time }) => {
              const active = nextName === key;
              return (
                <div
                  key={key}
                  className={`p-4 text-center bg-card transition-colors ${active ? "bg-primary/10" : ""}`}
                >
                  <div className="text-2xl">{PRAYER_LABELS[key].icon}</div>
                  <div className="text-sm font-semibold mt-1">{PRAYER_LABELS[key].label}</div>
                  <div className="text-base font-bold text-primary tabular-nums mt-1">
                    {fmtTime12NoAmPm(time)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-3 text-center text-xs text-muted-foreground bg-muted/30">
            সময়গুলি অটোম্যাটিক হিসাবের ভিত্তিতে, ১-২ মিনিট (+/-) হতে পারে।
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrayerTimes;
