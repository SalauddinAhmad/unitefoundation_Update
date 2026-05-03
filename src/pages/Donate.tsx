import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Heart, ShieldCheck, Lock, RefreshCw } from "lucide-react";
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
  amount: z.number().min(50).max(10000000),
  frequency: z.enum(["one-time", "monthly"]),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক বাংলাদেশী মোবাইল নম্বর দিন"),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  message: z.string().trim().max(500).optional(),
  anonymous: z.boolean(),
});

const Donate = () => {
  const [params] = useSearchParams();
  const initialSlug = params.get("project") || projects[0].slug;
  const initialAmount = Number(params.get("amount")) || 1000;
  const initialName = params.get("name") || "";
  const initialPhone = params.get("phone") || "";

  const [project, setProject] = useState(initialSlug);
  const [amount, setAmount] = useState(initialAmount);
  const [custom, setCustom] = useState(presets.includes(initialAmount) ? "" : String(initialAmount));
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const finalAmount = custom ? Number(custom) : amount;
  const selected = useMemo(() => getProject(project) || projects[0], [project]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ project, amount: finalAmount, frequency, name, phone, email, message, anonymous });
    if (!result.success) {
      toast({ title: "তথ্য যাচাই করুন", description: result.error.issues[0]?.message || "ফর্ম সঠিকভাবে পূরণ করুন", variant: "destructive" });
      return;
    }
    setShowModal(true);
  };

  return (
    <SiteLayout>
      <Seo title="দান করুন | ইউনাইট ফাউন্ডেশন" description="আপনার পছন্দের প্রকল্পে সরাসরি দান করুন — bKash, Nagad, ব্যাংক ট্রান্সফার বা WhatsApp-এর মাধ্যমে।" canonical="/donate" />

      <PageHero
        image={donateImg}
        eyebrow="দান প্ল্যাটফর্ম"
        title="আপনার দান, কারো জীবনের নতুন আশা"
        subtitle="পেমেন্ট তথ্য পেতে নিচের ফর্মটি পূরণ করুন। ১০০% নিরাপদ ও স্বচ্ছ।"
      />

      {/* Donor types */}
      <section className="py-10 md:py-12 bg-secondary/40 border-b border-border">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="eyebrow">দাতা সদস্যপদ</span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">আপনি কীভাবে পাশে থাকতে চান?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "এককালীন দান", d: "যেকোনো প্রকল্পে যেকোনো পরিমাণে দান করুন।", h: "Donate" },
              { t: "নিয়মিত দাতা সদস্য", d: "মাসিক নির্দিষ্ট পরিমাণে দান করে কার্যক্রমে অংশীদার হোন।", h: "Regular Donor" },
              { t: "আজীবন দাতা সদস্য", d: "এককালীন বড় অনুদানে আজীবন দাতা সদস্যপদ গ্রহণ করুন।", h: "Lifetime Donor" },
              { t: "স্বেচ্ছাসেবক", d: "সময়, দক্ষতা ও শ্রম দিয়ে আমাদের কার্যক্রমে যুক্ত হোন।", h: "Volunteer" },
            ].map((c) => (
              <div key={c.t} className="card-base p-5 text-center">
                <div className="h-10 w-10 rounded-card gradient-donate-bg text-white flex items-center justify-center mx-auto"><Heart className="h-5 w-5" /></div>
                <h3 className="mt-3 font-bold">{c.t}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{c.d}</p>
                <p className="text-[10px] font-en text-primary mt-2 tracking-wider">{c.h}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-page grid lg:grid-cols-[1fr_360px] gap-10">
          <form onSubmit={submit} className="card-base p-6 md:p-8 space-y-8">
            {/* Step 1 */}
            <Step n={1} title="প্রকল্প নির্বাচন">
              <div className="grid sm:grid-cols-2 gap-3">
                {projects.map((p) => {
                  const active = project === p.slug;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProject(p.slug)}
                      className={`text-left p-3 rounded-btn border-2 transition-all flex gap-3 ${
                        active ? "border-primary bg-accent/40" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img src={p.image} alt="" className="h-14 w-14 rounded-btn object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm line-clamp-2 leading-snug">{p.title}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">{p.category} · {p.location}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* Step 2 */}
            <Step n={2} title="পরিমাণ ও ফ্রিকোয়েন্সি">
              <div className="flex gap-2 mb-4">
                {[
                  { v: "one-time" as const, l: "এককালীন" },
                  { v: "monthly" as const, l: "মাসিক" },
                ].map((f) => (
                  <button
                    key={f.v}
                    type="button"
                    onClick={() => setFrequency(f.v)}
                    className={`flex-1 py-2.5 rounded-btn text-sm font-semibold border-2 transition-all ${
                      frequency === f.v ? "border-primary bg-accent/40 text-primary" : "border-border text-foreground"
                    }`}
                  >
                    {f.v === "monthly" && <RefreshCw className="h-3.5 w-3.5 inline mr-1.5" />}
                    {f.l}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((p) => {
                  const active = !custom && amount === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setAmount(p); setCustom(""); }}
                      className={`py-3 rounded-btn font-bold border-2 transition-all ${
                        active ? "gradient-donate-bg text-white border-transparent shadow-donate" : "border-border bg-background hover:border-primary"
                      }`}
                    >
                      ৳{toBnNum(p)}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                <input
                  type="number"
                  min={50}
                  placeholder="কাস্টম পরিমাণ"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-btn border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </Step>

            {/* Step 3 */}
            <Step n={3} title="দাতার তথ্য">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="পূর্ণ নাম *">
                  <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="input-base" />
                </Field>
                <Field label="মোবাইল নম্বর *">
                  <input required type="tel" inputMode="numeric" maxLength={11} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="01XXXXXXXXX" className="input-base" />
                </Field>
                <Field label="ই-মেইল (ঐচ্ছিক)" className="sm:col-span-2">
                  <input type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" />
                </Field>
                <Field label="বার্তা (ঐচ্ছিক)" className="sm:col-span-2">
                  <textarea maxLength={500} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="input-base resize-none" />
                </Field>
              </div>
              <label className="mt-4 flex items-center gap-2.5 text-sm cursor-pointer">
                <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4 rounded border-input" />
                আমার নাম গোপন রাখুন
              </label>
            </Step>

            <button type="submit" className="btn-donate w-full text-base py-4">
              <Heart className="h-5 w-5" /> ৳{toBnNum(finalAmount || 0)} দান করুন
            </button>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-2">
              <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" />সুরক্ষিত</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />শরীয়াহ-অনুমোদিত</span>
              <span>স্বচ্ছ হিসাব</span>
            </div>
          </form>

          {/* Summary sidebar */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="card-base p-6">
              <h3 className="font-bold text-lg">দানের সারসংক্ষেপ</h3>
              <img src={selected.image} alt="" className="w-full h-32 object-cover rounded-btn mt-4" />
              <div className="mt-3 text-sm font-semibold line-clamp-2">{selected.title}</div>
              <dl className="mt-4 space-y-2 text-sm">
                <Row k="পরিমাণ" v={`৳${toBnNum(finalAmount || 0)}`} />
                <Row k="ফ্রিকোয়েন্সি" v={frequency === "monthly" ? "মাসিক" : "এককালীন"} />
                <Row k="পেমেন্ট" v="bKash / Nagad / ব্যাংক" />
              </dl>
              <div className="mt-5 pt-5 border-t border-border flex items-baseline justify-between">
                <span className="font-bold">মোট</span>
                <span className="text-2xl font-extrabold gradient-donate-text">৳{toBnNum(finalAmount || 0)}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              "যে ব্যক্তি ভালো কাজে উদ্যোগী হয়, সে ঐ কাজ সম্পাদনকারীর সমান সওয়াব পায়।"
            </p>
          </aside>
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

      <style>{`.input-base{width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid hsl(var(--input));background:hsl(var(--background));color:hsl(var(--foreground));outline:none;transition:all 0.2s}.input-base:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary)/0.1)}`}</style>
    </SiteLayout>
  );
};

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-3 mb-4">
      <span className="h-8 w-8 rounded-full gradient-donate-bg text-white text-sm font-bold flex items-center justify-center">{toBnNum(n)}</span>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
    {children}
  </div>
);

const Field = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <label className={`block ${className}`}>
    <span className="text-sm font-semibold text-foreground mb-1.5 block">{label}</span>
    {children}
  </label>
);

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold text-right">{v}</dd></div>
);

export default Donate;
