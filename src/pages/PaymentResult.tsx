import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Kind = "success" | "fail" | "cancel";

const CONFIG: Record<Kind, { icon: any; color: string; title: string; msg: string }> = {
  success: {
    icon: CheckCircle2,
    color: "text-green-600",
    title: "পেমেন্ট সফল হয়েছে",
    msg: "আপনার দানের জন্য আন্তরিক কৃতজ্ঞতা। রশিদ ইমেইলে পাঠানো হবে।",
  },
  fail: {
    icon: XCircle,
    color: "text-red-600",
    title: "পেমেন্ট ব্যর্থ হয়েছে",
    msg: "লেনদেন সম্পন্ন করা যায়নি। কোনো টাকা কাটা হলে ৭ কর্মদিবসের মধ্যে ফেরত পাবেন।",
  },
  cancel: {
    icon: AlertCircle,
    color: "text-amber-600",
    title: "পেমেন্ট বাতিল হয়েছে",
    msg: "আপনি লেনদেন বাতিল করেছেন। ইচ্ছা হলে আবার চেষ্টা করতে পারেন।",
  },
};

export default function PaymentResult({ kind }: { kind: Kind }) {
  const [sp] = useSearchParams();
  const tranId = sp.get("tran_id") || "";
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(!!tranId);

  useEffect(() => {
    if (!tranId) return;
    fetch(`${API_BASE_URL}/sslcommerz/status/${encodeURIComponent(tranId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setInfo)
      .finally(() => setLoading(false));
  }, [tranId]);

  const C = CONFIG[kind];
  const Icon = C.icon;

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full bg-card border rounded-2xl p-8 text-center shadow-sm">
          <Icon className={`h-16 w-16 mx-auto ${C.color}`} strokeWidth={1.5} />
          <h1 className="heading-display text-2xl mt-4">{C.title}</h1>
          <p className="text-muted-foreground mt-2">{C.msg}</p>

          {tranId && (
            <div className="mt-6 bg-muted/40 rounded-lg p-4 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ট্রানজেকশন আইডি</span>
                <span className="font-mono">{tranId}</span>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> যাচাই করা হচ্ছে…
                </div>
              ) : info ? (
                <>
                  <div className="flex justify-between mt-2">
                    <span className="text-muted-foreground">পরিমাণ</span>
                    <span>৳ {Number(info.amount).toLocaleString("bn-BD")}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-muted-foreground">অবস্থা</span>
                    <span className="uppercase">{info.status}</span>
                  </div>
                </>
              ) : null}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <Link to="/">হোমে ফিরুন</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/donate">{kind === "success" ? "আরও দান করুন" : "আবার চেষ্টা করুন"}</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
