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
    initialData: () => readCache()[key] || FORM_DEFAULTS[key],
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
  });
}

export function useSaveFormSchema() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, schema }: { key: FormKey; schema: FormSchema }) => {
      // cache locally regardless of API result so preview always works
      writeCache(key, schema);
      try {
        await api.put(`/forms/${key}`, {
          title: schema.title,
          subtitle: schema.subtitle,
          fields: schema.fields,
          extras: schema.extras || {},
        });
      } catch (e) {
        // surface but do not throw — local cache still applied
        console.warn("Form save API failed, using local cache", e);
      }
      return schema;
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
