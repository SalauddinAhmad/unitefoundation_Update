// Left-side editorial content shown next to each public form.
// Powered by the schema.extras that admins edit in the Form Manager.
// Falls back to nothing when the admin has cleared a field.
import { CheckCircle2, PlayCircle } from "lucide-react";
import { useState } from "react";
import type { FormExtras } from "@/data/formDefaults";

// Extract a YouTube video ID from many URL shapes so we can embed reliably.
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function FormBanner({ extras }: { extras?: FormExtras }) {
  const [play, setPlay] = useState(false);
  if (!extras || extras.banner_type === "none" || !extras.banner_url) return null;

  if (extras.banner_type === "image") {
    return (
      <div className="mb-6 rounded-card overflow-hidden shadow-[var(--shadow-card)]">
        <img src={extras.banner_url} alt="" className="w-full h-auto object-cover" loading="lazy" />
      </div>
    );
  }

  const id = extractYouTubeId(extras.banner_url);
  if (!id) {
    // Fallback: try to render as a direct <video> source.
    return (
      <div className="mb-6 rounded-card overflow-hidden shadow-[var(--shadow-card)] bg-black">
        <video src={extras.banner_url} controls className="w-full h-auto" />
      </div>
    );
  }
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return (
    <div className="mb-6 rounded-card overflow-hidden shadow-[var(--shadow-card)] aspect-video bg-black">
      {play ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
          title="video"
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlay(true)}
          className="relative w-full h-full group"
          aria-label="Play video"
        >
          <img src={thumb} alt="" className="w-full h-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition">
            <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
          </span>
        </button>
      )}
    </div>
  );
}

export function FormSideContent({ extras }: { extras?: FormExtras }) {
  if (!extras) return null;
  const hasBullets = (extras.bullets?.length ?? 0) > 0;
  const hasStats = (extras.stats?.length ?? 0) > 0;

  return (
    <div>
      <FormBanner extras={extras} />
      {extras.intro && (
        <p className="text-base md:text-lg leading-relaxed text-foreground/85">{extras.intro}</p>
      )}
      {extras.quote_text && (
        <blockquote className="mt-6 rounded-card border-l-4 border-primary bg-accent/40 p-5 text-foreground/80 italic leading-relaxed">
          {extras.quote_text}{" "}
          {extras.quote_source && (
            <span className="not-italic text-sm text-muted-foreground">{extras.quote_source}</span>
          )}
        </blockquote>
      )}
      {hasBullets && (
        <>
          {extras.bullets_title && <h3 className="mt-8 text-xl font-bold">{extras.bullets_title}</h3>}
          <ul className="mt-4 space-y-3">
            {extras.bullets!.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/80 leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {hasStats && (
        <div className="mt-8 grid grid-cols-3 gap-3">
          {extras.stats!.map((s, i) => (
            <div key={i} className="rounded-card bg-secondary/60 p-4 text-center">
              <div className="text-xl md:text-2xl font-extrabold text-primary">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
