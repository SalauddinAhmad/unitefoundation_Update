import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type FieldType = "text" | "number" | "date" | "select" | "textarea";
export type Field = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  half?: boolean;
  defaultValue?: string | number;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: Field[];
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
}

export const ManualEntryDialog = ({
  open, onOpenChange, title, description, fields, submitLabel = "সংরক্ষণ", onSubmit,
}: Props) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const init: Record<string, string> = {};
      for (const f of fields) init[f.name] = f.defaultValue?.toString() ?? "";
      setValues(init);
    }
  }, [open, fields]);

  const set = (name: string, v: string) => setValues((s) => ({ ...s, [name]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !values[f.name]?.trim()) {
        toast.error(`"${f.label}" আবশ্যক`);
        return;
      }
    }
    setSaving(true);
    try {
      await onSubmit(values);
      toast.success("সফলভাবে যোগ হয়েছে");
      onOpenChange(false);
    } catch (err) {
      toast.error("সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden gap-0">
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-6 py-5 relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader className="text-left space-y-1">
            <div className="inline-flex items-center gap-2 text-xs bg-white/15 backdrop-blur px-2.5 py-1 rounded-md w-fit font-semibold">
              <Plus className="h-3 w-3" /> ম্যানুয়াল এন্ট্রি
            </div>
            <DialogTitle className="text-primary-foreground text-xl font-extrabold">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-primary-foreground/85 text-sm">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
                <label className="text-xs font-bold text-foreground/80 mb-1.5 block">
                  {f.label} {f.required && <span className="text-destructive">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    value={values[f.name] || ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none transition border border-transparent focus:border-primary/30 resize-none"
                  />
                ) : f.type === "select" ? (
                  <select
                    value={values[f.name] || ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none transition border border-transparent focus:border-primary/30"
                  >
                    <option value="">— নির্বাচন করুন —</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || "text"}
                    value={values[f.name] || ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none transition border border-transparent focus:border-primary/30"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitLabel}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
