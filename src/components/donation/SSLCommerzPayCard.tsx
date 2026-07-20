import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { Link } from "react-router-dom";

const PRESETS = [100, 500, 1000, 2500, 5000, 10000];

export function SSLCommerzPayCard() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "" as string | number,
    purpose: "",
    note: "",
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
          name: form.name,
          email: form.email,
          phone: form.phone,
          amount: amt,
          purpose: form.purpose || "সাধারণ দান",
          note: form.note,
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.gatewayUrl) {
        throw new Error(j.message || "Gateway init failed");
      }
      window.location.href = j.gatewayUrl;
    } catch (err: any) {
      toast({ title: "পেমেন্ট শুরু করা যায়নি", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            <ShieldCheck className="h-4 w-4" /> SSLCommerz দ্বারা নিরাপদ
          </div>
          <h2 className="heading-display text-3xl mt-4">কার্ড / মোবাইল ব্যাংকিং-এ দান করুন</h2>
          <p className="text-muted-foreground mt-2">
            Visa · MasterCard · bKash · Nagad · Rocket · Internet Banking
          </p>
        </div>

        <form onSubmit={submit} className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setForm((f) => ({ ...f, amount: p }))}
                className={`py-2 rounded-lg border text-sm font-medium transition ${
                  Number(form.amount) === p ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/40"
                }`}
              >
                ৳ {p.toLocaleString("bn-BD")}
              </button>
            ))}
          </div>

          <div>
            <Label htmlFor="amount">পরিমাণ (৳) *</Label>
            <Input id="amount" type="number" min={10} required value={form.amount}
              onChange={set("amount")} placeholder="যেমন ১০০০" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">নাম *</Label>
              <Input id="name" required value={form.name} onChange={set("name")} />
            </div>
            <div>
              <Label htmlFor="phone">মোবাইল *</Label>
              <Input id="phone" required value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" />
            </div>
          </div>

          <div>
            <Label htmlFor="email">ইমেইল *</Label>
            <Input id="email" type="email" required value={form.email} onChange={set("email")} />
          </div>

          <div>
            <Label htmlFor="purpose">উদ্দেশ্য (ঐচ্ছিক)</Label>
            <Input id="purpose" value={form.purpose} onChange={set("purpose")} placeholder="যেমন যাকাত, সাধারণ দান" />
          </div>

          <div>
            <Label htmlFor="note">নোট (ঐচ্ছিক)</Label>
            <Textarea id="note" rows={2} value={form.note} onChange={set("note")} />
          </div>

          <label className="flex items-start gap-3 text-sm cursor-pointer">
            <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
            <span className="text-muted-foreground">
              আমি{" "}
              <Link to="/terms-conditions" target="_blank" className="text-primary underline">শর্তাবলী</Link>,{" "}
              <Link to="/refund-policy" target="_blank" className="text-primary underline">রিফান্ড নীতি</Link> এবং{" "}
              <Link to="/privacy-policy" target="_blank" className="text-primary underline">প্রাইভেসি পলিসি</Link>{" "}
              পড়ে সম্মত হয়েছি।
            </span>
          </label>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> সংযোগ করা হচ্ছে…</>
            ) : (
              <><CreditCard className="h-4 w-4 mr-2" /> নিরাপদে পেমেন্ট করুন</>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            পরবর্তী ধাপে SSLCommerz-এর নিরাপদ পেমেন্ট পেজে যাবেন।
          </p>
        </form>
      </div>
    </section>
  );
}
