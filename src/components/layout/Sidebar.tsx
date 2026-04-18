"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  TrendingUp,
  Target,
  Wallet,
  Settings,
  LogOut,
  ChevronRight,
  Home,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/properties", icon: Building2, label: "Properties" },
  { href: "/associates", icon: Users, label: "Associate Network" },
  { href: "/sales", icon: TrendingUp, label: "Sales" },
  { href: "/leads", icon: Target, label: "Lead Management" },
  { href: "/commissions", icon: Wallet, label: "Commissions" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-50"
      style={{ background: "linear-gradient(160deg, #1a2b4a 0%, #0f1e36 100%)" }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #D4AF37, #f0d060)" }}>
            <Home className="w-5 h-5 text-[#1a2b4a]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Maheshwari Group</p>
            <p className="text-white/50 text-xs">Real Estate Platform</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #D4AF37, #f0d060)", color: "#1a2b4a" }}>
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Admin User</p>
            <p className="text-white/50 text-xs">Super Admin</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/30" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
          Main Menu
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "text-[#1a2b4a]"
                      : "text-white/70 hover:text-white hover:bg-white/8"
                  }`}
                  style={isActive ? { background: "linear-gradient(135deg, #D4AF37, #f0d060)" } : {}}
                >
                  <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? "text-[#1a2b4a]" : "text-white/50 group-hover:text-white"}`} />
                  {item.label}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#1a2b4a]/60" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-red-500/15 transition-all duration-200 group"
        >
          <LogOut className="w-4.5 h-4.5 text-white/30 group-hover:text-red-400" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
