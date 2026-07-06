// Row-level editor for a single form field.
import { ChevronDown, ChevronUp, Trash2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FormField, FieldType } from "@/data/formDefaults";

const TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Mobile (01…)" },
  { value: "number", label: "Number" },
  { value: "url", label: "URL" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Dropdown (Select)" },
  { value: "radio-group", label: "Radio group" },
  { value: "checkbox-group", label: "Checkbox group (multi)" },
  { value: "checkbox", label: "Single checkbox (agreement)" },
  { value: "section", label: "Section heading" },
];

type Props = {
  field: FormField;
  index: number;
  total: number;
  onChange: (f: FormField) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
};

const needsOptions = (t: FieldType) => t === "select" || t === "radio-group" || t === "checkbox-group";

export function FormFieldEditor({ field, index, total, onChange, onDelete, onMove }: Props) {
  const locked = !!field.system;
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground w-8">#{index + 1}</span>
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={field.key}
            disabled={locked}
            onChange={(e) => onChange({ ...field, key: e.target.value.replace(/[^a-zA-Z0-9_]/g, "") })}
            placeholder="field_key"
            className="max-w-[180px] font-mono text-xs"
          />
          {locked && <span title="System field — key locked"><Lock className="h-3.5 w-3.5 text-muted-foreground" /></span>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => onMove(-1)} disabled={index === 0}><ChevronUp className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => onMove(1)} disabled={index === total - 1}><ChevronDown className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onDelete} disabled={locked} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-foreground/80 mb-1 block">Label</span>
          <Input value={field.label} onChange={(e) => onChange({ ...field, label: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-foreground/80 mb-1 block">Type</span>
          <select
            value={field.type}
            onChange={(e) => onChange({ ...field, type: e.target.value as FieldType })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        {field.type !== "section" && field.type !== "checkbox" && (
          <label className="block">
            <span className="text-xs font-semibold text-foreground/80 mb-1 block">Placeholder</span>
            <Input value={field.placeholder || ""} onChange={(e) => onChange({ ...field, placeholder: e.target.value })} />
          </label>
        )}
        <label className="block">
          <span className="text-xs font-semibold text-foreground/80 mb-1 block">Help text</span>
          <Input value={field.help || ""} onChange={(e) => onChange({ ...field, help: e.target.value })} />
        </label>
      </div>

      {needsOptions(field.type) && (
        <label className="block">
          <span className="text-xs font-semibold text-foreground/80 mb-1 block">Options (one per line)</span>
          <Textarea
            rows={Math.min(8, Math.max(3, (field.options?.length || 0) + 1))}
            value={(field.options || []).join("\n")}
            onChange={(e) => onChange({ ...field, options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
          />
        </label>
      )}

      <div className="flex items-center gap-6 pt-1">
        {field.type !== "section" && (
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={!!field.required} onCheckedChange={(v) => onChange({ ...field, required: v })} />
            <span className="text-foreground/80">Required</span>
          </label>
        )}
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={!!field.full} onCheckedChange={(v) => onChange({ ...field, full: v })} />
          <span className="text-foreground/80">Full-width</span>
        </label>
      </div>
    </div>
  );
}
