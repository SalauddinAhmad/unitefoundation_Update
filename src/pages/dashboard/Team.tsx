import { useState } from "react";
import { Plus, Pencil, Trash2, X, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import ImagePickerButton from "@/components/dashboard/ImagePickerButton";
import {
  useTeam,
  useSaveTeam,
  useDeleteTeam,
  type TeamMember,
} from "@/hooks/api/useTeam";

const emptyMember = (): TeamMember => ({
  id: `TM-${Date.now()}`,
  name: "",
  role: "",
  bio: "",
  photo: "",
  order: 0,
  facebook: "",
  linkedin: "",
  email: "",
});

const Team = () => {
  const { data = [] } = useTeam();
  const save = useSaveTeam();
  const del = useDeleteTeam();
  const [editing, setEditing] = useState<TeamMember | null>(null);

  // Photo handling now goes through the Media Library picker.


  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.role.trim()) {
      toast({ title: "নাম ও পদবি আবশ্যক", variant: "destructive" });
      return;
    }
    await save.mutateAsync(editing);
    toast({ title: "সংরক্ষণ হয়েছে" });
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই সদস্যকে ডিলিট করবেন?")) return;
    await del.mutateAsync(id);
    toast({ title: "ডিলিট হয়েছে" });
  };

  const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">আমাদের টিম</h1>
          <p className="text-sm text-muted-foreground mt-1">
            About পেজের "আমাদের টিম" সেকশনে দেখানো সদস্যদের যোগ, এডিট বা ডিলিট করুন।
          </p>
        </div>
        <Button onClick={() => setEditing(emptyMember())} className="gap-2">
          <Plus className="h-4 w-4" /> নতুন সদস্য
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <Users2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
          কোনো সদস্য যোগ করা হয়নি। "নতুন সদস্য" ক্লিক করে শুরু করুন।
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {sorted.map((m) => (
            <div
              key={m.id}
              className="group relative rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-secondary overflow-hidden">
                {m.photo ? (
                  <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <Users2 className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="font-bold text-foreground text-sm truncate">{m.name}</div>
                <div className="text-[11px] text-primary font-medium mt-0.5 truncate">{m.role}</div>
                {m.bio && (
                  <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">{m.bio}</p>
                )}
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditing(m)}
                  className="h-8 w-8 rounded-lg bg-background/95 border shadow-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="h-8 w-8 rounded-lg bg-background/95 border shadow-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card rounded-2xl shadow-xl border overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">
                {data.some((m) => m.id === editing.id) ? "সদস্য এডিট" : "নতুন সদস্য"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <ImagePickerButton
                label="সদস্যের ছবি"
                value={editing.photo || ""}
                onChange={(url) => setEditing({ ...editing, photo: url })}
                aspect="square"
                hint="প্রস্তাবিত: 600×600 px (স্কয়ার), JPG/PNG"
              />


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>নাম *</Label>
                  <Input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="মোহাম্মদ ..."
                  />
                </div>
                <div>
                  <Label>পদবি *</Label>
                  <Input
                    value={editing.role}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    placeholder="প্রোগ্রাম ডিরেক্টর"
                  />
                </div>
              </div>

              <div>
                <Label>সংক্ষিপ্ত পরিচিতি</Label>
                <Textarea
                  rows={3}
                  value={editing.bio ?? ""}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  placeholder="সংক্ষিপ্ত বায়ো..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Facebook</Label>
                  <Input
                    value={editing.facebook ?? ""}
                    onChange={(e) => setEditing({ ...editing, facebook: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={editing.linkedin ?? ""}
                    onChange={(e) => setEditing({ ...editing, linkedin: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>ইমেইল</Label>
                  <Input
                    type="email"
                    value={editing.email ?? ""}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                    placeholder="name@..."
                  />
                </div>
              </div>

              <div className="w-32">
                <Label>ক্রম (Order)</Label>
                <Input
                  type="number"
                  value={editing.order ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, order: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-secondary/30">
              <Button variant="outline" onClick={() => setEditing(null)}>
                বাতিল
              </Button>
              <Button onClick={handleSave} disabled={save.isPending}>
                {save.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
