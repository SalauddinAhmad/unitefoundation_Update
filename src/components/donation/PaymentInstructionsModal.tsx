import { CheckCircle2, Copy, MessageCircle, X } from "lucide-react";
import { site } from "@/data/site";
import { toBnNum } from "@/data/projects";
import { toast } from "@/hooks/use-toast";
import { usePaymentsData } from "@/hooks/usePaymentsData";


interface Props {
  open: boolean;
  onClose: () => void;
  amount: number;
  projectTitle: string;
  donorName: string;
  donorPhone: string;
}

export const PaymentInstructionsModal = ({ open, onClose, amount, projectTitle, donorName, donorPhone }: Props) => {
  const payments = usePaymentsData();
  if (!open) return null;

  const message = `আসসালামু আলাইকুম। আমি ${donorName} (${donorPhone}) "${projectTitle}" প্রকল্পে ৳${toBnNum(amount)} দান করতে চাই। অনুগ্রহ করে পেমেন্ট নিশ্চিত করুন।`;
  const waUrl = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "কপি হয়েছে", description: `${label} কপি করা হয়েছে।` });
  };


  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 p-4 animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pay-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-card rounded-card max-h-[90vh] overflow-y-auto shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 id="pay-title" className="font-bold text-foreground">পেমেন্টের নির্দেশনা</h2>
              <p className="text-xs text-muted-foreground">নিচের যেকোনো মাধ্যমে পেমেন্ট সম্পন্ন করুন</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="বন্ধ করুন" className="p-2 rounded-btn hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-4">
          <div className="rounded-card gradient-donate-bg p-5 text-white">
            <div className="text-sm opacity-90">আপনার দানের পরিমাণ</div>
            <div className="text-3xl font-extrabold mt-1">৳{toBnNum(new Intl.NumberFormat("en-IN").format(amount))}</div>
            <div className="text-sm opacity-90 mt-1 line-clamp-1">{projectTitle}</div>
          </div>

          {/* bKash */}
          <PaymentRow
            label="bKash (পার্সোনাল)"
            number={payments.mobiles.bkash}
            note={`Send Money → "${payments.mobiles.bkash}" → Reference: আপনার মোবাইল`}
            color="bg-pink-50 text-pink-700"
            onCopy={copy}
          />
          <PaymentRow
            label="Nagad (পার্সোনাল)"
            number={payments.mobiles.nagad}
            note="Send Money অপশন ব্যবহার করুন"
            color="bg-orange-50 text-orange-700"
            onCopy={copy}
          />
          <PaymentRow
            label="Rocket"
            number={payments.mobiles.rocket}
            note="Send Money অপশন ব্যবহার করুন"
            color="bg-purple-50 text-purple-700"
            onCopy={copy}
          />

          {/* QR */}
          {payments.qrImage && (
            <div className="rounded-card border border-border p-4 flex items-center gap-4">
              <img src={payments.qrImage} alt="Bangla QR" className="h-24 w-24 object-contain rounded-md border border-border bg-white" />
              <div className="min-w-0">
                <div className="font-bold text-foreground">Bangla QR স্ক্যান</div>
                <p className="text-xs text-muted-foreground mt-1">
                  যেকোনো MFS অ্যাপ (bKash, Nagad, Rocket, Bank App) থেকে QR স্ক্যান করে দান করুন।
                </p>
              </div>
            </div>
          )}

          {/* Banks */}
          {payments.banks.map((bank, i) => (
            <div key={i} className="rounded-card border border-border p-4">
              <div className="font-bold text-foreground">ব্যাংক ট্রান্সফার · {bank.bank}</div>
              <dl className="mt-2 grid grid-cols-3 gap-y-1.5 text-sm">
                <dt className="text-muted-foreground">শাখা</dt>
                <dd className="col-span-2 font-medium">{bank.branch}</dd>
                <dt className="text-muted-foreground">A/C নাম</dt>
                <dd className="col-span-2 font-medium">{bank.account}</dd>
                <dt className="text-muted-foreground">A/C নং</dt>
                <dd className="col-span-2 font-mono font-medium flex items-center gap-2">
                  <span dir="ltr">{bank.number}</span>
                  <button onClick={() => copy(bank.number, "অ্যাকাউন্ট নম্বর")} className="text-primary hover:bg-accent p-1 rounded"><Copy className="h-3.5 w-3.5" /></button>
                </dd>
                {bank.routing && (<>
                  <dt className="text-muted-foreground">Routing</dt>
                  <dd className="col-span-2 font-mono font-medium" dir="ltr">{bank.routing}</dd>
                </>)}
                {bank.swift && (<>
                  <dt className="text-muted-foreground">SWIFT</dt>
                  <dd className="col-span-2 font-mono font-medium" dir="ltr">{bank.swift}</dd>
                </>)}
              </dl>
            </div>
          ))}


          <div className="rounded-card bg-accent/60 border border-primary/20 p-4">
            <p className="text-sm text-foreground">
              <strong>পরবর্তী ধাপ:</strong> পেমেন্ট সম্পন্ন করার পর WhatsApp-এ আমাদের জানান —
              আপনার দান ২৪ ঘন্টার মধ্যে নিশ্চিত করা হবে এবং একটি রসিদ পাঠানো হবে।
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-btn bg-[#25D366] hover:bg-[#1FBE5B] text-white font-semibold py-3 transition-colors"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp-এ নিশ্চিত করুন
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentRow = ({ label, number, note, color, onCopy }: { label: string; number: string; note: string; color: string; onCopy: (t: string, l: string) => void }) => (
  <div className="rounded-card border border-border p-4 flex items-center justify-between gap-3">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{label}</span>
      </div>
      <div className="font-mono font-bold text-foreground mt-1.5" dir="ltr">{number}</div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{note}</p>
    </div>
    <button onClick={() => onCopy(number, label)} className="p-2.5 rounded-btn hover:bg-accent text-primary shrink-0" aria-label={`${label} নম্বর কপি করুন`}>
      <Copy className="h-4 w-4" />
    </button>
  </div>
);
