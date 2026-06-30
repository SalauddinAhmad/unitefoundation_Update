import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import logoWhite from "@/assets/logo-white.svg";
import mosqueBg from "@/assets/footer-bg.svg";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLink, setDemoLink] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await forgotPassword(email.trim());
    setLoading(false);
    if (res.ok) {
      setSent(true);
      if (res.demo && res.demoLink) setDemoLink(res.demoLink);
      toast.success("ইমেইল পাঠানো হয়েছে");
    } else {
      toast.error(res.message || "ব্যর্থ");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(160deg, hsl(152 100% 14%) 0%, hsl(152 100% 21%) 60%, hsl(150 80% 10%) 100%)",
        }}
      />
      <img src={mosqueBg} alt="" aria-hidden className="absolute inset-x-0 bottom-0 w-full opacity-[0.06] -z-10" />

      <div className="w-full max-w-[440px]">
        <div className="flex flex-col items-center mb-6">
          <img src={logoWhite} alt="Unite Foundation" className="h-11" />
        </div>

        <div className="rounded-3xl bg-card border border-border shadow-[0_30px_80px_-30px_rgba(0,40,20,0.4)] p-7 sm:p-9">
          {!sent ? (
            <>
              <h2 className="font-bangla text-2xl font-extrabold text-foreground">
                পাসওয়ার্ড ভুলে গেছেন?
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                আপনার রেজিস্টার্ড ইমেইল দিন — আমরা একটি রিসেট লিংক পাঠাব।
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-[12px] font-semibold text-foreground/80">ইমেইল</span>
                  <div className="mt-1.5 relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@unitefoundation.bd"
                      className="w-full h-12 pl-11 pr-3 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-bold text-sm text-primary-foreground disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(152 100% 21%) 0%, hsl(152 100% 16%) 100%)",
                  }}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> পাঠানো হচ্ছে...
                    </span>
                  ) : (
                    "রিসেট লিংক পাঠান"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-bangla text-xl font-extrabold">ইমেইল পাঠানো হয়েছে</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{email}</span> ঠিকানায় রিসেট
                লিংক পাঠানো হয়েছে। ইনবক্স ও স্প্যাম ফোল্ডার চেক করুন।
              </p>
              {demoLink && (
                <div className="mt-4 rounded-xl border border-dashed border-primary/30 bg-accent/40 p-3 text-[11px]">
                  <div className="font-semibold mb-1">ডেমো মোড — সরাসরি লিংক:</div>
                  <Link to={demoLink} className="text-primary font-mono underline break-all">
                    {demoLink}
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> লগইনে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
