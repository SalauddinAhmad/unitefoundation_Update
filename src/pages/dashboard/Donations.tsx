import { Download, Filter, Plus, Search } from "lucide-react";
import { Card, PageHeader, StatusBadge, Btn } from "@/components/dashboard/DashboardUI";
import type { Donation } from "@/data/dashboardMock";
import { useDonations } from "@/hooks/api/useDashboardData";
import { useState } from "react";
import { exportRowsAsCsv } from "@/lib/csv";
import { toast } from "sonner";
import { ManualEntryDialog } from "@/components/dashboard/ManualEntryDialog";
import { appendExtra, EXTRAS } from "@/lib/localExtras";

const Donations = () => {
  const { data = [], isLoading } = useDonations();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [entryOpen, setEntryOpen] = useState(false);
  const filtered = (data as Donation[]).filter((d) =>
    (status === "all" || d.status === status) &&
    (q === "" || d.name.includes(q) || d.id.toLowerCase().includes(q.toLowerCase()) || d.phone.includes(q))
  );
  const total = filtered.reduce((s, d) => s + (d.status === "completed" ? d.amount : 0), 0);

  return (
    <>
      <PageHeader
        title="দানসমূহ"
        subtitle="সকল ট্রানজেকশন, রসিদ ও স্ট্যাটাস ম্যানেজ করুন"
        actions={
          <>
            <Btn variant="outline" onClick={() => {
              if (!filtered.length) { toast.error("এক্সপোর্টের জন্য কোনো রেকর্ড নেই"); return; }
              exportRowsAsCsv(`দানসমূহ-${new Date().toISOString().slice(0,10)}.csv`, filtered, [
                { header: "ট্রানজেকশন ID", accessor: (r) => r.id },
                { header: "নাম", accessor: (r) => r.name },
                { header: "ফোন", accessor: (r) => r.phone },
                { header: "পরিমাণ (৳)", accessor: (r) => r.amount },
                { header: "মাধ্যম", accessor: (r) => r.method },
                { header: "ক্ষেত্র", accessor: (r) => r.area },
                { header: "তারিখ", accessor: (r) => r.date },
                { header: "স্ট্যাটাস", accessor: (r) => r.status === "completed" ? "সম্পন্ন" : r.status === "pending" ? "অপেক্ষমাণ" : "ব্যর্থ" },
              ]);
              toast.success(`${filtered.length}টি রেকর্ড এক্সপোর্ট করা হয়েছে`);
            }}><Download className="h-4 w-4" /> CSV ডাউনলোড</Btn>
            <Btn onClick={() => setEntryOpen(true)}><Plus className="h-4 w-4" /> ম্যানুয়াল এন্ট্রি</Btn>
          </>
        }
      />

      <ManualEntryDialog
        open={entryOpen}
        onOpenChange={setEntryOpen}
        title="নতুন দান যোগ করুন"
        description="অফলাইনে সংগৃহীত বা ব্যাংক থেকে সরাসরি প্রাপ্ত দান রেকর্ড করুন।"
        fields={[
          { name: "name", label: "দাতার নাম", required: true, half: true, placeholder: "যেমন: আব্দুর রহমান" },
          { name: "phone", label: "মোবাইল নম্বর", required: true, half: true, placeholder: "01XXXXXXXXX" },
          { name: "amount", label: "পরিমাণ (৳)", type: "number", required: true, half: true, placeholder: "5000" },
          { name: "method", label: "মাধ্যম", type: "select", required: true, half: true, options: [
            { value: "bKash", label: "bKash" },
            { value: "Nagad", label: "Nagad" },
            { value: "Rocket", label: "Rocket" },
            { value: "ব্যাংক", label: "ব্যাংক ট্রান্সফার" },
            { value: "নগদ", label: "নগদ (হাতে হাতে)" },
            { value: "কার্ড", label: "কার্ড / SSLCommerz" },
          ]},
          { name: "area", label: "দানের ক্ষেত্র", type: "select", required: true, half: true, options: [
            { value: "এতিম শিশু", label: "এতিম শিশু" },
            { value: "শিক্ষা", label: "শিক্ষা" },
            { value: "মসজিদ নির্মাণ", label: "মসজিদ নির্মাণ" },
            { value: "খাদ্য সহায়তা", label: "খাদ্য সহায়তা" },
            { value: "চিকিৎসা", label: "চিকিৎসা" },
            { value: "যেখানে প্রয়োজন", label: "যেখানে প্রয়োজন" },
          ]},
          { name: "date", label: "তারিখ", type: "date", required: true, half: true,
            defaultValue: new Date().toISOString().slice(0, 10) },
          { name: "status", label: "স্ট্যাটাস", type: "select", required: true, half: true, defaultValue: "completed", options: [
            { value: "completed", label: "সম্পন্ন" },
            { value: "pending", label: "অপেক্ষমাণ" },
            { value: "failed", label: "ব্যর্থ" },
          ]},
          { name: "note", label: "নোট (ঐচ্ছিক)", type: "textarea", placeholder: "যেমন: ট্রানজেকশন রেফারেন্স, রসিদ নং ইত্যাদি" },
        ]}
        onSubmit={(v) => {
          const entry: Donation = {
            id: `TXN-M${Date.now().toString().slice(-6)}`,
            name: v.name,
            phone: v.phone,
            amount: Number(v.amount) || 0,
            method: v.method,
            area: v.area,
            date: v.date,
            status: v.status as Donation["status"],
          };
          appendExtra<Donation>(EXTRAS.donations, entry);
        }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-xs text-muted-foreground font-medium">আজকের দান</div>
          <div className="text-2xl font-extrabold mt-2">৳ ৮৯,০০০</div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground font-medium">এই মাসে</div>
          <div className="text-2xl font-extrabold mt-2">৳ ১৮.৪L</div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground font-medium">অপেক্ষমাণ</div>
          <div className="text-2xl font-extrabold mt-2 text-amber-600">৳ ২৫,০০০</div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground font-medium">গড় দান</div>
          <div className="text-2xl font-extrabold mt-2">৳ ৩,৮৫০</div>
        </Card>
      </div>

      <Card pad={false}>
        <div className="p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between border-b border-border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="নাম, ট্রানজেকশন ID বা ফোন দিয়ে খুঁজুন"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {["all", "completed", "pending", "failed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors " +
                  (status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70 hover:bg-accent")
                }
              >
                {s === "all" ? "সব" : s === "completed" ? "সম্পন্ন" : s === "pending" ? "অপেক্ষমাণ" : "ব্যর্থ"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                <th className="font-semibold px-5 py-3">ট্রানজেকশন</th>
                <th className="font-semibold py-3">দাতা</th>
                <th className="font-semibold py-3">পরিমাণ</th>
                <th className="font-semibold py-3">মাধ্যম</th>
                <th className="font-semibold py-3">ক্ষেত্র</th>
                <th className="font-semibold py-3">তারিখ</th>
                <th className="font-semibold py-3 pr-5">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">লোড হচ্ছে...</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">কোনো রেকর্ড পাওয়া যায়নি</td></tr>
              )}
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-foreground/70">{d.id}</td>
                  <td className="py-3">
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.phone}</div>
                  </td>
                  <td className="py-3 font-bold tabular-nums">৳ {d.amount.toLocaleString()}</td>
                  <td className="py-3 text-foreground/80">{d.method}</td>
                  <td className="py-3 text-foreground/80">{d.area}</td>
                  <td className="py-3 text-foreground/70 text-xs">{d.date}</td>
                  <td className="py-3 pr-5"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/40">
                <td colSpan={2} className="px-5 py-3 text-xs font-bold uppercase text-muted-foreground">সম্পন্ন দান মোট</td>
                <td className="py-3 font-extrabold text-primary tabular-nums">৳ {total.toLocaleString()}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </>
  );
};

export default Donations;
