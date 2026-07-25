import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

const Subscribe = () => {
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  useEffect(() => {
    const pre = params.get("email");
    if (pre) setEmail(pre.trim());
  }, [params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error("সঠিক ইমেইল ঠিকানা দিন");
      return;
    }
    setState("sending");
    try {
      await api.post("/newsletter/subscribe", { email: v, source: "subscribe-page" });
      setState("done");
    } catch (err: unknown) {
      const anyE = err as { data?: { message?: string }; message?: string };
      toast.error(anyE?.data?.message || anyE?.message || "সাবস্ক্রাইব করা যায়নি");
      setState("idle");
    }
  };

  // Auto-submit when prefilled via ?email=
  useEffect(() => {
    const pre = params.get("email");
    if (pre && params.get("auto") === "1" && state === "idle" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pre)) {
      const t = setTimeout(() => {
        (document.getElementById("subscribe-form") as HTMLFormElement)?.requestSubmit();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [params, state]);

  return (
    <SiteLayout>
      <Seo
        title="নিউজলেটার সাবস্ক্রিপশন | ইউনাইট ফাউন্ডেশন"
        description="আমাদের সাম্প্রতিক কাজ, প্রকল্প ও দাওয়াতি কার্যক্রমের আপডেট সরাসরি আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।"
        canonical="/subscribe"
      />

      <section className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-muted/30 py-12 sm:py-20 px-4 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute -top-[10%] -right-[10%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-donate-highlight/15 to-primary/10 blur-3xl" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-primary/10 to-donate-highlight/15 blur-3xl" />
        </div>

        <div className="relative max-w-xl w-full bg-card rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-border p-8 sm:p-12 overflow-hidden group">
          {/* Subtle geometric accent */}
          <div className="absolute top-0 right-0 p-6 opacity-[0.06] group-hover:opacity-10 transition-opacity pointer-events-none" aria-hidden>
            <svg width="140" height="140" viewBox="0 0 100 100" fill="currentColor" className="text-primary">
              <path d="M50 0 L61.2 38.8 L100 50 L61.2 61.2 L50 100 L38.8 61.2 L0 50 L38.8 38.8 Z" />
            </svg>
          </div>

          {state !== "done" ? (
            <div className="relative flex flex-col items-center text-center space-y-6">
              {/* Single hero mark */}
              <div className="w-20 h-20 rounded-2xl gradient-donate-bg flex items-center justify-center shadow-lg shadow-primary/20">
                <Mail className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                  নিউজলেটার সাবস্ক্রিপশন
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
                  আমাদের সাম্প্রতিক কাজ, প্রকল্প ও দাওয়াতি কার্যক্রমের আপডেট সরাসরি আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।
                </p>
              </div>

              <form id="subscribe-form" onSubmit={submit} className="w-full space-y-4 pt-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={state === "sending"}
                    placeholder="আপনার ইমেইল ঠিকানা"
                    dir="ltr"
                    className="w-full px-6 py-4 pr-12 rounded-2xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-background transition-all text-base sm:text-lg disabled:opacity-60"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                </div>

                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="w-full py-4 rounded-2xl gradient-donate-bg text-white font-semibold text-lg sm:text-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0 inline-flex items-center justify-center gap-2"
                >
                  {state === "sending" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> পাঠানো হচ্ছে…</>
                  ) : (
                    "সাবস্ক্রাইব করুন"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="relative flex flex-col items-center text-center space-y-5 py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" strokeWidth={1.8} />
              </div>
              <h2 className="text-3xl font-bold text-foreground">জাযাকাল্লাহু খাইরান!</h2>
              <p className="text-muted-foreground max-w-sm">
                সফলভাবে সাবস্ক্রাইব করা হয়েছে। একটি নিশ্চিতকরণ ইমেইল আপনার ইনবক্সে পাঠানো হয়েছে ইন শা আল্লাহ।
              </p>
              <Link
                to="/"
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
              >
                হোমপেজে ফিরে যান
              </Link>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Subscribe;
