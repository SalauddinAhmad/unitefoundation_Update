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

// Match PremiumChannelsSection tokens
const CREAM = "#F5F0E0";
const CREAM_SOFT = "#FBF7EA";
const EMERALD_DEEP = "#0A2417";
const EMERALD = "#0F3D24";
const GOLD = "#C9A84C";

const Ornament = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="32" cy="32" r="28" />
    <path d="M32 4l6 22 22 6-22 6-6 22-6-22-22-6 22-6z" />
    <path d="M12 12l40 40M52 12L12 52" opacity="0.4" />
  </svg>
);

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

  const inputStyle = {
    backgroundColor: "#fff",
    border: `1px solid ${EMERALD_DEEP}22`,
    color: EMERALD_DEEP,
  } as React.CSSProperties;

  return (
    <section
      className="relative overflow-hidden isolate py-20 md:py-28"
      style={{ backgroundColor: CREAM }}
    >
      {/* Geometric background pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='%230A2417' stroke-width='0.8'><path d='M60 6l16 16 22 6-16 16 6 22-22-6-16 16-16-16-22 6 6-22-16-16 22-6z'/><circle cx='60' cy='60' r='14'/><circle cx='60' cy='60' r='28'/></g></svg>")`,
          backgroundSize: "160px 160px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}66, transparent)` }}
      />

      <div className="container-page relative">
        {/* Editorial header */}
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div
            className="inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.32em] uppercase mb-6"
            style={{ color: GOLD }}
          >
            <span className="h-px w-8" style={{ background: GOLD }} />
            অনলাইন পেমেন্ট
            <span className="h-px w-8" style={{ background: GOLD }} />
          </div>
          <h2
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
            style={{ color: EMERALD_DEEP }}
          >
            কার্ড / মোবাইল ব্যাংকিং-এ দান করুন
          </h2>
          <div className="flex justify-center my-6" style={{ color: GOLD }}>
            <Ornament className="h-8 w-8" />
          </div>
          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: `${EMERALD_DEEP}B3` }}
          >
            SSLCommerz-এর সুরক্ষিত গেটওয়ে দিয়ে মাত্র কয়েক মুহূর্তে আপনার দান পৌঁছে দিন।
          </p>
        </div>

        {/* Card */}
        <div
          className="relative mt-14 md:mt-20 max-w-3xl mx-auto rounded-3xl overflow-hidden"
          style={{
            backgroundColor: CREAM_SOFT,
            border: `1px solid ${EMERALD_DEEP}1A`,
            boxShadow: `0 1px 0 ${GOLD}44, 0 30px 60px -30px ${EMERALD_DEEP}66`,
          }}
        >
          {/* Corner ornaments */}
          {[
            "top-4 left-4 border-t border-l",
            "top-4 right-4 border-t border-r",
            "bottom-4 left-4 border-b border-l",
            "bottom-4 right-4 border-b border-r",
          ].map((c) => (
            <span
              key={c}
              className={`pointer-events-none absolute h-5 w-5 ${c}`}
              style={{ borderColor: `${GOLD}99` }}
            />
          ))}

          {/* Emerald header strip */}
          <div
            className="relative px-6 md:px-10 py-6 flex flex-wrap items-center justify-between gap-4"
            style={{
              backgroundColor: EMERALD_DEEP,
              borderBottom: `1px solid ${GOLD}55`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${GOLD}22`, border: `1px solid ${GOLD}66` }}
              >
                <ShieldCheck className="h-5 w-5" style={{ color: GOLD }} />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: GOLD }}>
                  Secured Gateway
                </div>
                <div className="text-sm font-semibold" style={{ color: CREAM }}>
                  SSLCommerz দ্বারা এনক্রিপ্টেড
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: `${CREAM}CC` }}>
              <Lock className="h-3.5 w-3.5" style={{ color: GOLD }} />
              256-bit SSL
            </div>
          </div>

          <form onSubmit={submit} className="p-6 md:p-10 space-y-7">
            {/* Amount presets */}
            <div>
              <div
                className="text-[10px] font-bold tracking-[0.24em] uppercase mb-3"
                style={{ color: `${EMERALD_DEEP}99` }}
              >
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
                      className="relative py-3 rounded-lg text-sm font-bold transition-all"
                      style={{
                        backgroundColor: active ? EMERALD_DEEP : "#fff",
                        color: active ? CREAM : EMERALD_DEEP,
                        border: `1px solid ${active ? GOLD : `${EMERALD_DEEP}22`}`,
                        boxShadow: active ? `0 0 0 3px ${GOLD}22` : "none",
                      }}
                    >
                      ৳{p.toLocaleString("bn-BD")}
                      {active && (
                        <CheckCircle2
                          className="absolute -top-1.5 -right-1.5 h-4 w-4"
                          style={{ color: GOLD, backgroundColor: EMERALD_DEEP, borderRadius: "50%" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <Label htmlFor="amount" className="text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: `${EMERALD_DEEP}99` }}>
                অথবা কাস্টম পরিমাণ (৳) *
              </Label>
              <div className="relative mt-1.5">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold"
                  style={{ color: GOLD }}
                >৳</span>
                <Input
                  id="amount" type="number" min={10} required value={form.amount}
                  onChange={set("amount")} placeholder="যেমন ১০০০"
                  className="pl-10 h-12 text-lg font-bold"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}66, transparent)` }} />

            {/* Donor info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: `${EMERALD_DEEP}99` }}>
                  নাম *
                </Label>
                <Input id="name" required value={form.name} onChange={set("name")} className="mt-1.5 h-11" style={inputStyle} />
              </div>
              <div>
                <Label htmlFor="phone" className="text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: `${EMERALD_DEEP}99` }}>
                  মোবাইল *
                </Label>
                <Input id="phone" required value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" className="mt-1.5 h-11" style={inputStyle} />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: `${EMERALD_DEEP}99` }}>
                ইমেইল *
              </Label>
              <Input id="email" type="email" required value={form.email} onChange={set("email")} className="mt-1.5 h-11" style={inputStyle} />
            </div>

            <div>
              <Label htmlFor="purpose" className="text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: `${EMERALD_DEEP}99` }}>
                উদ্দেশ্য (ঐচ্ছিক)
              </Label>
              <Input id="purpose" value={form.purpose} onChange={set("purpose")} placeholder="যেমন যাকাত, সাধারণ দান" className="mt-1.5 h-11" style={inputStyle} />
            </div>

            <div>
              <Label htmlFor="note" className="text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: `${EMERALD_DEEP}99` }}>
                নোট (ঐচ্ছিক)
              </Label>
              <Textarea id="note" rows={2} value={form.note} onChange={set("note")} className="mt-1.5" style={inputStyle} />
            </div>

            {/* Terms */}
            <label
              className="flex items-start gap-3 text-sm cursor-pointer rounded-lg p-4"
              style={{ backgroundColor: `${GOLD}12`, border: `1px solid ${GOLD}33` }}
            >
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
              <span style={{ color: `${EMERALD_DEEP}CC` }}>
                আমি{" "}
                <Link to="/terms-conditions" target="_blank" className="font-semibold underline" style={{ color: EMERALD }}>শর্তাবলী</Link>,{" "}
                <Link to="/refund-policy" target="_blank" className="font-semibold underline" style={{ color: EMERALD }}>রিফান্ড নীতি</Link> এবং{" "}
                <Link to="/privacy-policy" target="_blank" className="font-semibold underline" style={{ color: EMERALD }}>প্রাইভেসি পলিসি</Link>{" "}
                পড়ে সম্মত হয়েছি।
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-14 text-base font-bold tracking-wide rounded-xl transition-all hover:opacity-95"
              style={{
                backgroundColor: EMERALD_DEEP,
                color: CREAM,
                border: `1px solid ${GOLD}`,
                boxShadow: `0 10px 30px -10px ${EMERALD_DEEP}, inset 0 1px 0 ${GOLD}44`,
              }}
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> সংযোগ করা হচ্ছে…</>
              ) : (
                <><CreditCard className="h-5 w-5 mr-2" style={{ color: GOLD }} /> নিরাপদে পেমেন্ট করুন</>
              )}
            </Button>

            {/* Payment methods */}
            <div className="pt-2">
              <div
                className="text-center text-[10px] font-bold tracking-[0.24em] uppercase mb-3"
                style={{ color: `${EMERALD_DEEP}80` }}
              >
                গৃহীত পেমেন্ট মাধ্যম
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {METHODS.map((m) => (
                  <span
                    key={m}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded"
                    style={{
                      color: EMERALD_DEEP,
                      backgroundColor: "#fff",
                      border: `1px solid ${EMERALD_DEEP}1A`,
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-center" style={{ color: `${EMERALD_DEEP}88` }}>
              পরবর্তী ধাপে SSLCommerz-এর নিরাপদ পেমেন্ট পেজে যাবেন।
            </p>
          </form>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}66, transparent)` }}
      />
    </section>
  );
}
