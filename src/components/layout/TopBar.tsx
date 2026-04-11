"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center px-6 gap-4 sticky top-0 z-40">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-[#1a2b4a] leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 w-56 h-9 text-sm bg-secondary border-0"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="w-4.5 h-4.5 text-muted-foreground" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
            style={{ background: "#D4AF37", color: "#1a2b4a" }}>
            3
          </Badge>
        </Button>

        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer"
          style={{ background: "linear-gradient(135deg, #1a2b4a, #2d4a7a)", color: "white" }}>
          A
        </div>
      </div>
    </header>
  );
}
