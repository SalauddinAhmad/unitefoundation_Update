import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck, Heart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { Link } from "react-router-dom";
import donateIllustration from "@/assets/donation/donate-illustration.png.asset.json";

const SSL_LOGO_URL = "/sslcommerz-pay.png";

const PRESETS = [100, 500, 1000, 2500, 5000, 10000];

export function SSLCommerzPayCard() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", amount: "" as string | number, purpose: "", note: "",
  });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showExtra, setShowExtra] = useState(false);

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
    <section className="relative overflow-hidden py-14 md:py-20 bg-gradient-to-b from-background via-accent/30 to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='%23006837' stroke-width='0.8'><path d='M60 6l16 16 22 6-16 16 6 22-22-6-16 16-16-16-22 6 6-22-16-16 22-6z'/><circle cx='60' cy='60' r='14'/></g></svg>")`,
          backgroundSize: "160px 160px",
        }}
      />

      <div className="container-page relative">
        <div className="mx-auto grid lg:grid-cols-[1fr_440px] lg:gap-12 lg:items-center max-w-5xl">
          {/* Illustration - desktop only */}
          <div className="hidden lg:flex flex-col items-center text-center animate-fade-in">
            <img
              src={donateIllustration.url}
              alt="দানের মাধ্যমে মানবতার সেবা"
              className="w-full max-w-md h-auto drop-shadow-[0_20px_40px_rgba(0,104,55,0.15)]"
              loading="lazy"
            />
            <h3 className="mt-6 text-2xl xl:text-3xl font-extrabold text-foreground leading-snug">
              আপনার দানে বদলে যাবে <span className="text-primary">অসংখ্য জীবন</span>
            </h3>
            <p className="mt-3 text-sm xl:text-base text-muted-foreground leading-relaxed max-w-md">
              সুন্নাহর অনুসরণে মানবতার কল্যাণে — আপনার ছোট্ট অবদানই হতে পারে কারও জন্য বড় সহায়।
            </p>
          </div>

          <div className="w-full max-w-[440px] mx-auto lg:mx-0 bg-card rounded-3xl shadow-[var(--shadow-card-hover)] border border-border overflow-hidden animate-fade-in">
          {/* Compact centered header */}
          <div className="bg-primary text-primary-foreground px-6 py-7 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-foreground/10 rounded-full mb-3 border border-primary-foreground/15">
              <Heart className="h-6 w-6" fill="currentColor" />
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
              কার্ড / মোবাইল ব্যাংকিং-এ দান
            </h2>
            <p className="text-xs md:text-sm text-primary-foreground/80 mt-1.5">
              আপনার ছোট দানে আসবে বড় পরিবর্তন
            </p>
          </div>

          <form onSubmit={submit} className="p-5 md:p-6 space-y-5">
            {/* Amount input + presets */}
            <div>
              <div className="relative mb-2.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-primary">৳</span>
                <Input
                  id="amount" type="number" min={10} required inputMode="numeric"
                  value={form.amount} onChange={set("amount")}
                  placeholder="পরিমাণ লিখুন"
                  className="pl-11 h-14 text-lg font-bold rounded-2xl bg-muted/60 border-2 border-transparent focus-visible:border-primary focus-visible:ring-0"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((p) => {
                  const active = Number(form.amount) === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setForm((f) => ({ ...f, amount: p }))}
                      className={`py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                        active
                          ? "border-primary bg-accent text-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.15)]"
                          : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      ৳{p.toLocaleString("bn-BD")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Donor info */}
            <div className="space-y-3">
              <Input
                required value={form.name} onChange={set("name")}
                placeholder="আপনার পূর্ণ নাম *"
                className="h-12 rounded-xl bg-muted/60 border-border"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  required value={form.phone} onChange={set("phone")}
                  placeholder="ফোন নম্বর *"
                  className="h-12 rounded-xl bg-muted/60 border-border"
                />
                <Input
                  type="email" required value={form.email} onChange={set("email")}
                  placeholder="ইমেইল *"
                  className="h-12 rounded-xl bg-muted/60 border-border"
                />
              </div>
            </div>

            {/* Collapsible optional */}
            <div>
              <button
                type="button"
                onClick={() => setShowExtra((v) => !v)}
                className="w-full flex items-center justify-between text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground hover:text-primary transition-colors py-1"
              >
                <span>অতিরিক্ত তথ্য (ঐচ্ছিক)</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showExtra ? "rotate-180" : ""}`} />
              </button>
              {showExtra && (
                <div className="mt-3 space-y-3 animate-fade-in">
                  <Input
                    value={form.purpose} onChange={set("purpose")}
                    placeholder="দানের উদ্দেশ্য (যেমন যাকাত, সাধারণ দান)"
                    className="h-12 rounded-xl bg-muted/60 border-border"
                  />
                  <Textarea
                    rows={2} value={form.note} onChange={set("note")}
                    placeholder="নোট বা মন্তব্য"
                    className="rounded-xl bg-muted/60 border-border resize-none"
                  />
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 text-xs cursor-pointer">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
              <span className="text-muted-foreground leading-relaxed">
                আমি{" "}
                <Link to="/terms-conditions" target="_blank" className="font-semibold underline text-primary">শর্তাবলী</Link>,{" "}
                <Link to="/refund-policy" target="_blank" className="font-semibold underline text-primary">রিফান্ড নীতি</Link> ও{" "}
                <Link to="/privacy-policy" target="_blank" className="font-semibold underline text-primary">প্রাইভেসি পলিসি</Link>{" "}
                পড়ে সম্মত হয়েছি।
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-14 text-base font-bold tracking-wide rounded-2xl text-white border-0 hover:brightness-110 hover:opacity-100 active:scale-[0.98] transition-all"
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
          </form>

          {/* Trust footer strip */}
          <div className="px-6 py-4 bg-muted/40 border-t border-border flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Secured by SSLCommerz · 256-bit SSL
            </div>
            <img
              src={SSL_LOGO_URL}
              alt="SSLCommerz accepted payment methods"
              className="max-w-full h-auto opacity-80"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
