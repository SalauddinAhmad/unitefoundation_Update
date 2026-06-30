import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck, Loader2, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string })?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(email.trim(), password);
    if (res.ok) {
      toast.success(res.demo ? "ডেমো মোডে লগইন সফল" : "লগইন সফল");
      nav(from, { replace: true });
    } else {
      toast.error(res.message || "লগইন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, hsl(152 80% 30% / 0.55), transparent 60%), radial-gradient(900px 500px at 100% 110%, hsl(152 90% 18% / 0.7), transparent 55%), linear-gradient(135deg, #04140b 0%, #06251a 45%, #021a10 100%)",
      }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-teal-300/15 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-lime-200/10 blur-3xl" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        {/* Glow ring */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-emerald-300/60 via-white/10 to-emerald-500/40 opacity-70 blur-[2px]" />
        <div
          className="relative rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl p-7 sm:p-9"
          style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur border border-white/20 grid place-items-center shadow-inner">
                <img src={logo} alt="Unite Foundation" className="h-7 w-7" />
              </div>
              <div className="leading-tight">
                <div className="text-white font-extrabold">Unite Foundation</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/80">Admin Console</div>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-100/90 bg-white/10 border border-white/15 rounded-full px-2.5 py-1">
              <Sparkles className="h-3 w-3" /> Premium
            </span>
          </div>

          <div className="mt-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">স্বাগতম 👋</h1>
            <p className="mt-1.5 text-sm text-white/70">
              ড্যাশবোর্ডে প্রবেশ করতে অ্যাডমিন তথ্য দিন।
            </p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {/* Email */}
            <label className="block">
              <span className="text-xs font-semibold text-white/80">ইমেইল</span>
              <div className="mt-1.5 group relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 group-focus-within:text-emerald-200 transition-colors" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@unitefoundation.bd"
                  className="w-full h-12 pl-11 pr-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-emerald-300/60 focus:border-emerald-300/50 transition"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <span className="text-xs font-semibold text-white/80">পাসওয়ার্ড</span>
              <div className="mt-1.5 group relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 group-focus-within:text-emerald-200 transition-colors" />
                <input
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-11 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-emerald-300/60 focus:border-emerald-300/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white"
                  aria-label="toggle password"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-white/75 select-none cursor-pointer">
                <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-white/30 bg-white/10 accent-emerald-400" />
                মনে রাখুন
              </label>
              <a href="#" className="text-emerald-200 hover:text-white font-medium">
                পাসওয়ার্ড ভুলে গেছেন?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-12 rounded-xl font-bold text-sm text-emerald-950 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-transform active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #d1fae5 0%, #6ee7b7 50%, #34d399 100%)",
                boxShadow: "0 12px 30px -10px rgba(52,211,153,0.55), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                লগইন করুন
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-full transition-transform duration-700" />
            </button>

            <div className="flex items-center gap-2 text-[11px] text-white/70 justify-center pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              JWT‑সুরক্ষিত · এনক্রিপ্টেড সেশন
            </div>

            <div className="mt-2 rounded-xl border border-white/15 bg-white/5 backdrop-blur p-3 text-[11px] text-white/75">
              <div className="font-semibold text-white mb-0.5">ডেমো অ্যাক্সেস</div>
              ইমেইল: <code className="text-emerald-200">admin@unitefoundation.bd</code> · পাসওয়ার্ড:{" "}
              <code className="text-emerald-200">admin123</code>
            </div>
          </form>
        </div>

        <p className="relative mt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Unite Foundation · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Login;
