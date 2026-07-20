import { Card, PageHeader, Btn } from "@/components/dashboard/DashboardUI";
import { Building2, KeyRound, ShieldCheck, Bell, Share2, UserPlus, Trash2, Mail, Loader2, Copy, TrendingUp, Plus, Image as ImageIcon, Info, Milestone as MilestoneIcon, ArrowUp, ArrowDown, Target, Layers, Pencil, X as XIcon } from "lucide-react";
import ImagePickerButton from "@/components/dashboard/ImagePickerButton";
import MediaLibrary from "@/components/dashboard/MediaLibrary";
import HeroSlidesEditor from "@/components/dashboard/HeroSlidesEditor";
import EmailTemplatesPanel from "@/components/dashboard/EmailTemplatesPanel";

import { useSettings, useUpdateSettings, type SiteSettings, type Milestone } from "@/hooks/api/useDashboardData";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ASSIGNABLE_ROLES, ROLE_LABEL, ROLE_DESCRIPTION, type Role, type Permission } from "@/lib/permissions";


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

const ImageField = ({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) => (
  <ImagePickerButton
    label={label}
    value={value}
    onChange={onChange}
    aspect="wide"
    hint={hint}
  />
);

// Compact page-hero tile: small aspect-video thumbnail + hover overlay
// with change/remove actions. Opens the MediaLibrary modal on click.
const PageHeroTile = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="group relative rounded-xl overflow-hidden border border-border bg-secondary/60 aspect-[16/10] shadow-sm hover:shadow-md transition">
      {value ? (
        <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground/70">
          <ImageIcon className="h-6 w-6" />
          <span className="text-[11px] font-medium">ইমেজ নেই</span>
        </div>
      )}
      {/* gradient + label always visible */}
      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
      <div className="absolute left-2.5 bottom-2 right-2 text-white text-xs font-semibold tracking-wide drop-shadow">
        {label}
      </div>
      {/* hover actions */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 group-hover:opacity-100 transition">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white text-foreground text-[11px] font-semibold shadow hover:bg-white/90"
        >
          <Pencil className="h-3 w-3" />
          {value ? "পরিবর্তন" : "বাছুন"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-white/90 text-destructive hover:bg-destructive hover:text-destructive-foreground shadow"
            title="সরান"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && (
        <MediaLibrary
          onClose={() => setOpen(false)}
          onSelect={(url) => { onChange(url); setOpen(false); }}
          hint="প্রস্তাবিত: 1600×900 px, JPG/WebP"
        />
      )}
    </div>
  );
};



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

const TABS: { k: string; icon: typeof Building2; l: string; perm?: Permission }[] = [
  { k: "profile", icon: KeyRound, l: "প্রোফাইল ও পাসওয়ার্ড" },
  { k: "organization", icon: Building2, l: "প্রতিষ্ঠান", perm: "settings" },
  { k: "hero", icon: ImageIcon, l: "হোম স্লাইডার", perm: "settings" },
  { k: "about", icon: Info, l: "About সেকশন", perm: "settings" },
  { k: "milestones", icon: MilestoneIcon, l: "মাইলফলকসমূহ", perm: "settings" },
  { k: "mission", icon: Target, l: "লক্ষ্য সেকশন (About)", perm: "settings" },
  { k: "page_heroes", icon: Layers, l: "পেজ হেডার ইমেজ", perm: "settings" },
  
  
  { k: "payment", icon: KeyRound, l: "পেমেন্ট গেটওয়ে", perm: "settings.payment" },
  { k: "socials", icon: Share2, l: "সোশ্যাল লিংক", perm: "settings" },
  { k: "impact", icon: TrendingUp, l: "ইমপ্যাক্ট পরিসংখ্যান", perm: "settings" },
  { k: "security", icon: ShieldCheck, l: "নিরাপত্তা ও রোল", perm: "settings.security" },
  { k: "admins", icon: UserPlus, l: "অ্যাডমিন ব্যবস্থাপনা", perm: "admins" },
  { k: "email_templates", icon: Mail, l: "ইমেইল টেমপ্লেট", perm: "admins" },
  { k: "notifications", icon: Bell, l: "নোটিফিকেশন", perm: "settings" },
];


const Settings = () => {
  const { data } = useSettings();
  const update = useUpdateSettings();
  const { toast } = useToast();
  const { can } = useAuth();
  const visibleTabs = TABS.filter((t) => !t.perm || can(t.perm));
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [active, setActive] = useState<string>(visibleTabs[0]?.k || "organization");


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
          {visibleTabs.map((i) => (
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
          {active === "profile" && <ProfilePanel />}

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
            <div className="space-y-4">

              {/* QR Code */}
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold">Bangla QR (স্ক্যান করে দান)</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      QR ইমেজ আপলোড করুন — যেকোনো MFS অ্যাপ থেকে স্ক্যান করা যাবে
                    </p>
                  </div>
                  <SaveBar />
                </div>
                <div className="grid sm:grid-cols-[260px_1fr] gap-5 items-start">
                  <div className="rounded-xl border border-border bg-secondary/40 p-3">
                    <div className="aspect-square rounded-lg bg-card flex items-center justify-center overflow-hidden">
                      {form.payments.qr_image ? (
                        <img src={form.payments.qr_image} alt="QR Preview" className="h-full w-full object-contain" />
                      ) : (
                        <div className="text-xs text-muted-foreground text-center px-4">
                          QR ইমেজ নেই — ডানের বাটন থেকে বাছুন
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <ImagePickerButton
                      label="QR কোড ইমেজ"
                      value={form.payments.qr_image}
                      onChange={(v) => setPay("qr_image" as any, v)}
                      aspect="square"
                      hint="স্কয়ার ইমেজ প্রস্তাবিত — কমপক্ষে 600×600 px, PNG/JPG"
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      বিকাশ / নগদ / রকেট বা যেকোনো ব্যাংকের Bangla QR এখানে আপলোড করুন। নতুন QR
                      আপডেট করলে সেভ চাপার সাথে সাথে হোম ও ডোনেট পেজে আপডেট হয়ে যাবে।
                    </p>
                  </div>
                </div>
              </Card>

              {/* Personal Mobile Banking */}
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold">পার্সোনাল মোবাইল ব্যাংকিং</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      ডোনেট পেজে দেখানো bKash / Nagad / Rocket নম্বর
                    </p>
                  </div>
                  <SaveBar />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="bKash (পার্সোনাল)" value={form.payments.bkash} onChange={(v) => setPay("bkash", v)} />
                  <Field label="Nagad (পার্সোনাল)" value={form.payments.nagad} onChange={(v) => setPay("nagad", v)} />
                  <Field label="Rocket (পার্সোনাল)" value={form.payments.rocket} onChange={(v) => setPay("rocket", v)} />
                </div>
              </Card>

              {/* Bank Accounts */}
              <Card>
                <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                  <div>
                    <h3 className="font-bold">ব্যাংক অ্যাকাউন্টসমূহ</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      একাধিক ব্যাংক যোগ, সম্পাদনা বা মুছে ফেলুন। ডোনেট পেজে সব ব্যাংক দেখানো হবে।
                    </p>
                  </div>
                  <SaveBar />
                </div>

                <div className="space-y-4">
                  {(form.payments.banks || []).map((b, idx) => {
                    const upd = (patch: Partial<typeof b>) => {
                      const next = [...(form.payments.banks || [])];
                      next[idx] = { ...next[idx], ...patch };
                      setForm({ ...form, payments: { ...form.payments, banks: next } });
                    };
                    const move = (dir: -1 | 1) => {
                      const next = [...(form.payments.banks || [])];
                      const j = idx + dir;
                      if (j < 0 || j >= next.length) return;
                      [next[idx], next[j]] = [next[j], next[idx]];
                      setForm({ ...form, payments: { ...form.payments, banks: next } });
                    };
                    const remove = () => {
                      if (!confirm("এই ব্যাংক অ্যাকাউন্টটি মুছবেন?")) return;
                      setForm({
                        ...form,
                        payments: { ...form.payments, banks: (form.payments.banks || []).filter((_, i) => i !== idx) },
                      });
                    };
                    return (
                      <div key={idx} className="rounded-xl border border-border p-4 bg-card">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="text-xs font-bold text-muted-foreground">ব্যাংক #{idx + 1}</div>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => move(-1)} className="p-1.5 rounded-md hover:bg-secondary" title="উপরে"><ArrowUp className="h-4 w-4" /></button>
                            <button type="button" onClick={() => move(1)} className="p-1.5 rounded-md hover:bg-secondary" title="নিচে"><ArrowDown className="h-4 w-4" /></button>
                            <button type="button" onClick={remove} className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="মুছুন"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Field label="ব্যাংকের নাম" value={b.bank} onChange={(v) => upd({ bank: v })} />
                          <Field label="শাখা" value={b.branch} onChange={(v) => upd({ branch: v })} hint="যেমন: Branch : Uttara" />
                          <Field label="অ্যাকাউন্ট নাম" value={b.account} onChange={(v) => upd({ account: v })} />
                          <Field label="অ্যাকাউন্ট নম্বর" value={b.number} onChange={(v) => upd({ number: v })} />
                          <Field label="Routing" value={b.routing} onChange={(v) => upd({ routing: v })} />
                          <Field label="SWIFT" value={b.swift} onChange={(v) => upd({ swift: v })} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      payments: {
                        ...form.payments,
                        banks: [
                          ...(form.payments.banks || []),
                          { bank: "নতুন ব্যাংক", branch: "", account: "", number: "", routing: "", swift: "" },
                        ],
                      },
                    })
                  }
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" /> নতুন ব্যাংক যোগ করুন
                </button>
              </Card>
            </div>
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

          {active === "admins" && <AdminsPanel />}
          {active === "email_templates" && <EmailTemplatesPanel />}

          {active === "impact" && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">ইমপ্যাক্ট পরিসংখ্যান</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    হোম পেজে প্রদর্শিত সংখ্যাসমূহ (মানুষকে সাহায্য, প্রকল্প, স্বেচ্ছাসেবক ইত্যাদি)
                  </p>
                </div>
                <SaveBar />
              </div>

              <div className="mb-6 rounded-lg border border-border p-4 space-y-3 bg-muted/30">
                <div className="text-sm font-bold">সেকশন হেডিং</div>
                <Field
                  label="আইব্রো (উপরের ছোট লেখা)"
                  value={form.impact_section?.eyebrow || ""}
                  onChange={(v) =>
                    setForm({ ...form, impact_section: { ...(form.impact_section || {}), eyebrow: v } })
                  }
                />
                <Field
                  label="হেডিং"
                  value={form.impact_section?.heading || ""}
                  onChange={(v) =>
                    setForm({ ...form, impact_section: { ...(form.impact_section || {}), heading: v } })
                  }
                />
                <Field
                  label="সাবটাইটেল"
                  value={form.impact_section?.subtitle || ""}
                  onChange={(v) =>
                    setForm({ ...form, impact_section: { ...(form.impact_section || {}), subtitle: v } })
                  }
                />
              </div>

              <div className="space-y-3">
                {(form.impact_stats || []).map((stat, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_80px_40px] gap-3 items-end rounded-lg border border-border p-3">
                    <Field
                      label="লেবেল"
                      value={stat.label}
                      onChange={(v) => {
                        const next = [...(form.impact_stats || [])];
                        next[idx] = { ...next[idx], label: v };
                        setForm({ ...form, impact_stats: next });
                      }}
                    />
                    <Field
                      label="সংখ্যা"
                      type="number"
                      value={stat.value}
                      onChange={(v) => {
                        const next = [...(form.impact_stats || [])];
                        next[idx] = { ...next[idx], value: Number(v) || 0 };
                        setForm({ ...form, impact_stats: next });
                      }}
                    />
                    <Field
                      label="সাফিক্স"
                      value={stat.suffix || ""}
                      onChange={(v) => {
                        const next = [...(form.impact_stats || [])];
                        next[idx] = { ...next[idx], suffix: v };
                        setForm({ ...form, impact_stats: next });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (form.impact_stats || []).filter((_, i) => i !== idx);
                        setForm({ ...form, impact_stats: next });
                      }}
                      className="p-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="ডিলিট"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    impact_stats: [
                      ...(form.impact_stats || []),
                      { value: 0, label: "নতুন পরিসংখ্যান", suffix: "" },
                    ],
                  })
                }
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <Plus className="h-4 w-4" /> নতুন পরিসংখ্যান যোগ করুন
              </button>
            </Card>
          )}

          {active === "hero" && (
            <Card>
              <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                <div>
                  <h3 className="font-bold">হোম পেজের স্লাইডার</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    যতগুলো স্লাইড দরকার যোগ করুন। প্রতিটি স্লাইডে ইমেজ, টেক্সট, বাটন, অ্যালাইনমেন্ট ও ওভারলে আলাদা ভাবে সেট করা যাবে। "সেভ করুন" বাটন চাপার পর সাইটে আপডেট হবে।
                  </p>
                </div>
                <SaveBar />
              </div>
              <HeroSlidesEditor
                slides={form.hero_slides || []}
                onChange={(next) => setForm({ ...form, hero_slides: next })}
              />
            </Card>
          )}


          {active === "about" && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">About সেকশন</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    হোম পেজের "সুন্নাহর অনুসরণে..." সেকশনের সব টেক্সট
                  </p>
                </div>
                <SaveBar />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="হেডিং"
                  value={form.about.heading}
                  onChange={(v) => setForm({ ...form, about: { ...form.about, heading: v } })}
                />
                <Field
                  label="হাইলাইট শব্দ (কমলা রঙে দেখাবে)"
                  value={form.about.highlight}
                  onChange={(v) => setForm({ ...form, about: { ...form.about, highlight: v } })}
                />
              </div>

              <label className="block mt-4">
                <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">মূল প্যারাগ্রাফ</span>
                <textarea
                  value={form.about.body}
                  onChange={(e) => setForm({ ...form, about: { ...form.about, body: e.target.value } })}
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <label className="block">
                  <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">উক্তি / হাদীছ</span>
                  <textarea
                    value={form.about.quoteText}
                    onChange={(e) => setForm({ ...form, about: { ...form.about, quoteText: e.target.value } })}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
                  />
                </label>
                <Field
                  label="উক্তির সূত্র"
                  value={form.about.quoteSource}
                  onChange={(v) => setForm({ ...form, about: { ...form.about, quoteSource: v } })}
                  hint="উদাহরণ: — তিরমিযী, হা/২৯৫৩"
                />
              </div>

              <div className="grid sm:grid-cols-[1fr_140px_1fr] gap-4 mt-4 items-end">
                <ImageField
                  label="সাইড ইমেজ"
                  value={form.about.sideImage}
                  onChange={(v) => setForm({ ...form, about: { ...form.about, sideImage: v } })}
                  hint="খালি রাখলে ডিফল্ট ইমেজ দেখাবে"
                />
                <Field
                  label="ব্যাজ সংখ্যা"
                  value={form.about.expNumber}
                  onChange={(v) => setForm({ ...form, about: { ...form.about, expNumber: v } })}
                  hint="যেমন: ১৫+"
                />
                <Field
                  label="ব্যাজ লেবেল"
                  value={form.about.expLabel}
                  onChange={(v) => setForm({ ...form, about: { ...form.about, expLabel: v } })}
                />
              </div>

              <div className="mt-6">
                <div className="text-sm font-bold mb-2">চেকমার্ক পয়েন্ট (নিচে গ্রিডে দেখাবে)</div>
                <div className="space-y-2">
                  {(form.about.points || []).map((p, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input
                        value={p}
                        onChange={(e) => {
                          const next = [...form.about.points];
                          next[idx] = e.target.value;
                          setForm({ ...form, about: { ...form.about, points: next } });
                        }}
                        className="flex-1 px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = form.about.points.filter((_, i) => i !== idx);
                          setForm({ ...form, about: { ...form.about, points: next } });
                        }}
                        className="p-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      about: { ...form.about, points: [...(form.about.points || []), "নতুন পয়েন্ট"] },
                    })
                  }
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" /> পয়েন্ট যোগ করুন
                </button>
              </div>
            </Card>
          )}

          {active === "milestones" && (
            <Card>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h3 className="font-bold">মাইলফলকসমূহ (About পেজ)</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    বছর অনুযায়ী মাইলফলক যোগ, সম্পাদনা বা মুছে ফেলুন। প্রতিটি কার্ডের ভেতরে বাংলা ও ইংরেজি উভয়ই দিতে হবে। প্রতিটি পয়েন্ট নতুন লাইনে লিখুন।
                  </p>
                </div>
                <SaveBar />
              </div>

              <div className="mb-6 rounded-xl border border-border p-4 bg-secondary/30">
                <div className="text-sm font-bold mb-3">সেকশন হেডার ও শেষের উক্তি</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Eyebrow (বাংলা)" value={form.milestones_section.eyebrowBn} onChange={(v) => setForm({ ...form, milestones_section: { ...form.milestones_section, eyebrowBn: v } })} hint="ছোট লেবেল, যেমন: আমাদের যাত্রা" />
                  <Field label="Eyebrow (English)" value={form.milestones_section.eyebrowEn} onChange={(v) => setForm({ ...form, milestones_section: { ...form.milestones_section, eyebrowEn: v } })} />
                  <Field label="হেডিং (বাংলা)" value={form.milestones_section.headingBn} onChange={(v) => setForm({ ...form, milestones_section: { ...form.milestones_section, headingBn: v } })} />
                  <Field label="Heading (English)" value={form.milestones_section.headingEn} onChange={(v) => setForm({ ...form, milestones_section: { ...form.milestones_section, headingEn: v } })} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">সংক্ষিপ্ত বিবরণ (বাংলা)</span>
                    <textarea value={form.milestones_section.introBn} onChange={(e) => setForm({ ...form, milestones_section: { ...form.milestones_section, introBn: e.target.value } })} rows={3} className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">Intro (English)</span>
                    <textarea value={form.milestones_section.introEn} onChange={(e) => setForm({ ...form, milestones_section: { ...form.milestones_section, introEn: e.target.value } })} rows={3} className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">শেষের উক্তি (বাংলা)</span>
                    <textarea value={form.milestones_section.quoteBn} onChange={(e) => setForm({ ...form, milestones_section: { ...form.milestones_section, quoteBn: e.target.value } })} rows={4} className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">Closing quote (English)</span>
                    <textarea value={form.milestones_section.quoteEn} onChange={(e) => setForm({ ...form, milestones_section: { ...form.milestones_section, quoteEn: e.target.value } })} rows={4} className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition" />
                  </label>
                </div>
              </div>

              <div className="text-sm font-bold mb-2">টাইমলাইন এন্ট্রি</div>

              <div className="space-y-4">
                {(form.milestones || []).map((m, idx) => {
                  const upd = (patch: Partial<Milestone>) => {
                    const next = [...(form.milestones || [])];
                    next[idx] = { ...next[idx], ...patch };
                    setForm({ ...form, milestones: next });
                  };
                  const move = (dir: -1 | 1) => {
                    const next = [...(form.milestones || [])];
                    const j = idx + dir;
                    if (j < 0 || j >= next.length) return;
                    [next[idx], next[j]] = [next[j], next[idx]];
                    setForm({ ...form, milestones: next });
                  };
                  const remove = () => {
                    if (!confirm("এই মাইলফলকটি মুছে ফেলবেন?")) return;
                    setForm({ ...form, milestones: (form.milestones || []).filter((_, i) => i !== idx) });
                  };
                  return (
                    <div key={idx} className="rounded-xl border border-border p-4 bg-card">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="text-xs font-bold text-muted-foreground">মাইলফলক #{idx + 1}</div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => move(-1)} className="p-1.5 rounded-md hover:bg-secondary" title="উপরে সরান"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => move(1)} className="p-1.5 rounded-md hover:bg-secondary" title="নিচে সরান"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" onClick={remove} className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="মুছুন"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="বছর (বাংলা)" value={m.yearBn} onChange={(v) => upd({ yearBn: v })} hint="যেমন: ২০২৭" />
                        <Field label="বছর (English)" value={m.yearEn} onChange={(v) => upd({ yearEn: v })} hint="e.g. 2027" />
                        <Field label="শিরোনাম (বাংলা)" value={m.titleBn} onChange={(v) => upd({ titleBn: v })} />
                        <Field label="শিরোনাম (English)" value={m.titleEn} onChange={(v) => upd({ titleEn: v })} />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 mt-3">
                        <label className="block">
                          <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">পয়েন্টসমূহ (বাংলা — প্রতি লাইনে একটি)</span>
                          <textarea
                            value={(m.itemsBn || []).join("\n")}
                            onChange={(e) => upd({ itemsBn: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                            rows={5}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">Points (English — one per line)</span>
                          <textarea
                            value={(m.itemsEn || []).join("\n")}
                            onChange={(e) => upd({ itemsEn: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                            rows={5}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    milestones: [
                      ...(form.milestones || []),
                      { yearBn: "", yearEn: "", titleBn: "", titleEn: "", itemsBn: [], itemsEn: [] },
                    ],
                  })
                }
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <Plus className="h-4 w-4" /> নতুন মাইলফলক যোগ করুন
              </button>
            </Card>
          )}

          {active === "mission" && (
            <Card>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h3 className="font-bold">আমাদের লক্ষ্য (About পেজ)</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    ইমেজ, হেডিং, ইন্ট্রো ও ৬টি লক্ষ্য এখান থেকে এডিট করা যাবে। ইমেজ আপলোড করুন অথবা মিডিয়া লাইব্রেরি থেকে বাছুন।
                  </p>
                </div>
                <SaveBar />
              </div>

              <div className="mb-6">
                <ImagePickerButton
                  label="সেকশন ইমেজ"
                  value={form.mission_section.image}
                  onChange={(v) => setForm({ ...form, mission_section: { ...form.mission_section, image: v } })}
                  aspect="wide"
                  hint="খালি রাখলে ডিফল্ট মিশন ইমেজ দেখাবে"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Eyebrow (বাংলা)" value={form.mission_section.eyebrowBn} onChange={(v) => setForm({ ...form, mission_section: { ...form.mission_section, eyebrowBn: v } })} hint="যেমন: আমাদের লক্ষ্য" />
                <Field label="Eyebrow (English)" value={form.mission_section.eyebrowEn} onChange={(v) => setForm({ ...form, mission_section: { ...form.mission_section, eyebrowEn: v } })} />
                <Field label="হেডিং প্রথম অংশ (বাংলা)" value={form.mission_section.headingBn} onChange={(v) => setForm({ ...form, mission_section: { ...form.mission_section, headingBn: v } })} hint="যেমন: যে পথে আমরা" />
                <Field label="Heading first part (English)" value={form.mission_section.headingEn} onChange={(v) => setForm({ ...form, mission_section: { ...form.mission_section, headingEn: v } })} />
                <Field label="হাইলাইট অংশ (বাংলা)" value={form.mission_section.headingHighlightBn} onChange={(v) => setForm({ ...form, mission_section: { ...form.mission_section, headingHighlightBn: v } })} hint="গ্রেডিয়েন্ট রঙে দেখাবে" />
                <Field label="Highlight part (English)" value={form.mission_section.headingHighlightEn} onChange={(v) => setForm({ ...form, mission_section: { ...form.mission_section, headingHighlightEn: v } })} />
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <label className="block">
                  <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">সংক্ষিপ্ত বিবরণ (বাংলা)</span>
                  <textarea value={form.mission_section.introBn} onChange={(e) => setForm({ ...form, mission_section: { ...form.mission_section, introBn: e.target.value } })} rows={3} className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition" />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">Intro (English)</span>
                  <textarea value={form.mission_section.introEn} onChange={(e) => setForm({ ...form, mission_section: { ...form.mission_section, introEn: e.target.value } })} rows={3} className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition" />
                </label>
              </div>

              <div className="mt-6">
                <div className="text-sm font-bold mb-2">লক্ষ্যসমূহ (বাংলা)</div>
                <div className="space-y-2">
                  {(form.mission_section.goalsBn || []).map((g, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="mt-2 text-xs font-bold text-muted-foreground w-6 text-right">{String(idx + 1).padStart(2, "0")}</span>
                      <textarea
                        value={g}
                        rows={2}
                        onChange={(e) => {
                          const next = [...form.mission_section.goalsBn];
                          next[idx] = e.target.value;
                          setForm({ ...form, mission_section: { ...form.mission_section, goalsBn: next } });
                        }}
                        className="flex-1 px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nextBn = form.mission_section.goalsBn.filter((_, i) => i !== idx);
                          const nextEn = form.mission_section.goalsEn.filter((_, i) => i !== idx);
                          setForm({ ...form, mission_section: { ...form.mission_section, goalsBn: nextBn, goalsEn: nextEn } });
                        }}
                        className="p-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="মুছুন"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="text-sm font-bold mb-2 mt-6">Goals (English)</div>
                <div className="space-y-2">
                  {(form.mission_section.goalsEn || []).map((g, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="mt-2 text-xs font-bold text-muted-foreground w-6 text-right">{String(idx + 1).padStart(2, "0")}</span>
                      <textarea
                        value={g}
                        rows={2}
                        onChange={(e) => {
                          const next = [...form.mission_section.goalsEn];
                          next[idx] = e.target.value;
                          setForm({ ...form, mission_section: { ...form.mission_section, goalsEn: next } });
                        }}
                        className="flex-1 px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      mission_section: {
                        ...form.mission_section,
                        goalsBn: [...(form.mission_section.goalsBn || []), "নতুন লক্ষ্য"],
                        goalsEn: [...(form.mission_section.goalsEn || []), "New goal"],
                      },
                    })
                  }
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" /> নতুন লক্ষ্য যোগ করুন
                </button>
              </div>
            </Card>
          )}

          {active === "page_heroes" && (
            <Card>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h3 className="font-bold">পেজ হেডার ইমেজ</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    প্রতিটি পেজের উপরের হিরো ব্যানারে যে ইমেজ দেখাবে তা মিডিয়া লাইব্রেরি থেকে বাছুন। খালি রাখলে ডিফল্ট গ্র‍্যাডিয়েন্ট দেখাবে।
                  </p>
                </div>
                <SaveBar />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {([
                  { key: "about", label: "About" },
                  { key: "projects", label: "Projects" },
                  { key: "blog", label: "Blog" },
                  { key: "gallery", label: "Gallery" },
                  { key: "contact", label: "Contact" },
                  { key: "volunteer", label: "Volunteer" },
                  { key: "privacy", label: "Privacy" },
                ] as const).map((p) => (
                  <PageHeroTile
                    key={p.key}
                    label={p.label}
                    value={form.page_heroes?.[p.key] || ""}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        page_heroes: { ...form.page_heroes, [p.key]: v },
                      })
                    }
                  />
                ))}
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

// =========================
// অ্যাডমিন ব্যবস্থাপনা প্যানেল
// =========================
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
};

function genPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const roleBadgeClass = (r: Role) =>
  r === "super_admin" ? "bg-destructive/10 text-destructive"
  : r === "admin" ? "bg-primary/10 text-primary"
  : r === "editor" ? "bg-amber-500/10 text-amber-600"
  : r === "moderator" ? "bg-blue-500/10 text-blue-600"
  : "bg-secondary text-muted-foreground";

const AdminsPanel = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [list, setList] = useState<AdminUser[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [creating, setCreating] = useState(false);
  const [lastCreds, setLastCreds] = useState<{ email: string; password: string } | null>(null);

  const fetchList = async () => {
    setLoadingList(true);
    try {
      const rows = await api.get<AdminUser[]>("/admin/users");
      setList(Array.isArray(rows) ? rows : []);
    } catch {
      /* keep empty */
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchList(); }, []);


  const refresh = () => { fetchList(); };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (list.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      toast({ title: "ইতোমধ্যে আছে", description: "এই ইমেইল দিয়ে একজন অ্যাডমিন আছে।" });
      return;
    }
    setCreating(true);
    const password = genPassword();
    try {
      let emailSent = false;
      let emailError: string | null = null;
      let apiOk = false;
      let newId = "";
      try {
        const res = await api.post<{ id: string; emailSent?: boolean; emailError?: string | null }>(
          "/admin/users",
          { name, email, role, password, sendEmail: true },
        );
        apiOk = true;
        newId = res?.id || "";
        emailSent = Boolean(res?.emailSent);
        emailError = res?.emailError ?? null;
      } catch (err: unknown) {
        toast({
          title: "অ্যাডমিন তৈরি ব্যর্থ",
          description: err instanceof Error ? err.message : "সার্ভারে সংযোগ করা যায়নি।",
          variant: "destructive",
        });
        return;
      }
      const newEmail = email.trim();
      refresh();
      setLastCreds({ email: newEmail, password });
      setName(""); setEmail(""); setRole("editor");

      if (apiOk && emailSent) {
        toast({
          title: "অ্যাডমিন তৈরি হয়েছে",
          description: `${newEmail} ঠিকানায় লগইন তথ্য পাঠানো হয়েছে।`,
        });
      } else {
        toast({
          title: "অ্যাডমিন তৈরি হয়েছে, কিন্তু ইমেইল যায়নি",
          description: emailError ? `SMTP error: ${emailError}` : "ইমেইল পাঠানো যায়নি — নিচে দেখানো পাসওয়ার্ডটি কপি করে ম্যানুয়ালি দিন।",
          variant: "destructive",
        });
      }
    } finally {
      setCreating(false);
    }
  };

  const removeAdmin = async (u: AdminUser) => {
    if (!confirm(`${u.email} মুছে ফেলবেন?`)) return;
    try { await api.delete(`/admin/users/${u.id}`); } catch {}
    refresh();
    toast({ title: "মুছে ফেলা হয়েছে" });
  };

  const resend = async (u: AdminUser) => {
    const password = genPassword();
    try {
      const res = await api.post<{ ok: boolean; emailSent?: boolean; emailError?: string | null }>(
        `/admin/users/${u.id}/reset-credentials`,
        { password, sendEmail: true },
      );
      setLastCreds({ email: u.email, password });
      if (res?.emailSent) {
        toast({ title: "নতুন পাসওয়ার্ড পাঠানো হয়েছে", description: u.email });
      } else {
        toast({
          title: "পাসওয়ার্ড রিসেট হয়েছে, কিন্তু ইমেইল যায়নি",
          description: res?.emailError ? `SMTP error: ${res.emailError}` : "নিচের পাসওয়ার্ডটি ম্যানুয়ালি পাঠান।",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      toast({
        title: "রিসেট ব্যর্থ",
        description: err instanceof Error ? err.message : "সার্ভারে সংযোগ করা যায়নি।",
        variant: "destructive",
      });
    }
  };

  const changeRole = async (u: AdminUser, newRole: Role) => {
    if (newRole === u.role) return;
    const prev = list;
    setList((rows) => rows.map((r) => (r.id === u.id ? { ...r, role: newRole } : r)));
    try {
      await api.patch(`/admin/users/${u.id}/role`, { role: newRole });
      toast({ title: "রোল আপডেট হয়েছে", description: `${u.email} → ${ROLE_LABEL[newRole]}` });
    } catch (err: unknown) {
      setList(prev);
      toast({
        title: "রোল পরিবর্তন ব্যর্থ",
        description: err instanceof Error ? err.message : "সার্ভারে সংযোগ করা যায়নি।",
        variant: "destructive",
      });
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "কপি করা হয়েছে" });
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold">নতুন অ্যাডমিন তৈরি করুন</h3>
            <p className="text-xs text-muted-foreground mt-1">
              একটি র‍্যান্ডম পাসওয়ার্ড তৈরি হবে এবং SMTP-এর মাধ্যমে স্বয়ংক্রিয়ভাবে ইমেইল পাঠানো হবে।
            </p>
          </div>
        </div>

        <form onSubmit={createAdmin} className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">পূর্ণ নাম</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ইউজারের নাম" className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">ইমেইল</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@unitefoundation.bd" className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">রোল</span>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition">
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]} — {ROLE_DESCRIPTION[r]}</option>
              ))}
            </select>

          </label>
          <div className="flex items-end">
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-60">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              তৈরি করুন ও ইমেইল পাঠান
            </button>
          </div>
        </form>

        {lastCreds && (
          <div className="mt-5 rounded-xl border border-primary/25 bg-accent/40 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <Mail className="h-4 w-4" /> ইমেইল পাঠানো হয়েছে
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ব্যাকআপ হিসেবে ক্রেডেনশিয়াল নিচে দেখানো হলো — পেজ বদলালে আর দেখা যাবে না।
            </p>
            <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between gap-2 rounded-lg bg-card border border-border px-3 py-2">
                <span className="text-muted-foreground">ইমেইল</span>
                <span className="font-mono font-semibold truncate">{lastCreds.email}</span>
                <button onClick={() => copy(lastCreds.email)} className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-card border border-border px-3 py-2">
                <span className="text-muted-foreground">পাসওয়ার্ড</span>
                <span className="font-mono font-semibold">{lastCreds.password}</span>
                <button onClick={() => copy(lastCreds.password)} className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-bold mb-4">বর্তমান অ্যাডমিনগণ ({list.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="text-left border-b border-border">
                <th className="py-2.5 font-semibold">নাম</th>
                <th className="py-2.5 font-semibold">ইমেইল</th>
                <th className="py-2.5 font-semibold">রোল</th>
                <th className="py-2.5 font-semibold">তৈরি</th>
                <th className="py-2.5 font-semibold text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingList && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-xs">লোড হচ্ছে...</td></tr>}
              {!loadingList && list.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-xs">কোনো অ্যাডমিন পাওয়া যায়নি</td></tr>}
              {list.map((u) => {
                const isSelf = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-muted/40">
                    <td className="py-3 font-semibold">
                      {u.name}
                      {isSelf && <span className="ml-2 text-[10px] font-bold text-primary">আপনি</span>}
                    </td>
                    <td className="py-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3">
                      <div className="inline-flex items-center gap-2">
                        <span className={"px-2 py-0.5 rounded-full text-[11px] font-bold " + roleBadgeClass(u.role)}>
                          {ROLE_LABEL[u.role] || u.role}
                        </span>
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value as Role)}
                          className="text-[11px] px-2 py-1 rounded-md bg-secondary border border-border focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none"
                          title="রোল পরিবর্তন করুন"
                        >
                          {ASSIGNABLE_ROLES.map((r) => (
                            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">{String(u.created_at).slice(0, 10)}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => resend(u)} className="text-xs text-primary hover:underline mr-3 font-semibold">নতুন পাসওয়ার্ড</button>
                      <button
                        onClick={() => removeAdmin(u)}
                        disabled={isSelf}
                        title={isSelf ? "নিজেকে মুছতে পারবেন না" : "মুছুন"}
                        className="text-destructive hover:text-destructive/80 inline-flex disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

const ProfilePanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({ title: "দুর্বল পাসওয়ার্ড", description: "কমপক্ষে ৮ অক্ষর দিন।", variant: "destructive" });
      return;
    }
    if (newPassword !== confirm) {
      toast({ title: "মিলছে না", description: "নতুন পাসওয়ার্ড ও কনফার্ম আলাদা।", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      toast({ title: "পাসওয়ার্ড পরিবর্তিত হয়েছে", description: "পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।" });
      setCurrent(""); setNew(""); setConfirm("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "পরিবর্তন ব্যর্থ হয়েছে";
      toast({ title: "ত্রুটি", description: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card>
        <h3 className="font-bold mb-1">আপনার প্রোফাইল</h3>
        <p className="text-xs text-muted-foreground mb-4">লগইন অ্যাকাউন্টের তথ্য</p>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">নাম</div>
            <div className="font-semibold">{user?.name || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">ইমেইল</div>
            <div className="font-semibold">{user?.email || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">রোল</div>
            <div className="font-semibold">{user?.role || "—"}</div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-1">পাসওয়ার্ড পরিবর্তন</h3>
        <p className="text-xs text-muted-foreground mb-4">
          নিরাপত্তার জন্য প্রথম লগইনের পর অবশ্যই পাসওয়ার্ড পরিবর্তন করুন।
        </p>
        <form onSubmit={submit} className="space-y-4 max-w-md">
          <Field label="বর্তমান পাসওয়ার্ড" type="password" value={currentPassword} onChange={setCurrent} />
          <Field label="নতুন পাসওয়ার্ড" type="password" value={newPassword} onChange={setNew} hint="কমপক্ষে ৮ অক্ষর" />
          <Field label="নতুন পাসওয়ার্ড কনফার্ম করুন" type="password" value={confirm} onChange={setConfirm} />
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition">
            {busy ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
          </button>
        </form>
      </Card>
    </>
  );
};

