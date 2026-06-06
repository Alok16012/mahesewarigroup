"use client";
import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type UserRole = "admin" | "associate" | "sub-associate" | "telecaller";

export type CurrentUser = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  referral_code: string;
  referred_by?: string;
};

const DEMO_ADMIN: CurrentUser = {
  id: "admin", email: "admin@masheuri.com", full_name: "Maheshwari Group (Admin)",
  role: "admin", referral_code: "MG-ADMIN",
};

function getDemoUser(): CurrentUser {
  const role = (typeof window !== "undefined" ? localStorage.getItem("dummy_role") : null) || "admin";
  if (role === "admin") return DEMO_ADMIN;

  if (role === "telecaller") {
    try {
      const raw = localStorage.getItem("dummy_telecaller");
      if (raw) {
        const t = JSON.parse(raw) as { id: string; full_name: string; username: string };
        return {
          id: t.id,
          email: `${t.username}@telecaller.com`,
          full_name: t.full_name,
          role: "telecaller",
          referral_code: "",
        };
      }
    } catch {}
    return { id: "TC-001", email: "telecaller@demo.com", full_name: "Demo Telecaller", role: "telecaller", referral_code: "" };
  }

  // Try to get the specific associate who logged in
  try {
    const raw = localStorage.getItem("dummy_associate");
    if (raw) {
      const a = JSON.parse(raw) as { id: string; name: string; referralCode: string; username: string };
      return {
        id: a.id,
        email: `${a.username}@demo.com`,
        full_name: a.name,
        role: role as UserRole,
        referral_code: a.referralCode,
      };
    }
  } catch {}

  // Fallback defaults
  if (role === "associate")
    return { id: "A-001", email: "alok@email.com", full_name: "Alok Kumar", role: "associate", referral_code: "MG-AK-001" };
  return { id: "A-003", email: "ram@email.com", full_name: "Ram Singh", role: "sub-associate", referral_code: "MG-RS-003", referred_by: "MG-AK-001" };
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Check for telecaller session first (they don't use Supabase Auth)
      const dummyRole = typeof window !== "undefined" ? localStorage.getItem("dummy_role") : null;
      if (dummyRole === "telecaller") {
        setUser(getDemoUser());
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured()) {
        setUser(getDemoUser());
        setLoading(false);
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(getDemoUser());
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
      if (profile) {
        setUser({ id: profile.id, email: profile.email, full_name: profile.full_name, role: profile.role, referral_code: profile.referral_code || "", referred_by: profile.referred_by });
      }
      setLoading(false);
    }
    load();
  }, []);

  return { user, loading, isAdmin: user?.role === "admin" };
}

// Build flat list of all downline associate IDs for a given referral_code
export function getDownlineIds(
  referralCode: string,
  allAssociates: { id: string; referral_code?: string; referred_by?: string }[]
): string[] {
  const direct = allAssociates.filter((a) => a.referred_by === referralCode);
  const result: string[] = [];
  for (const d of direct) {
    result.push(d.id);
    if (d.referral_code) {
      result.push(...getDownlineIds(d.referral_code, allAssociates));
    }
  }
  return result;
}
