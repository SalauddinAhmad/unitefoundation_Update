import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck, Loader2, Eye, EyeOff, ArrowRight, Heart, Users, BookOpen, KeyRound, ArrowLeft } from "lucide-react";
import logoWhite from "@/assets/logo-white.svg";
import logo from "@/assets/logo.png";
import mosqueBg from "@/assets/footer-bg.svg";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const { login, verifyOtp, loading, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string })?.from || "/dashboard";

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [code, setCode] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const submitCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(email.trim(), password);
    if (!res.ok) {
      toast.error(res.message || "লগইন ব্যর্থ হয়েছে");
      return;
    }
    if (res.requiresOtp) {
      setStep("otp");
      setDemoOtp(res.demoOtp || null);
      toast.success("OTP পাঠানো হয়েছে আপনার ইমেইলে");
      return;
    }
    toast.success(res.demo ? "ডেমো মোডে লগইন সফল" : "লগইন সফল");
    nav(from, { replace: true });
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await verifyOtp(email.trim(), code.trim());
    if (res.ok) {
      toast.success("যাচাই সফল");
      nav(from, { replace: true });
    } else {
      toast.error(res.message || "OTP সঠিক নয়");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* LEFT — brand storytelling panel (desktop) */}
      <aside
        className="relative hidden lg:flex w-[46%] xl:w-[44%] flex-col justify-between p-12 xl:p-16 text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, hsl(152 100% 14%) 0%, hsl(152 100% 21%) 55%, hsl(150 80% 10%) 100%)",
        }}
      >
        <img src={mosqueBg} alt="" aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-[0.06] select-none" />
        <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)", backgroundSize: "22px 22px" }} />

        <div className="relative flex items-center gap-3">
          <img src={logoWhite} alt="Unite Foundation" className="h-11 w-auto" />
        </div>

        <div className="relative space-y-7">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/90 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Console
          </div>
          <h1 className="font-bangla text-4xl xl:text-[2.75rem] font-extrabold leading-[1.2]">
            ইনশাআল্লাহ,<br />
            আপনার সেবায়<br />
            <span className="text-emerald-200">ইউনাইট ফাউন্ডেশন</span>
          </h1>
          <p className="text-white/75 max-w-md leading-[1.85]">
            দান, স্বেচ্ছাসেবক, প্রকল্প, ব্লগ ও সেটিংস — একটি নিরাপদ ড্যাশবোর্ড থেকে সবকিছু পরিচালনা করুন।
          </p>
          <ul className="grid grid-cols-3 gap-3 pt-2 max-w-md">
            {[
              { icon: Heart, label: "দান ব্যবস্থাপনা" },
              { icon: Users, label: "স্বেচ্ছাসেবক" },
              { icon: BookOpen, label: "কন্টেন্ট" },
            ].map((f) => (
              <li key={f.label} className="rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur px-3 py-3 text-center">
                <f.icon className="h-4 w-4 mx-auto text-emerald-200" />
                <div className="mt-1.5 text-[11px] text-white/80 font-medium">{f.label}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative space-y-4">
          <figure className="border-l-2 border-emerald-300/60 pl-4 max-w-md">
            <blockquote className="font-bangla text-sm text-white/85 leading-[1.9] italic">
              "তোমাদের মধ্যে শ্রেষ্ঠ সেই, যে মানুষের কল্যাণে নিবেদিত।"
            </blockquote>
            <figcaption className="mt-1.5 text-[11px] text-white/55">— হাদীস</figcaption>
          </figure>
          <div className="text-[11px] text-white/45">
            © {new Date().getFullYear()} Unite Foundation · unitefoundation.bd
          </div>
        </div>
      </aside>

      {/* RIGHT — form */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="lg:hidden absolute inset-x-0 top-0 h-72 -z-0" style={{ background: "linear-gradient(160deg, hsl(152 100% 21%) 0%, hsl(150 80% 12%) 100%)" }}>
          <img src={mosqueBg} alt="" aria-hidden className="absolute bottom-0 w-full opacity-[0.07]" />
        </div>

        <div className="relative w-full max-w-[420px]">
          <div className="lg:hidden flex flex-col items-center text-center mb-6 pt-4">
            <img src={logoWhite} alt="Unite Foundation" className="h-12" />
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/75 font-semibold">Admin Console</p>
          </div>

          <div className="relative rounded-3xl border border-border bg-card shadow-[0_30px_80px_-30px_rgba(0,40,20,0.25)] p-7 sm:p-9">
            <div className="absolute -top-px left-8 right-8 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)/0.6), transparent)" }} />

            <div className="hidden lg:flex items-center gap-3 mb-1">
              <img src={logo} alt="" className="h-8 w-8" />
              <span className="text-sm font-bold text-foreground">Unite Foundation</span>
            </div>

            {step === "credentials" ? (
              <>
                <h2 className="font-bangla text-2xl sm:text-[1.75rem] font-extrabold text-foreground mt-2">স্বাগতম 👋</h2>
                <p className="text-sm text-muted-foreground mt-1.5">ড্যাশবোর্ডে প্রবেশ করতে অ্যাডমিন তথ্য দিন।</p>

                <form onSubmit={submitCreds} className="mt-7 space-y-4">
                  <label className="block">
                    <span className="text-[12px] font-semibold text-foreground/80">ইমেইল</span>
                    <div className="mt-1.5 group relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@unitefoundation.bd" className="w-full h-12 pl-11 pr-3 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition" />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-[12px] font-semibold text-foreground/80">পাসওয়ার্ড</span>
                    <div className="mt-1.5 group relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input type={show ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-12 pl-11 pr-11 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition" />
                      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground" aria-label="toggle password">
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </label>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-muted-foreground select-none cursor-pointer">
                      <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-input accent-primary" />
                      মনে রাখুন
                    </label>
                    <Link to="/forgot-password" className="text-primary hover:underline font-semibold">
                      পাসওয়ার্ড ভুলে গেছেন?
                    </Link>
                  </div>

                  <button type="submit" disabled={loading} className="group relative w-full h-12 rounded-xl font-bold text-sm text-primary-foreground overflow-hidden transition-transform active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, hsl(152 100% 21%) 0%, hsl(152 100% 16%) 100%)", boxShadow: "0 14px 30px -12px hsl(152 100% 21% / 0.55), inset 0 1px 0 rgba(255,255,255,0.12)" }}>
                    <span className="relative z-10 inline-flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      লগইন করুন
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                  </button>

                  <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    JWT‑সুরক্ষিত · এনক্রিপ্টেড সেশন
                  </div>

                </form>
              </>
            ) : (
              <>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bangla text-xl font-extrabold text-foreground">দ্বিতীয় ধাপ — OTP</h2>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">{email}</span> ঠিকানায় পাঠানো ৬-অঙ্কের কোড দিন।
                    </p>
                  </div>
                </div>

                <form onSubmit={submitOtp} className="mt-6 space-y-4">
                  <input
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full h-14 text-center text-2xl tracking-[0.6em] font-bold rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60"
                  />

                  {demoOtp && (
                    <div className="rounded-xl border border-dashed border-primary/30 bg-accent/40 p-3 text-[11px] text-center">
                      <span className="text-muted-foreground">ডেমো OTP:</span>{" "}
                      <code className="text-primary font-bold text-sm tracking-widest">{demoOtp}</code>
                    </div>
                  )}

                  <button type="submit" disabled={loading || code.length !== 6} className="w-full h-12 rounded-xl font-bold text-sm text-primary-foreground disabled:opacity-60" style={{ background: "linear-gradient(135deg, hsl(152 100% 21%) 0%, hsl(152 100% 16%) 100%)" }}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : "যাচাই ও প্রবেশ করুন"}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep("credentials"); setCode(""); setDemoOtp(null); }}
                    className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> পিছনে যান
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Unite Foundation · unitefoundation.bd
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
