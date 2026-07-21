// Hook layer for dynamic form schemas.
// Reads from backend, falls back to bundled defaults + localStorage cache.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FORM_DEFAULTS, FORM_KEYS, type FormKey, type FormSchema } from "@/data/formDefaults";

const LS_KEY = "uf_form_schemas__cache";

function readCache(): Partial<Record<FormKey, FormSchema>> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
function writeCache(key: FormKey, schema: FormSchema) {
  const c = readCache();
  c[key] = schema;
  try { localStorage.setItem(LS_KEY, JSON.stringify(c)); } catch { /* ignore */ }
}

async function fetchOne(key: FormKey): Promise<FormSchema> {
  try {
    const r = await api.get<FormSchema & { extras?: FormSchema["extras"] }>(`/forms/${key}`, { auth: false });
    const def = FORM_DEFAULTS[key];
    const schema: FormSchema = {
      form_key: key,
      title: r.title || def.title,
      subtitle: r.subtitle || def.subtitle,
      fields: Array.isArray(r.fields) && r.fields.length ? r.fields : def.fields,
      extras: { ...(def.extras || {}), ...(r.extras || {}) },
    };
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
      if (extras.banner_type === "image" && banner.startsWith("data:")) {
        try {
          const saved = await api.post<{ id: string; url: string }>("/media", {
            url: banner,
            thumb_url: banner,
            filename: `form-${key}-banner`,
            mime: (banner.match(/^data:([^;,]+)/i)?.[1]) || "image/jpeg",
          });
          extras.banner_url = saved.url;
        } catch {
          throw new Error("ব্যানার ইমেজটি অনেক বড় — অনুগ্রহ করে 'ইমেজ' বাটন থেকে মিডিয়া লাইব্রেরির মাধ্যমে নতুন করে ছবি বাছুন।");
        }
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
