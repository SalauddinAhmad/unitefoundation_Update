import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { Link } from "react-router-dom";

const PRESETS = [100, 500, 1000, 2500, 5000, 10000];
const METHODS = ["Visa", "MasterCard", "bKash", "Nagad", "Rocket", "Amex", "DBBL", "Net Banking"];

export function SSLCommerzPayCard() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", amount: "" as string | number, purpose: "", note: "",
  });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      toast({ title: "শর্তাবলী সম্মতি প্রয়োজন", description: "অনুগ্রহ করে শর্তাবলী গ্রহণ করুন।", variant: "destructive" });
      return;
    }
    const amt = Number(form.amount);
    if (!amt || amt < 10) {
      toast({ title: "পরিমাণ ঠিক নয়", description: "ন্যূনতম ১০ টাকা।", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/sslcommerz/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone,
          amount: amt, purpose: form.purpose || "সাধারণ দান", note: form.note,
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.gatewayUrl) throw new Error(j.message || "Gateway init failed");
      window.location.href = j.gatewayUrl;
    } catch (err: any) {
      toast({ title: "পেমেন্ট শুরু করা যায়নি", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-24 bg-gradient-to-b from-background via-accent/30 to-background">
      {/* Subtle geometric backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='%23006837' stroke-width='0.8'><path d='M60 6l16 16 22 6-16 16 6 22-22-6-16 16-16-16-22 6 6-22-16-16 22-6z'/><circle cx='60' cy='60' r='14'/></g></svg>")`,
          backgroundSize: "160px 160px",
        }}
      />

      <div className="container-page relative">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            SSLCommerz দ্বারা নিরাপদ
          </div>
          <h2 className="heading-display text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mt-5">
            কার্ড / মোবাইল ব্যাংকিং-এ দান করুন
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            SSLCommerz-এর সুরক্ষিত গেটওয়ে দিয়ে মাত্র কয়েক মুহূর্তে আপনার দান পৌঁছে দিন।
          </p>
        </div>

        {/* Card */}
        <div className="mt-12 max-w-3xl mx-auto rounded-3xl overflow-hidden bg-card border border-border shadow-[var(--shadow-card-hover)]">
          {/* Header strip */}
          <div className="relative px-6 md:px-10 py-5 flex flex-wrap items-center justify-between gap-4 bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary-foreground/10 border border-primary-foreground/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.24em] uppercase text-primary-foreground/80">
                  Secured Gateway
                </div>
                <div className="text-sm font-semibold">SSLCommerz এনক্রিপ্টেড</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
              <Lock className="h-3.5 w-3.5" />
              256-bit SSL
            </div>
          </div>

          <form onSubmit={submit} className="p-6 md:p-10 space-y-7">
            {/* Presets */}
            <div>
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">
                দানের পরিমাণ নির্বাচন করুন
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {PRESETS.map((p) => {
                  const active = Number(form.amount) === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setForm((f) => ({ ...f, amount: p }))}
                      className={`relative py-3 rounded-lg text-sm font-bold transition-all border ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                          : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-accent"
                      }`}
                    >
                      ৳{p.toLocaleString("bn-BD")}
                      {active && (
                        <CheckCircle2 className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-primary rounded-full text-primary-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <Label htmlFor="amount" className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                অথবা কাস্টম পরিমাণ (৳) *
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-primary">৳</span>
                <Input
                  id="amount" type="number" min={10} required value={form.amount}
                  onChange={set("amount")} placeholder="যেমন ১০০০"
                  className="pl-10 h-12 text-lg font-bold"
                />
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Donor info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">নাম *</Label>
                <Input id="name" required value={form.name} onChange={set("name")} className="mt-1.5 h-11" />
              </div>
              <div>
                <Label htmlFor="phone" className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">মোবাইল *</Label>
                <Input id="phone" required value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" className="mt-1.5 h-11" />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">ইমেইল *</Label>
              <Input id="email" type="email" required value={form.email} onChange={set("email")} className="mt-1.5 h-11" />
            </div>

            <div>
              <Label htmlFor="purpose" className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">উদ্দেশ্য (ঐচ্ছিক)</Label>
              <Input id="purpose" value={form.purpose} onChange={set("purpose")} placeholder="যেমন যাকাত, সাধারণ দান" className="mt-1.5 h-11" />
            </div>

            <div>
              <Label htmlFor="note" className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">নোট (ঐচ্ছিক)</Label>
              <Textarea id="note" rows={2} value={form.note} onChange={set("note")} className="mt-1.5" />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 text-sm cursor-pointer rounded-lg p-4 bg-accent/50 border border-border">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
              <span className="text-muted-foreground">
                আমি{" "}
                <Link to="/terms-conditions" target="_blank" className="font-semibold underline text-primary">শর্তাবলী</Link>,{" "}
                <Link to="/refund-policy" target="_blank" className="font-semibold underline text-primary">রিফান্ড নীতি</Link> এবং{" "}
                <Link to="/privacy-policy" target="_blank" className="font-semibold underline text-primary">প্রাইভেসি পলিসি</Link>{" "}
                পড়ে সম্মত হয়েছি।
              </span>
            </label>

            {/* Submit — donate gradient */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-14 text-base font-bold tracking-wide rounded-xl text-white border-0 hover:opacity-95 transition-opacity"
              style={{
                background: "var(--gradient-donate)",
                boxShadow: "var(--shadow-donate)",
              }}
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> সংযোগ করা হচ্ছে…</>
              ) : (
                <><CreditCard className="h-5 w-5 mr-2" /> নিরাপদে পেমেন্ট করুন</>
              )}
            </Button>

            {/* Methods */}
            <div className="pt-2">
              <div className="text-center text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">
                গৃহীত পেমেন্ট মাধ্যম
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {METHODS.map((m) => (
                  <span key={m} className="text-[11px] font-semibold px-2.5 py-1 rounded bg-background text-foreground border border-border">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              পরবর্তী ধাপে SSLCommerz-এর নিরাপদ পেমেন্ট পেজে যাবেন।
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
