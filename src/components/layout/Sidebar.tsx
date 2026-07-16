"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, TrendingUp,
  Target, LogOut, ChevronRight,
  MapPin, Settings, Headphones, Menu, X, CheckSquare,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard",           adminOnly: false, telecallerHidden: false },
  { href: "/properties",         icon: Building2,       label: "Plot Inventory",      adminOnly: false, telecallerHidden: false },
  { href: "/leads",              icon: Target,          label: "My Leads",            adminOnly: false, telecallerHidden: false },
  { href: "/telecallers",        icon: Headphones,      label: "Telecallers",         adminOnly: true,  telecallerHidden: true  },
  { href: "/marketing-managers", icon: Users,           label: "Marketing Managers",  adminOnly: true,  telecallerHidden: true  },
  { href: "/associates",         icon: Users,           label: "Associate Network",   adminOnly: false, telecallerHidden: true  },
  { href: "/sales",              icon: TrendingUp,      label: "Sales & Commissions", adminOnly: false, telecallerHidden: true  },
  { href: "/settings",           icon: Settings,        label: "Settings",            adminOnly: true,  telecallerHidden: true  },
];

const bottomNavItems = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { href: "/leads",      icon: Target,          label: "Leads"     },
  { href: "/properties", icon: Building2,       label: "Properties"},
  { href: "/sales",      icon: CheckSquare,     label: "Sales"     },
];

const roleLabel: Record<string, string> = {
  admin: "Super Admin",
  associate: "Associate (L1)",
  "sub-associate": "Sub-Associate (L2)",
  telecaller: "Telecaller",
  "marketing-manager": "Marketing Manager",
};

function MGLogo({ size = "sm" }: { size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-10 h-10 text-sm rounded-xl" : "w-8 h-8 text-xs rounded-lg";
  return (
    <div
      className={`${cls} flex items-center justify-center font-black shrink-0`}
      style={{ background: "linear-gradient(135deg, #D4AF37, #f0d060)", color: "#1a2b4a" }}
    >
      MG
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem("dummy_role");
      localStorage.removeItem("dummy_telecaller");
      localStorage.removeItem("dummy_marketing_manager");
    }
    toast.success("Signed out");
    router.push("/login");
  };

  const initials = user?.full_name
    ?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "U";

  const visibleItems = navItems.filter((item) => {
    if (user?.role === "telecaller") return !item.telecallerHidden;
    if (user?.role === "marketing-manager") return item.href === "/properties" || item.href === "/leads";
    if (item.adminOnly) return user?.role === "admin";
    return true;
  });

  const visibleBottomNav = bottomNavItems.filter((item) => {
    if (user?.role === "telecaller") return item.href === "/dashboard" || item.href === "/leads";
    if (user?.role === "marketing-manager") return item.href !== "/sales";
    return true;
  });

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 shadow-md"
        style={{ background: "linear-gradient(160deg, #1a2b4a 0%, #0f1e36 100%)" }}
      >
        <button onClick={() => setMobileOpen(true)} className="text-white/70 hover:text-white p-1">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <MGLogo size="sm" />
          <p className="text-white font-bold text-sm">Maheshwari Group</p>
        </div>
        <div className="ml-auto">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #D4AF37, #f0d060)", color: "#1a2b4a" }}
          >
            {initials}
          </div>
        </div>
      </div>

      {/* ── Backdrop ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar drawer ──────────────────────────────────────────── */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-[260px] flex flex-col z-50 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{ background: "linear-gradient(160deg, #1a2b4a 0%, #0f1e36 100%)" }}
      >
        {/* Logo + close */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MGLogo size="md" />
            <div>
              <p className="text-white font-bold text-sm leading-tight">Maheshwari Group</p>
              <p className="text-white/40 text-xs">Real Estate Platform</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/50 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/8">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, #D4AF37, #f0d060)", color: "#1a2b4a" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.full_name || "Loading…"}</p>
              <p className="text-white/40 text-xs">{roleLabel[user?.role || "admin"]}</p>
            </div>
          </div>
          {user?.referral_code && (
            <div className="mt-2 px-2 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#D4AF37]/70" />
              <span className="text-[11px] text-white/40 font-mono">{user.referral_code}</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">Navigation</p>
          <ul className="space-y-0.5">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                      isActive ? "text-[#1a2b4a]" : "text-white/60 hover:text-white hover:bg-white/8"
                    }`}
                    style={isActive ? { background: "linear-gradient(135deg, #D4AF37, #f0d060)" } : {}}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#1a2b4a]" : "text-white/40 group-hover:text-white"}`} />
                    {item.label}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#1a2b4a]/50" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-red-500/15 transition-all duration-150 group"
          >
            <LogOut className="w-4 h-4 text-white/30 group-hover:text-red-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Bottom navigation bar (mobile only) ────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-white"
        style={{ borderColor: "#e2e8f0", boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center justify-around h-16 px-1">
          {visibleBottomNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] rounded-xl"
              >
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: isActive ? "#1e1b4b" : "#94a3b8" }}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className="text-[10px] font-semibold transition-colors"
                  style={{ color: isActive ? "#1e1b4b" : "#94a3b8" }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-4 h-0.5 rounded-full mt-0.5" style={{ background: "#D4AF37" }} />
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] rounded-xl"
          >
            <Menu className="w-5 h-5" style={{ color: "#94a3b8" }} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold" style={{ color: "#94a3b8" }}>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
