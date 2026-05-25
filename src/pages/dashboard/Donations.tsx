import { Download, Filter, Plus, Search } from "lucide-react";
import { Card, PageHeader, StatusBadge, Btn } from "@/components/dashboard/DashboardUI";
import { donations } from "@/data/dashboardMock";
import { useState } from "react";

const Donations = () => {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = donations.filter((d) =>
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
            <Btn variant="outline"><Download className="h-4 w-4" /> CSV ডাউনলোড</Btn>
            <Btn><Plus className="h-4 w-4" /> ম্যানুয়াল এন্ট্রি</Btn>
          </>
        }
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
