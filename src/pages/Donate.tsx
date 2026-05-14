import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Heart,
  ShieldCheck,
  Lock,
  RefreshCw,
  Check,
  ArrowRight,
  Sparkles,
  Users,
  Receipt,
  Wallet,
  Landmark,
  Quote,
} from "lucide-react";
import { z } from "zod";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import donateImg from "@/assets/hero-relief.jpg";
import { projects, toBnNum, getProject } from "@/data/projects";
import { PaymentInstructionsModal } from "@/components/donation/PaymentInstructionsModal";
import { toast } from "@/hooks/use-toast";

const presets = [500, 1000, 2500, 5000, 10000, 25000];

const schema = z.object({
  project: z.string().min(1),
  amount: z.number().min(50, "সর্বনিম্ন ৫০ টাকা").max(10000000),
  frequency: z.enum(["one-time", "monthly"]),
  name: z.string().trim().min(2, "নাম দিন").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "সঠিক বাংলাদেশী মোবাইল নম্বর দিন (১১ ডিজিট)"),
  email: z.string().trim().email("সঠিক ই-মেইল দিন").max(255).optional().or(z.literal("")),
  message: z.string().trim().max(500).optional(),
  anonymous: z.boolean(),
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
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const finalAmount = custom ? Number(custom) : amount;
  const selected = useMemo(() => getProject(project) || projects[0], [project]);

  // Step completion tracking
  const stepStatus = {
    1: !!project,
    2: finalAmount >= 50,
    3: name.trim().length >= 2 && /^01[3-9]\d{8}$/.test(phone),
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const result = schema.safeParse({
      project,
      amount: finalAmount,
      frequency,
      name,
      phone,
      email,
      message,
      anonymous,
    });
    if (!result.success) {
      toast({
        title: "তথ্য যাচাই করুন",
        description: result.error.issues[0]?.message || "ফর্মটি সঠিকভাবে পূরণ করুন",
        variant: "destructive",
      });
      // scroll to first incomplete step
      const firstFail = !stepStatus[1] ? 1 : !stepStatus[2] ? 2 : 3;
      document.getElementById(`step-${firstFail}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
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
        description="আপনার পছন্দের প্রকল্পে সরাসরি দান করুন — bKash, Nagad, ব্যাংক ট্রান্সফার বা WhatsApp-এর মাধ্যমে। ১০০% নিরাপদ ও স্বচ্ছ।"
        canonical="/donate"
      />

      <PageHero
        image={donateImg}
        eyebrow="দান প্ল্যাটফর্ম"
        title="আপনার দান, কারো জীবনের নতুন আশা"
        subtitle="মাত্র তিনটি ধাপে দান সম্পন্ন করুন — নিরাপদ, স্বচ্ছ ও শরীয়াহ-অনুমোদিত।"
      />

      {/* Trust ribbon */}
      <div className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container-page py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs md:text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> শরীয়াহ-অনুমোদিত</span>
          <span className="hidden md:inline-block h-3 w-px bg-border" />
          <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> ১০০% নিরাপদ</span>
          <span className="hidden md:inline-block h-3 w-px bg-border" />
          <span className="inline-flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /> স্বচ্ছ হিসাব ও রসিদ</span>
          <span className="hidden md:inline-block h-3 w-px bg-border" />
          <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> ১২,০০০+ দাতা</span>
        </div>
      </div>

      <section id="donate-form" className="py-14 md:py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container-page grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* MAIN FORM */}
          <form onSubmit={submit} className="space-y-6">
            {/* Step 1 — Project */}
            <StepCard
              id="step-1"
              n={1}
              title="প্রকল্প নির্বাচন করুন"
              subtitle="আপনার দান যে কাজে ব্যয় হবে"
              done={stepStatus[1]}
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {projects.map((p) => {
                  const active = project === p.slug;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProject(p.slug)}
                      aria-pressed={active}
                      className={`group relative text-left p-3 rounded-card border-2 transition-all flex gap-3 overflow-hidden ${
                        active
                          ? "border-primary bg-accent/40 shadow-card"
                          : "border-border bg-card hover:border-primary/40 hover:shadow-card"
                      }`}
                    >
                      <div className="relative h-16 w-16 rounded-btn overflow-hidden shrink-0">
                        <img src={p.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        {p.urgent && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold gradient-donate-bg text-white">
                            জরুরি
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm line-clamp-2 leading-snug">{p.title}</div>
                        <div className="text-[11px] text-muted-foreground mt-1 truncate">
                          {p.category} · {p.location}
                        </div>
                      </div>
                      {active && (
                        <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </StepCard>

            {/* Step 2 — Amount */}
            <StepCard
              id="step-2"
              n={2}
              title="পরিমাণ ও ফ্রিকোয়েন্সি"
              subtitle="মাসিক দাতা হলে নিয়মিত প্রভাব রাখুন"
              done={stepStatus[2]}
            >
              {/* Frequency segmented */}
              <div className="relative grid grid-cols-2 p-1 rounded-btn bg-muted mb-5">
                <span
                  aria-hidden
                  className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-[8px] bg-card shadow-sm transition-transform duration-300 ${
                    frequency === "monthly" ? "translate-x-[calc(100%+4px)]" : "translate-x-1"
                  }`}
                />
                {(
                  [
                    { v: "one-time", l: "এককালীন", icon: Heart },
                    { v: "monthly", l: "মাসিক", icon: RefreshCw },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.v}
                    type="button"
                    onClick={() => setFrequency(f.v)}
                    className={`relative z-10 py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
                      frequency === f.v ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <f.icon className="h-4 w-4" />
                    {f.l}
                  </button>
                ))}
              </div>

              {/* Preset amounts */}
              <div className="grid grid-cols-3 gap-2.5">
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
                      className={`py-3.5 rounded-btn font-bold border-2 transition-all relative ${
                        active
                          ? "gradient-donate-bg text-white border-transparent shadow-donate"
                          : "border-border bg-card hover:border-primary/60 hover:-translate-y-0.5"
                      }`}
                    >
                      ৳{toBnNum(p)}
                      {p === 2500 && !active && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-bold rounded bg-primary text-primary-foreground whitespace-nowrap">
                          জনপ্রিয়
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom */}
              <div className="mt-4">
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  অথবা কাস্টম পরিমাণ লিখুন
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">৳</span>
                  <input
                    type="number"
                    min={50}
                    placeholder="যেমন — ৩০০০"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    className="input-base pl-9 text-base font-semibold"
                  />
                </div>
                {frequency === "monthly" && finalAmount > 0 && (
                  <p className="mt-2 text-xs text-primary inline-flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    বার্ষিক প্রভাব: ৳{toBnNum(finalAmount * 12)}
                  </p>
                )}
              </div>
            </StepCard>

            {/* Step 3 — Donor */}
            <StepCard
              id="step-3"
              n={3}
              title="দাতার তথ্য"
              subtitle="যোগাযোগ ও রসিদের জন্য প্রয়োজন"
              done={stepStatus[3]}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="পূর্ণ নাম" required>
                  <input
                    required
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন — আবদুল্লাহ"
                    className="input-base"
                    aria-invalid={submitted && name.trim().length < 2}
                  />
                </Field>
                <Field label="মোবাইল নম্বর" required>
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
                    aria-invalid={submitted && !/^01[3-9]\d{8}$/.test(phone)}
                  />
                </Field>
                <Field label="ই-মেইল" hint="ঐচ্ছিক — রসিদের জন্য" className="sm:col-span-2">
                  <input
                    type="email"
                    maxLength={255}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    dir="ltr"
                    className="input-base font-en"
                  />
                </Field>
                <Field label="বার্তা" hint="ঐচ্ছিক — কোনো বিশেষ অনুরোধ থাকলে লিখুন" className="sm:col-span-2">
                  <textarea
                    maxLength={500}
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="যেমন — আমার পিতার নামে দান করছি…"
                    className="input-base resize-none"
                  />
                </Field>
              </div>
              <label className="mt-4 flex items-start gap-3 p-3 rounded-btn bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-input accent-primary"
                />
                <div>
                  <div className="text-sm font-semibold">আমার পরিচয় গোপন রাখুন</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    পাবলিক তালিকায় "একজন দাতা" হিসেবে প্রদর্শিত হবে
                  </div>
                </div>
              </label>
            </StepCard>

            {/* Submit */}
            <button
              type="submit"
              className="btn-donate w-full text-base py-4 group"
              disabled={!finalAmount}
            >
              <Heart className="h-5 w-5" />
              ৳{toBnNum(finalAmount || 0)} দান করুন
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="text-center text-xs text-muted-foreground">
              "Continue" বাটনে ক্লিক করলে আপনার দানের জন্য পেমেন্ট নির্দেশনা প্রদর্শিত হবে। কোনো অর্থ স্বয়ংক্রিয়ভাবে কাটা হবে না।
            </p>
          </form>

          {/* SIDEBAR */}
          <aside className="space-y-5 lg:sticky lg:top-28 self-start">
            {/* Summary card */}
            <div className="rounded-card overflow-hidden bg-card shadow-card border border-border">
              <div className="relative h-36">
                <img src={selected.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <div className="text-[11px] uppercase tracking-wider opacity-80">{selected.category}</div>
                  <div className="font-bold text-base line-clamp-2 leading-snug mt-0.5">{selected.title}</div>
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">দানের সারসংক্ষেপ</div>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <Row k="পরিমাণ" v={`৳${toBnNum(finalAmount || 0)}`} />
                  <Row k="ফ্রিকোয়েন্সি" v={frequency === "monthly" ? "মাসিক পুনরাবৃত্ত" : "এককালীন"} />
                  <Row k="পেমেন্ট" v="bKash · Nagad · ব্যাংক" />
                </dl>
                <div className="mt-4 pt-4 border-t border-dashed border-border flex items-baseline justify-between">
                  <span className="font-bold text-foreground">মোট</span>
                  <span className="text-3xl font-extrabold gradient-donate-text" dir="ltr">
                    ৳{toBnNum(finalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment methods preview */}
            <div className="rounded-card bg-card border border-border p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">পেমেন্ট মাধ্যম</div>
              <div className="grid grid-cols-2 gap-2">
                <Method icon={<Wallet className="h-4 w-4" />} label="bKash" />
                <Method icon={<Wallet className="h-4 w-4" />} label="Nagad" />
                <Method icon={<Wallet className="h-4 w-4" />} label="Rocket" />
                <Method icon={<Landmark className="h-4 w-4" />} label="ব্যাংক" />
              </div>
            </div>

            {/* Quote */}
            <div className="rounded-card bg-gradient-to-br from-primary/95 to-primary text-primary-foreground p-5 relative overflow-hidden">
              <Quote className="absolute -top-2 -right-2 h-20 w-20 text-white/10" />
              <p className="relative text-sm leading-relaxed">
                "যে ব্যক্তি ভালো কাজে উদ্যোগী হয়, সে ঐ কাজ সম্পাদনকারীর সমান সওয়াব পায়।"
              </p>
              <div className="relative mt-3 text-xs opacity-80">— সহীহ মুসলিম</div>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQ / Trust footer */}
      <section className="py-14 md:py-20 border-t border-border bg-card/40">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow">আপনার বিশ্বাস, আমাদের দায়িত্ব</span>
            <h2 className="heading-display mt-3">কেন ইউনাইট ফাউন্ডেশনে দান করবেন?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: ShieldCheck,
                t: "১০০% শরীয়াহ-অনুমোদিত",
                d: "প্রতিটি প্রকল্প বিজ্ঞ আলেমদের তত্ত্বাবধানে পরিচালিত — যাকাত, সাদাকাহ ও কর্জ-এ-হাসানাহ আলাদা হিসাবে।",
              },
              {
                icon: Receipt,
                t: "স্বচ্ছ হিসাব ও রসিদ",
                d: "প্রতিটি দানের জন্য ডিজিটাল রসিদ এবং প্রকল্পভিত্তিক বিস্তারিত আয়-ব্যয়ের প্রতিবেদন প্রকাশ করা হয়।",
              },
              {
                icon: Users,
                t: "সরাসরি প্রভাব",
                d: "আপনার দান কোন পরিবার বা প্রকল্পে পৌঁছেছে — তা ছবি, ভিডিও ও আপডেটসহ জানানো হয়।",
              },
            ].map((f) => (
              <div key={f.t} className="card-base p-6">
                <div className="h-11 w-11 rounded-btn bg-accent text-primary flex items-center justify-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-lg">{f.t}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PaymentInstructionsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        amount={finalAmount}
        projectTitle={selected.title}
        donorName={anonymous ? "একজন দাতা" : name}
        donorPhone={phone}
      />

      <style>{`
        .input-base{width:100%;padding:0.85rem 1rem;border-radius:12px;border:1px solid hsl(var(--input));background:hsl(var(--background));color:hsl(var(--foreground));outline:none;transition:all 0.2s;font-size:0.95rem}
        .input-base::placeholder{color:hsl(var(--muted-foreground)/0.7)}
        .input-base:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 4px hsl(var(--primary)/0.12);background:hsl(var(--card))}
        .input-base[aria-invalid="true"]{border-color:hsl(var(--destructive));box-shadow:0 0 0 4px hsl(var(--destructive)/0.1)}
      `}</style>
    </SiteLayout>
  );
};

const StepCard = ({
  id,
  n,
  title,
  subtitle,
  done,
  children,
}: {
  id: string;
  n: number;
  title: string;
  subtitle?: string;
  done?: boolean;
  children: React.ReactNode;
}) => (
  <section
    id={id}
    className="rounded-card bg-card border border-border shadow-card p-6 md:p-7 transition-all"
  >
    <header className="flex items-start gap-4 mb-5">
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
          done
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-primary border-2 border-primary/30"
        }`}
      >
        {done ? <Check className="h-5 w-5" strokeWidth={3} /> : toBnNum(n)}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg md:text-xl font-bold leading-tight">{title}</h2>
        {subtitle && <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </header>
    {children}
  </section>
);

const Field = ({
  label,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <label className={`block ${className}`}>
    <span className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
      {label}
      {required && <span className="text-destructive">*</span>}
      {hint && <span className="text-xs font-normal text-muted-foreground">— {hint}</span>}
    </span>
    {children}
  </label>
);

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-3">
    <dt className="text-muted-foreground">{k}</dt>
    <dd className="font-semibold text-right text-foreground">{v}</dd>
  </div>
);

const Method = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 px-3 py-2.5 rounded-btn border border-border bg-background text-sm font-semibold">
    <span className="text-primary">{icon}</span>
    {label}
  </div>
);

export default Donate;
