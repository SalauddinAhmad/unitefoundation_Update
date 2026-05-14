import { useState } from "react";
import { Mail, Phone, MapPin, Send, Facebook, Youtube, Instagram } from "lucide-react";
import { z } from "zod";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import contactImg from "@/assets/hero-mosque.jpg";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন").max(80),
  email: z.string().trim().email("সঠিক ই-মেইল দিন").max(255),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন").or(z.literal("")),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10, "অন্তত ১০ অক্ষর লিখুন").max(2000),
});

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast({ title: "তথ্য যাচাই করুন", description: r.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    const text = `নাম: ${form.name}\nই-মেইল: ${form.email}\nফোন: ${form.phone}\nবিষয়: ${form.subject}\n\n${form.message}`;
    window.open(`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    toast({ title: "ধন্যবাদ!", description: "আপনার বার্তা WhatsApp-এ খোলা হয়েছে। আমরা শীঘ্রই উত্তর দেব।" });
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <SiteLayout>
      <Seo title="যোগাযোগ | ইউনাইট ফাউন্ডেশন" description="আমাদের সাথে যোগাযোগ করুন — ফোন, ই-মেইল, WhatsApp বা সরাসরি অফিসে আসুন।" canonical="/contact" />

      <PageHero
        image={contactImg}
        eyebrow="যোগাযোগ"
        title="আমরা আপনার কথা শুনতে আগ্রহী"
        subtitle="যেকোনো প্রশ্ন, পরামর্শ বা সহযোগিতার জন্য নিচের যেকোনো মাধ্যমে যোগাযোগ করুন।"
      />

      <section className="py-12 md:py-16">
        <div className="container-page grid lg:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-4 lg:col-span-1">
            <InfoCard icon={Phone} title="ফোন" lines={[site.phone]} href={`tel:${site.phone.replace(/\s/g, "")}`} />
            <InfoCard icon={Mail} title="ই-মেইল" lines={[site.email]} href={`mailto:${site.email}`} />
            <InfoCard icon={MessageCircle} title="WhatsApp" lines={["২৪/৭ দ্রুত প্রতিক্রিয়া"]} href={`https://wa.me/${site.whatsapp}`} accent />
            <InfoCard icon={MapPin} title="ঠিকানা" lines={[site.address, "অফিস সময়: শনি-বৃহঃ, সকাল ১০টা - সন্ধ্যা ৬টা"]} />

            <div className="card-base p-6">
              <div className="font-bold mb-3">সোশ্যাল মিডিয়ায় আমরা</div>
              <div className="flex gap-2">
                <SocialLink href={site.socials.facebook} icon={Facebook} />
                <SocialLink href={site.socials.youtube} icon={Youtube} />
                <SocialLink href={site.socials.instagram} icon={Instagram} />
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="card-base p-6 md:p-8 lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold">আমাদের বার্তা পাঠান</h2>
            <p className="text-sm text-muted-foreground -mt-2">ফর্ম সাবমিট করলে আপনার বার্তা সরাসরি আমাদের WhatsApp-এ পাঠানো হবে।</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="পূর্ণ নাম *">
                <input required maxLength={80} value={form.name} onChange={upd("name")} className="input-c" />
              </Field>
              <Field label="ই-মেইল *">
                <input required type="email" maxLength={255} value={form.email} onChange={upd("email")} className="input-c" />
              </Field>
              <Field label="মোবাইল নম্বর">
                <input type="tel" inputMode="numeric" maxLength={11} value={form.phone} onChange={upd("phone")} placeholder="01XXXXXXXXX" className="input-c" />
              </Field>
              <Field label="বিষয় *">
                <input required maxLength={120} value={form.subject} onChange={upd("subject")} className="input-c" />
              </Field>
            </div>
            <Field label="আপনার বার্তা *">
              <textarea required maxLength={2000} rows={6} value={form.message} onChange={upd("message")} className="input-c resize-none" />
            </Field>
            <button type="submit" className="btn-donate w-full text-base">
              <Send className="h-4 w-4" /> বার্তা পাঠান
            </button>
          </form>
        </div>
      </section>

      {/* Map */}
      <section className="pb-16">
        <div className="container-page">
          <div className="rounded-card overflow-hidden shadow-card aspect-[16/7] bg-muted">
            <iframe
              title="আমাদের অবস্থান"
              src="https://www.openstreetmap.org/export/embed.html?bbox=90.4050%2C23.7800%2C90.4250%2C23.7950&layer=mapnik&marker=23.7875%2C90.4150"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <style>{`.input-c{width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid hsl(var(--input));background:hsl(var(--background));color:hsl(var(--foreground));outline:none;transition:all 0.2s}.input-c:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary)/0.1)}`}</style>
    </SiteLayout>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-sm font-semibold mb-1.5 block">{label}</span>
    {children}
  </label>
);

import whatsappIcon from "@/assets/whatsapp-icon.svg";

const InfoCard = ({ icon: Icon, iconSrc, title, lines, href, accent }: { icon?: any; iconSrc?: string; title: string; lines: string[]; href?: string; accent?: boolean }) => {
  const inner = (
    <div className={`card-base p-5 flex gap-4 ${href ? "hover:border-primary cursor-pointer" : ""}`}>
      <div className={`h-11 w-11 rounded-card flex items-center justify-center shrink-0 ${accent ? "bg-[#25D366] text-white" : "bg-accent text-primary"}`}>
        {iconSrc ? <img src={iconSrc} alt={title} className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
      </div>
      <div className="min-w-0">
        <div className="font-bold">{title}</div>
        {lines.map((l, i) => (<div key={i} className="text-sm text-muted-foreground mt-0.5" dir={i === 0 && title === "ফোন" ? "ltr" : undefined}>{l}</div>))}
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{inner}</a> : inner;
};

const SocialLink = ({ href, icon: Icon }: { href: string; icon: any }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-btn bg-accent text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
    <Icon className="h-4 w-4" />
  </a>
);

export default Contact;
