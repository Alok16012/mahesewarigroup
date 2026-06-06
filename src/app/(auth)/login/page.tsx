"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Home, ArrowRight, Lock, Mail, Building2, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "admin@masheuri.com";
const ADMIN_PASSWORD = "admin123";
const ASSOCIATES_KEY = "mg_associates_v2";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDummyLogin = (
    role: string,
    associateData?: { id: string; name: string; referralCode: string; username: string }
  ) => {
    setLoading(true);
    toast.success(`Welcome${associateData ? ", " + associateData.name : ""}!`);
    if (typeof window !== "undefined") {
      localStorage.setItem("dummy_role", role.toLowerCase());
      if (associateData) {
        localStorage.setItem("dummy_associate", JSON.stringify(associateData));
      } else {
        localStorage.removeItem("dummy_associate");
      }
    }
    setTimeout(() => {
      router.push("/dashboard");
      setLoading(false);
    }, 800);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Admin hardcoded credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return handleDummyLogin("Admin");
    }

    // 2. Username-based login — check localStorage associates
    const isUsername = !email.includes("@");
    if (isUsername) {
      let allAssociates: Array<{ id: string; name: string; level: number; referralCode: string; username?: string; password?: string }> = [];
      try {
        const stored = localStorage.getItem(ASSOCIATES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.length > 0 && parsed[0].username) allAssociates = parsed;
        }
      } catch {}

      const match = allAssociates.find((a) => a.username === email && a.password === password);
      if (match) {
        const role = match.level === 1 ? "associate" : "sub-associate";
        return handleDummyLogin(role, {
          id: match.id,
          name: match.name,
          referralCode: match.referralCode,
          username: match.username!,
        });
      }

      // 3. Telecaller login — check telecallers table via API
      try {
        const res = await fetch("/api/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ op: "telecaller-login", username: email, password }),
        });
        const json = await res.json();
        if (res.ok && json.data) {
          const tc = json.data as { id: string; full_name: string; username: string };
          if (typeof window !== "undefined") {
            localStorage.setItem("dummy_role", "telecaller");
            localStorage.setItem("dummy_telecaller", JSON.stringify(tc));
          }
          toast.success(`Welcome, ${tc.full_name}!`);
          setTimeout(() => { router.push("/dashboard"); setLoading(false); }, 800);
          return;
        }
      } catch {}

      toast.error("Invalid credentials", { description: "Username or password is incorrect." });
      setLoading(false);
      return;
    }

    // 4. Supabase auth (email-based)
    if (!isSupabaseConfigured()) {
      toast.info("Supabase not configured — entering Demo Mode.");
      setTimeout(() => { router.push("/dashboard"); setLoading(false); }, 800);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("Login failed", { description: error.message });
      } else {
        toast.success("Welcome back!", { description: "Preparing your dashboard..." });
        router.push("/dashboard");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#eeeeff" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #a5b4fc, #c4b5fd)" }} />
          <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #6366f1, #8b5cf6)" }} />
          <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #14b8a6, transparent)" }} />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-[#1e1b4b] text-xl">Maheshwari Group</p>
            <p className="text-gray-400 text-sm">Real Estate Platform</p>
          </div>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm text-[#6366f1] text-xs font-semibold mb-6 border border-[#c4b5fd]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
            Broker Management System
          </div>
          <h2 className="text-4xl font-bold text-[#1e1b4b] leading-tight mb-4">
            Grow Your<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              Broker Network
            </span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm">
            Track properties, manage your broker hierarchy, distribute commissions automatically, and convert leads — all in one place.
          </p>

          <div className="flex gap-3 flex-wrap">
            {[
              { icon: Users, label: "1,284 Brokers", color: "#6366f1" },
              { icon: Building2, label: "617 Properties", color: "#14b8a6" },
              { icon: TrendingUp, label: "₹4.8Cr Sales", color: "#22c55e" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-white rounded-xl px-3 py-2 shadow-sm">
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                  <span className="text-sm font-semibold text-[#1e1b4b]">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative text-gray-400 text-xs">© 2026 Maheshwari Group. All rights reserved.</p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <Home className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-[#1e1b4b]">Maheshwari Group</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1e1b4b] mb-1">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to your account to continue</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-[#1e1b4b]">Email or Username</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-[#6366f1] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-[#1e1b4b]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-[#6366f1] transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#6366f1]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-semibold rounded-xl mt-1 group"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            New associate?{" "}
            <Link href="/register" className="font-semibold text-[#6366f1] hover:underline">
              Register with referral code
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
