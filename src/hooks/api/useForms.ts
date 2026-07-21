// Hook layer for dynamic form schemas.
// Reads from backend, falls back to bundled defaults + localStorage cache.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FORM_DEFAULTS, FORM_KEYS, type FormKey, type FormSchema } from "@/data/formDefaults";

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
      // Do not attempt to upload legacy base64 banners during form save.
      // On the live cPanel/LiteSpeed API, that extra media request is what can
      // abort the whole save flow as a browser-level "Failed to fetch".
      // New banners should be selected/uploaded via Media Library first, which
      // gives us a short URL; legacy data URIs are cleared here so text/field
      // edits always save.
      const nextSchema = normalizeSchema(key, schema);
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
