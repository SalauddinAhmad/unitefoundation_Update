// Hook layer for dynamic form schemas.
// Reads from backend, falls back to bundled defaults + localStorage cache.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FORM_DEFAULTS, FORM_KEYS, type FormKey, type FormSchema } from "@/data/formDefaults";
import { compressImage } from "@/lib/imageCompress";

const LS_KEY = "uf_form_schemas__cache";

function readCache(): Partial<Record<FormKey, FormSchema>> {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return Object.fromEntries(
      Object.entries(raw).map(([key, schema]) => [key, normalizeSchema(key as FormKey, schema as FormSchema)])
    ) as Partial<Record<FormKey, FormSchema>>;
  } catch { return {}; }
}
function writeCache(key: FormKey, schema: FormSchema) {
  const c = readCache();
  c[key] = normalizeSchema(key, schema);
  try { localStorage.setItem(LS_KEY, JSON.stringify(c)); } catch { /* ignore */ }
}

const DATA_URI_RE = /^data:([^;,]+);base64,/i;

function isDataUri(value?: string) {
  return Boolean(value && DATA_URI_RE.test(value));
}

function normalizeSchema(key: FormKey, schema?: Partial<FormSchema>): FormSchema {
  const def = FORM_DEFAULTS[key];
  const extras = { ...(def.extras || {}), ...(schema?.extras || {}) };

  // Never keep base64 banners in React Query/localStorage. Old dashboard builds
  // could store them and later every save became a huge PUT request, which live
  // cPanel/LiteSpeed often reports in the browser as only "Failed to fetch".
  if (isDataUri(extras.banner_url)) {
    extras.banner_type = "none";
    extras.banner_url = "";
  }

  return {
    form_key: key,
    title: schema?.title || def.title,
    subtitle: schema?.subtitle || def.subtitle,
    fields: Array.isArray(schema?.fields) && schema.fields.length ? schema.fields : def.fields,
    extras,
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function dataUriToOptimizedFile(dataUri: string, filename: string): Promise<File> {
  const response = await fetch(dataUri);
  const blob = await response.blob();
  const mime = blob.type || dataUri.match(DATA_URI_RE)?.[1] || "image/jpeg";
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : mime.includes("gif") ? "gif" : "jpg";
  const original = new File([blob], `${filename}.${ext}`, { type: mime, lastModified: Date.now() });
  return compressImage(original, { maxWidth: 1600, maxHeight: 1000, quality: 0.78, mimeType: "auto" });
}

async function uploadLegacyBannerDataUri(key: FormKey, dataUri: string) {
  const file = await dataUriToOptimizedFile(dataUri, `form-${key}-banner`);

  // Prefer real file upload after client-side compression. If a host blocks
  // multipart, fall back to the existing JSON data-URI media endpoint.
  try {
    const form = new FormData();
    form.append("file", file, file.name);
    const saved = await api.post<{ id: string; url: string }>("/media", form);
    return saved.url;
  } catch {
    const compactDataUri = await fileToDataUrl(file);
    const saved = await api.post<{ id: string; url: string }>("/media", {
      url: compactDataUri,
      thumb_url: compactDataUri,
      filename: file.name.replace(/\.[^.]+$/, ""),
      mime: file.type || "image/jpeg",
      size_bytes: file.size,
    });
    return saved.url;
  }
}

async function fetchOne(key: FormKey): Promise<FormSchema> {
  try {
    const r = await api.get<FormSchema & { extras?: FormSchema["extras"] }>(`/forms/${key}`, { auth: false });
    const schema = normalizeSchema(key, r);
    writeCache(key, schema);
    return schema;
  } catch {
    return readCache()[key] || FORM_DEFAULTS[key];
  }
}

export function useFormSchema(key: FormKey) {
  return useQuery({
    queryKey: ["form-schema", key],
    queryFn: () => fetchOne(key),
    staleTime: 60_000,
    refetchOnMount: "always",
    initialData: () => readCache()[key] || FORM_DEFAULTS[key],
    // Mark initialData as ancient so RQ still fetches fresh server data on mount.
    initialDataUpdatedAt: 0,
  });
}

export function useAllFormSchemas() {
  return useQuery({
    queryKey: ["form-schemas", "all"],
    queryFn: async () => {
      const results = await Promise.all(FORM_KEYS.map((k) => fetchOne(k)));
      return Object.fromEntries(FORM_KEYS.map((k, i) => [k, results[i]])) as Record<FormKey, FormSchema>;
    },
    staleTime: 60_000,
    refetchOnMount: "always",
  });
}

export function useSaveFormSchema() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, schema }: { key: FormKey; schema: FormSchema }) => {
      // Guard: legacy banner_url stored as a base64 data URI can push the
      // PUT payload past cPanel/LiteSpeed's request body limit and surface
      // as a generic "Failed to fetch" in the browser. Upload it to the
      // media library first and swap in the short URL before saving.
      const extras = { ...(schema.extras || {}) } as NonNullable<FormSchema["extras"]>;
      const banner = extras.banner_url || "";
      if (extras.banner_type === "image" && isDataUri(banner)) {
        try {
          extras.banner_url = await uploadLegacyBannerDataUri(key, banner);
        } catch {
          // Last-resort safety: do not let an old oversized base64 banner stop
          // all form edits from being saved. Admin can re-select the banner from
          // the Media Library after the text/field changes are saved.
          extras.banner_type = "none";
          extras.banner_url = "";
        }
      } else if (isDataUri(banner)) {
        extras.banner_type = "none";
        extras.banner_url = "";
      }
      const nextSchema: FormSchema = { ...schema, extras };
      await api.put(`/forms/${key}`, {
        title: nextSchema.title,
        subtitle: nextSchema.subtitle,
        fields: nextSchema.fields,
        extras: nextSchema.extras || {},
      });
      writeCache(key, nextSchema);
      return nextSchema;
    },
    onSuccess: (schema, vars) => {
      qc.setQueryData(["form-schema", vars.key], schema);
      qc.invalidateQueries({ queryKey: ["form-schemas", "all"] });
    },
  });
}


export function resetToDefault(key: FormKey): FormSchema {
  return JSON.parse(JSON.stringify(FORM_DEFAULTS[key]));
}
