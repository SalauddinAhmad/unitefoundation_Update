import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle, AlertCircle, Loader2, Download, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import { SiteLayout } from "@/components/layout/SiteLayout";

type Kind = "success" | "fail" | "cancel";

type Info = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  amount: number;
  currency?: string;
  status: string;
  method?: string;
  purpose?: string;
  transaction_id?: string;
  bank_tran_id?: string;
  card_type?: string;
  created_at?: string;
};

const bnDate = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("bn-BD", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
};

export default function PaymentResult({ kind }: { kind: Kind }) {
  const [sp] = useSearchParams();
  const tranId = sp.get("tran_id") || "";
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(!!tranId);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tranId) { setLoading(false); return; }
    fetch(`${API_BASE_URL}/sslcommerz/status/${encodeURIComponent(tranId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setInfo)
      .finally(() => setLoading(false));
  }, [tranId]);

  const printReceipt = () => {
    if (!tranId) { window.print(); return; }
    const url = `${API_BASE_URL}/sslcommerz/receipt/${encodeURIComponent(tranId)}?print=1`;
    const w = window.open(url, "_blank", "noopener,noreferrer");
    // Fallback if popup was blocked
    if (!w || w.closed || typeof w.closed === "undefined") {
      window.location.href = url;
    }
  };



  if (kind === "fail" || kind === "cancel") {
    const isFail = kind === "fail";
    return (
      <SiteLayout>
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full bg-card border rounded-2xl p-8 text-center shadow-sm">
            {isFail
              ? <XCircle className="h-16 w-16 mx-auto text-red-600" strokeWidth={1.5} />
              : <AlertCircle className="h-16 w-16 mx-auto text-amber-600" strokeWidth={1.5} />}
            <h1 className="heading-display text-2xl mt-4">
              {isFail ? "পেমেন্ট ব্যর্থ হয়েছে" : "পেমেন্ট বাতিল হয়েছে"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isFail
                ? "লেনদেন সম্পন্ন করা যায়নি। কোনো টাকা কাটা হলে ৭ কর্মদিবসের মধ্যে ফেরত পাবেন।"
                : "আপনি লেনদেন বাতিল করেছেন। ইচ্ছা হলে আবার চেষ্টা করতে পারেন।"}
            </p>
            {tranId && (
              <div className="mt-6 bg-muted/40 rounded-lg p-3 text-sm font-mono">{tranId}</div>
            )}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild><Link to="/donate"><RotateCcw className="h-4 w-4 mr-2" />আবার চেষ্টা করুন</Link></Button>
              <Button asChild variant="outline"><Link to="/"><Home className="h-4 w-4 mr-2" />হোমে ফিরুন</Link></Button>
            </div>
          </div>
        </main>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <main className="min-h-[70vh] px-4 py-12 md:py-16 bg-gradient-to-b from-emerald-50/40 to-background print:bg-white print:py-0">
        <div className="max-w-2xl mx-auto">
          <div
            ref={receiptRef}
            className="bg-card border rounded-3xl p-6 md:p-10 shadow-sm print:shadow-none print:border-0"
          >
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 heading-display">
                আল-হামদুলিল্লাহ!
              </h1>
              <p className="text-lg md:text-xl mt-3 text-foreground/90 leading-relaxed">
                আপনার অনুদানটি আমরা সফলভাবে গ্রহণ করেছি। <br className="hidden sm:block" />
                জাযাকাল্লাহু খাইরান!
              </p>
              <p className="text-sm md:text-base text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
                মহান আল্লাহ আপনার এই উত্তম দানকে কবুল করুন এবং আপনাকে দুনিয়া ও আখিরাতে সর্বোত্তম প্রতিদান দিন। আমীন!
              </p>
            </div>

            {loading ? (
              <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground py-8">
                <Loader2 className="h-5 w-5 animate-spin" /> যাচাই করা হচ্ছে…
              </div>
            ) : info ? (
              <div className="mt-8 border-2 border-dashed border-emerald-300 rounded-2xl p-5 md:p-6">
                <dl className="space-y-3 text-sm md:text-base">
                  <Row label="দাতার নাম" value={info.name} />
                  <Row label="মোবাইল / ইমেইল" value={info.email || info.phone} />
                  <Row
                    label="দানের পরিমাণ"
                    value={<span className="font-semibold text-emerald-700">৳ {Number(info.amount).toLocaleString("bn-BD")}</span>}
                  />
                  <Row
                    label="ট্রানজেকশন আইডি"
                    value={<span className="font-mono text-xs md:text-sm break-all">{info.id}</span>}
                  />
                  <Row label="মাধ্যম" value={info.method || "SSLCommerz"} />
                  {info.card_type && <Row label="কার্ড / চ্যানেল" value={info.card_type} />}
                  {info.bank_tran_id && (
                    <Row
                      label="ব্যাংক রেফারেন্স"
                      value={<span className="font-mono text-xs md:text-sm break-all">{info.bank_tran_id}</span>}
                    />
                  )}
                  <Row label="উদ্দেশ্য" value={info.purpose || "সাধারণ দান"} />
                  <Row label="তারিখ ও সময়" value={bnDate(info.created_at)} />
                </dl>
              </div>
            ) : tranId ? (
              <div className="mt-8 text-center text-muted-foreground text-sm">
                ট্রানজেকশন আইডি: <span className="font-mono">{tranId}</span>
              </div>
            ) : null}

            <div className="mt-8 flex justify-center print:hidden">
              <Button size="lg" onClick={printReceipt} className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="h-4 w-4 mr-2" /> রিসিট ডাউনলোড করুন
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center print:hidden">
            <Button asChild variant="outline"><Link to="/"><Home className="h-4 w-4 mr-2" />হোমে ফিরুন</Link></Button>
            <Button asChild variant="outline"><Link to="/donate">আরও দান করুন</Link></Button>
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[180px_1fr] gap-3 items-start">
      <dt className="text-muted-foreground">{label}:</dt>
      <dd className="text-foreground">{value || "—"}</dd>
    </div>
  );
}
