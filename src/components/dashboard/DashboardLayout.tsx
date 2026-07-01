import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  HandCoins,
  Users2,
  HeartHandshake,
  FolderKanban,
  FileText,
  ImageIcon,
  Inbox,
  Briefcase,
  Settings,
  LogOut,
  HelpCircle,
  Search,
  Bell,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";

const menu = [
  { to: "/dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড", end: true },
  { to: "/dashboard/donations", icon: HandCoins, label: "দানসমূহ", badge: "নতুন" },
  { to: "/dashboard/volunteers", icon: Users2, label: "স্বেচ্ছাসেবক", badge: "১২" },
  { to: "/dashboard/members", icon: HeartHandshake, label: "সদস্যপদ" },
  { to: "/dashboard/projects", icon: FolderKanban, label: "প্রকল্প" },
  { to: "/dashboard/blog", icon: FileText, label: "ব্লগ ও কনটেন্ট" },
  { to: "/dashboard/gallery", icon: ImageIcon, label: "গ্যালারি" },
  { to: "/dashboard/messages", icon: Inbox, label: "মেসেজ", badge: "৪" },
  { to: "/dashboard/careers", icon: Briefcase, label: "ক্যারিয়ার" },
  { to: "/dashboard/team", icon: Users2, label: "আমাদের টিম" },
];

const generalMenu = [
  { to: "/dashboard/settings", icon: Settings, label: "সেটিংস" },
  { to: "/dashboard/help", icon: HelpCircle, label: "সাহায্য" },
];

const SidebarContent = ({ onNav, onLogout }: { onNav?: () => void; onLogout?: () => void }) => (
  <div className="flex h-full flex-col">
    {/* Logo */}
    <div className="px-6 pt-6 pb-8 flex items-center gap-3">
      <img src={logo} alt="Unite Foundation" className="h-9 w-9 object-contain" />
      <div>
        <div className="font-extrabold text-foreground leading-tight">Unite</div>
        <div className="text-[11px] text-muted-foreground -mt-0.5">Admin Console</div>
      </div>
    </div>

    {/* Menu */}
    <div className="flex-1 overflow-y-auto px-3">
      <div className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">
        মেনু
      </div>
      <nav className="space-y-1">
        {menu.map(({ to, icon: Icon, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNav}
            className={({ isActive }) =>
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " +
              (isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/70 hover:bg-secondary hover:text-foreground")
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span
                    className={
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full " +
                      (isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary")
                    }
                  >
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 mt-7 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        সাধারণ
      </div>
      <nav className="space-y-1">
        {generalMenu.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNav}
            className={({ isActive }) =>
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " +
              (isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-secondary hover:text-foreground")
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span>লগ আউট</span>
        </button>
      </nav>
    </div>

    {/* Promo / upgrade card */}
    <div className="m-4 mt-6 rounded-2xl p-5 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(155deg, hsl(var(--primary)) 0%, hsl(142 56% 14%) 100%)" }}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-8 h-20 w-20 rounded-full bg-white/5" />
      <div className="relative">
        <div className="text-sm font-bold leading-snug">মাসিক ইমপ্যাক্ট<br />রিপোর্ট প্রস্তুত</div>
        <div className="text-[11px] text-white/70 mt-1">PDF সহ ডাউনলোড করুন</div>
        <button className="mt-3 w-full rounded-lg bg-white text-primary text-xs font-bold py-2 hover:bg-white/90 transition-colors">
          ডাউনলোড
        </button>
      </div>
    </div>
  </div>
);

const Topbar = ({ onMenu, user, onLogout }: { onMenu: () => void; user: { name: string; email: string } | null; onLogout: () => void }) => {
  const location = useLocation();
  const current =
    [...menu, ...generalMenu].find((m) =>
      m.to === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(m.to),
    )?.label || "ড্যাশবোর্ড";

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
      <div className="flex items-center gap-3 px-4 md:px-8 h-[68px]">
        <button onClick={onMenu} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-secondary">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden md:block">
          <div className="text-[11px] text-muted-foreground">পেজ</div>
          <div className="text-sm font-bold">{current}</div>
        </div>
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="খুঁজুন — দান, দাতা, প্রকল্প, ব্লগ..."
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-secondary border border-transparent text-sm focus:bg-card focus:border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
              ⌘ K
            </kbd>
          </div>
        </div>
        <button className="relative p-2.5 rounded-xl bg-card border border-border hover:bg-secondary transition">
          <Mail className="h-4 w-4" />
        </button>
        <button className="relative p-2.5 rounded-xl bg-card border border-border hover:bg-secondary transition">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>
        <button
          onClick={onLogout}
          title="লগ আউট"
          className="flex items-center gap-2.5 pl-2 md:pl-3 ml-1 md:ml-2 md:border-l md:border-border hover:opacity-80 transition"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
            {(user?.name || "UF").slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden md:block leading-tight text-left">
            <div className="text-sm font-bold">{user?.name || "এডমিন"}</div>
            <div className="text-[11px] text-muted-foreground">{user?.email || "—"}</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const handleLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-[260px] bg-card border-r border-border z-40 flex-col">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed top-0 left-0 h-screen w-[280px] bg-card z-50 lg:hidden flex flex-col animate-in slide-in-from-left">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onNav={() => setOpen(false)} onLogout={handleLogout} />
          </aside>
        </>
      )}

      <div className="lg:ml-[260px]">
        <Topbar onMenu={() => setOpen(true)} user={user} onLogout={handleLogout} />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
