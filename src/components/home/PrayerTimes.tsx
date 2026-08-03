import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Loader2 } from "lucide-react";
import {
  Coordinates,
  CalculationMethod,
  PrayerTimes as AdhanPrayerTimes,
  Prayer,
} from "adhan";

const DEFAULT_COORDS = { lat: 23.8103, lng: 90.4125, label: "ঢাকা, বাংলাদেশ" };

const METHODS: { value: string; label: string }[] = [
  { value: "MuslimWorldLeague", label: "মুসলিম ওয়ার্ল্ড লীগ" },
  { value: "Karachi", label: "করাচি (দক্ষিণ এশিয়া)" },
  { value: "Egyptian", label: "মিশরীয়" },
  { value: "UmmAlQura", label: "উম্মুল কুরা (মক্কা)" },
  { value: "Dubai", label: "দুবাই" },
  { value: "NorthAmerica", label: "উত্তর আমেরিকা (ISNA)" },
  { value: "Kuwait", label: "কুয়েত" },
  { value: "Qatar", label: "কাতার" },
  { value: "Singapore", label: "সিঙ্গাপুর" },
  { value: "Turkey", label: "তুরস্ক (Diyanet)" },
];

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
// Module-level language flag — set at the top of each render so the
// number/label formatters below emit English directly (no Google-Translate flicker).
let EN = false;
const toBn = (s: string | number) =>
  EN ? String(s) : String(s).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
const L = (bn: string, en: string) => (EN ? en : bn);

const BN_DAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const EN_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS = () => (EN ? EN_DAYS : BN_DAYS);
const BN_MONTHS_BONGABDO = [
  "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন",
  "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র",
];
const EN_MONTHS_BONGABDO = [
  "Boishakh", "Joishtho", "Asharh", "Shrabon", "Bhadro", "Ashwin",
  "Kartik", "Ogrohayon", "Poush", "Magh", "Falgun", "Choitro",
];

function toBengaliDate(d: Date) {
  const year = d.getFullYear();
  const boishakhStart = new Date(year, 3, 14);
  const start = d >= boishakhStart ? boishakhStart : new Date(year - 1, 3, 14);
  const bnYear = (d >= boishakhStart ? year : year - 1) - 593;
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000);
  const lens = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
  let remaining = dayOfYear;
  let m = 0;
  for (; m < 12; m++) {
    if (remaining < lens[m]) break;
    remaining -= lens[m];
  }
  return { day: remaining + 1, month: (EN ? EN_MONTHS_BONGABDO : BN_MONTHS_BONGABDO)[Math.min(m, 11)], year: bnYear };
}

function toHijri(d: Date) {
  try {
    const parts = new Intl.DateTimeFormat("en-TN-u-ca-islamic-umalqura", {
      day: "numeric", month: "numeric", year: "numeric",
    }).formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const months = EN
      ? ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Ula", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"]
      : ["মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জুমাদাল উলা", "জুমাদাস সানিয়া", "রজব", "শাবান", "রমজান", "শাওয়াল", "জিলকদ", "জিলহজ"];
    return { day: Number(get("day")), month: months[Number(get("month")) - 1] ?? "", year: Number(get("year")) };
  } catch {
    return null;
  }
}

function fmtHM(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return { time: `${toBn(h)}:${toBn(String(m).padStart(2, "0"))}`, ampm };
}
function fmtHMS(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${toBn(h)}:${toBn(String(m).padStart(2, "0"))}:${toBn(String(s).padStart(2, "0"))} ${ampm}`;
}

const PRAYERS: { key: string; label: string; labelEn: string; icon: JSX.Element }[] = [
  { key: "fajr", label: "ফজর", labelEn: "Fajr", icon: <FajrIcon /> },
  { key: "sunrise", label: "সূর্যোদয়", labelEn: "Sunrise", icon: <SunriseIcon /> },
  { key: "dhuhr", label: "যোহর", labelEn: "Dhuhr", icon: <DhuhrIcon /> },
  { key: "asr", label: "আছর", labelEn: "Asr", icon: <AsrIcon /> },
  { key: "maghrib", label: "মাগরিব", labelEn: "Maghrib", icon: <MaghribIcon /> },
  { key: "isha", label: "এশা", labelEn: "Isha", icon: <IshaIcon /> },
];
const plabel = (p?: { label: string; labelEn: string }) => (p ? L(p.label, p.labelEn) : "");

function FajrIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path d="M3 18h18M6 18a6 6 0 0112 0M12 4v3M4.2 8.2l2.1 2.1M19.8 8.2l-2.1 2.1"/></svg>; }
function SunriseIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path d="M3 20h18M12 4v4M5.5 8.5l1.5 1.5M18.5 8.5L17 10M8 14a4 4 0 018 0"/></svg>; }
function DhuhrIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><circle cx="12" cy="12" r="4"/><path strokeLinecap="round" d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>; }
function AsrIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><circle cx="10" cy="12" r="3.5"/><path strokeLinecap="round" d="M10 4v2M10 18v2M2 12h2M17 12h2M4.5 6.5L6 8M14.5 15.5L16 17M4.5 17.5L6 16"/><path d="M17 20l4-4-3-1z"/></svg>; }
function MaghribIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path d="M3 18h18M6 18a6 6 0 0112 0"/><path strokeLinecap="round" d="M12 14v-4M10 12l2 2 2-2"/></svg>; }
function IshaIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path d="M20 14.5A8 8 0 019.5 4a7 7 0 108.5 10.5z"/><path strokeLinecap="round" d="M5 5l.5 1.5L7 7l-1.5.5L5 9l-.5-1.5L3 7l1.5-.5z"/></svg>; }

export const PrayerTimes = () => {
  const { i18n } = useTranslation();
  // Render everything in the active language ourselves — the section is marked
  // `notranslate`, so Google Translate never re-processes the ticking clock.
  EN = (i18n.language || "bn").startsWith("en");
  const [now, setNow] = useState(new Date());
  const [method, setMethod] = useState<string>(() => localStorage.getItem("uf_prayer_method") ?? "MuslimWorldLeague");
  const [coords, setCoords] = useState(() => {
    try {
      const raw = localStorage.getItem("uf_prayer_coords");
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return DEFAULT_COORDS;
  });
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => localStorage.setItem("uf_prayer_method", method), [method]);
  useEffect(() => localStorage.setItem("uf_prayer_coords", JSON.stringify(coords)), [coords]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocError(L("এই ব্রাউজারে লোকেশন সাপোর্ট নেই", "Location is not supported in this browser"));
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let label = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${EN ? "en" : "bn"}`);
          const j = await res.json();
          const a = j.address ?? {};
          label = a.city || a.town || a.village || a.county || a.state || label;
          if (a.country) label = `${label}, ${a.country}`;
        } catch { /* ignore */ }
        setCoords({ lat: latitude, lng: longitude, label });
        setLocating(false);
      },
      (err) => {
        setLocError(err.code === 1 ? L("লোকেশন অনুমতি দেয়া হয়নি", "Location permission denied") : L("লোকেশন পাওয়া যায়নি", "Could not get location"));
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const params = useMemo(() => {
    const fn = (CalculationMethod as any)[method] ?? CalculationMethod.MuslimWorldLeague;
    return fn();
  }, [method]);
  const adhCoords = useMemo(() => new Coordinates(coords.lat, coords.lng), [coords]);
  const today = useMemo(() => new AdhanPrayerTimes(adhCoords, new Date(), params), [adhCoords, params, now.toDateString()]);
  const tomorrow = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return new AdhanPrayerTimes(adhCoords, d, params);
  }, [adhCoords, params, now.toDateString()]);

  const nextPrayerKey = today.nextPrayer(now);
  const nextTime = nextPrayerKey === Prayer.None ? tomorrow.fajr : today.timeForPrayer(nextPrayerKey)!;
  const nextName = nextPrayerKey === Prayer.None ? "fajr" : String(nextPrayerKey).toLowerCase();
  const nextLabel = plabel(PRAYERS.find((p) => p.key === nextName)) || nextName;

  const currentKey = today.currentPrayer(now);
  const currentName = currentKey === Prayer.None ? null : String(currentKey).toLowerCase();

  const diff = Math.max(0, Math.floor((nextTime.getTime() - now.getTime()) / 1000));
  const hh = Math.floor(diff / 3600);
  const mm = Math.floor((diff % 3600) / 60);
  const ss = diff % 60;

  const bn = toBengaliDate(now);
  const hijri = toHijri(now);
  const sehri = new Date(today.fajr.getTime() - 3 * 60000);

  // Sun-arc position: percentage of day from sunrise to sunset
  const dayStart = today.sunrise.getTime();
  const dayEnd = today.maghrib.getTime();
  const rawPct = (now.getTime() - dayStart) / (dayEnd - dayStart);
  const dayPct = Math.max(0, Math.min(1, rawPct));
  const isDaytime = rawPct >= 0 && rawPct <= 1;
  // Arc math: semicircle from (10, 100) to (390, 100), peak at (200, 20)
  const arcX = 10 + dayPct * 380;
  const arcY = 100 - Math.sin(dayPct * Math.PI) * 80;

  const prayerTimes = [
    { key: "fajr", time: today.fajr },
    { key: "sunrise", time: today.sunrise },
    { key: "dhuhr", time: today.dhuhr },
    { key: "asr", time: today.asr },
    { key: "maghrib", time: today.maghrib },
    { key: "isha", time: today.isha },
  ];

  return (
    <section translate="no" className="notranslate py-8 sm:py-20 md:py-28 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-card shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.35)]">
          {/* Decorative arch pattern watermark */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden>
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <pattern id="pt-mihrab" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M40 10 C60 10 70 25 70 45 L70 70 L10 70 L10 45 C10 25 20 10 40 10 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#pt-mihrab)" />
            </svg>
          </div>

          {/* ============ MOBILE HERO: compact emerald header ============ */}
          <div className="sm:hidden relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary-foreground)/0.15),transparent_70%)]" />

            <div className="relative px-4 pt-3 pb-1 flex items-center justify-between gap-2">
              <div className="text-[10px] text-primary-foreground/80 leading-tight min-w-0">
                <div className="truncate">{DAYS()[now.getDay()]}, {toBn(bn.day)} {bn.month}</div>
                {hijri && <div className="truncate opacity-80">{toBn(hijri.day)} {hijri.month} {toBn(hijri.year)} {L(" হিজরি", " AH")}</div>}
              </div>
              <button
                onClick={detectLocation}
                disabled={locating}
                className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium transition-colors disabled:opacity-60 border border-primary-foreground/20 shrink-0"
              >
                {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                <span className="truncate max-w-[110px]">{locating ? "..." : coords.label}</span>
              </button>
            </div>

            <div className="relative px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.18em] text-primary-foreground/70 leading-none mb-1">{L("এখন", "Now")}</p>
                <div className="text-2xl font-bold tabular-nums tracking-tight leading-none">{fmtHMS(now)}</div>
              </div>
              <div className="text-right shrink-0 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 px-3 py-1.5">
                <span className="block text-[9px] uppercase tracking-widest text-primary-foreground/70 leading-none">{L("পরবর্তী", "Next")} · {nextLabel}</span>
                <span className="block text-sm font-bold tabular-nums mt-0.5">
                  {toBn(hh)}<span className="text-primary-foreground/60 text-[10px]">{L("ঘ","h")}</span>
                  {" "}{toBn(String(mm).padStart(2, "0"))}<span className="text-primary-foreground/60 text-[10px]">{L("মি","m")}</span>
                  {" "}{toBn(String(ss).padStart(2, "0"))}<span className="text-primary-foreground/60 text-[10px]">{L("সে","s")}</span>
                </span>
              </div>
            </div>
          </div>


          {/* ============ DESKTOP HEADER: compact single row ============ */}
          <div className="hidden sm:block relative border-b border-border/60 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
            <div className="relative px-8 py-5 flex items-center justify-between gap-6">
              <div className="flex items-center gap-5 min-w-0">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary tabular-nums tracking-tight leading-none">{fmtHMS(now)}</span>
                  <span className="text-xs text-muted-foreground mt-1.5">
                    {DAYS()[now.getDay()]}, {toBn(bn.day)} {bn.month} {toBn(bn.year)} {L("বঙ্গাব্দ", "BS")}
                    <span className="opacity-40 mx-2">·</span>
                    {hijri && <>{toBn(hijri.day)} {hijri.month} {toBn(hijri.year)}{L(" হিজরি", " AH")}<span className="opacity-40 mx-2">·</span></>}
                    {now.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{L("পরবর্তী", "Next")} · {nextLabel}</span>
                  <span className="text-lg font-bold text-primary tabular-nums">
                    {toBn(hh)}<span className="text-muted-foreground text-sm mx-0.5">{L("ঘ","h")}</span>
                    {" "}{toBn(String(mm).padStart(2, "0"))}<span className="text-muted-foreground text-sm mx-0.5">{L("মি","m")}</span>
                    {" "}{toBn(String(ss).padStart(2, "0"))}<span className="text-muted-foreground text-sm mx-0.5">{L("সে","s")}</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">{L("শুরু", "Starts")} {fmtHM(nextTime).time} {fmtHM(nextTime).ampm}</span>
                </div>
                <button
                  onClick={detectLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/15 px-3 py-2 text-xs font-medium text-primary transition-colors disabled:opacity-60 border border-primary/20"
                >
                  {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                  <span className="truncate max-w-[160px]">{locating ? L("খোঁজা হচ্ছে...", "Locating...") : coords.label}</span>
                </button>
              </div>
            </div>
          </div>


          {/* Sehri / Iftar band */}
          <div className="relative mt-3 sm:mt-4 mx-3 sm:mx-6 grid grid-cols-2 gap-2 sm:gap-3 z-10">
            <div className="rounded-xl sm:rounded-2xl bg-card border border-border shadow-sm px-3 sm:px-4 py-2 sm:py-3 text-center">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">{L("সাহরী", "Sehri")}</p>
              <p className="text-sm sm:text-lg font-bold text-primary tabular-nums">{fmtHM(sehri).time}<span className="text-[10px] sm:text-xs text-muted-foreground ml-1">{fmtHM(sehri).ampm}</span></p>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-card border border-border shadow-sm px-3 sm:px-4 py-2 sm:py-3 text-center">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">{L("ইফতার", "Iftar")}</p>
              <p className="text-sm sm:text-lg font-bold text-primary tabular-nums">{fmtHM(today.maghrib).time}<span className="text-[10px] sm:text-xs text-muted-foreground ml-1">{fmtHM(today.maghrib).ampm}</span></p>
            </div>
          </div>

          {/* Prayer arch cards */}
          <div className="relative p-3 sm:p-6 pt-4 sm:pt-6">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-3">
              {prayerTimes.map(({ key, time }) => {
                const meta = PRAYERS.find((p) => p.key === key)!;
                const isNext = nextName === key;
                const isCurrent = currentName === key;
                const highlight = isCurrent || isNext;
                return (
                  <div
                    key={key}
                    className={[
                      "relative group flex flex-col items-center text-center px-1.5 sm:px-2 py-2.5 sm:py-4 transition-all",
                      "rounded-t-[2rem] sm:rounded-t-[3rem] rounded-b-lg sm:rounded-b-xl border",
                      highlight
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 -translate-y-1"
                        : "bg-muted/40 text-foreground border-border/60 hover:bg-primary/5 hover:border-primary/30",
                    ].join(" ")}
                  >
                    {isCurrent && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest bg-primary-foreground text-primary px-1.5 sm:px-2 py-0.5 rounded-full shadow">{L("চলমান", "Now")}</span>
                    )}
                    {isNext && !isCurrent && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest bg-primary-foreground text-primary px-1.5 sm:px-2 py-0.5 rounded-full shadow">{L("পরবর্তী", "Next")}</span>
                    )}
                    <div className={["w-5 h-5 sm:w-8 sm:h-8 mb-1 sm:mb-1.5 mt-0.5 sm:mt-1", highlight ? "text-primary-foreground" : "text-primary/80"].join(" ")}>
                      {meta.icon}
                    </div>
                    <div className={["text-[11px] sm:text-sm font-semibold leading-tight", highlight ? "text-primary-foreground" : ""].join(" ")}>{plabel(meta)}</div>
                    <div className={["text-xs sm:text-base font-bold tabular-nums mt-0.5", highlight ? "text-primary-foreground" : "text-primary"].join(" ")}>
                      {fmtHM(time).time}
                    </div>
                    <div className={["text-[8px] sm:text-[9px] uppercase tracking-wider", highlight ? "text-primary-foreground/75" : "text-muted-foreground"].join(" ")}>{fmtHM(time).ampm}</div>
                  </div>
                );
              })}
            </div>


            {/* Method selector + disclaimer */}
            <div className="mt-3 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border/60">
              <div className="relative w-full sm:w-auto">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full sm:w-auto appearance-none text-xs font-medium rounded-full border border-input bg-background pl-4 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  aria-label={L("হিসাব পদ্ধতি", "Calculation method")}
                >
                  {METHODS.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
                </select>
                <svg className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center sm:text-right">
                {locError ? <span className="text-destructive">{locError} · </span> : null}
                {L("সময়গুলি অটোম্যাটিক হিসাবের ভিত্তিতে, ১-২ মিনিট (+/-) হতে পারে।", "Times are auto-calculated and may vary by 1-2 minutes (+/-).")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrayerTimes;
