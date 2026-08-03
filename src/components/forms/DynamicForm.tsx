// Renders a form from a FormSchema config and validates via a schema built
// dynamically from field metadata. Caller passes onSubmit which receives the
// full validated values map.
import { useMemo, useState, type ReactNode } from "react";
import { z, type ZodTypeAny } from "zod";
import { toast } from "@/hooks/use-toast";
import type { FormField, FormSchema } from "@/data/formDefaults";
import { ChevronRight, Send, ShieldCheck } from "lucide-react";
import { emailRejectionReason } from "@/lib/emailValidator";

type Values = Record<string, string | number | boolean | string[]>;

function initialValueFor(f: FormField): string | number | boolean | string[] {
  if (f.type === "checkbox-group") return [];
  if (f.type === "checkbox") return false;
  if (f.type === "number") return "";
  return "";
}

function buildZod(fields: FormField[]) {
  const shape: Record<string, ZodTypeAny> = {};
  for (const f of fields) {
    if (f.type === "section") continue;
    let s: ZodTypeAny;
    switch (f.type) {
      case "email": {
        const emailBase = z.string().trim().email("সঠিক ইমেইল দিন").superRefine((v, ctx) => {
          if (v === "") return;
          const reason = emailRejectionReason(v);
          if (reason) ctx.addIssue({ code: z.ZodIssueCode.custom, message: reason });
        });
        s = f.required ? emailBase.refine((v) => v !== "", "সঠিক ইমেইল দিন") : emailBase.or(z.literal(""));
        break;
      }
      case "tel":
        s = z.string().trim().regex(/^01[3-9]\d{8}$/, `${f.label}: সঠিক ১১-অঙ্কের মোবাইল দিন`);
        if (!f.required) s = s.or(z.literal(""));
        break;
      case "url":
        s = f.required ? z.string().trim().url("সঠিক লিংক দিন") : z.string().trim().url("সঠিক লিংক দিন").or(z.literal(""));
        break;
      case "number":
        s = z.coerce.number({ message: `${f.label} সংখ্যায় দিন` });
        if (!f.required) s = z.union([z.literal(""), s]);
        break;
      case "date":
        s = f.required ? z.string().min(1, `${f.label} দিন`) : z.string();
        break;
      case "checkbox-group":
        s = f.required
          ? z.array(z.string()).min(1, `${f.label} বাছাই করুন`)
          : z.array(z.string());
        break;
      case "checkbox":
        s = f.required
          ? z.literal(true, { message: `${f.label} সম্মতি দিন` })
          : z.boolean();
        break;
      case "select":
      case "radio-group":
        s = f.required ? z.string().min(1, `${f.label} বাছাই করুন`) : z.string();
        break;
      case "textarea":
      case "text":
      default:
        s = f.required ? z.string().trim().min(1, `${f.label} পূরণ করুন`) : z.string().trim();
        break;
    }
    shape[f.key] = s;
  }
  return z.object(shape);
}

type Props = {
  schema: FormSchema;
  submitLabel?: string;
  onSubmit: (values: Values) => void;
  variant?: "light" | "dark";
  footer?: ReactNode;
  extraBeforeSubmit?: ReactNode;
  /** Dashboard preview: render fields even when the form is turned off. */
  ignoreDisabled?: boolean;
};

export function DynamicForm({ schema, submitLabel = "জমা দিন", onSubmit, variant = "dark", footer, extraBeforeSubmit, ignoreDisabled }: Props) {
  const [values, setValues] = useState<Values>(() => {
    const v: Values = {};
    for (const f of schema.fields) v[f.key] = initialValueFor(f);
    return v;
  });


  const zSchema = useMemo(() => buildZod(schema.fields), [schema.fields]);
  const set = (k: string, v: Values[string]) => setValues((s) => ({ ...s, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = zSchema.safeParse(values);
    if (!r.success) {
      toast({ title: "যাচাই ব্যর্থ", description: r.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    onSubmit(r.data as Values);
  };

  const isDark = variant === "dark";
  const inputCls = isDark
    ? "w-full rounded-lg px-3 py-2.5 text-sm bg-primary-foreground/10 border border-primary-foreground/25 text-primary-foreground placeholder:text-primary-foreground/60 focus:bg-primary-foreground/20 focus:border-primary-foreground outline-none transition"
    : "w-full rounded-lg px-3 py-2.5 text-sm bg-background border border-input text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition";
  const labelCls = isDark ? "text-xs font-semibold text-white/90 mb-1.5 block" : "text-xs font-semibold text-foreground/80 mb-1.5 block";

  if (schema.extras?.disabled && !ignoreDisabled) {
    const msg = schema.extras.disabled_message?.trim()
      || "এই ফর্মটি আপাতত বন্ধ রয়েছে। শীঘ্রই আবার চালু করা হবে, ইনশাআল্লাহ।";
    return (
      <div
        className={
          "rounded-xl border p-6 text-center " +
          (isDark
            ? "border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground"
            : "border-border bg-secondary/40 text-foreground")
        }
      >
        <Lock className={"h-6 w-6 mx-auto mb-3 " + (isDark ? "text-primary-foreground/80" : "text-muted-foreground")} />
        <p className="text-sm font-semibold leading-relaxed">{msg}</p>
      </div>
    );
  }


  return (
    <form onSubmit={submit} className={"space-y-3 " + (isDark ? "dyn-form-dark" : "dyn-form-light")}>
      <style>{`
        /* Neutralize browser autofill white background that hides typed text */
        .dyn-form-dark input:-webkit-autofill,
        .dyn-form-dark input:-webkit-autofill:hover,
        .dyn-form-dark input:-webkit-autofill:focus,
        .dyn-form-dark textarea:-webkit-autofill,
        .dyn-form-dark select:-webkit-autofill {
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff;
          -webkit-box-shadow: 0 0 0 1000px hsl(var(--primary)) inset !important;
          box-shadow: 0 0 0 1000px hsl(var(--primary)) inset !important;
          transition: background-color 9999s ease-in-out 0s;
        }
        .dyn-form-light input:-webkit-autofill,
        .dyn-form-light input:-webkit-autofill:hover,
        .dyn-form-light input:-webkit-autofill:focus,
        .dyn-form-light textarea:-webkit-autofill,
        .dyn-form-light select:-webkit-autofill {
          -webkit-text-fill-color: hsl(var(--foreground)) !important;
          caret-color: hsl(var(--foreground));
          -webkit-box-shadow: 0 0 0 1000px hsl(var(--background)) inset !important;
          box-shadow: 0 0 0 1000px hsl(var(--background)) inset !important;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>
      <div className="grid sm:grid-cols-2 gap-3">
        {schema.fields.map((f) => renderField(f, values, set, inputCls, labelCls, isDark))}
      </div>

      {extraBeforeSubmit}

      {footer ?? (
        <>
          <button
            type="submit"
            className={
              isDark
                ? "mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white text-primary font-bold py-3.5 hover:bg-white/90 transition-colors"
                : "mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-bold py-3 hover:bg-primary/90 transition-colors"
            }
          >
            <Send className="h-4 w-4" /> {submitLabel} <ChevronRight className="h-4 w-4" />
          </button>
          <div className={"flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs pt-2 " + (isDark ? "text-white/80" : "text-muted-foreground")}>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> আপনার তথ্য নিরাপদ</span>
          </div>
        </>
      )}
    </form>
  );
}

function renderField(
  f: FormField,
  values: Values,
  set: (k: string, v: Values[string]) => void,
  inputCls: string,
  labelCls: string,
  isDark: boolean,
) {
  if (f.type === "section") {
    return (
      <div key={f.key} className="sm:col-span-2">
        <div className={"text-xs font-bold uppercase tracking-wider mb-2 border-b pb-1.5 " + (isDark ? "text-white/70 border-white/20" : "text-foreground/70 border-border")}>
          {f.label}
        </div>
      </div>
    );
  }

  const wrapCls = f.full ? "sm:col-span-2" : "";
  const val = values[f.key];

  const inner = (() => {
    switch (f.type) {
      case "textarea":
        return <textarea rows={4} value={String(val ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} className={inputCls + " resize-none"} />;
      case "select":
        return (
          <select value={String(val ?? "")} onChange={(e) => set(f.key, e.target.value)} className={inputCls}>
            <option value="">— বাছাই করুন —</option>
            {(f.options || []).map((o) => <option key={o} value={o} className="text-foreground">{o}</option>)}
          </select>
        );
      case "radio-group":
        return (
          <div className="grid grid-cols-2 gap-2">
            {(f.options || []).map((o) => {
              const active = val === o;
              return (
                <label key={o} className={"cursor-pointer flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors " +
                  (active
                    ? (isDark ? "bg-white/25 border-white text-white" : "bg-primary/10 border-primary text-primary")
                    : (isDark ? "bg-white/10 border-white/25 text-white/85 hover:bg-white/15" : "bg-secondary border-border text-foreground/80 hover:bg-secondary/70"))}>
                  <input type="radio" name={f.key} checked={active} onChange={() => set(f.key, o)} className={isDark ? "accent-white" : "accent-primary"} />
                  <span>{o}</span>
                </label>
              );
            })}
          </div>
        );
      case "checkbox-group": {
        const arr = Array.isArray(val) ? (val as string[]) : [];
        return (
          <div className="grid sm:grid-cols-2 gap-2">
            {(f.options || []).map((o) => {
              const active = arr.includes(o);
              return (
                <label key={o} className={"cursor-pointer flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors " +
                  (active
                    ? (isDark ? "bg-white/25 border-white text-white" : "bg-primary/10 border-primary text-primary")
                    : (isDark ? "bg-white/10 border-white/25 text-white/85 hover:bg-white/15" : "bg-secondary border-border text-foreground/80 hover:bg-secondary/70"))}>
                  <input type="checkbox" checked={active} onChange={() => set(f.key, active ? arr.filter((x) => x !== o) : [...arr, o])} className={isDark ? "accent-white" : "accent-primary"} />
                  <span>{o}</span>
                </label>
              );
            })}
          </div>
        );
      }
      case "checkbox":
        return (
          <label className={"flex items-start gap-2.5 text-sm cursor-pointer " + (isDark ? "text-white/90" : "text-foreground/85")}>
            <input type="checkbox" checked={Boolean(val)} onChange={(e) => set(f.key, e.target.checked)} className={"mt-1 " + (isDark ? "accent-white" : "accent-primary")} />
            <span>{f.label}</span>
          </label>
        );
      case "date":
        return <input type="date" value={String(val ?? "")} onChange={(e) => set(f.key, e.target.value)} className={inputCls} />;
      case "number":
        return <input type="number" value={String(val ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} className={inputCls} />;
      case "tel":
        return <input type="tel" inputMode="numeric" maxLength={11} value={String(val ?? "")} placeholder={f.placeholder || "01XXXXXXXXX"} onChange={(e) => set(f.key, e.target.value.replace(/\D/g, ""))} className={inputCls} />;
      case "email":
        return <input type="email" value={String(val ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} className={inputCls} />;
      case "url":
        return <input type="url" value={String(val ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} className={inputCls} />;
      default:
        return <input type="text" value={String(val ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} className={inputCls} />;
    }
  })();

  // "checkbox" uses inline label; others use stacked label
  if (f.type === "checkbox") {
    return <div key={f.key} className={wrapCls}>{inner}</div>;
  }
  return (
    <label key={f.key} className={"block " + wrapCls}>
      <span className={labelCls}>
        {f.label}
        {f.required && <span className={isDark ? "text-white/70 ml-1" : "text-destructive ml-1"}>*</span>}
      </span>
      {inner}
      {f.help && <span className={"text-[11px] mt-1 block " + (isDark ? "text-white/60" : "text-muted-foreground")}>{f.help}</span>}
    </label>
  );
}
