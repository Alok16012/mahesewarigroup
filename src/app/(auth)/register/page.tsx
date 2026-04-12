"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, ArrowRight, User, Mail, Phone, Lock, Hash, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [referralVerified, setReferralVerified] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(160deg, #1a2b4a 0%, #0d1b33 100%)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #D4AF37, #f0d060)" }}>
            <Home className="w-6 h-6 text-[#1a2b4a]" />
          </div>
          <div>
            <p className="text-white font-bold text-xl">Masheuri Group</p>
            <p className="text-white/50 text-sm">Real Estate Platform</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Join Our <br />
            <span style={{ color: "#D4AF37" }}>Broker Network</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            Register with your referral code to start selling properties and earning commissions across the network.
          </p>

          {/* Commission breakdown */}
          <div className="rounded-2xl p-5 border border-white/10 bg-white/5">
            <p className="text-white/70 text-sm font-medium mb-4">Commission Structure</p>
            {[
              { level: "Level 0 (You, Seller)", pct: "4%", color: "#D4AF37" },
              { level: "Level 1 (Your Referrer)", pct: "1.5%", color: "#6ee7b7" },
              { level: "Level 2 (Referrer's Referrer)", pct: "0.5%", color: "#93c5fd" },
            ].map((row) => (
              <div key={row.level} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white/60 text-sm">{row.level}</span>
                <span className="text-sm font-bold" style={{ color: row.color }}>{row.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/30 text-sm">
          Already an associate?{" "}
          <Link href="/login" className="text-[#D4AF37] hover:underline">Sign in here</Link>
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in">
          <h1 className="text-2xl font-bold text-[#1a2b4a] mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm mb-8">Register as an associate using your referral code</p>

          <form className="space-y-4">
            {/* Referral Code */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1a2b4a]">Referral Code *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. MG-2024-ABCD"
                    className="pl-10 h-11"
                    onChange={() => setReferralVerified(false)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-4 text-sm border-[#1a2b4a] text-[#1a2b4a] hover:bg-[#1a2b4a] hover:text-white"
                  onClick={() => setReferralVerified(true)}
                >
                  Verify
                </Button>
              </div>
              {referralVerified && (
                <div className="flex items-center gap-2 text-green-600 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Referred by: <span className="font-medium">Rahul Sharma (Level 1)</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1a2b4a]">First Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Amit" className="pl-10 h-11" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1a2b4a]">Last Name *</Label>
                <Input placeholder="Kumar" className="h-11" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1a2b4a]">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="amit@example.com" className="pl-10 h-11" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1a2b4a]">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="tel" placeholder="+91 98765 43210" className="pl-10 h-11" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1a2b4a]">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className="pl-10 pr-10 h-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#1a2b4a]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password strength indicator */}
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i <= 2 ? "bg-[#D4AF37]" : "bg-border"}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Password strength: <span className="text-amber-600 font-medium">Fair</span></p>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="terms" className="w-4 h-4 mt-0.5 rounded border-border accent-[#1a2b4a]" />
              <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                I agree to the{" "}
                <span className="text-[#1a2b4a] font-medium">Terms of Service</span> and{" "}
                <span className="text-[#1a2b4a] font-medium">Privacy Policy</span>
              </Label>
            </div>

            <Link href="/dashboard">
              <Button className="w-full h-11 text-sm font-semibold group"
                style={{ background: "linear-gradient(135deg, #1a2b4a, #2d4a7a)", color: "white" }}>
                Create Account
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "#D4AF37" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
