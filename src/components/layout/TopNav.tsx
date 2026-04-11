"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/properties", label: "Properties" },
  { href: "/brokers", label: "Brokers" },
  { href: "/sales", label: "Sales" },
  { href: "/leads", label: "Leads" },
  { href: "/settings", label: "Settings" },
];

export default function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main nav bar */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-sm">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm text-white text-xs font-black tracking-tight"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            MG
          </div>
          <span className="font-bold text-[#1e1b4b] text-sm hidden sm:block tracking-tight">
            Masheuri Group
          </span>
        </Link>

        {/* Nav pills — desktop only, pill container style like reference */}
        <nav className="hidden md:flex items-center gap-0.5 bg-[#f0f0fc] rounded-2xl px-1.5 py-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-white text-[#6366f1] shadow-sm border border-gray-100/80 font-semibold"
                    : "text-gray-500 hover:text-[#6366f1] hover:bg-white/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search — lg+ only */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-9 w-44 h-8 text-sm bg-[#f0f0fc] border-0 rounded-xl placeholder:text-gray-400 focus-visible:ring-[#6366f1]/30"
            />
          </div>

          {/* Bell */}
          <button className="relative w-8 h-8 rounded-xl flex items-center justify-center bg-[#f0f0fc] hover:bg-[#ede9fe] transition-colors">
            <Bell className="w-4 h-4 text-gray-500" />
            <Badge
              className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] font-bold border-2 border-white"
              style={{ background: "#6366f1", color: "white" }}
            >
              3
            </Badge>
          </button>

          {/* Avatar + name */}
          <div className="flex items-center gap-2 ml-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              A
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-[#1e1b4b] leading-tight">Admin User</p>
              <p className="text-[10px] text-gray-400 leading-tight">Super Admin</p>
            </div>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center bg-[#f0f0fc] hover:bg-[#ede9fe] transition-colors ml-1"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-4 h-4 text-gray-600" />
            ) : (
              <Menu className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 shadow-lg">
          {/* Mobile search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-9 w-full h-9 text-sm bg-[#f0f0fc] border-0 rounded-xl placeholder:text-gray-400"
            />
          </div>
          {/* Nav grid */}
          <nav className="grid grid-cols-3 gap-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium text-center transition-all ${
                    isActive
                      ? "text-white shadow-sm"
                      : "bg-[#f0f0fc] text-gray-600 hover:text-[#6366f1] hover:bg-[#ede9fe]"
                  }`}
                  style={isActive ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" } : {}}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
