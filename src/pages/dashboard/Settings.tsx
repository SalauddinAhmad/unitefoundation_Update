import { Card, PageHeader, Btn } from "@/components/dashboard/DashboardUI";
import { Building2, KeyRound, ShieldCheck, Bell } from "lucide-react";
import { useSettings, useUpdateSettings, type SiteSettings } from "@/hooks/api/useDashboardData";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Field = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <label className="block">
    <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
    />
  </label>
);

const Settings = () => {
  const { data } = useSettings();
  const update = useUpdateSettings();
  const { toast } = useToast();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [active, setActive] = useState("organization");

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  if (!form) return <div className="p-8 text-sm text-muted-foreground">লোড হচ্ছে...</div>;

  const save = async () => {
    await update.mutateAsync(form);
    toast({ title: "সংরক্ষিত হয়েছে", description: "পরিবর্তন সফলভাবে সেভ হয়েছে।" });
  };

  const setOrg = (k: keyof SiteSettings["organization"], v: string) =>
    setForm({ ...form, organization: { ...form.organization, [k]: v } });
  const setPay = (k: keyof SiteSettings["payments"], v: string) =>
    setForm({ ...form, payments: { ...form.payments, [k]: v } });
  const setSoc = (k: keyof SiteSettings["socials"], v: string) =>
    setForm({ ...form, socials: { ...form.socials, [k]: v } });

  return (
    <>
      <PageHeader title="সেটিংস" subtitle="ফাউন্ডেশনের তথ্য, পেমেন্ট ও নিরাপত্তা সেটিংস" />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <nav className="space-y-1">
          {[
            { k: "organization", icon: Building2, l: "প্রতিষ্ঠান" },
            { k: "payment", icon: KeyRound, l: "পেমেন্ট গেটওয়ে" },
            { k: "security", icon: ShieldCheck, l: "নিরাপত্তা ও রোল" },
            { k: "notifications", icon: Bell, l: "নোটিফিকেশন" },
          ].map((i) => (
            <button
              key={i.k}
              onClick={() => setActive(i.k)}
              className={
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " +
                (active === i.k ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-secondary hover:text-foreground")
              }
            >
              <i.icon className="h-4 w-4" />
              {i.l}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold">প্রতিষ্ঠান তথ্য</h3>
                <p className="text-xs text-muted-foreground mt-1">সাইটে প্রদর্শিত নাম, লোগো ও যোগাযোগের তথ্য</p>
              </div>
              <Btn onClick={save} disabled={update.isPending}>{update.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}</Btn>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="প্রতিষ্ঠানের নাম" value={form.organization.name} onChange={(v) => setOrg("name", v)} />
              <Field label="ট্যাগলাইন" value={form.organization.tagline} onChange={(v) => setOrg("tagline", v)} />
              <Field label="ইমেইল" type="email" value={form.organization.email} onChange={(v) => setOrg("email", v)} />
              <Field label="ফোন / WhatsApp" type="tel" value={form.organization.phone} onChange={(v) => setOrg("phone", v)} />
              <Field label="ওয়েবসাইট" value={form.organization.website} onChange={(v) => setOrg("website", v)} />
              <Field label="রেজিস্ট্রেশন নং" value={form.organization.registration_no} onChange={(v) => setOrg("registration_no", v)} />
            </div>
            <div className="mt-4">
              <Field label="পূর্ণ ঠিকানা" value={form.organization.address} onChange={(v) => setOrg("address", v)} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold">পেমেন্ট অ্যাকাউন্ট</h3>
                <p className="text-xs text-muted-foreground mt-1">দান গ্রহণের জন্য মোবাইল ব্যাংকিং ও ব্যাংক তথ্য</p>
              </div>
              <Btn onClick={save} disabled={update.isPending}>সংরক্ষণ</Btn>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="bKash (পার্সোনাল)" value={form.payments.bkash} onChange={(v) => setPay("bkash", v)} />
              <Field label="Nagad (পার্সোনাল)" value={form.payments.nagad} onChange={(v) => setPay("nagad", v)} />
              <Field label="Rocket (পার্সোনাল)" value={form.payments.rocket} onChange={(v) => setPay("rocket", v)} />
              <Field label="ব্যাংক একাউন্ট নম্বর" value={form.payments.bank_account} onChange={(v) => setPay("bank_account", v)} />
              <Field label="ব্যাংকের নাম" value={form.payments.bank_name} onChange={(v) => setPay("bank_name", v)} />
              <Field label="SSLCommerz Store ID" value={form.payments.sslcommerz_store_id} onChange={(v) => setPay("sslcommerz_store_id", v)} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold">যোগাযোগের লিংক</h3>
                <p className="text-xs text-muted-foreground mt-1">ফুটার ও যোগাযোগ পেজে দেখানো হবে</p>
              </div>
              <Btn onClick={save} disabled={update.isPending}>সংরক্ষণ</Btn>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Facebook" value={form.socials.facebook} onChange={(v) => setSoc("facebook", v)} />
              <Field label="YouTube" value={form.socials.youtube} onChange={(v) => setSoc("youtube", v)} />
              <Field label="Instagram" value={form.socials.instagram} onChange={(v) => setSoc("instagram", v)} />
              <Field label="Twitter / X" value={form.socials.twitter} onChange={(v) => setSoc("twitter", v)} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Settings;
