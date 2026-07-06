// ============================================================
// Professional Home Hero Slides editor.
// - Drag-free reorder via up/down buttons
// - Duplicate / delete / enable-disable per slide
// - Collapsible cards with live preview thumbnail
// - Media Library everywhere via ImagePickerButton
// - Alignment (left / center / right) + overlay strength
// ============================================================
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heart,
  ArrowRight,
} from "lucide-react";
import ImagePickerButton from "@/components/dashboard/ImagePickerButton";
import type { HeroSlide } from "@/hooks/api/useDashboardData";

// No bundled fallbacks — slides without an image show a placeholder
// so admins clearly see which slides still need an image assigned.

interface Props {
  slides: HeroSlide[];
  onChange: (next: HeroSlide[]) => void;
}

const OVERLAY_OPTS: { v: NonNullable<HeroSlide["overlay"]>; label: string }[] = [
  { v: "dark", label: "গাঢ়" },
  { v: "medium", label: "মাঝারি" },
  { v: "light", label: "হালকা" },
];

const emptySlide = (): HeroSlide => ({
  image: "",
  eyebrow: "নতুন ক্যাম্পেইন",
  title: "নতুন স্লাইডের টাইটেল",
  subtitle: "সংক্ষিপ্ত বর্ণনা এখানে লিখুন",
  primaryCtaLabel: "এখনই দান করুন",
  primaryCtaTo: "/donate",
  secondaryCtaLabel: "বিস্তারিত",
  secondaryCtaTo: "/projects",
  enabled: true,
  align: "left",
  overlay: "dark",
});

const Field = ({
  label,
  value,
  onChange,
  hint,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  textarea?: boolean;
}) => (
  <label className="block">
    <span className="text-[11px] font-semibold text-foreground/70 mb-1 block uppercase tracking-wide">
      {label}
    </span>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
      />
    )}
    {hint && <span className="block mt-1 text-[11px] text-muted-foreground">{hint}</span>}
  </label>
);

export default function HeroSlidesEditor({ slides, onChange }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const list = slides || [];
  const update = (i: number, patch: Partial<HeroSlide>) => {
    const next = [...list];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpenIdx(j);
  };
  const remove = (i: number) => {
    if (!confirm("এই স্লাইড মুছে ফেলতে চান?")) return;
    onChange(list.filter((_, k) => k !== i));
    setOpenIdx(null);
  };
  const duplicate = (i: number) => {
    const next = [...list];
    next.splice(i + 1, 0, { ...list[i] });
    onChange(next);
    setOpenIdx(i + 1);
  };
  const add = () => {
    onChange([...list, emptySlide()]);
    setOpenIdx(list.length);
  };

  return (
    <div className="space-y-3">
      {list.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
          <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">কোনো স্লাইড নেই</p>
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> প্রথম স্লাইড যোগ করুন
          </button>
        </div>
      )}

      {list.map((slide, idx) => {
        const isOpen = openIdx === idx;
        const enabled = slide.enabled !== false;
        const preview = slide.image?.trim() || "";
        return (
          <div
            key={idx}
            className={`rounded-xl border overflow-hidden transition-shadow ${
              enabled ? "border-border bg-card" : "border-border bg-muted/40 opacity-70"
            } ${isOpen ? "shadow-md" : ""}`}
          >
            {/* Header row (always visible) */}
            <div className="flex items-stretch gap-3 p-3">
              {/* Thumbnail preview */}
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="relative shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-secondary border border-border group"
                aria-label="স্লাইড টগল"
              >
                <img
                  src={preview}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <span className="absolute top-1 left-1 text-[10px] font-bold text-white bg-black/50 backdrop-blur rounded px-1.5 py-0.5">
                  #{idx + 1}
                </span>
              </button>

              {/* Title / meta */}
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="text-[11px] font-semibold text-primary/80 uppercase tracking-wider truncate">
                  {slide.eyebrow || "—"}
                </div>
                <div className="text-sm font-bold text-foreground truncate">{slide.title || "শিরোনাম নেই"}</div>
                <div className="text-xs text-muted-foreground truncate">{slide.subtitle || "সাবটাইটেল নেই"}</div>
              </button>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => update(idx, { enabled: !enabled })}
                  title={enabled ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                  className={`p-2 rounded-lg transition-colors ${
                    enabled ? "text-emerald-600 hover:bg-emerald-50" : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  title="উপরে"
                  className="p-2 rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === list.length - 1}
                  title="নিচে"
                  className="p-2 rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => duplicate(idx)}
                  title="ডুপ্লিকেট"
                  className="p-2 rounded-lg text-muted-foreground hover:bg-accent"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  title="ডিলিট"
                  className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-accent"
                >
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Expanded editor */}
            {isOpen && (
              <div className="border-t border-border bg-background/60 p-4 space-y-4">
                {/* Live preview */}
                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden bg-foreground">
                  <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div
                    className={`absolute inset-0 ${
                      (slide.overlay || "dark") === "dark"
                        ? "bg-gradient-to-r from-black/75 via-black/50 to-black/20"
                        : (slide.overlay || "dark") === "medium"
                        ? "bg-gradient-to-r from-black/55 via-black/30 to-transparent"
                        : "bg-gradient-to-t from-black/60 via-black/15 to-transparent"
                    }`}
                  />
                  <div
                    className={`absolute inset-0 flex flex-col justify-center px-6 md:px-10 text-white ${
                      slide.align === "center"
                        ? "items-center text-center"
                        : slide.align === "right"
                        ? "items-end text-right"
                        : "items-start text-left"
                    }`}
                  >
                    {slide.eyebrow && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-donate-highlight text-donate-highlight-foreground text-[10px] font-bold uppercase tracking-wider">
                        <Heart className="h-3 w-3" />
                        {slide.eyebrow}
                      </span>
                    )}
                    <div className="mt-2 text-xl md:text-3xl font-extrabold leading-tight max-w-xl line-clamp-2">
                      {slide.title || "শিরোনাম"}
                    </div>
                    <div className="mt-1.5 text-xs md:text-sm text-white/85 max-w-md line-clamp-2">
                      {slide.subtitle}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {slide.primaryCtaLabel && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-donate-highlight text-donate-highlight-foreground text-xs font-bold">
                          <Heart className="h-3 w-3" /> {slide.primaryCtaLabel}
                        </span>
                      )}
                      {slide.secondaryCtaLabel && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/30 text-white text-xs font-semibold">
                          {slide.secondaryCtaLabel} <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="absolute top-2 right-2 text-[10px] font-semibold text-white bg-black/50 backdrop-blur rounded px-2 py-0.5">
                    লাইভ প্রিভিউ
                  </span>
                </div>

                {/* Image picker (Media Library) */}
                <ImagePickerButton
                  label="ব্যানার ইমেজ"
                  value={slide.image}
                  onChange={(v) => update(idx, { image: v })}
                  aspect="wide"
                  hint="1920×1080 রেকমেন্ডেড। মিডিয়া লাইব্রেরি থেকে আগের ইমেজ পুনরায় ব্যবহার করুন অথবা নতুন আপলোড করুন — অটো কমপ্রেস হবে।"
                />

                {/* Text fields */}
                <div className="grid gap-3">
                  <Field
                    label="ছোট টাইটেল (Eyebrow)"
                    value={slide.eyebrow}
                    onChange={(v) => update(idx, { eyebrow: v })}
                  />
                  <Field label="মূল টাইটেল" value={slide.title} onChange={(v) => update(idx, { title: v })} />
                  <Field
                    label="সাবটাইটেল"
                    value={slide.subtitle}
                    onChange={(v) => update(idx, { subtitle: v })}
                    textarea
                  />
                </div>

                {/* CTA fields */}
                <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                  <Field
                    label="Primary বাটন লেবেল"
                    value={slide.primaryCtaLabel}
                    onChange={(v) => update(idx, { primaryCtaLabel: v })}
                  />
                  <Field
                    label="Primary বাটন লিংক"
                    value={slide.primaryCtaTo}
                    onChange={(v) => update(idx, { primaryCtaTo: v })}
                    hint="উদাহরণ: /donate বা /projects/palestine-food"
                  />
                  <Field
                    label="Secondary বাটন লেবেল"
                    value={slide.secondaryCtaLabel}
                    onChange={(v) => update(idx, { secondaryCtaLabel: v })}
                  />
                  <Field
                    label="Secondary বাটন লিংক"
                    value={slide.secondaryCtaTo}
                    onChange={(v) => update(idx, { secondaryCtaTo: v })}
                  />
                </div>

                {/* Layout controls */}
                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <span className="text-[11px] font-semibold text-foreground/70 mb-1.5 block uppercase tracking-wide">
                      টেক্সট অ্যালাইনমেন্ট
                    </span>
                    <div className="inline-flex rounded-lg border border-border overflow-hidden">
                      {(
                        [
                          { v: "left", Icon: AlignLeft, label: "বাম" },
                          { v: "center", Icon: AlignCenter, label: "মাঝ" },
                          { v: "right", Icon: AlignRight, label: "ডান" },
                        ] as const
                      ).map(({ v, Icon, label }) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => update(idx, { align: v })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                            (slide.align || "left") === v
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-foreground hover:bg-accent"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-foreground/70 mb-1.5 block uppercase tracking-wide">
                      ওভারলে ডার্কনেস
                    </span>
                    <div className="inline-flex rounded-lg border border-border overflow-hidden">
                      {OVERLAY_OPTS.map(({ v, label }) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => update(idx, { overlay: v })}
                          className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                            (slide.overlay || "dark") === v
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-foreground hover:bg-accent"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {list.length > 0 && (
        <button
          type="button"
          onClick={add}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-primary hover:bg-primary/5 hover:border-primary/40 transition"
        >
          <Plus className="h-4 w-4" /> নতুন স্লাইড যোগ করুন
        </button>
      )}
    </div>
  );
}
