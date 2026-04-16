"use client";

import { useState, useEffect, useRef, createContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Car, LogOut, Users, DollarSign, MapPin,
  Activity, Moon, Sun, Bell, PanelLeftClose, PanelLeft,
  TrendingUp, ClipboardList, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────
type MenuLink = { name: string; href: string; icon: React.ReactNode };
type UserSession = { id: string; name: string; role: string; username: string } | null;
type Notification = { id: string; aksi: string; timestamp: string; user: { name: string; role: string } };

// ─── Sidebar Context ─────────────────────────────────────────
const SidebarContext = createContext({ collapsed: false, toggle: () => {} });

// ─── Main Layout Export ──────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [hasNew, setHasNew] = useState(true);
  const [areaStats, setAreaStats] = useState<{kapasitas: number, terisi: number} | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { 
      if (d.user) {
        setUser(d.user); 
        if (d.user.role === "PETUGAS") {
          fetch("/api/petugas/area").then(res => res.json()).then(stats => {
            if (stats && stats.max_kapasitas !== undefined) {
              setAreaStats({ kapasitas: stats.max_kapasitas, terisi: stats.terisi });
            }
          });
        }
      } else router.push("/login"); 
    }).catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Close notif dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", !dark ? "dark" : "light");
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Berhasil logout");
    setTimeout(() => {
      router.push("/login");
    }, 1200);
  };

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch {
      // silently fail
    }
    setNotifLoading(false);
  };

  const toggleNotif = () => {
    if (!notifOpen) {
      fetchNotifications();
      setHasNew(false);
    }
    setNotifOpen(!notifOpen);
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  const menuAdmin: MenuLink[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Manajemen User", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { name: "Data Kendaraan", href: "/admin/kendaraan", icon: <Car className="w-5 h-5" /> },
    { name: "Tarif Parkir", href: "/admin/tarif", icon: <DollarSign className="w-5 h-5" /> },
    { name: "Area Parkir", href: "/admin/area", icon: <MapPin className="w-5 h-5" /> },
    { name: "Log Aktivitas", href: "/admin/log", icon: <Activity className="w-5 h-5" /> },
  ];
  const menuPetugas: MenuLink[] = [
    { name: "Terminal", href: "/petugas/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Kendaraan Masuk", href: "/petugas/masuk", icon: <Car className="w-5 h-5" /> },
    { name: "Keluar & Bayar", href: "/petugas/keluar", icon: <ClipboardList className="w-5 h-5" /> },
  ];
  const menuOwner: MenuLink[] = [
    { name: "Dashboard", href: "/owner/dashboard", icon: <TrendingUp className="w-5 h-5" /> },
    { name: "Rekap Transaksi", href: "/owner/laporan", icon: <DollarSign className="w-5 h-5" /> },
  ];

  const menus = user?.role === "ADMIN" ? menuAdmin : user?.role === "PETUGAS" ? menuPetugas : menuOwner;

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Memuat...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed(!collapsed) }}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* ─── SIDEBAR ────────────────────────────── */}
        <motion.aside
          animate={{ width: collapsed ? 72 : 260 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative flex flex-col h-full border-r border-border bg-card z-30"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
            <div className="w-9 h-9 rounded-xl gradient-indigo flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <span className="font-bold text-lg text-foreground whitespace-nowrap">SmartPark</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {menus.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <motion.a
                  key={item.href}
                  href={item.href}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }
                  `}
                  title={collapsed ? item.name : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="whitespace-nowrap overflow-hidden">
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.a>
              );
            })}
          </nav>

          {/* Collapse toggle */}
          <div className="border-t border-border p-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
            >
              {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              <AnimatePresence>
                {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Tutup</motion.span>}
              </AnimatePresence>
            </button>
          </div>
        </motion.aside>

        {/* ─── MAIN CONTENT ───────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
            <div>
              <h2 className="text-sm font-semibold text-foreground capitalize">{user.role.toLowerCase()} Panel</h2>
            </div>
            <div className="flex items-center gap-4">
              
              {/* Petugas Capacity Bar */}
              {user.role === "PETUGAS" && areaStats && (
                <div className="hidden sm:flex flex-col items-end border-r border-border pr-5 mr-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Kapasitas Area</div>
                  <div className="flex items-center gap-3 w-36">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ease-out ${
                          (areaStats.terisi / areaStats.kapasitas) > 0.9 ? 'bg-rose-500' : 'bg-primary'
                        }`} 
                        style={{width: `${Math.min((areaStats.terisi / areaStats.kapasitas) * 100, 100)}%`}}>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono tracking-widest">
                      {areaStats.terisi}/{areaStats.kapasitas}
                    </span>
                  </div>
                </div>
              )}

              {/* Dark mode toggle */}
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleDark}>
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              {/* Notification */}
              <div className="relative" ref={notifRef}>
                <Button variant="ghost" size="icon" className="rounded-xl relative" onClick={toggleNotif}>
                  <Bell className="w-4 h-4" />
                  {hasNew && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </Button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Bell className="w-4 h-4 text-primary" /> Notifikasi
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Aktivitas terbaru sistem</p>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="py-8 text-center">
                            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Belum ada notifikasi</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className="px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Activity className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground leading-snug">{notif.aksi}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-muted-foreground">{notif.user.name}</span>
                                    <span className="text-[10px] text-muted-foreground/50">•</span>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      {formatTimeAgo(notif.timestamp)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Avatar + Name */}
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border">
                <div className="w-8 h-8 rounded-xl gradient-indigo flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-foreground leading-none">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6 gradient-mesh">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
