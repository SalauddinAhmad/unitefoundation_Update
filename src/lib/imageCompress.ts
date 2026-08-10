// Client-side image compression utility.
// Downscales large images, re-encodes as JPEG/WebP with quality preserved,
// and preserves alpha (PNG) when transparency is detected.

export type CompressOptions = {
  maxWidth?: number;      // default 1920
  maxHeight?: number;     // default 1920
  quality?: number;       // 0..1, default 0.82
  mimeType?: "image/jpeg" | "image/webp" | "image/png" | "auto";
  maxBytes?: number;      // skip compression if original already smaller
};

const DEFAULTS: Required<Omit<CompressOptions, "mimeType" | "maxBytes">> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.75, // Lowered slightly to hit targets better
};

const loadImage = (file: File | Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });

// Sample the rendered canvas to detect actual transparency.
// Many PNGs (screenshots, exports) have no real alpha and can be
// re-encoded as JPEG, which is 5–20× smaller.
const canvasHasAlpha = (ctx: CanvasRenderingContext2D, w: number, h: number): boolean => {
  try {
    const step = Math.max(1, Math.floor(Math.min(w, h) / 50));
    const data = ctx.getImageData(0, 0, w, h).data;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (data[(y * w + x) * 4 + 3] < 255) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), type, quality);
  });

/**
 * Compress a single image file. Returns a new File with optimized bytes.
 * Non-image files are returned unchanged.
 */
export async function compressImage(file: File, opts: CompressOptions = {}): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  const o = { ...DEFAULTS, ...opts };
  // Even if small, we re-compress if force WebP or specific sizing is needed
  // to ensure consistency across the site.

  try {
    const img = await loadImage(file);
    const { width: iw, height: ih } = img;
    const ratio = Math.min(1, o.maxWidth / iw, o.maxHeight / ih);
    const w = Math.round(iw * ratio);
    const h = Math.round(ih * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);

    // Default to webp as requested
    let outType = opts.mimeType && opts.mimeType !== "auto" ? opts.mimeType : "image/webp";
    
    // Check if browser supports webp
    const canWebp = (() => {
      try {
        const c = document.createElement("canvas");
        return c.toDataURL("image/webp").startsWith("data:image/webp");
      } catch { return false; }
    })();

    if (!canWebp && outType === "image/webp") {
      const alpha = canvasHasAlpha(ctx, w, h);
      outType = alpha ? "image/png" : "image/jpeg";
    }

    // Iterative compression to stay under ~200KB if target is not specified
    let currentQuality = o.quality;
    let blob = await canvasToBlob(canvas, outType, currentQuality);
    
    // If it's still too big (> 200KB) and we aren't at minimum quality yet, reduce quality
    // Max size target is 200KB (204800 bytes)
    const MAX_TARGET = 200 * 1024;
    if (blob.size > MAX_TARGET && currentQuality > 0.3) {
      // Simple one-step reduction if significantly over, otherwise binary search could be used
      // but usually one drop is enough for most photos.
      currentQuality = Math.max(0.3, currentQuality * (MAX_TARGET / blob.size));
      blob = await canvasToBlob(canvas, outType, currentQuality);
    }

    const ext = outType.split("/")[1].replace("jpeg", "jpg");
    const base = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.${ext}`, { type: outType, lastModified: Date.now() });
  } catch {
    return file;
  }
}

/** Compress and return a data URL (base64) — convenient for previews & JSON storage. */
export async function compressImageToDataURL(file: File, opts?: CompressOptions): Promise<string> {
  const compressed = await compressImage(file, opts);
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(compressed);
  });
}

/** Compress many files in parallel. */
export async function compressImages(files: File[] | FileList, opts?: CompressOptions): Promise<File[]> {
  const arr = Array.from(files);
  return Promise.all(arr.map((f) => compressImage(f, opts)));
}
