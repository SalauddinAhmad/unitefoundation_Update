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
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.82,
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
  // SVG / GIF: skip (SVG is vector, GIF may be animated)
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  const o = { ...DEFAULTS, ...opts };
  if (opts.maxBytes && file.size <= opts.maxBytes) return file;

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

    let outType: string;
    if (opts.mimeType && opts.mimeType !== "auto") {
      outType = opts.mimeType;
    } else {
      const alpha = await hasAlpha(file);
      outType = alpha ? "image/png" : "image/jpeg";
    }

    const blob = await canvasToBlob(canvas, outType, o.quality);
    // If compression made it larger (small images), keep original.
    if (blob.size >= file.size) return file;

    const ext = outType === "image/png" ? "png" : outType === "image/webp" ? "webp" : "jpg";
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
