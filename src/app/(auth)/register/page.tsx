"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, ArrowRight, User, Mail, Phone, Lock, Hash, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralVerified, setReferralVerified] = useState(false);
  const [referredByName, setReferredByName] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    referralCode: params.get("ref") || "",
  });

  // Auto-verify if ref code comes from URL
  useEffect(() => {
    if (form.referralCode) verifyCode(form.referralCode);
  }, []);

  const verifyCode = async (code: string) => {
    if (!code) return;
    if (!isSupabaseConfigured()) {
      setReferralVerified(true);
      setReferredByName("Demo Associate");
      return;
    }
    const { data } = await supabase.from("profiles").select("full_name").eq("referral_code", code).single();
    if (data) {
      setReferralVerified(true);
      setReferredByName(data.full_name);
    } else {
      setReferralVerified(false);
      setReferredByName("");
      toast.error("Invalid referral code");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    if (!isSupabaseConfigured()) {
      toast.success("Account created (Demo Mode)");
      setTimeout(() => router.push("/dashboard"), 1000);
      setLoading(false);
      return;
    }

    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const initials = fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
      const referralCode = `MG-${initials}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: fullName,
            phone: form.phone,
            referral_code: referralCode,
            referred_by: form.referralCode || null,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Update profile with phone and referral info
        await supabase.from("profiles").update({
          referral_code: referralCode,
          referred_by: form.referralCode || null,
          role: form.referralCode ? "sub-associate" : "associate",
        }).eq("id", authData.user.id);
      }

      toast.success("Account created! Please check your email to confirm.");
      router.push("/login");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(160deg, #1a2b4a 0%, #0d1b33 100%)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #D4AF37, #f0d060)" }}>
            <Home className="w-6 h-6 text-[#1a2b4a]" />
          </div>
          <div>
            <p className="text-white font-bold text-xl">Maheshwari Group</p>
            <p className="text-white/50 text-sm">Real Estate Platform</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Join Our <br />
            <span style={{ color: "#D4AF37" }}>Associate Network</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            Register with your invite code and start earning commissions on every sale.
          </p>
          <div className="rounded-2xl p-5 border border-white/10 bg-white/5">
            <p className="text-white/70 text-sm font-medium mb-4">Commission Structure</p>
            {[
              { level: "Seller (You)", pct: "4%", color: "#D4AF37" },
              { level: "Your Referrer (L1)", pct: "1.5%", color: "#6ee7b7" },
              { level: "L2 Upline", pct: "0.5%", color: "#93c5fd" },
            ].map((row) => (
              <div key={row.level} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white/60 text-sm">{row.level}</span>
                <span className="text-sm font-bold" style={{ color: row.color }}>{row.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/30 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-[#D4AF37] hover:underline">Sign in here</Link>
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in">
          <h1 className="text-2xl font-bold text-[#1a2b4a] mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm mb-8">Register as an associate using your invite code</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Referral Code */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1a2b4a]">Invite / Referral Code *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. MG-AK-001"
                    className="pl-10 h-11"
                    value={form.referralCode}
                    onChange={(e) => {
                      setForm({ ...form, referralCode: e.target.value });
                      setReferralVerified(false);
                    }}
                  />
                </div>
                <Button type="button" variant="outline" className="h-11 px-4 text-sm border-[#1a2b4a] text-[#1a2b4a]"
                  onClick={() => verifyCode(form.referralCode)}>
                  Verify
                </Button>
              </div>
              {referralVerified && (
                <div className="flex items-center gap-2 text-green-600 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Referred by: <span className="font-medium">{referredByName}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1a2b4a]">First Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Amit" className="pl-10 h-11" value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1a2b4a]">Last Name</Label>
                <Input placeholder="Kumar" className="h-11" value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1a2b4a]">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="amit@example.com" className="pl-10 h-11" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1a2b4a]">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="tel" placeholder="+91 98765 43210" className="pl-10 h-11" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1a2b4a]">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" className="pl-10 pr-10 h-11"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#1a2b4a]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold group"
              style={{ background: "linear-gradient(135deg, #1a2b4a, #2d4a7a)", color: "white" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Creating Account…" : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "#D4AF37" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
