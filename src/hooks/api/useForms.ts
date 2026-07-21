// Hook layer for dynamic form schemas.
// Reads from backend, falls back to bundled defaults + localStorage cache.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FORM_DEFAULTS, FORM_KEYS, type FormExtras, type FormField, type FormKey, type FormSchema } from "@/data/formDefaults";

const LS_KEY = "uf_form_schemas__cache_v2";
const LEGACY_LS_KEYS = ["uf_form_schemas__cache"];

function clearLegacyCache() {
  try {
    LEGACY_LS_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch { /* ignore */ }
}

function readCache(): Partial<Record<FormKey, FormSchema>> {
  clearLegacyCache();
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

function cleanString(value: unknown, max = 4000): string {
  if (typeof value !== "string") return "";
  if (isDataUri(value)) return "";
  return value.slice(0, max);
}

function cleanOptions(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => cleanString(item, 400)).filter(Boolean).slice(0, 80)
    : [];
}

function normalizeField(field: Partial<FormField>): FormField {
  const type = field.type || "text";
  return {
    key: cleanString(field.key, 64).replace(/[^a-zA-Z0-9_]/g, ""),
    label: cleanString(field.label, 200),
    placeholder: cleanString(field.placeholder, 200),
    type,
    required: Boolean(field.required),
    options: cleanOptions(field.options),
    help: cleanString(field.help, 500),
    full: Boolean(field.full),
    system: Boolean(field.system),
  };
}

function normalizeExtras(extras?: Partial<FormExtras>): FormExtras {
  const next = {
    intro: cleanString(extras?.intro, 4000),
    bullets_title: cleanString(extras?.bullets_title, 200),
    bullets: cleanOptions(extras?.bullets),
    quote_text: cleanString(extras?.quote_text, 1000),
    quote_source: cleanString(extras?.quote_source, 200),
    stats: Array.isArray(extras?.stats)
      ? extras.stats.map((stat) => ({
          v: cleanString(stat?.v, 40),
          l: cleanString(stat?.l, 80),
        })).slice(0, 8)
      : [],
    banner_type: extras?.banner_type || "none",
    banner_url: cleanString(extras?.banner_url, 3000),
  } satisfies FormSchema["extras"];

  if (isDataUri(extras?.banner_url) || !next.banner_url) {
    next.banner_type = "none";
    next.banner_url = "";
  }

  return next;
}

function normalizeSchema(key: FormKey, schema?: Partial<FormSchema>): FormSchema {
  const def = FORM_DEFAULTS[key];
  const extras = normalizeExtras({ ...(def.extras || {}), ...(schema?.extras || {}) });
  const fieldsSource = Array.isArray(schema?.fields) && schema.fields.length ? schema.fields : def.fields;

  return {
    form_key: key,
    title: cleanString(schema?.title, 200) || def.title,
    subtitle: cleanString(schema?.subtitle, 1000) || def.subtitle,
    fields: fieldsSource.map(normalizeField).filter((field) => field.key || field.type === "section"),
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
      const payload = {
        title: nextSchema.title,
        subtitle: nextSchema.subtitle,
        fields: nextSchema.fields,
        extras: nextSchema.extras || {},
      };
      const payloadBytes = new Blob([JSON.stringify(payload)]).size;
      if (payloadBytes > 200_000) {
        throw new Error("ফর্মের ডেটা অস্বাভাবিক বড় — বড়/base64 ইমেজ সরিয়ে Media Library URL ব্যবহার করুন।");
      }
      await api.put(`/forms/${key}`, {
        title: payload.title,
        subtitle: payload.subtitle,
        fields: payload.fields,
        extras: payload.extras,
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
