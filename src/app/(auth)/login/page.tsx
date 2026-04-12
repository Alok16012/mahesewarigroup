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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@masheuri.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDummyLogin = (role: string) => {
    setLoading(true);
    toast.success(`Entering as ${role} (Demo Mode)`);
    // Store dummy role for experimental features
    if (typeof window !== "undefined") {
      localStorage.setItem("dummy_role", role.toLowerCase());
    }
    setTimeout(() => {
      router.push("/dashboard");
      setLoading(false);
    }, 800);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email === "admin@masheuri.com" && password === "admin123") {
      return handleDummyLogin("Admin");
    }

    if (!isSupabaseConfigured()) {
      toast.info("Supabase not configured. Entering Demo Mode.", {
        description: "You're viewing the app with mock data. Real changes won't be saved to a database."
      });
      setTimeout(() => {
        router.push("/dashboard");
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Login failed", { description: error.message });
      } else {
        toast.success("Welcome back!", { description: "Preparing your dashboard..." });
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#eeeeff" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #a5b4fc, #c4b5fd)" }} />
          <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #6366f1, #8b5cf6)" }} />
          <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #14b8a6, transparent)" }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-[#1e1b4b] text-xl">Masheuri Group</p>
            <p className="text-gray-400 text-sm">Real Estate Platform</p>
          </div>
        </div>

        {/* Hero */}
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

          {/* Stat pills */}
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

        <p className="relative text-gray-400 text-xs">© 2026 Masheuri Group. All rights reserved.</p>
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
            <p className="font-bold text-[#1e1b4b]">Masheuri Group</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1e1b4b] mb-1">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to your account to continue</p>
          </div>

          <div className="mb-6 p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-indigo-700">i</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
              Aap dummy buttons se kisi bhi role mein login kar sakte hain testing ke liye.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-[#1e1b4b]">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-[#6366f1] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-[#1e1b4b]">Password</Label>
                <Link href="#" className="text-xs font-medium text-[#6366f1] hover:underline">Forgot password?</Link>
              </div>
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

            <div className="relative my-4">
              <div className="mb-6 p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-indigo-700">i</span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                  Aap dummy buttons se kisi bhi role mein login kar sakte hain testing ke liye.
                </p>
              </div>
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-gray-400">Dummy Login for Testing</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["Admin", "Associate", "Sub-Associate"].map((role) => (
                <Button key={role} type="button" variant="outline" onClick={() => handleDummyLogin(role)}
                  className="w-full px-0 h-10 text-[11px] font-bold rounded-xl border-gray-200 text-gray-500 hover:border-[#6366f1] hover:text-[#6366f1] hover:bg-[#f5f3ff] transition-all">
                  {role}
                </Button>
              ))}
            </div>
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
