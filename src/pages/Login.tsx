import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left — brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden"
        style={{ background: "linear-gradient(150deg, hsl(var(--primary)) 0%, hsl(142 60% 12%) 100%)" }}>
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -left-16 -bottom-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-3">
          <img src={logo} alt="Unite Foundation" className="h-10 w-10" />
          <div>
            <div className="font-extrabold leading-tight">Unite Foundation</div>
            <div className="text-xs text-white/70">Admin Console</div>
          </div>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight">
            স্বাগতম, <br />ইউনাইট ফাউন্ডেশন<br />অ্যাডমিন প্যানেলে
          </h1>
          <p className="text-white/80 max-w-md">
            দান, স্বেচ্ছাসেবক, প্রকল্প, ব্লগ ও সেটিংস — সব এক জায়গা থেকে নিরাপদে পরিচালনা করুন।
          </p>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <ShieldCheck className="h-4 w-4" />
            JWT‑নিরাপদ সংযোগ · এনক্রিপ্টেড সেশন
          </div>
        </div>
        <div className="relative text-xs text-white/60">© {new Date().getFullYear()} Unite Foundation</div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={logo} alt="" className="h-9 w-9" />
            <div className="font-extrabold">Unite Foundation</div>
          </div>

          <h2 className="text-2xl font-extrabold">লগইন করুন</h2>
          <p className="text-sm text-muted-foreground mt-1">
            ড্যাশবোর্ডে প্রবেশ করতে আপনার অ্যাডমিন তথ্য দিন।
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium">ইমেইল</label>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@unitefoundation.bd"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">পাসওয়ার্ড</label>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label="show password"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-border" defaultChecked />
                মনে রাখুন
              </label>
              <a href="#" className="text-primary font-medium hover:underline">পাসওয়ার্ড ভুলে গেছেন?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              লগইন করুন
            </button>

            <div className="mt-2 text-[11px] text-muted-foreground bg-muted/60 border border-border rounded-lg p-3">
              <div className="font-semibold text-foreground mb-0.5">ডেমো অ্যাক্সেস (ব্যাকএন্ড না থাকলে)</div>
              ইমেইল: <code>admin@unitefoundation.bd</code> · পাসওয়ার্ড: <code>admin123</code>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
