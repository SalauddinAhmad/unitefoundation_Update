import { Card, PageHeader, Btn } from "@/components/dashboard/DashboardUI";
import { Building2, Phone, Mail, MapPin, Globe, KeyRound, ShieldCheck, Bell } from "lucide-react";

const Field = ({ label, value, type = "text" }: { label: string; value: string; type?: string }) => (
  <label className="block">
    <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">{label}</span>
    <input type={type} defaultValue={value} className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition" />
  </label>
);

const Settings = () => {
  return (
    <>
      <PageHeader title="সেটিংস" subtitle="ফাউন্ডেশনের তথ্য, পেমেন্ট ও নিরাপত্তা সেটিংস" />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Nav */}
        <nav className="space-y-1">
          {[
            { icon: Building2, l: "প্রতিষ্ঠান", active: true },
            { icon: KeyRound, l: "পেমেন্ট গেটওয়ে" },
            { icon: ShieldCheck, l: "নিরাপত্তা ও রোল" },
            { icon: Bell, l: "নোটিফিকেশন" },
          ].map((i) => (
            <button
              key={i.l}
              className={
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " +
                (i.active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-secondary hover:text-foreground")
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
              <Btn>সংরক্ষণ</Btn>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="প্রতিষ্ঠানের নাম" value="ইউনাইট ফাউন্ডেশন" />
              <Field label="ট্যাগলাইন" value="অহিভিত্তিক জীবন গড়ার দৃঢ় প্রত্যয়ে" />
              <Field label="ইমেইল" value="info@unitefoundation.org" type="email" />
              <Field label="ফোন / WhatsApp" value="+880 1700-000000" type="tel" />
              <Field label="ওয়েবসাইট" value="https://unitefoundation.org" />
              <Field label="রেজিস্ট্রেশন নং" value="S-12345/2024" />
            </div>
            <div className="mt-4">
              <Field label="পূর্ণ ঠিকানা" value="ঢাকা, বাংলাদেশ" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold">পেমেন্ট অ্যাকাউন্ট</h3>
                <p className="text-xs text-muted-foreground mt-1">দান গ্রহণের জন্য মোবাইল ব্যাংকিং ও ব্যাংক তথ্য</p>
              </div>
              <Btn>সংরক্ষণ</Btn>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="bKash (পার্সোনাল)" value="01700-000001" />
              <Field label="Nagad (পার্সোনাল)" value="01700-000002" />
              <Field label="Rocket (পার্সোনাল)" value="01700-000003" />
              <Field label="ব্যাংক একাউন্ট" value="1234-5678-9012" />
              <Field label="ব্যাংকের নাম" value="ইসলামী ব্যাংক বাংলাদেশ" />
              <Field label="SSLCommerz Store ID" value="unitefoundation" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold">যোগাযোগের লিংক</h3>
                <p className="text-xs text-muted-foreground mt-1">ফুটার ও যোগাযোগ পেজে দেখানো হবে</p>
              </div>
              <Btn>সংরক্ষণ</Btn>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Facebook" value="https://facebook.com/unitefoundation" />
              <Field label="YouTube" value="https://youtube.com/@unitefoundation" />
              <Field label="Instagram" value="https://instagram.com/unitefoundation" />
              <Field label="Twitter / X" value="https://x.com/unitefoundation" />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Settings;
