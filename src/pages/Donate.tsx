import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Heart, ShieldCheck, Lock, ArrowRight, Check, Receipt } from "lucide-react";
import { z } from "zod";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import donateImg from "@/assets/hero-relief.jpg";
import { projects, toBnNum, getProject } from "@/data/projects";
import { PaymentInstructionsModal } from "@/components/donation/PaymentInstructionsModal";
import { toast } from "@/hooks/use-toast";

const presets = [500, 1000, 2500, 5000];

const schema = z.object({
  project: z.string().min(1),
  amount: z.number().min(50, "সর্বনিম্ন ৫০ টাকা").max(10000000),
  frequency: z.enum(["one-time", "monthly"]),
  name: z.string().trim().min(2, "নাম দিন").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "সঠিক বাংলাদেশী মোবাইল নম্বর দিন (১১ ডিজিট)"),
});

const Donate = () => {
  const [params] = useSearchParams();
  const initialSlug = params.get("project") || projects[0].slug;
  const initialAmount = Number(params.get("amount")) || 1000;

  const [project, setProject] = useState(initialSlug);
  const [amount, setAmount] = useState(initialAmount);
  const [custom, setCustom] = useState(presets.includes(initialAmount) ? "" : String(initialAmount));
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [name, setName] = useState(params.get("name") || "");
  const [phone, setPhone] = useState(params.get("phone") || "");
  const [showModal, setShowModal] = useState(false);

  const finalAmount = custom ? Number(custom) : amount;
  const selected = useMemo(() => getProject(project) || projects[0], [project]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ project, amount: finalAmount, frequency, name, phone });
    if (!result.success) {
      toast({
        title: "তথ্য যাচাই করুন",
        description: result.error.issues[0]?.message || "ফর্মটি সঠিকভাবে পূরণ করুন",
        variant: "destructive",
      });
      return;
    }
    setShowModal(true);
  };

  useEffect(() => {
    if (params.get("project") || params.get("amount")) {
      document.getElementById("donate-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <SiteLayout>
      <Seo
        title="দান করুন | ইউনাইট ফাউন্ডেশন"
        description="মাত্র কয়েক সেকেন্ডে আপনার দান সম্পন্ন করুন — bKash, Nagad, রকেট বা ব্যাংকের মাধ্যমে। নিরাপদ ও স্বচ্ছ।"
        canonical="/donate"
      />

      <PageHero
        image={donateImg}
        eyebrow="দান করুন"
        title="আপনার দান, কারো নতুন আশা"
        subtitle="সহজ, নিরাপদ, শরীয়াহ-অনুমোদিত — কয়েক সেকেন্ডেই সম্পন্ন করুন।"
      />

      <section id="donate-form" className="py-12 md:py-16 bg-gradient-to-b from-background to-secondary/20">
        <div className="container-page max-w-2xl">
          {/* Premium Donation Card */}
          <form
            onSubmit={submit}
            className="rounded-card bg-card border border-border shadow-card-hover overflow-hidden"
          >
            {/* Header strip */}
            <div className="gradient-donate-bg p-6 md:p-7 text-white">
              <div className="text-xs uppercase tracking-[0.2em] opacity-80">আপনার দানের পরিমাণ</div>
              <div className="mt-1 text-4xl md:text-5xl font-extrabold" dir="ltr">
                ৳{toBnNum(new Intl.NumberFormat("en-IN").format(finalAmount || 0))}
              </div>
              <div className="mt-1 text-sm opacity-90 line-clamp-1">
                {selected.title} · {frequency === "monthly" ? "মাসিক" : "এককালীন"}
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-7">
              {/* Project — single dropdown */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  প্রকল্প
                </label>
                <div className="relative">
                  <select
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="input-base appearance-none pr-10 cursor-pointer"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Frequency segmented */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  ফ্রিকোয়েন্সি
                </label>
                <div className="relative grid grid-cols-2 p-1 rounded-btn bg-muted">
                  <span
                    aria-hidden
                    className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-[8px] bg-card shadow-sm transition-transform duration-300 ${
                      frequency === "monthly" ? "translate-x-[calc(100%+4px)]" : "translate-x-1"
                    }`}
                  />
                  {([
                    { v: "one-time", l: "এককালীন" },
                    { v: "monthly", l: "মাসিক" },
                  ] as const).map((f) => (
                    <button
                      key={f.v}
                      type="button"
                      onClick={() => setFrequency(f.v)}
                      className={`relative z-10 py-2.5 text-sm font-semibold transition-colors ${
                        frequency === f.v ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {f.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount presets */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  পরিমাণ নির্বাচন করুন
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presets.map((p) => {
                    const active = !custom && amount === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setAmount(p);
                          setCustom("");
                        }}
                        className={`py-3 rounded-btn font-bold text-sm border-2 transition-all ${
                          active
                            ? "gradient-donate-bg text-white border-transparent shadow-donate"
                            : "border-border bg-card hover:border-primary/60"
                        }`}
                      >
                        ৳{toBnNum(p)}
                      </button>
                    );
                  })}
                </div>
                <div className="relative mt-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={50}
                    placeholder="কাস্টম পরিমাণ"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    className="input-base pl-9 font-semibold"
                  />
                </div>
              </div>

              {/* Donor info — minimal */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    নাম
                  </label>
                  <input
                    required
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার পূর্ণ নাম"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    মোবাইল
                  </label>
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="01XXXXXXXXX"
                    dir="ltr"
                    className="input-base font-en"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-donate w-full text-base py-4 group"
                disabled={!finalAmount}
              >
                <Heart className="h-5 w-5" />
                দান নিশ্চিত করুন
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Trust microcopy */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> শরীয়াহ-অনুমোদিত
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" /> ১০০% নিরাপদ
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-primary" /> ডিজিটাল রসিদ
                </span>
              </div>
            </div>
          </form>

          {/* Payment methods strip */}
          <div className="mt-5 rounded-card border border-border bg-card/60 backdrop-blur p-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              পেমেন্ট মাধ্যম
            </span>
            {["bKash", "Nagad", "Rocket", "ব্যাংক"].map((m) => (
              <span key={m} className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <Check className="h-3.5 w-3.5 text-primary" /> {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      <PaymentInstructionsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        amount={finalAmount}
        projectTitle={selected.title}
        donorName={name}
        donorPhone={phone}
      />

      <style>{`
        .input-base{width:100%;padding:0.85rem 1rem;border-radius:12px;border:1px solid hsl(var(--input));background:hsl(var(--background));color:hsl(var(--foreground));outline:none;transition:all 0.2s;font-size:0.95rem}
        .input-base::placeholder{color:hsl(var(--muted-foreground)/0.7)}
        .input-base:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 4px hsl(var(--primary)/0.12);background:hsl(var(--card))}
      `}</style>
    </SiteLayout>
  );
};

export default Donate;
