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
  Building2,
  ScrollText,
  FormInput,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/favicon.svg";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABEL, type Permission } from "@/lib/permissions";
import { useMessages } from "@/hooks/api/useDashboardData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


type MenuItem = { to: string; icon: typeof LayoutDashboard; label: string; end?: boolean; badge?: string; perm: Permission };
type MenuGroup = { title: string; items: MenuItem[] };

const menuGroups: MenuGroup[] = [
  {
    title: "সংক্ষিপ্ত বিবরণ",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড", end: true, perm: "overview" },
    ],
  },
  {
    title: "অনুদান ও সদস্য",
    items: [
      { to: "/dashboard/donations", icon: HandCoins, label: "দানসমূহ", perm: "donations" },
      { to: "/dashboard/members", icon: HeartHandshake, label: "সদস্যপদ", perm: "members" },
      { to: "/dashboard/volunteers", icon: Users2, label: "স্বেচ্ছাসেবক", perm: "volunteers" },
      { to: "/dashboard/careers", icon: Briefcase, label: "প্রতিনিধি", perm: "careers" },
    ],
  },
  {
    title: "কনটেন্ট",
    items: [
      { to: "/dashboard/projects", icon: FolderKanban, label: "প্রকল্প", perm: "projects" },
      { to: "/dashboard/blog", icon: FileText, label: "ব্লগ ও কনটেন্ট", perm: "blog" },
      { to: "/dashboard/gallery", icon: ImageIcon, label: "গ্যালারি", perm: "gallery" },
    ],
  },
  {
    title: "যোগাযোগ",
    items: [
      { to: "/dashboard/messages", icon: Inbox, label: "মেসেজ", perm: "messages" },
      { to: "/dashboard/newsletter", icon: Mail, label: "নিউজলেটার", perm: "newsletter" },
      { to: "/dashboard/forms", icon: FormInput, label: "ফর্ম ম্যানেজার", perm: "forms" },
    ],
  },
  {
    title: "প্রতিষ্ঠান",
    items: [
      { to: "/dashboard/team", icon: Users2, label: "আমাদের টিম", perm: "team" },
      { to: "/dashboard/partners", icon: Building2, label: "আমাদের প্রতিষ্ঠান", perm: "partners" },
      { to: "/dashboard/logs", icon: ScrollText, label: "অ্যাক্টিভিটি লগ", perm: "logs" },
    ],
  },
];

const generalMenu: MenuItem[] = [
  { to: "/dashboard/settings", icon: Settings, label: "সেটিংস", perm: "settings" },
  { to: "/dashboard/help", icon: HelpCircle, label: "সাহায্য", perm: "help" },
];

const groupTitleClass =
  "px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80 leading-[1.6] py-0.5";

const itemClass = (isActive: boolean) =>
  "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium leading-[1.9] transition-colors " +
  (isActive
    ? "bg-primary text-primary-foreground shadow-sm"
    : "text-foreground/70 hover:bg-secondary hover:text-foreground");

const SidebarContent = ({ onNav, onLogout, can }: { onNav?: () => void; onLogout?: () => void; can: (p: Permission) => boolean }) => (
  <div className="flex h-full flex-col">
    {/* Logo */}
    <div className="px-6 pt-6 pb-8 flex items-center justify-center">
      <img src={logo} alt="Unite Foundation" className="h-16 w-auto object-contain" />
    </div>

    {/* Menu */}
    <div className="flex-1 overflow-y-auto px-3 pb-2">
      {menuGroups
        .map((g) => ({ ...g, items: g.items.filter((m) => can(m.perm)) }))
        .filter((g) => g.items.length > 0)
        .map((group, gi) => (
          <div key={group.title} className={gi === 0 ? "" : "mt-6"}>
            <div className={groupTitleClass}>{group.title}</div>
            <nav className="flex flex-col gap-1">
              {group.items.map(({ to, icon: Icon, label, end, badge }) => (
                <NavLink key={to} to={to} end={end} onClick={onNav} className={({ isActive }) => itemClass(isActive)}>
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
                      )}
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1 min-w-0 truncate text-left py-0.5">{label}</span>
                      {badge && (
                        <span
                          className={
                            "shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full " +
                            (isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary")
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
          </div>
        ))}

      <div className="mt-6 mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80 leading-[1.6] py-0.5">
        সাধারণ
      </div>
      <nav className="flex flex-col gap-1">
        {generalMenu.filter((m) => can(m.perm)).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onNav} className={({ isActive }) => itemClass(isActive)}>
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 min-w-0 truncate text-left py-0.5">{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium leading-[1.9] text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1 min-w-0 truncate text-left py-0.5">লগ আউট</span>
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
  const nav = useNavigate();
  const location = useLocation();
  const { data: messages } = useMessages();
  const msgList = (Array.isArray(messages) ? messages : []) as Array<{ id: string; name: string; subject: string; status: string }>;
  const unreadMsgs = msgList.filter((m) => m.status === "unread");
  const unreadCount = unreadMsgs.length;
  const notifications = [
    ...unreadMsgs.slice(0, 5).map((m) => ({
      title: `নতুন মেসেজ — ${m.name}`,
      desc: m.subject,
      to: "/dashboard/messages",
    })),
  ];
  const current =
    [...menuGroups.flatMap((g) => g.items), ...generalMenu].find((m) =>
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
        <button
          type="button"
          onClick={() => nav("/dashboard/messages")}
          title="মেসেজ"
          className="relative p-2.5 rounded-xl bg-card border border-border hover:bg-secondary transition"
        >
          <Mail className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center ring-2 ring-card">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title="নোটিফিকেশন"
              className="relative p-2.5 rounded-xl bg-card border border-border hover:bg-secondary transition outline-none"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>নোটিফিকেশন</span>
              {notifications.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {notifications.length}
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                নতুন কোনো নোটিফিকেশন নেই
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n, i) => (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => nav(n.to)}
                    className="cursor-pointer flex items-start gap-2 py-2.5"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{n.title}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{n.desc}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => nav("/dashboard/logs")} className="cursor-pointer justify-center text-xs font-semibold text-primary">
              সব অ্যাক্টিভিটি দেখুন
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title="আমার অ্যাকাউন্ট"
              className="flex items-center gap-2.5 pl-2 md:pl-3 ml-1 md:ml-2 md:border-l md:border-border hover:opacity-80 transition outline-none"
            >
              <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user?.name || "UF").slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="hidden md:block leading-tight text-left">
                <div className="text-sm font-bold">{user?.name || "এডমিন"}</div>
                <div className="text-[11px] text-muted-foreground">{user?.email || "—"}</div>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-3 py-2">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user?.name || "UF").slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-sm font-bold truncate">{user?.name || "এডমিন"}</div>
                <div className="text-[11px] text-muted-foreground truncate">{user?.email || "—"}</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => nav("/dashboard/profile")} className="cursor-pointer">
              <UserIcon className="h-4 w-4 mr-2" />
              আমার প্রোফাইল
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => nav("/dashboard/settings")} className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              অ্যাকাউন্ট সেটিংস
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              লগ আউট
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, can } = useAuth();
  const nav = useNavigate();
  const handleLogout = () => {
    logout();
    nav("/login", { replace: true });
  };


  return (
    <div className="min-h-screen bg-muted/40">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-[260px] bg-card border-r border-border z-40 flex-col">
        <SidebarContent onLogout={handleLogout} can={can} />
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
            <SidebarContent onNav={() => setOpen(false)} onLogout={handleLogout} can={can} />
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
