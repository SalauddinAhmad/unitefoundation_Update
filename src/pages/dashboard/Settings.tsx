import { Card, PageHeader, Btn } from "@/components/dashboard/DashboardUI";
import { Building2, KeyRound, ShieldCheck, Bell, Share2, UserPlus, Trash2, Mail, Loader2, Copy } from "lucide-react";
import { useSettings, useUpdateSettings, type SiteSettings } from "@/hooks/api/useDashboardData";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  hint,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) => (
  <label className="block">
    <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">{label}</span>
    <input
      type={type}
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
    />
    {hint && <span className="block mt-1 text-[11px] text-muted-foreground">{hint}</span>}
  </label>
);

const Toggle = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-b-0">
    <div>
      <div className="text-sm font-semibold">{label}</div>
      {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        "shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
        (checked ? "bg-primary" : "bg-muted-foreground/30")
      }
      aria-pressed={checked}
    >
      <span
        className={
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform " +
          (checked ? "translate-x-5" : "translate-x-0.5")
        }
      />
    </button>
  </div>
);

const TABS = [
  { k: "organization", icon: Building2, l: "প্রতিষ্ঠান" },
  { k: "payment", icon: KeyRound, l: "পেমেন্ট গেটওয়ে" },
  { k: "socials", icon: Share2, l: "সোশ্যাল লিংক" },
  { k: "security", icon: ShieldCheck, l: "নিরাপত্তা ও রোল" },
  { k: "admins", icon: UserPlus, l: "অ্যাডমিন ব্যবস্থাপনা" },
  { k: "notifications", icon: Bell, l: "নোটিফিকেশন" },
] as const;

const Settings = () => {
  const { data } = useSettings();
  const update = useUpdateSettings();
  const { toast } = useToast();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [active, setActive] = useState<(typeof TABS)[number]["k"]>("organization");

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
  const setSec = <K extends keyof SiteSettings["security"]>(k: K, v: SiteSettings["security"][K]) =>
    setForm({ ...form, security: { ...form.security, [k]: v } });
  const setNot = <K extends keyof SiteSettings["notifications"]>(
    k: K,
    v: SiteSettings["notifications"][K],
  ) => setForm({ ...form, notifications: { ...form.notifications, [k]: v } });

  const SaveBar = () => (
    <Btn onClick={save} disabled={update.isPending}>
      {update.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
    </Btn>
  );

  return (
    <>
      <PageHeader title="সেটিংস" subtitle="ফাউন্ডেশনের তথ্য, পেমেন্ট, নিরাপত্তা ও নোটিফিকেশন" />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <nav className="space-y-1">
          {TABS.map((i) => (
            <button
              key={i.k}
              onClick={() => setActive(i.k)}
              className={
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " +
                (active === i.k
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground")
              }
            >
              <i.icon className="h-4 w-4" />
              {i.l}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {active === "organization" && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">প্রতিষ্ঠান তথ্য</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    সাইটে প্রদর্শিত নাম, ঠিকানা ও যোগাযোগের তথ্য
                  </p>
                </div>
                <SaveBar />
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
          )}

          {active === "payment" && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">পেমেন্ট অ্যাকাউন্ট</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    দান গ্রহণের জন্য মোবাইল ব্যাংকিং, ব্যাংক ও গেটওয়ে তথ্য
                  </p>
                </div>
                <SaveBar />
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
          )}

          {active === "socials" && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">যোগাযোগের লিংক</h3>
                  <p className="text-xs text-muted-foreground mt-1">ফুটার ও যোগাযোগ পেজে দেখানো হবে</p>
                </div>
                <SaveBar />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Facebook" value={form.socials.facebook} onChange={(v) => setSoc("facebook", v)} />
                <Field label="YouTube" value={form.socials.youtube} onChange={(v) => setSoc("youtube", v)} />
                <Field label="Instagram" value={form.socials.instagram} onChange={(v) => setSoc("instagram", v)} />
                <Field label="Twitter / X" value={form.socials.twitter} onChange={(v) => setSoc("twitter", v)} />
              </div>
            </Card>
          )}

          {active === "security" && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">নিরাপত্তা ও রোল</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    অ্যাডমিন অ্যাক্সেস, পাসওয়ার্ড নীতিমালা ও সেশন কনফিগারেশন
                  </p>
                </div>
                <SaveBar />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-2">
                <Field
                  label="সেশন টাইমআউট (মিনিট)"
                  type="number"
                  value={form.security.session_timeout_min}
                  onChange={(v) => setSec("session_timeout_min", Number(v) || 0)}
                />
                <Field
                  label="পাসওয়ার্ড সর্বনিম্ন দৈর্ঘ্য"
                  type="number"
                  value={form.security.password_min_length}
                  onChange={(v) => setSec("password_min_length", Number(v) || 0)}
                />
              </div>
              <Field
                label="অনুমোদিত অ্যাডমিন ইমেইল (কমা দ্বারা পৃথক)"
                value={form.security.allowed_admin_emails}
                onChange={(v) => setSec("allowed_admin_emails", v)}
                hint="শুধু এই ইমেইলগুলো ড্যাশবোর্ডে লগইন করতে পারবে"
              />

              <div className="mt-4 rounded-xl border border-border p-2 px-4">
                <Toggle
                  label="টু-ফ্যাক্টর অথেন্টিকেশন"
                  description="লগইনের সময় OTP চাওয়া হবে"
                  checked={form.security.two_factor}
                  onChange={(v) => setSec("two_factor", v)}
                />
                <Toggle
                  label="শক্তিশালী পাসওয়ার্ড আবশ্যক"
                  description="বড়/ছোট হাতের অক্ষর, সংখ্যা ও সিম্বল প্রয়োজন"
                  checked={form.security.require_strong_password}
                  onChange={(v) => setSec("require_strong_password", v)}
                />
                <Toggle
                  label="লগইন এলার্ট"
                  description="নতুন ডিভাইস থেকে লগইন হলে ইমেইল নোটিফিকেশন"
                  checked={form.security.login_alerts}
                  onChange={(v) => setSec("login_alerts", v)}
                />
              </div>
            </Card>
          )}

          {active === "notifications" && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">নোটিফিকেশন</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    কোন ইভেন্টে আপনি ইমেইল/SMS পেতে চান তা নির্বাচন করুন
                  </p>
                </div>
                <SaveBar />
              </div>

              <Field
                label="নোটিফিকেশন ইমেইল"
                type="email"
                value={form.notifications.notify_email}
                onChange={(v) => setNot("notify_email", v)}
              />

              <div className="mt-4 rounded-xl border border-border p-2 px-4">
                <Toggle
                  label="নতুন দান পেলে ইমেইল"
                  checked={form.notifications.email_on_donation}
                  onChange={(v) => setNot("email_on_donation", v)}
                />
                <Toggle
                  label="নতুন স্বেচ্ছাসেবক আবেদনে ইমেইল"
                  checked={form.notifications.email_on_volunteer}
                  onChange={(v) => setNot("email_on_volunteer", v)}
                />
                <Toggle
                  label="নতুন মেসেজ পেলে ইমেইল"
                  checked={form.notifications.email_on_message}
                  onChange={(v) => setNot("email_on_message", v)}
                />
                <Toggle
                  label="সাপ্তাহিক রিপোর্ট"
                  description="প্রতি সপ্তাহে ইমপ্যাক্ট সারাংশ পাঠানো হবে"
                  checked={form.notifications.weekly_report}
                  onChange={(v) => setNot("weekly_report", v)}
                />
                <Toggle
                  label="SMS এলার্ট"
                  description="জরুরি ইভেন্টে SMS পাঠানো হবে"
                  checked={form.notifications.sms_alerts}
                  onChange={(v) => setNot("sms_alerts", v)}
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;
