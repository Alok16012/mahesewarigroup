"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, TrendingUp,
  Target, LogOut, Home, ChevronRight,
  MapPin, Settings, Headphones,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Dashboard",           adminOnly: false },
  { href: "/properties",  icon: Building2,       label: "Properties",          adminOnly: false },
  { href: "/leads",       icon: Target,          label: "Lead Management",     adminOnly: false },
  { href: "/telecallers", icon: Headphones,      label: "Telecallers",         adminOnly: true  },
  { href: "/associates",  icon: Users,           label: "Associate Network",   adminOnly: false },
  { href: "/sales",       icon: TrendingUp,      label: "Sales & Commissions", adminOnly: false },
  { href: "/settings",    icon: Settings,        label: "Settings",            adminOnly: true  },
];

const roleLabel: Record<string, string> = {
  admin: "Super Admin",
  associate: "Associate (L1)",
  "sub-associate": "Sub-Associate (L2)",
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("dummy_role");
    }
    toast.success("Signed out");
    router.push("/login");
  };

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-50 shadow-xl"
      style={{ background: "linear-gradient(160deg, #1a2b4a 0%, #0f1e36 100%)" }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #D4AF37, #f0d060)" }}>
            <Home className="w-5 h-5 text-[#1a2b4a]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Maheshwari Group</p>
            <p className="text-white/40 text-xs">Real Estate Platform</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/8">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #D4AF37, #f0d060)", color: "#1a2b4a" }}>
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {navItems.filter((item) => !item.adminOnly || user?.role === "admin").map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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
  );
}
