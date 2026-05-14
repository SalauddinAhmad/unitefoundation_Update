import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { z } from "zod";
import { projects, toBnNum } from "@/data/projects";
import { toast } from "@/hooks/use-toast";

const presets = [500, 1000, 2500, 5000, 10000];

const schema = z.object({
  project: z.string().min(1, "প্রকল্প নির্বাচন করুন"),
  amount: z.number().min(50, "ন্যূনতম ৫০ টাকা").max(10000000),
  name: z.string().trim().min(2, "নাম লিখুন").max(80),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন"),
});

export const QuickDonate = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState(projects[0].slug);
  const [amount, setAmount] = useState<number>(1000);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = custom ? Number(custom) : amount;
    const result = schema.safeParse({ project, amount: finalAmount, name, phone });
    if (!result.success) {
      toast({ title: "তথ্য যাচাই করুন", description: result.error.issues[0]?.message, variant: "destructive" });
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
          <h2 className="heading-display text-donate-highlight-foreground">
            ৩০ সেকেন্ডে দান করুন — পরিবর্তন শুরু হোক এখনই
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-donate-highlight-foreground/80 max-w-lg">
            আপনার পছন্দের প্রকল্পে সরাসরি দান করুন। প্রতিটি টাকার পূর্ণ হিসাব আপনি পাবেন
            ই-মেইল ও SMS-এ।
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-donate-highlight-foreground">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />১০০% সুরক্ষিত</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />স্বচ্ছ হিসাব</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />সরাসরি প্রভাব</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="bg-card rounded-card p-6 md:p-8 shadow-card-hover">
          <label className="block text-sm font-semibold text-foreground mb-2">প্রকল্প নির্বাচন করুন</label>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full rounded-btn border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.slug}>{p.title}</option>
            ))}
          </select>

          <label className="block text-sm font-semibold text-foreground mt-5 mb-2">দানের পরিমাণ (৳)</label>
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
                  ৳{toBnNum(p)}
                </button>
              );
            })}
          </div>
          <input
            type="number"
            min={50}
            placeholder="বা কাস্টম পরিমাণ লিখুন"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="mt-3 w-full rounded-btn border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <input
              required
              maxLength={80}
              placeholder="আপনার নাম"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-btn border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              required
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="মোবাইল নম্বর"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="rounded-btn border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button type="submit" className="btn-donate w-full mt-6 text-base">
            <Heart className="h-5 w-5" /> এগিয়ে যান
          </button>
        </form>
      </div>
    </section>
  );
};
