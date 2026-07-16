import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useProjectsPublic } from "@/hooks/api/usePublic";
import { useLocaleNum } from "@/hooks/useLocaleNum";
import { toast } from "@/hooks/use-toast";

const presets = [500, 1000, 2500, 5000, 10000];

export const QuickDonate = () => {
  const { t } = useTranslation();
  const { fmt } = useLocaleNum();
  const navigate = useNavigate();
  const { data: projects = [] } = useProjectsPublic();
  const [project, setProject] = useState("");
  const [amount, setAmount] = useState<number>(1000);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const schema = z.object({
    project: z.string().min(1, t("quickDonate.err.projectRequired")),
    amount: z.number().min(50, t("quickDonate.err.amountMin")).max(10000000),
    name: z.string().trim().min(2, t("quickDonate.err.nameMin")).max(80),
    phone: z.string().trim().regex(/^01[3-9]\d{8}$/, t("quickDonate.err.phoneInvalid")),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = custom ? Number(custom) : amount;
    const result = schema.safeParse({ project, amount: finalAmount, name, phone });
    if (!result.success) {
      toast({ title: t("common.verifyInfo"), description: result.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    navigate(`/donate?project=${project}&amount=${finalAmount}&name=${encodeURIComponent(name)}&phone=${phone}`);
  };

  return (
    <section className="relative section-y overflow-hidden">
      <div className="absolute inset-0 bg-donate-highlight" aria-hidden />
      <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 20% 30%, white 0%, transparent 50%)" }} aria-hidden />

      <div className="container-page relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="text-donate-highlight-foreground">
          <h2 className="heading-display text-left text-donate-highlight-foreground">
            {t("quickDonate.heading")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-donate-highlight-foreground/80 max-w-lg">
            {t("quickDonate.subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-donate-highlight-foreground">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />{t("quickDonate.trust1")}</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />{t("quickDonate.trust2")}</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />{t("quickDonate.trust3")}</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="bg-card rounded-card p-6 md:p-8 shadow-card-hover">
          <label className="block text-sm font-semibold text-foreground mb-2">{t("quickDonate.selectProject")}</label>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full rounded-btn border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t("quickDonate.selectProject")}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.slug}>{p.title}</option>
            ))}
          </select>

          <label className="block text-sm font-semibold text-foreground mt-5 mb-2">{t("quickDonate.amountLabel")}</label>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((p) => {
              const active = !custom && amount === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setAmount(p); setCustom(""); }}
                  className={`py-2.5 rounded-btn text-sm font-bold border transition-all ${
                    active
                      ? "gradient-donate-bg text-white border-transparent shadow-donate"
                      : "border-input bg-background text-foreground hover:border-primary"
                  }`}
                >
                  ৳{fmt(p)}
                </button>
              );
            })}
          </div>
          <input
            type="number"
            min={50}
            placeholder={t("quickDonate.customPlaceholder")}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="mt-3 w-full rounded-btn border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <input
              required
              maxLength={80}
              placeholder={t("quickDonate.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-btn border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              required
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder={t("quickDonate.phonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="rounded-btn border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button type="submit" className="btn-donate w-full mt-6 text-base">
            <Heart className="h-5 w-5" /> {t("quickDonate.cta")}
          </button>
        </form>
      </div>
    </section>
  );
};
