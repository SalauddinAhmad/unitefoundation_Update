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
import whatsappIcon from "@/assets/whatsapp-icon.svg";

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
  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast({ title: t("common.verifyInfo"), description: r.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    const text = `${t("contactPage.name").replace(" *", "")}: ${form.name}\n${t("contactPage.emailLabel").replace(" *", "")}: ${form.email}\n${t("contactPage.mobile")}: ${form.phone}\n${t("contactPage.subject").replace(" *", "")}: ${form.subject}\n\n${form.message}`;
    window.open(`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    toast({ title: t("contactPage.successTitle"), description: t("contactPage.successDesc") });
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
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
            <InfoCard iconSrc={whatsappIcon} title={t("contactPage.whatsapp")} lines={[t("contactPage.whatsappNote")]} href={`https://wa.me/${site.whatsapp}`} accent />
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
            <button type="submit" className="btn-donate w-full text-base">
              <Send className="h-4 w-4" /> {t("contactPage.send")}
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

export default Contact;
