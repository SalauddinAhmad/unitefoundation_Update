import { Card, PageHeader, StatusBadge } from "@/components/dashboard/DashboardUI";
import { messages } from "@/data/dashboardMock";
import { Search, Star, Archive, Reply, Trash2 } from "lucide-react";
import { useState } from "react";

const Messages = () => {
  const [selected, setSelected] = useState(messages[0].id);
  const active = messages.find((m) => m.id === selected) || messages[0];

  return (
    <>
      <PageHeader title="মেসেজ" subtitle="যোগাযোগ ফর্ম থেকে আসা সকল মেসেজ" />

      <Card pad={false} className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] min-h-[600px]">
          {/* List */}
          <div className="border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input placeholder="মেসেজ খুঁজুন" className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto divide-y divide-border">
              {messages.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => setSelected(m.id)}
                    className={
                      "w-full text-left p-4 transition-colors " +
                      (selected === m.id ? "bg-accent/60" : "hover:bg-muted/40")
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className={"text-sm truncate " + (m.status === "unread" ? "font-bold" : "font-semibold")}>{m.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{m.email}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{m.date}</span>
                    </div>
                    <div className={"text-sm mt-2 truncate " + (m.status === "unread" ? "font-semibold text-foreground" : "text-foreground/80")}>
                      {m.subject}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{m.preview}</div>
                    <div className="mt-2"><StatusBadge status={m.status} /></div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Detail */}
          <div className="flex flex-col">
            <div className="p-5 border-b border-border flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{active.subject}</h3>
                <div className="flex items-center gap-2 mt-1.5 text-sm">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {active.name.charAt(0)}
                  </div>
                  <span className="font-semibold">{active.name}</span>
                  <span className="text-muted-foreground text-xs">&lt;{active.email}&gt;</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Star className="h-4 w-4" /></button>
                <button className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Archive className="h-4 w-4" /></button>
                <button className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="p-6 flex-1 text-sm text-foreground/85 leading-relaxed">
              <p>আসসালামু আলাইকুম,</p>
              <p className="mt-3">{active.preview} {active.preview}</p>
              <p className="mt-3">দয়া করে আমাকে দ্রুত উত্তর দিন।</p>
              <p className="mt-6 text-foreground/70">— {active.name}</p>
            </div>
            <div className="p-5 border-t border-border">
              <div className="rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-primary/20">
                <textarea
                  rows={3}
                  placeholder="আপনার উত্তর লিখুন..."
                  className="w-full px-4 py-3 bg-transparent text-sm resize-none focus:outline-none"
                />
                <div className="flex items-center justify-end p-2 border-t border-border">
                  <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
                    <Reply className="h-4 w-4" /> উত্তর পাঠান
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default Messages;
