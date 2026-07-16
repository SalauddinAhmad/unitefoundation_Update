// ============================================================
// MediaLibrary — WordPress-style image picker modal.
// Two tabs:
//   • "লাইব্রেরি" — grid of previously uploaded images
//     (select / delete)
//   • "নতুন আপলোড" — drag & drop or file picker, multi-file,
//     auto-compressed & thumbnailed, saved to the library and
//     returned to the caller.
//
// Usage:
//   const [open, setOpen] = useState(false);
//   {open && (
//     <MediaLibrary
//       onClose={() => setOpen(false)}
//       onSelect={(url) => { setCover(url); setOpen(false); }}
//       hint="প্রস্তাবিত: 1600×900 px, JPG/WebP"
//     />
//   )}
// ============================================================
import { useState, useRef } from "react";
import {
  X, Upload, Image as ImageIcon, Trash2, Search, Loader2,
  CheckCircle2, Library, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useMediaLibrary, useUploadMedia, useDeleteMedia, useRenameMedia, fetchMediaFull, type MediaItem } from "@/hooks/api/useMedia";
import { compressImage, compressImageToDataURL } from "@/lib/imageCompress";

type Props = {
  onClose: () => void;
  onSelect: (url: string, item?: MediaItem) => void;
  hint?: string;
  /** Restrict to single-file upload when true (default true) */
  multiple?: boolean;
};

const formatSize = (n?: number) => {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
};

async function fileToMeta(f: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { resolve({ width: img.width, height: img.height }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve({ width: 0, height: 0 }); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

export default function MediaLibrary({ onClose, onSelect, hint, multiple = true }: Props) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useMediaLibrary(search);
  const upload = useUploadMedia();
  const del = useDeleteMedia();
  const rename = useRenameMedia();

  const handleRename = async (m: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = m.filename || "";
    const next = window.prompt(
      "SEO-বান্ধব ফাইলনেম দিন (যেমন: eid-food-distribution-2024.jpg)\nছোট হাতের অক্ষর, শব্দের মাঝে হাইফেন (-) ব্যবহার করুন।",
      current
    );
    if (next == null) return;
    const cleaned = next.trim();
    if (!cleaned || cleaned === current) return;
    try {
      await rename.mutateAsync({ id: m.id, filename: cleaned });
      toast.success("নাম পরিবর্তন হয়েছে");
    } catch (err: any) {
      toast.error(err?.message || "নাম পরিবর্তন ব্যর্থ");
    }
  };

  const items = data?.items || [];
  const total = data?.total || 0;

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(true);
    setProgress({ done: 0, total: list.length });
    let lastUrl = "";
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      try {
        const compressed = await compressImage(f, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 });
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = reject;
          r.readAsDataURL(compressed);
        });
        const thumb = await compressImageToDataURL(compressed, { maxWidth: 400, maxHeight: 400, quality: 0.75 });
        const meta = await fileToMeta(compressed);

        // Send as JSON (base64 data URI) — cPanel/LiteSpeed proxies often block
        // multipart/form-data uploads, causing "Failed to fetch". The server
        // accepts data-URI JSON via express.json({limit:'25mb'}) and stores
        // the file to disk on its side.
        const saved = await upload.mutateAsync({
          url: dataUrl,
          thumb_url: thumb,
          filename: f.name,
          mime: compressed.type,
          size_bytes: compressed.size,
          width: meta.width,
          height: meta.height,
        });
        lastUrl = saved.url;
      } catch (e: any) {
        const detail = e?.message || e?.data?.message || "অজানা ত্রুটি";
        console.error("[MediaLibrary] upload failed", { file: f.name, error: e });
        toast.error(`${f.name}: আপলোড ব্যর্থ — ${detail}`);
      } finally {
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
      }
    }
    setBusy(false);
    setProgress(null);
    if (list.length === 1 && lastUrl) {
      // single upload: auto-select immediately
      onSelect(lastUrl);
      onClose();
      return;
    }
    toast.success(`${list.length}টি ইমেজ আপলোড হয়েছে`);
    setTab("library");
  };

  const handleSelectCurrent = async () => {
    if (!selectedId) return;
    const item = items.find((x) => x.id === selectedId);
    // Grid returned thumb_url; fetch full url on select
    try {
      const full = await fetchMediaFull(selectedId);
      onSelect(full.url || item?.thumb_url || "", full);
      onClose();
    } catch {
      // fall back to thumb
      if (item?.thumb_url) { onSelect(item.thumb_url, item); onClose(); }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("এই ইমেজটি লাইব্রেরি থেকে ডিলিট করবেন? (যেসব পোস্ট/পেজে ব্যবহৃত সেখানে ছবি ভেঙে যেতে পারে)")) return;
    try {
      await del.mutateAsync(id);
      if (selectedId === id) setSelectedId(null);
      toast.success("ডিলিট হয়েছে");
    } catch (e: any) {
      toast.error(e?.message || "ডিলিট করা যায়নি");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl h-[92vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Library className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold">মিডিয়া লাইব্রেরি</div>
              <div className="text-[11px] text-muted-foreground">
                {total} টি ইমেজ · আগে আপলোড করা ছবি রিইউজ করুন বা নতুন যোগ করুন
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-3 border-b border-border flex items-center gap-1">
          {([
            ["library", "লাইব্রেরি", Library],
            ["upload", "নতুন আপলোড", Upload],
          ] as const).map(([k, l, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition " +
                (tab === k
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground")
              }
            >
              <Icon className="h-4 w-4" /> {l}
            </button>
          ))}
        </div>

        {/* Body */}
        {tab === "library" ? (
          <>
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ফাইলের নাম দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              {hint && <span className="text-[11px] text-muted-foreground truncate">{hint}</span>}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <div className="font-semibold">কোনো ইমেজ নেই</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    "নতুন আপলোড" ট্যাব থেকে প্রথম ইমেজ আপলোড করুন।
                  </div>
                  <button
                    onClick={() => setTab("upload")}
                    className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    <Upload className="h-4 w-4" /> আপলোড করুন
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {items.map((m) => {
                    const active = selectedId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedId(m.id)}
                        onDoubleClick={() => { setSelectedId(m.id); setTimeout(() => handleSelectCurrent(), 0); }}
                        className={
                          "group relative aspect-square rounded-xl overflow-hidden border-2 bg-secondary transition " +
                          (active ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border")
                        }
                        title={m.filename || m.id}
                      >
                        <img
                          src={m.thumb_url}
                          alt={m.filename || ""}
                          loading="lazy"
                          decoding="async"
                          onLoad={(e) => e.currentTarget.classList.add("opacity-100")}
                          className="h-full w-full object-cover opacity-0 transition-opacity duration-300"
                        />
                        {active && (
                          <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground rounded-full p-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => handleRename(m, e)}
                            className="h-7 w-7 rounded-md bg-card/95 border border-border shadow flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
                            title="নাম পরিবর্তন (SEO)"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(m.id, e)}
                            className="h-7 w-7 rounded-md bg-card/95 border border-border shadow flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition"
                            title="ডিলিট"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[10px] text-white opacity-0 group-hover:opacity-100 transition">
                          <div className="truncate">{m.filename || "—"}</div>
                          <div className="text-white/70">
                            {m.width || "?"}×{m.height || "?"} · {formatSize(m.size_bytes)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">
                {selectedId ? "১টি নির্বাচিত · সিলেক্ট করতে ডাবল-ক্লিকও করতে পারেন" : "একটি ইমেজে ক্লিক করে নির্বাচন করুন"}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-secondary">
                  বাতিল
                </button>
                <button
                  onClick={handleSelectCurrent}
                  disabled={!selectedId}
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold shadow disabled:opacity-40"
                >
                  <CheckCircle2 className="h-4 w-4" /> এটি ব্যবহার করুন
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            <div
              onClick={() => !busy && fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (!busy) handleFiles(e.dataTransfer.files); }}
              className={
                "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition " +
                (busy ? "border-primary bg-primary/5" : "border-border hover:border-primary hover:bg-accent/30")
              }
            >
              {busy ? (
                <>
                  <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
                  <div className="mt-3 font-semibold">
                    আপলোড হচ্ছে... {progress ? `${progress.done}/${progress.total}` : ""}
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-primary" />
                  <div className="mt-3 font-bold text-lg">ছবি এখানে ড্র্যাগ করুন অথবা ক্লিক করুন</div>
                  <div className="text-sm text-muted-foreground mt-1">JPG, PNG, WebP · একাধিক নির্বাচন সমর্থিত</div>
                  {hint && <div className="mt-3 text-[12px] text-muted-foreground"><b>টিপ:</b> {hint}</div>}
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
            <div className="mt-4 text-xs text-muted-foreground text-center">
              আপলোডের পর সব ইমেজ লাইব্রেরিতে সংরক্ষিত হবে এবং সাইটের যেকোনো জায়গায় পুনরায় ব্যবহার করা যাবে।
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
