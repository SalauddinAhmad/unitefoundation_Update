import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Heart, ShieldCheck, Check, Copy, Quote } from "lucide-react";
import { z } from "zod";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import donateImg from "@/assets/hero-relief.jpg";
import sslLogo from "@/assets/sslcommerz-logo.png";
import { projects, toBnNum, getProject } from "@/data/projects";
import { PaymentInstructionsModal } from "@/components/donation/PaymentInstructionsModal";
import { toast } from "@/hooks/use-toast";
import { site } from "@/data/site";

const presets = [4250, 3800, 2550, 1700, 850];

type PayMethod = "ssl" | "bkash" | "nagad" | "rocket" | "bank";

const methods: { id: PayMethod; label: string; sub: string }[] = [
  { id: "bkash", label: "bKash", sub: "পার্সোনাল" },
  { id: "nagad", label: "Nagad", sub: "পার্সোনাল" },
  { id: "rocket", label: "Rocket", sub: "পার্সোনাল" },
  { id: "bank", label: "ব্যাংক", sub: "Islami Bank" },
];

const schema = z.object({
  amount: z.number().min(50, "সর্বনিম্ন ৫০ টাকা").max(10000000),
  name: z.string().trim().min(2, "নাম দিন").max(80),
  contact: z.string().trim().min(3, "মোবাইল বা ইমেইল দিন").max(255),
});

const Donate = () => {
  const [params] = useSearchParams();
  const initialSlug = params.get("project") || projects[0].slug;
  const initialAmount = Number(params.get("amount")) || 2550;

  const [project, setProject] = useState(initialSlug);
  const [amount, setAmount] = useState(initialAmount);
  const [custom, setCustom] = useState(presets.includes(initialAmount) ? "" : String(initialAmount));
  const [name, setName] = useState(params.get("name") || "");
  const [contact, setContact] = useState(params.get("phone") || "");
  const [behalf, setBehalf] = useState("");
  const [method, setMethod] = useState<PayMethod>("bkash");
  const [showModal, setShowModal] = useState(false);

  const finalAmount = custom ? Number(custom) : amount;
  const selected = useMemo(() => getProject(project) || projects[0], [project]);

  const methodNumber =
    method === "bank" ? site.payments.bank.number : site.payments[method].number;
  const methodLabel = methods.find((m) => m.id === method)!;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ amount: finalAmount, name, contact });
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

  const copyNumber = () => {
    navigator.clipboard.writeText(methodNumber);
    toast({ title: "কপি হয়েছে", description: `${methodLabel.label} নম্বর কপি করা হয়েছে।` });
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
        title={selected.title}
        subtitle="আপনার দানে গড়ে উঠবে কারো নতুন দিন।"
      />

      <section id="donate-form" className="py-12 md:py-16 bg-gradient-to-b from-background to-secondary/20">
        <div className="container-page grid lg:grid-cols-[1fr_460px] gap-8 lg:gap-10 items-start">
          {/* LEFT — Story / context */}
          <div className="space-y-6">
            {/* Project selector */}
            <div className="rounded-card border border-border bg-card p-2">
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="input-base border-none bg-transparent font-semibold focus:shadow-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Project image */}
            <div className="rounded-card overflow-hidden border border-border shadow-card">
              <img src={selected.image} alt={selected.title} className="w-full h-72 md:h-96 object-cover" />
            </div>

            {/* Hadith quote */}
            <div className="rounded-card bg-accent/50 border border-border p-6 md:p-7 relative overflow-hidden">
              <Quote className="absolute -top-2 -right-2 h-20 w-20 text-primary/10" />
              <p className="text-base md:text-lg leading-relaxed text-foreground relative">
                "যে ব্যক্তি কোনো মুসলিমের পার্থিব কোনো বিপদ দূর করে দেবে, কিয়ামতের দিন আল্লাহ তার বিপদ দূর করে দেবেন।"
              </p>
              <div className="mt-3 text-xs font-semibold text-muted-foreground relative">— সুনান আবু দাউদ</div>
            </div>

            {/* Description */}
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {selected.description}
            </p>
          </div>

          {/* RIGHT — Premium donation card */}
          <form onSubmit={submit} className="rounded-card bg-card border border-border shadow-card-hover overflow-hidden lg:sticky lg:top-28">
            {/* Green header */}
            <div className="gradient-donate-bg p-5 md:p-6 text-white">
              <h2 className="text-xl md:text-2xl font-extrabold">দান করে পাশে দাঁড়ান</h2>
              <p className="text-sm opacity-90 mt-1.5 leading-relaxed">
                আপনার সামান্য সহযোগিতাই হতে পারে কারো জীবনের বড় পরিবর্তন।
              </p>
            </div>

            <div className="p-5 md:p-6 space-y-5">
              {/* Selected payment quick-info */}
              <div className="rounded-btn border border-border bg-muted/40 p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {methodLabel.label} ({methodLabel.sub})
                  </div>
                  <div className="font-mono font-bold text-foreground mt-0.5 truncate" dir="ltr">
                    {methodNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyNumber}
                  className="shrink-0 p-2 rounded-btn hover:bg-accent text-primary"
                  aria-label="নম্বর কপি করুন"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              {/* Amount presets — 3 cols */}
              <div className="grid grid-cols-3 gap-2">
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
                      ৳{toBnNum(new Intl.NumberFormat("en-IN").format(p))}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setAmount(0);
                    setCustom(custom || "");
                    document.getElementById("custom-amt")?.focus();
                  }}
                  className={`py-3 rounded-btn font-bold text-xs border-2 transition-all ${
                    custom
                      ? "gradient-donate-bg text-white border-transparent shadow-donate"
                      : "border-dashed border-border bg-card hover:border-primary/60 text-muted-foreground"
                  }`}
                >
                  যে কোনো পরিমাণ
                </button>
              </div>

              {/* Amount input */}
              <Field label="পরিমাণ" required>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">৳</span>
                  <input
                    id="custom-amt"
                    type="number"
                    min={50}
                    value={custom || amount}
                    onChange={(e) => setCustom(e.target.value)}
                    className="input-base pl-9 font-semibold"
                  />
                </div>
              </Field>

              <Field label="আপনার নাম" required>
                <input
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="লিখুন"
                  className="input-base"
                />
              </Field>

              <Field label="মোবাইল / ইমেইল" required>
                <input
                  required
                  maxLength={255}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="লিখুন"
                  className="input-base"
                />
              </Field>

              <Field label="অন্য কারো পক্ষ থেকে দান করে থাকলে তার নাম লিখুন">
                <input
                  maxLength={80}
                  value={behalf}
                  onChange={(e) => setBehalf(e.target.value)}
                  placeholder="লিখুন"
                  className="input-base"
                />
              </Field>

              {/* Payment method */}
              <Field label="পেমেন্ট মেথড" required>
                <div className="grid grid-cols-2 gap-2">
                  {methods.map((m) => {
                    const active = method === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`relative p-3 rounded-btn border-2 text-left transition-all ${
                          active
                            ? "border-primary bg-accent/40 shadow-card"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${m.color}`}>
                          {m.label}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1.5">{m.sub}</div>
                        {active && (
                          <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Submit */}
              <button type="submit" className="btn-donate w-full text-base py-4">
                <Heart className="h-5 w-5" />
                দান করুন — ৳{toBnNum(new Intl.NumberFormat("en-IN").format(finalAmount || 0))}
              </button>

              <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                "দান করুন" ক্লিক করে আপনি আমাদের <span className="underline">শর্তাবলী</span> ও{" "}
                <span className="underline">গোপনীয়তা নীতির</span> সাথে সম্মত হন।
              </p>

              <div className="flex items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                শরীয়াহ-অনুমোদিত · স্বচ্ছ হিসাব · ডিজিটাল রসিদ
              </div>
            </div>
          </form>
        </div>
      </section>

      <PaymentInstructionsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        amount={finalAmount}
        projectTitle={selected.title}
        donorName={behalf ? `${name} (${behalf}-এর পক্ষ থেকে)` : name}
        donorPhone={contact}
      />

      <style>{`
        .input-base{width:100%;padding:0.8rem 1rem;border-radius:12px;border:1px solid hsl(var(--input));background:hsl(var(--background));color:hsl(var(--foreground));outline:none;transition:all 0.2s;font-size:0.95rem}
        .input-base::placeholder{color:hsl(var(--muted-foreground)/0.7)}
        .input-base:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 4px hsl(var(--primary)/0.12);background:hsl(var(--card))}
      `}</style>
    </SiteLayout>
  );
};

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1">
      {label}
      {required && <span className="text-destructive">*</span>}
    </span>
    {children}
  </label>
);

export default Donate;
