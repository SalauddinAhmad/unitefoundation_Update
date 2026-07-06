// ============================================================
// ImagePickerButton — a compact preview + trigger that opens
// the MediaLibrary modal. Drop-in replacement for existing
// "cover / photo / logo" upload widgets across the dashboard.
// ============================================================
import { useState } from "react";
import { Image as ImageIcon, X, Library } from "lucide-react";
import MediaLibrary from "./MediaLibrary";

type Aspect = "square" | "wide" | "portrait" | "logo";

const boxCls: Record<Aspect, string> = {
  square: "aspect-square w-28",
  wide: "aspect-[16/9] w-full max-w-md",
  portrait: "aspect-[4/5] w-28",
  logo: "aspect-[2/1] w-40",
};

export default function ImagePickerButton({
  value,
  onChange,
  hint,
  aspect = "wide",
  label,
  className = "",
  objectFit = "cover",
}: {
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  aspect?: Aspect;
  label?: string;
  className?: string;
  objectFit?: "cover" | "contain";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"space-y-2 " + className}>
      {label && <div className="text-xs font-semibold text-foreground/80">{label}</div>}
      <div className="flex flex-wrap items-start gap-3">
        <div
          className={
            "relative rounded-xl overflow-hidden bg-secondary border border-border flex items-center justify-center shrink-0 " +
            boxCls[aspect]
          }
        >
          {value ? (
            <>
              <img
                src={value}
                alt=""
                className={"h-full w-full " + (objectFit === "contain" ? "object-contain" : "object-cover")}
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-md bg-card/95 border border-border shadow flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                title="সরান"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
          )}
        </div>
        <div className="flex-1 min-w-[200px] space-y-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow hover:shadow-md transition"
          >
            <Library className="h-4 w-4" />
            {value ? "ছবি পরিবর্তন করুন" : "মিডিয়া লাইব্রেরি থেকে বাছুন / আপলোড"}
          </button>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </div>

      {open && (
        <MediaLibrary
          onClose={() => setOpen(false)}
          onSelect={(url) => onChange(url)}
          hint={hint}
        />
      )}
    </div>
  );
}
