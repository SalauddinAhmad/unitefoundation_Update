import { useState } from "react";
import { Mail, Phone, MapPin, Send, Facebook, Youtube, Instagram } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import contactImg from "@/assets/hero-mosque.jpg";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";


const Contact = () => {
  const { t } = useTranslation();
  const schema = z.object({
    name: z.string().trim().min(2, t("contactPage.errName")).max(80),
    email: z.string().trim().email(t("contactPage.errEmail")).max(255),
    phone: z.string().trim().regex(/^01[3-9]\d{8}$/, t("contactPage.errPhone")).or(z.literal("")),
    subject: z.string().trim().min(2).max(120),
    message: z.string().trim().min(10, t("contactPage.errMessage")).max(2000),
  });

  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast({ title: t("common.verifyInfo"), description: r.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await api.post("/messages", {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject,
        body: form.message,
      }, { auth: false });
      toast({ title: t("contactPage.successTitle"), description: t("contactPage.successDesc") });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error("[contact] submit failed:", err);
      toast({
        title: "পাঠাতে ব্যর্থ",
        description: (err as { message?: string })?.message || "সার্ভারে পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteLayout>
      <Seo title={t("contactPage.seoTitle")} description={t("contactPage.seoDesc")} canonical="/contact" />

      <PageHero
        image={contactImg}
        eyebrow={t("contactPage.eyebrow")}
        title={t("contactPage.title")}
        subtitle={t("contactPage.subtitle")}
      />

      <section className="py-12 md:py-16">
        <div className="container-page grid lg:grid-cols-3 gap-8">
          <div className="space-y-4 lg:col-span-1">
            <InfoCard icon={Phone} title={t("contactPage.phone")} lines={[site.phone]} href={`tel:${site.phone.replace(/\s/g, "")}`} />
            <InfoCard icon={Mail} title={t("contactPage.email")} lines={[site.email]} href={`mailto:${site.email}`} />
            <InfoCard icon={WhatsAppIcon} title={t("contactPage.whatsapp")} lines={[t("contactPage.whatsappNote")]} href={`https://wa.me/${site.whatsapp}`} accent />
            <InfoCard icon={MapPin} title={t("contactPage.address")} lines={[site.address, t("contactPage.officeHours")]} />

            <div className="card-base p-6">
              <div className="font-bold mb-3">{t("contactPage.socialTitle")}</div>
              <div className="flex gap-2">
                <SocialLink href={site.socials.facebook} icon={Facebook} />
                <SocialLink href={site.socials.youtube} icon={Youtube} />
                <SocialLink href={site.socials.instagram} icon={Instagram} />
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="card-base p-6 md:p-8 lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold">{t("contactPage.formTitle")}</h2>
            <p className="text-sm text-muted-foreground -mt-2">{t("contactPage.formNote")}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={t("contactPage.name")}>
                <input required maxLength={80} value={form.name} onChange={upd("name")} className="input-c" />
              </Field>
              <Field label={t("contactPage.emailLabel")}>
                <input required type="email" maxLength={255} value={form.email} onChange={upd("email")} className="input-c" />
              </Field>
              <Field label={t("contactPage.mobile")}>
                <input type="tel" inputMode="numeric" maxLength={11} value={form.phone} onChange={upd("phone")} placeholder="01XXXXXXXXX" className="input-c" />
              </Field>
              <Field label={t("contactPage.subject")}>
                <input required maxLength={120} value={form.subject} onChange={upd("subject")} className="input-c" />
              </Field>
            </div>
            <Field label={t("contactPage.message")}>
              <textarea required maxLength={2000} rows={6} value={form.message} onChange={upd("message")} className="input-c resize-none" />
            </Field>
            <button type="submit" disabled={sending} className="btn-donate w-full text-base disabled:opacity-60">
              <Send className="h-4 w-4" /> {sending ? "পাঠানো হচ্ছে…" : t("contactPage.send")}
            </button>
          </form>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-page">
          <div className="rounded-card overflow-hidden shadow-card aspect-[16/7] bg-muted border-2 border-primary/15">
            <iframe
              title={t("contactPage.mapTitle")}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.4403623099843!2d90.4460879753398!3d23.873998578586303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c551a26063a7%3A0xdff6509b3a97f058!2sUnite%20Foundation!5e0!3m2!1sen!2sbd!4v1778757284293!5m2!1sen!2sbd"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <style>{`.input-c{width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid hsl(var(--input));background:hsl(var(--background));color:hsl(var(--foreground));outline:none;transition:all 0.2s}.input-c:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary)/0.1)}.input-c:-webkit-autofill,.input-c:-webkit-autofill:hover,.input-c:-webkit-autofill:focus{-webkit-text-fill-color:hsl(var(--foreground)) !important;caret-color:hsl(var(--foreground));-webkit-box-shadow:0 0 0 1000px hsl(var(--background)) inset !important;transition:background-color 9999s ease-in-out 0s}`}</style>
    </SiteLayout>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-sm font-semibold mb-1.5 block">{label}</span>
    {children}
  </label>
);

const InfoCard = ({ icon: Icon, iconSrc, title, lines, href, accent }: { icon?: any; iconSrc?: string; title: string; lines: string[]; href?: string; accent?: boolean }) => {
  const inner = (
    <div className={`card-base p-5 flex gap-4 ${href ? "hover:border-primary cursor-pointer" : ""}`}>
      {iconSrc ? (
        <img src={iconSrc} alt={title} className="h-11 w-11 rounded-card shrink-0" />
      ) : (
        <div className={`h-11 w-11 rounded-card flex items-center justify-center shrink-0 ${accent ? "bg-[#25D366] text-white" : "bg-accent text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <div className="font-bold">{title}</div>
        {lines.map((l, i) => (<div key={i} className="text-sm text-muted-foreground mt-0.5">{l}</div>))}
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

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413" />
  </svg>
);

export default Contact;
