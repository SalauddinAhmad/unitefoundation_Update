import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import logoWhite from "@/assets/logo-white.svg";
import mosqueBg from "@/assets/footer-bg.svg";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ResetPassword = () => {
  const { token = "" } = useParams();
  const { resetPassword } = useAuth();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর");
    if (password !== confirm) return toast.error("পাসওয়ার্ড মিলছে না");
    setLoading(true);
    const res = await resetPassword(token, password);
    setLoading(false);
    if (res.ok) {
      setDone(true);
      toast.success("পাসওয়ার্ড পরিবর্তিত হয়েছে");
      setTimeout(() => nav("/login", { replace: true }), 1500);
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
          {done ? (
            <div className="text-center py-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-bangla text-xl font-extrabold">সম্পন্ন</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                পাসওয়ার্ড পরিবর্তিত হয়েছে। লগইন পেজে নিয়ে যাওয়া হচ্ছে...
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-bangla text-2xl font-extrabold text-foreground">
                নতুন পাসওয়ার্ড সেট করুন
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                নিরাপত্তার জন্য ৮+ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন।
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                {(["password", "confirm"] as const).map((field) => (
                  <label key={field} className="block">
                    <span className="text-[12px] font-semibold text-foreground/80">
                      {field === "password" ? "নতুন পাসওয়ার্ড" : "পাসওয়ার্ড নিশ্চিত করুন"}
                    </span>
                    <div className="mt-1.5 relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={show ? "text" : "password"}
                        required
                        value={field === "password" ? password : confirm}
                        onChange={(e) =>
                          field === "password" ? setPassword(e.target.value) : setConfirm(e.target.value)
                        }
                        placeholder="••••••••"
                        className="w-full h-12 pl-11 pr-11 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60"
                      />
                      {field === "password" && (
                        <button
                          type="button"
                          onClick={() => setShow((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                        >
                          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </label>
                ))}

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
                      <Loader2 className="h-4 w-4 animate-spin" /> সংরক্ষণ হচ্ছে...
                    </span>
                  ) : (
                    "পাসওয়ার্ড পরিবর্তন করুন"
                  )}
                </button>
              </form>

              <Link
                to="/login"
                className="mt-5 inline-block text-xs text-muted-foreground hover:text-foreground"
              >
                ← লগইনে ফিরে যান
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
