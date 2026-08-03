// ============================================================
// My Profile — self-service profile page for dashboard users.
// Avatar (media library), display name, and password change.
// ============================================================
import { useEffect, useState } from "react";
import { Card, PageHeader, Btn } from "@/components/dashboard/DashboardUI";
import ImagePickerButton from "@/components/dashboard/ImagePickerButton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABEL, type Role } from "@/lib/permissions";
import { Loader2, KeyRound, UserIcon, Mail, ShieldCheck } from "lucide-react";

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) => (
  <label className="block">
    <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">{label}</span>
    <input
      type={type}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition disabled:opacity-60"
    />
  </label>
);

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [saving, setSaving] = useState(false);

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setAvatar(user?.avatar ?? "");
  }, [user?.name, user?.avatar]);

  const dirty = name.trim() !== (user?.name ?? "") || avatar !== (user?.avatar ?? "");

  const save = async () => {
    if (name.trim().length < 2) {
      toast({ title: "নাম কমপক্ষে ২ অক্ষর হতে হবে", variant: "destructive" });
      return;
    }
    setSaving(true);
    const res = await updateProfile({ name: name.trim(), avatar });
    setSaving(false);
    toast(
      res.ok
        ? { title: "প্রোফাইল আপডেট হয়েছে" }
        : { title: "সংরক্ষণ ব্যর্থ", description: res.message, variant: "destructive" },
    );
  };

  const submitPassword = async () => {
    if (newPass.length < 8) {
      toast({ title: "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর", variant: "destructive" });
      return;
    }
    if (newPass !== confirmPass) {
      toast({ title: "পাসওয়ার্ড দুটি মিলছে না", variant: "destructive" });
      return;
    }
    setChanging(true);
    const res = await changePassword(curPass, newPass);
    setChanging(false);
    if (res.ok) {
      setCurPass(""); setNewPass(""); setConfirmPass("");
      toast({ title: "পাসওয়ার্ড পরিবর্তন হয়েছে" });
    } else {
      toast({ title: "পরিবর্তন ব্যর্থ", description: res.message, variant: "destructive" });
    }
  };

  const initials = (user?.name || "UF").slice(0, 2).toUpperCase();

  return (
    <div>
      <PageHeader
        title="আমার প্রোফাইল"
        subtitle="আপনার ছবি, নাম ও পাসওয়ার্ড এখান থেকে হালনাগাদ করুন"
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Summary */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-extrabold text-2xl">
              {avatar ? (
                <img src={avatar} alt={user?.name || "প্রোফাইল ছবি"} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <div className="font-extrabold text-lg leading-relaxed">{user?.name || "এডমিন"}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
                <Mail className="h-3.5 w-3.5" /> {user?.email || "—"}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {ROLE_LABEL[(user?.role as Role) ?? "viewer"] ?? user?.role}
              </div>
            </div>
          </div>
        </Card>

        {/* Editable details */}
        <Card className="lg:col-span-2">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" /> ব্যক্তিগত তথ্য
          </h2>
          <div className="space-y-4">
            <ImagePickerButton
              label="প্রোফাইল ছবি"
              value={avatar}
              onChange={setAvatar}
              aspect="square"
              hint="মিডিয়া লাইব্রেরি থেকে বেছে নিন বা নতুন ছবি আপলোড করুন"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="পূর্ণ নাম" value={name} onChange={setName} placeholder="আপনার নাম" />
              <Field label="ইমেইল (পরিবর্তনযোগ্য নয়)" value={user?.email ?? ""} disabled />
            </div>
            <div className="flex justify-end">
              <Btn onClick={save} disabled={saving || !dirty}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                সংরক্ষণ করুন
              </Btn>
            </div>
          </div>
        </Card>

        {/* Password */}
        <Card className="lg:col-span-3">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" /> পাসওয়ার্ড পরিবর্তন
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="বর্তমান পাসওয়ার্ড" type="password" value={curPass} onChange={setCurPass} />
            <Field label="নতুন পাসওয়ার্ড" type="password" value={newPass} onChange={setNewPass} />
            <Field label="নতুন পাসওয়ার্ড (পুনরায়)" type="password" value={confirmPass} onChange={setConfirmPass} />
          </div>
          <div className="flex justify-end mt-4">
            <Btn variant="outline" onClick={submitPassword} disabled={changing || !curPass || !newPass}>
              {changing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              পাসওয়ার্ড আপডেট
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
