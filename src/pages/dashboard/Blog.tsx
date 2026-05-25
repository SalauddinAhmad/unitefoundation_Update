import { Card, PageHeader, StatusBadge, Btn } from "@/components/dashboard/DashboardUI";
import { posts } from "@/data/dashboardMock";
import { Plus, Edit3, Eye, Trash2, Search } from "lucide-react";

const Blog = () => (
  <>
    <PageHeader
      title="ব্লগ ও কনটেন্ট"
      subtitle="ব্লগ পোস্ট, লেখক ও ক্যাটাগরি ম্যানেজ করুন"
      actions={<Btn><Plus className="h-4 w-4" /> নতুন পোস্ট</Btn>}
    />

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card><div className="text-xs text-muted-foreground font-medium">মোট পোস্ট</div><div className="text-2xl font-extrabold mt-2">৩৮</div></Card>
      <Card><div className="text-xs text-muted-foreground font-medium">এই মাসে ভিউ</div><div className="text-2xl font-extrabold mt-2">৪৮,২৪০</div></Card>
      <Card><div className="text-xs text-muted-foreground font-medium">ড্রাফট</div><div className="text-2xl font-extrabold mt-2">৫</div></Card>
      <Card><div className="text-xs text-muted-foreground font-medium">সময়সূচি</div><div className="text-2xl font-extrabold mt-2">২</div></Card>
    </div>

    <Card pad={false}>
      <div className="p-4 border-b border-border">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="শিরোনাম বা লেখক দিয়ে খুঁজুন" className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
              <th className="font-semibold px-5 py-3">শিরোনাম</th>
              <th className="font-semibold py-3">লেখক</th>
              <th className="font-semibold py-3">ক্যাটাগরি</th>
              <th className="font-semibold py-3">ভিউ</th>
              <th className="font-semibold py-3">তারিখ</th>
              <th className="font-semibold py-3">স্ট্যাটাস</th>
              <th className="font-semibold py-3 pr-5 text-right">কর্ম</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                <td className="px-5 py-3 font-semibold max-w-md truncate">{p.title}</td>
                <td className="py-3 text-foreground/80">{p.author}</td>
                <td className="py-3"><span className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-semibold">{p.category}</span></td>
                <td className="py-3 font-bold tabular-nums">{p.views.toLocaleString()}</td>
                <td className="py-3 text-foreground/70 text-xs">{p.date}</td>
                <td className="py-3"><StatusBadge status={p.status} /></td>
                <td className="py-3 pr-5">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Eye className="h-4 w-4" /></button>
                    <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit3 className="h-4 w-4" /></button>
                    <button className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </>
);

export default Blog;
