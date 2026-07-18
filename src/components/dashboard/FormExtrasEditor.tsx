// Editor panel for schema.extras — sidebar copy, bullets, quote, stats, banner.
import { Plus, Trash2, Image as ImgIcon, Youtube, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePickerButton } from "@/components/dashboard/ImagePickerButton";
import { EMPTY_EXTRAS, type FormExtras } from "@/data/formDefaults";
import { FormSideContent } from "@/components/forms/FormSideContent";

type Props = { value?: FormExtras; onChange: (v: FormExtras) => void };

export function FormExtrasEditor({ value, onChange }: Props) {
  const v: FormExtras = { ...EMPTY_EXTRAS, ...(value || {}) };
  const patch = (p: Partial<FormExtras>) => onChange({ ...v, ...p });

  const setBullet = (i: number, s: string) => {
    const next = [...(v.bullets || [])]; next[i] = s; patch({ bullets: next });
  };
  const addBullet = () => patch({ bullets: [...(v.bullets || []), ""] });
  const delBullet = (i: number) => patch({ bullets: (v.bullets || []).filter((_, k) => k !== i) });

  const setStat = (i: number, key: "v" | "l", val: string) => {
    const next = [...(v.stats || [])];
    next[i] = { ...next[i], [key]: val } as { v: string; l: string };
    patch({ stats: next });
  };
  const addStat = () => patch({ stats: [...(v.stats || []), { v: "", l: "" }] });
  const delStat = (i: number) => patch({ stats: (v.stats || []).filter((_, k) => k !== i) });

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-5">
      <div>
        <h3 className="text-sm font-bold text-foreground">সাইড কনটেন্ট (ফর্মের পাশে দেখাবে)</h3>
        <p className="text-xs text-muted-foreground">ইনট্রো টেক্সট, বুলেট লিস্ট, উক্তি, পরিসংখ্যান ও ব্যানার — সবই এখান থেকে সম্পাদনা করুন।</p>
      </div>

      {/* Banner */}
      <div className="rounded-md bg-secondary/40 p-3 space-y-3">
        <div className="text-xs font-bold text-foreground">ব্যানার (ইমেজ বা ইউটিউব ভিডিও)</div>
        <div className="flex gap-2">
          <Button size="sm" variant={v.banner_type === "none" ? "default" : "outline"} onClick={() => patch({ banner_type: "none", banner_url: "" })}><Ban className="h-3.5 w-3.5 mr-1" /> নেই</Button>
          <Button size="sm" variant={v.banner_type === "image" ? "default" : "outline"} onClick={() => patch({ banner_type: "image" })}><ImgIcon className="h-3.5 w-3.5 mr-1" /> ইমেজ</Button>
          <Button size="sm" variant={v.banner_type === "video" ? "default" : "outline"} onClick={() => patch({ banner_type: "video" })}><Youtube className="h-3.5 w-3.5 mr-1" /> ভিডিও</Button>
        </div>
        {v.banner_type === "image" && (
          <div className="flex items-center gap-3">
            <ImagePickerButton value={v.banner_url || ""} onChange={(url) => patch({ banner_url: url })} label="ইমেজ নির্বাচন" />
            {v.banner_url && <img src={v.banner_url} alt="" className="h-16 rounded" />}
          </div>
        )}
        {v.banner_type === "video" && (
          <Input placeholder="https://youtube.com/watch?v=..." value={v.banner_url || ""} onChange={(e) => patch({ banner_url: e.target.value })} />
        )}
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-foreground/80 mb-1 block">ইনট্রো টেক্সট</span>
        <Textarea rows={3} value={v.intro || ""} onChange={(e) => patch({ intro: e.target.value })} />
      </label>

      <div className="rounded-md bg-secondary/40 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-foreground">উক্তি / হাদীস</div>
        </div>
        <Textarea rows={2} placeholder="উক্তির টেক্সট" value={v.quote_text || ""} onChange={(e) => patch({ quote_text: e.target.value })} />
        <Input placeholder="উৎস (যেমন: সহীহ বুখারী ৬৪৬৪)" value={v.quote_source || ""} onChange={(e) => patch({ quote_source: e.target.value })} />
      </div>

      <div className="rounded-md bg-secondary/40 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-foreground">বুলেট লিস্ট</div>
          <Button size="sm" variant="outline" onClick={addBullet}><Plus className="h-3.5 w-3.5 mr-1" /> যোগ</Button>
        </div>
        <Input placeholder="লিস্টের হেডিং" value={v.bullets_title || ""} onChange={(e) => patch({ bullets_title: e.target.value })} />
        <div className="space-y-2">
          {(v.bullets || []).map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={b} onChange={(e) => setBullet(i, e.target.value)} />
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => delBullet(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md bg-secondary/40 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-foreground">পরিসংখ্যান (৩টি সুপারিশকৃত)</div>
          <Button size="sm" variant="outline" onClick={addStat}><Plus className="h-3.5 w-3.5 mr-1" /> যোগ</Button>
        </div>
        <div className="space-y-2">
          {(v.stats || []).map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <Input placeholder="মান (৩,৪৫০+)" value={s.v} onChange={(e) => setStat(i, "v", e.target.value)} />
              <Input placeholder="লেবেল (স্বেচ্ছাসেবক)" value={s.l} onChange={(e) => setStat(i, "l", e.target.value)} />
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => delStat(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Small preview of the sidebar copy as it appears on public pages.
export function FormExtrasPreview({ value }: { value?: FormExtras }) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">সাইড কনটেন্ট প্রিভিউ</div>
      <FormSideContent extras={value} />
    </div>
  );
}
