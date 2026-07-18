// Dashboard — Form Manager.
// Tabs for each editable public form; edit title/subtitle/fields with live preview.
import { useEffect, useMemo, useState } from "react";
import { Plus, Save, RotateCcw, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FORM_KEYS, FORM_LABEL, type FormField, type FormKey, type FormSchema } from "@/data/formDefaults";
import { resetToDefault, useAllFormSchemas, useSaveFormSchema } from "@/hooks/api/useForms";
import { FormFieldEditor } from "@/components/dashboard/FormFieldEditor";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { FormExtrasEditor, FormExtrasPreview } from "@/components/dashboard/FormExtrasEditor";

export default function FormsManager() {
  const { data: all, isLoading } = useAllFormSchemas();
  const save = useSaveFormSchema();
  const [active, setActive] = useState<FormKey>("volunteer");
  const [drafts, setDrafts] = useState<Record<FormKey, FormSchema> | null>(null);

  useEffect(() => {
    if (all && !drafts) setDrafts({ ...all });
  }, [all, drafts]);

  const current = drafts?.[active];
  const original = all?.[active];
  const dirty = useMemo(() => JSON.stringify(current) !== JSON.stringify(original), [current, original]);

  const patch = (schema: FormSchema) => setDrafts((d) => (d ? { ...d, [active]: schema } : d));
  const patchField = (i: number, f: FormField) => {
    if (!current) return;
    const next = [...current.fields];
    next[i] = f;
    patch({ ...current, fields: next });
  };
  const addField = () => {
    if (!current) return;
    const idx = current.fields.length + 1;
    patch({ ...current, fields: [...current.fields, {
      key: `field_${idx}`, label: `নতুন ফিল্ড ${idx}`, type: "text", required: false, placeholder: "",
    }] });
  };
  const deleteField = (i: number) => {
    if (!current) return;
    patch({ ...current, fields: current.fields.filter((_, k) => k !== i) });
  };
  const moveField = (i: number, dir: -1 | 1) => {
    if (!current) return;
    const j = i + dir;
    if (j < 0 || j >= current.fields.length) return;
    const next = [...current.fields];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ ...current, fields: next });
  };

  const onSave = async () => {
    if (!current) return;
    // key uniqueness check
    const keys = current.fields.map((f) => f.key);
    const dup = keys.find((k, i) => keys.indexOf(k) !== i);
    if (dup) return toast({ title: "একই key দুইবার আছে", description: `"${dup}" ইউনিক করুন`, variant: "destructive" });
    if (keys.some((k) => !k)) return toast({ title: "প্রতিটি ফিল্ডের key লাগবে", variant: "destructive" });
    try {
      await save.mutateAsync({ key: active, schema: current });
      toast({ title: "সংরক্ষিত হয়েছে ✓", description: FORM_LABEL[active] });
    } catch (e) {
      toast({ title: "সেভ হয়নি", description: String((e as Error).message), variant: "destructive" });
    }
  };

  const onReset = () => {
    if (!confirm("এই ফর্মকে ডিফল্ট-এ ফেরত নেব?")) return;
    patch(resetToDefault(active));
  };

  if (isLoading || !drafts) {
    return <div className="p-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে…</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">ফর্ম ম্যানেজার</h1>
        <p className="text-sm text-muted-foreground mt-1">
          পাবলিক পেজের ফর্মগুলোর ফিল্ড, লেবেল, ধরন ও ভ্যালিডেশন এখান থেকে নিয়ন্ত্রণ করুন।
          পরিবর্তন সংরক্ষণের পর সাথে-সাথে সাইটে দেখাবে।
        </p>
      </div>

      <Tabs value={active} onValueChange={(v) => setActive(v as FormKey)}>
        <TabsList className="flex flex-wrap h-auto">
          {FORM_KEYS.map((k) => (
            <TabsTrigger key={k} value={k} className="text-xs md:text-sm">
              {FORM_LABEL[k]}
            </TabsTrigger>
          ))}
        </TabsList>

        {FORM_KEYS.map((k) => (
          <TabsContent key={k} value={k} className="mt-6">
            {current && k === active && (
              <div className="grid xl:grid-cols-[1fr_460px] gap-6">
                {/* Editor */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                    <label className="block">
                      <span className="text-xs font-semibold text-foreground/80 mb-1 block">ফর্ম টাইটেল</span>
                      <Input value={current.title} onChange={(e) => patch({ ...current, title: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-foreground/80 mb-1 block">ফর্ম সাব-টাইটেল</span>
                      <Textarea rows={2} value={current.subtitle} onChange={(e) => patch({ ...current, subtitle: e.target.value })} />
                    </label>
                  </div>

                  <FormExtrasEditor
                    value={current.extras}
                    onChange={(extras) => patch({ ...current, extras })}
                  />


                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-foreground">ফিল্ডসমূহ ({current.fields.length})</div>
                    <Button size="sm" variant="outline" onClick={addField}><Plus className="h-4 w-4 mr-1" /> ফিল্ড যোগ</Button>
                  </div>

                  <div className="space-y-3">
                    {current.fields.map((f, i) => (
                      <FormFieldEditor
                        key={i}
                        field={f}
                        index={i}
                        total={current.fields.length}
                        onChange={(nf) => patchField(i, nf)}
                        onDelete={() => deleteField(i)}
                        onMove={(dir) => moveField(i, dir)}
                      />
                    ))}
                  </div>

                  <div className="sticky bottom-4 z-10 flex items-center justify-end gap-2 rounded-lg border border-border bg-card/95 backdrop-blur p-3 shadow-lg">
                    <span className={"text-xs mr-auto " + (dirty ? "text-amber-600 font-semibold" : "text-muted-foreground")}>
                      {dirty ? "অসংরক্ষিত পরিবর্তন" : "সংরক্ষিত"}
                    </span>
                    <Button variant="outline" onClick={onReset}><RotateCcw className="h-4 w-4 mr-1" /> ডিফল্ট</Button>
                    <Button onClick={onSave} disabled={!dirty || save.isPending}>
                      {save.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                      সংরক্ষণ
                    </Button>
                  </div>
                </div>

                {/* Live preview */}
                <div className="xl:sticky xl:top-4 h-max space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">লাইভ প্রিভিউ</div>
                  <FormExtrasPreview value={current.extras} />
                  <div className="rounded-xl overflow-hidden shadow-lg" style={{ background: "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(142 56% 18%) 100%)" }}>
                    <div className="p-6 text-white">
                      <h3 className="text-lg font-bold">{current.title}</h3>
                      <p className="text-white/80 text-xs mt-1 mb-4 leading-relaxed">{current.subtitle}</p>
                      <DynamicForm
                        schema={current}
                        submitLabel="প্রিভিউ (সাবমিট নিষ্ক্রিয়)"
                        onSubmit={() => toast({ title: "প্রিভিউ মোড", description: "এটি লাইভ ফর্ম নয়।" })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
