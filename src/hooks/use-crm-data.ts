import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Lead, Property, PlotUnit, LeadStatus, Telecaller, FollowUp } from "@/types/database";
import { toast } from "sonner";

function uuidOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) ? v : null;
}

async function dbMutate(op: "insert" | "update" | "delete", table: string, data?: Record<string, unknown>, id?: string) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op, table, data, id }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Database error");
  return json;
}

async function dbSelect(table: string): Promise<any[]> {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "select", table }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Database error");
  return json.data || [];
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_PLOT_UNITS: PlotUnit[] = [
  { id: "U-001", property_id: "P-001", unit_number: "A-101", status: "sold", buyer_name: "Rajesh Kumar", price: 8500000, size: "200 sqyd", facing: "East", created_at: "2024-02-15" },
  { id: "U-002", property_id: "P-001", unit_number: "A-102", status: "sold", buyer_name: "Priya Singh", price: 8200000, size: "200 sqyd", facing: "West", created_at: "2024-03-01" },
  { id: "U-003", property_id: "P-001", unit_number: "A-103", status: "available", size: "200 sqyd", facing: "North", created_at: "2024-01-10" },
  { id: "U-004", property_id: "P-001", unit_number: "A-104", status: "reserved", size: "250 sqyd", facing: "South", created_at: "2024-01-10" },
  { id: "U-005", property_id: "P-001", unit_number: "A-105", status: "available", size: "250 sqyd", facing: "East", created_at: "2024-01-10" },
  { id: "U-006", property_id: "P-001", unit_number: "A-106", status: "sold", buyer_name: "Anil Reddy", price: 9500000, size: "300 sqyd", facing: "West", created_at: "2024-03-10" },
  { id: "U-007", property_id: "P-001", unit_number: "A-107", status: "available", size: "300 sqyd", facing: "North", created_at: "2024-01-10" },
  { id: "U-008", property_id: "P-001", unit_number: "A-108", status: "available", size: "200 sqyd", facing: "South", created_at: "2024-01-10" },
];

const MOCK_LEADS: Lead[] = [
  { id: "L-001", name: "Suresh Gupta", phone: "+91 98001 23456", email: "suresh@email.com", property_name: "Royal Meadows", budget: 9000000, status: "negotiation", source: "Website", associate_id: "A-001", associate_name: "Rahul Sharma", telecaller_id: "TC-001", telecaller_name: "Ramesh Yadav", next_followup_date: "2024-04-12", notes: "Interested in corner plot", created_at: "2024-04-01" },
  { id: "L-002", name: "Ritu Agarwal", phone: "+91 97002 34567", email: "ritu@email.com", property_name: "Silver Oak", budget: 13000000, status: "site_visit", source: "Referral", associate_id: "A-002", associate_name: "Priya Mehta", telecaller_id: "TC-002", telecaller_name: "Sunita Patel", next_followup_date: "2024-04-15", notes: "Wants 3BHK", created_at: "2024-04-02" },
  { id: "L-003", name: "Manoj Tiwari", phone: "+91 96003 45678", email: "manoj@email.com", property_name: "Green Valley", budget: 22000000, status: "contacted", source: "Walk-in", associate_id: "A-001", associate_name: "Rahul Sharma", notes: "Seen villa B-12", created_at: "2024-04-03" },
  { id: "L-004", name: "Kavita Sharma", phone: "+91 95004 56789", email: "kavita@email.com", property_name: "Palm Grove", budget: 5500000, status: "new", source: "Social Media", associate_id: "A-003", associate_name: "Ram Singh", notes: "", created_at: "2024-04-04" },
  { id: "L-005", name: "Ajay Nair", phone: "+91 94005 67890", email: "ajay@email.com", property_name: "Lotus Park", budget: 7200000, status: "converted", source: "Website", associate_id: "A-002", associate_name: "Priya Mehta", notes: "Closed deal", created_at: "2024-03-22" },
];

const MOCK_PROPERTIES: Property[] = [
  { id: "P-001", name: "Royal Meadows — Sector 12", location: "Sector 12, Gurgaon", type: "plot", price_range: "75L - 1.2Cr", status: "available", images: [], plot_units: MOCK_PLOT_UNITS, created_at: "2024-01-01" },
  { id: "P-002", name: "Green Valley — Villa B-12", location: "Baner, Pune", type: "residential", price_range: "2.2Cr", status: "sold", images: [], created_at: "2024-01-02" },
  { id: "P-003", name: "Skyline Tower — Office Space", location: "Cyber City, Gurgaon", type: "commercial", price_range: "1.5Cr", status: "available", images: [], created_at: "2024-01-03" },
  { id: "P-004", name: "Silver Oak — Plot C-88", location: "Sector 45, Noida", type: "plot", price_range: "1.2Cr", status: "reserved", images: [], created_at: "2024-01-04" },
  { id: "P-005", name: "Lotus Park — Plot E-19", location: "Whitefield, Bangalore", type: "plot", price_range: "72L", status: "available", images: [], created_at: "2024-01-05" },
];

export type SaleRecord = {
  id: string;
  property_id?: string;
  property_name: string;
  associate_id?: string;
  associate_name?: string;
  buyer_name: string;
  buyer_phone?: string;
  sale_amount: number;
  commission_amount: number;
  status: "pending" | "approved" | "rejected";
  sale_date?: string;
  created_at: string;
};

const MOCK_SALES: SaleRecord[] = [
  { id: "SL-2024-091", property_name: "Royal Meadows - Plot A-204", associate_name: "Rahul Sharma", buyer_name: "Suresh Gupta", buyer_phone: "+91 98001 23456", sale_amount: 8500000, commission_amount: 340000, status: "approved", sale_date: "2024-04-08", created_at: "2024-04-08" },
  { id: "SL-2024-090", property_name: "Silver Oak - Plot C-88", associate_name: "Priya Mehta", buyer_name: "Ritu Agarwal", buyer_phone: "+91 97002 34567", sale_amount: 12000000, commission_amount: 480000, status: "pending", sale_date: "2024-04-06", created_at: "2024-04-06" },
  { id: "SL-2024-089", property_name: "Green Valley - Villa B-12", associate_name: "Amit Kumar", buyer_name: "Manoj Tiwari", buyer_phone: "+91 96003 45678", sale_amount: 22000000, commission_amount: 880000, status: "approved", sale_date: "2024-04-02", created_at: "2024-04-02" },
  { id: "SL-2024-088", property_name: "Palm Grove - Plot D-41", associate_name: "Sneha Reddy", buyer_name: "Kavita Sharma", buyer_phone: "+91 95004 56789", sale_amount: 5500000, commission_amount: 220000, status: "rejected", sale_date: "2024-03-28", created_at: "2024-03-28" },
  { id: "SL-2024-087", property_name: "Lotus Park - Plot E-19", associate_name: "Vikram Patel", buyer_name: "Ajay Nair", buyer_phone: "+91 94005 67890", sale_amount: 7200000, commission_amount: 288000, status: "approved", sale_date: "2024-03-22", created_at: "2024-03-22" },
];

export type Associate = {
  id: string;
  email: string;
  full_name: string;
  role: "associate" | "sub-associate" | "admin";
  referral_code?: string;
  referred_by?: string;
  phone?: string;
  sales?: number;
  commission?: number;
  status?: "active" | "inactive" | "suspended";
  created_at: string;
};

const MOCK_ASSOCIATES: Associate[] = [
  { id: "A-001", full_name: "Alok Kumar", email: "alok@email.com", role: "associate", referral_code: "MG-AK-001", sales: 18, commission: 720000, status: "active", created_at: "2024-01-10" },
  { id: "A-002", full_name: "Priya Mehta", email: "priya@email.com", role: "associate", referral_code: "MG-PM-002", sales: 22, commission: 880000, status: "active", created_at: "2024-01-15" },
  { id: "A-003", full_name: "Ram Singh", email: "ram@email.com", role: "sub-associate", referral_code: "MG-RS-003", referred_by: "MG-AK-001", sales: 10, commission: 400000, status: "active", created_at: "2024-02-01" },
  { id: "A-004", full_name: "Subham Gupta", email: "subham@email.com", role: "sub-associate", referral_code: "MG-SG-004", referred_by: "MG-AK-001", sales: 8, commission: 320000, status: "active", created_at: "2024-02-10" },
  { id: "A-005", full_name: "Vikram Joshi", email: "vikram@email.com", role: "sub-associate", referral_code: "MG-VJ-005", referred_by: "MG-PM-002", sales: 4, commission: 160000, status: "inactive", created_at: "2024-02-20" },
];

const MOCK_TELECALLERS: Telecaller[] = [
  { id: "TC-001", full_name: "Ramesh Yadav", phone: "+91 99001 11111", username: "ramesh.tc", password: "MG@2024#1", status: "active", created_at: "2024-03-01" },
  { id: "TC-002", full_name: "Sunita Patel", phone: "+91 99002 22222", username: "sunita.tc", password: "MG@2024#2", status: "active", created_at: "2024-03-05" },
  { id: "TC-003", full_name: "Arun Kumar", phone: "+91 99003 33333", username: "arun.tc", password: "MG@2024#3", status: "inactive", created_at: "2024-03-10" },
];

const MOCK_FOLLOWUPS: FollowUp[] = [
  { id: "FU-001", lead_id: "L-001", lead_name: "Suresh Gupta", telecaller_id: "TC-001", telecaller_name: "Ramesh Yadav", follow_up_date: "2024-04-10", notes: "Interested in corner plot, will call back after Friday", outcome: "callback", next_followup_date: "2024-04-12", created_at: "2024-04-10T10:00:00Z" },
  { id: "FU-002", lead_id: "L-002", lead_name: "Ritu Agarwal", telecaller_id: "TC-002", telecaller_name: "Sunita Patel", follow_up_date: "2024-04-08", notes: "Site visit scheduled for this weekend", outcome: "interested", next_followup_date: "2024-04-15", created_at: "2024-04-08T14:00:00Z" },
  { id: "FU-003", lead_id: "L-001", lead_name: "Suresh Gupta", telecaller_id: "TC-001", telecaller_name: "Ramesh Yadav", follow_up_date: "2024-04-05", notes: "First call, introduced ourselves and properties", outcome: "called", created_at: "2024-04-05T11:00:00Z" },
];

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useCrmData() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [telecallers, setTelecallers] = useState<Telecaller[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  const fetchLeads = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLeads(MOCK_LEADS);
      setUsingMockData(true);
      return;
    }
    try {
      const data = await dbSelect("leads");
      setLeads(data);
    } catch {
      setLeads([]);
    }
  }, []);

  // Reads go through the service-role API: the app uses localStorage auth (no
  // Supabase session), so direct anon client reads are blocked by RLS.
  const fetchProperties = useCallback(async () => {
    if (!isSupabaseConfigured()) { setProperties(MOCK_PROPERTIES); setUsingMockData(true); return; }
    try {
      const data = await dbSelect("properties");
      setProperties(data);
    } catch { setProperties([]); }
  }, []);

  const fetchAssociates = useCallback(async () => {
    if (!isSupabaseConfigured()) { setAssociates(MOCK_ASSOCIATES); setUsingMockData(true); return; }
    try {
      const data = await dbSelect("profiles");
      setAssociates((data as Associate[]).filter((a) => a.role === "associate" || a.role === "sub-associate"));
    } catch { setAssociates([]); }
  }, []);

  const fetchSales = useCallback(async () => {
    if (!isSupabaseConfigured()) { setSales(MOCK_SALES); setUsingMockData(true); return; }
    try {
      const data = await dbSelect("sales");
      setSales(data as SaleRecord[]);
    } catch { setSales([]); }
  }, []);

  const fetchTelecallers = useCallback(async () => {
    const lsKey = "mg_telecallers_v1";
    const stored = typeof window !== "undefined" ? localStorage.getItem(lsKey) : null;
    const localData: Telecaller[] = stored ? JSON.parse(stored) : [];

    if (!isSupabaseConfigured()) {
      setTelecallers(localData);
      return;
    }
    try {
      const data = await dbSelect("telecallers");
      if (data.length > 0) {
        setTelecallers(data);
        if (typeof window !== "undefined") localStorage.setItem(lsKey, JSON.stringify(data));
      } else if (localData.length > 0) {
        setTelecallers(localData);
      } else {
        setTelecallers([]);
      }
    } catch {
      setTelecallers(localData);
    }
  }, []);

  const fetchFollowups = useCallback(async () => {
    const lsKey = "mg_followups_v1";
    const stored = typeof window !== "undefined" ? localStorage.getItem(lsKey) : null;
    const localData: FollowUp[] = stored ? JSON.parse(stored) : [];

    if (!isSupabaseConfigured()) {
      setFollowups(localData);
      return;
    }
    try {
      const data = await dbSelect("lead_followups");
      if (data.length > 0) {
        setFollowups(data);
        if (typeof window !== "undefined") localStorage.setItem(lsKey, JSON.stringify(data));
      } else if (localData.length > 0) {
        setFollowups(localData);
      } else {
        setFollowups([]);
      }
    } catch {
      setFollowups(localData);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchLeads(), fetchProperties(), fetchAssociates(), fetchSales(), fetchTelecallers(), fetchFollowups()]);
      setLoading(false);
    }
    init();

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel("crm-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, fetchLeads)
        .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, fetchProperties)
        .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, fetchSales)
        .on("postgres_changes", { event: "*", schema: "public", table: "telecallers" }, fetchTelecallers)
        .on("postgres_changes", { event: "*", schema: "public", table: "lead_followups" }, fetchFollowups)
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [fetchLeads, fetchProperties, fetchAssociates, fetchSales, fetchTelecallers, fetchFollowups]);

  // ── Leads ──────────────────────────────────────────────────────────────────

  const addLead = async (newLead: Omit<Lead, "id" | "created_at">) => {
    if (!isSupabaseConfigured() || usingMockData) {
      const lead: Lead = { ...newLead, id: `L-${Date.now()}`, created_at: new Date().toISOString() };
      setLeads((prev) => [lead, ...prev]);
      toast.success("Lead added (Demo Mode)");
      return;
    }
    try {
      const { data } = await dbMutate("insert", "leads", {
        ...newLead,
        associate_id: uuidOrNull(newLead.associate_id),
        property_id: uuidOrNull(newLead.property_id),
      });
      setLeads((prev) => [data, ...prev]);
      toast.success("Lead added");
    } catch (e: any) { toast.error(e.message); throw e; }
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    if (!isSupabaseConfigured() || usingMockData) return;
    try {
      await dbMutate("update", "leads", { status }, id);
    } catch { toast.error("Failed to update status"); fetchLeads(); }
  };

  const assignLeadToTelecaller = async (leadId: string, telecallerId: string, telecallerName: string) => {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, telecaller_id: telecallerId, telecaller_name: telecallerName } : l));
    if (!isSupabaseConfigured() || usingMockData) { toast.success(`Lead assigned to ${telecallerName} (Demo)`); return; }
    try {
      await dbMutate("update", "leads", { telecaller_id: telecallerId, telecaller_name: telecallerName }, leadId);
      toast.success(`Lead assigned to ${telecallerName}`);
    } catch { toast.error("Failed to assign lead"); fetchLeads(); }
  };

  const deleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (!isSupabaseConfigured() || usingMockData) { toast.success("Lead deleted (Demo Mode)"); return; }
    try {
      await dbMutate("delete", "leads", undefined, id);
      toast.success("Lead deleted");
    } catch { toast.error("Failed to delete lead"); fetchLeads(); }
  };

  // ── Follow-ups ─────────────────────────────────────────────────────────────

  const addFollowup = async (newFu: Omit<FollowUp, "id" | "created_at">) => {
    const fu: FollowUp = { ...newFu, id: `FU-${Date.now()}`, created_at: new Date().toISOString() };
    const updatedFollowups = [fu, ...followups];
    setFollowups(updatedFollowups);
    setLeads((prev) => prev.map((l) => l.id === newFu.lead_id ? {
      ...l,
      telecaller_id: newFu.telecaller_id,
      telecaller_name: newFu.telecaller_name,
      next_followup_date: newFu.next_followup_date || newFu.follow_up_date,
    } : l));
    if (typeof window !== "undefined") localStorage.setItem("mg_followups_v1", JSON.stringify(updatedFollowups));
    toast.success("Follow-up scheduled");

    if (isSupabaseConfigured()) {
      try {
        // Empty date strings are invalid for a Postgres date column — send null instead.
        await dbMutate("insert", "lead_followups", {
          ...newFu,
          telecaller_id: uuidOrNull(newFu.telecaller_id),
          next_followup_date: newFu.next_followup_date || null,
        });
        await dbMutate("update", "leads", {
          telecaller_id: newFu.telecaller_id,
          telecaller_name: newFu.telecaller_name,
          next_followup_date: newFu.next_followup_date || newFu.follow_up_date,
        }, newFu.lead_id);
      } catch { /* local already saved */ }
    }
  };

  const updateFollowupOutcome = async (id: string, outcome: FollowUp["outcome"], next_followup_date?: string) => {
    setFollowups((prev) => prev.map((f) => f.id === id ? { ...f, outcome, next_followup_date } : f));
    if (!isSupabaseConfigured()) return;
    try {
      await dbMutate("update", "lead_followups", { outcome, next_followup_date }, id);
    } catch { toast.error("Failed to update follow-up"); }
  };

  // ── Telecallers ────────────────────────────────────────────────────────────

  const saveTelecallersToLS = (list: Telecaller[]) => {
    if (typeof window !== "undefined") localStorage.setItem("mg_telecallers_v1", JSON.stringify(list));
  };

  const addTelecaller = async (newTc: Omit<Telecaller, "id" | "created_at">) => {
    const tc: Telecaller = { ...newTc, id: `TC-${Date.now()}`, created_at: new Date().toISOString() };
    const updated = [tc, ...telecallers];
    setTelecallers(updated);
    saveTelecallersToLS(updated);
    toast.success("Telecaller added");

    if (isSupabaseConfigured()) {
      try {
        const { data } = await dbMutate("insert", "telecallers", newTc);
        const withRealId = updated.map((t) => t.id === tc.id ? (data as Telecaller) : t);
        setTelecallers(withRealId);
        saveTelecallersToLS(withRealId);
      } catch {
        // localStorage save already done above — silently ignore Supabase error
      }
    }
  };

  const updateTelecaller = async (id: string, updates: Partial<Telecaller>) => {
    const updated = telecallers.map((t) => t.id === id ? { ...t, ...updates } : t);
    setTelecallers(updated);
    saveTelecallersToLS(updated);

    if (!isSupabaseConfigured()) return;
    const isRealUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isRealUUID) return;
    try {
      await dbMutate("update", "telecallers", updates as Record<string, unknown>, id);
    } catch { /* local already updated */ }
  };

  const deleteTelecaller = async (id: string) => {
    const updated = telecallers.filter((t) => t.id !== id);
    setTelecallers(updated);
    saveTelecallersToLS(updated);
    toast.success("Telecaller deleted");

    if (!isSupabaseConfigured()) return;
    const isRealUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isRealUUID) return;
    try {
      await dbMutate("delete", "telecallers", undefined, id);
    } catch { /* local already deleted */ }
  };

  // ── Properties ─────────────────────────────────────────────────────────────

  const addProperty = async (newProp: Omit<Property, "id" | "created_at">) => {
    if (!isSupabaseConfigured() || usingMockData) {
      const prop: Property = { ...newProp, id: `P-${Date.now()}`, created_at: new Date().toISOString() };
      setProperties((prev) => [prop, ...prev]);
      toast.success("Property added (Demo Mode)");
      return;
    }
    try {
      const { data } = await dbMutate("insert", "properties", {
        ...newProp,
        associate_id: uuidOrNull(newProp.associate_id),
        associate_name: (newProp as any).associate_name || null,
        map_image: (newProp as any).map_image || null,
        plot_units: undefined,
      });
      setProperties((prev) => [data, ...prev]);
      toast.success("Property added");
    } catch (e: any) { toast.error(e.message); throw e; }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    if (!isSupabaseConfigured() || usingMockData) return;
    try {
      const clean = { ...updates, plot_units: undefined } as Record<string, unknown>;
      delete clean.plot_units;
      await dbMutate("update", "properties", clean, id);
    } catch { toast.error("Failed to update property"); fetchProperties(); }
  };

  const deleteProperty = async (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    if (!isSupabaseConfigured() || usingMockData) { toast.success("Property deleted (Demo Mode)"); return; }
    try {
      await dbMutate("delete", "properties", undefined, id);
      toast.success("Property deleted");
    } catch { toast.error("Failed to delete property"); fetchProperties(); }
  };

  // ── Sales ──────────────────────────────────────────────────────────────────

  const addSale = async (newSale: Omit<SaleRecord, "id" | "created_at">) => {
    if (!isSupabaseConfigured() || usingMockData) {
      const sale: SaleRecord = { ...newSale, id: `SL-${Date.now()}`, created_at: new Date().toISOString() };
      setSales((prev) => [sale, ...prev]);
      toast.success("Sale recorded (Demo Mode)");
      return;
    }
    try {
      const { data } = await dbMutate("insert", "sales", {
        ...newSale,
        property_id: uuidOrNull(newSale.property_id),
        associate_id: uuidOrNull(newSale.associate_id),
      });
      setSales((prev) => [data, ...prev]);
      toast.success("Sale recorded — pending approval");
    } catch (e: any) { toast.error(e.message); throw e; }
  };

  const updateSaleStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
    setSales((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    if (!isSupabaseConfigured() || usingMockData) { toast.success(`Sale ${status} (Demo Mode)`); return; }
    try {
      await dbMutate("update", "sales", { status }, id);
      toast.success(`Sale ${status}`);
    } catch { toast.error("Failed to update sale"); fetchSales(); }
  };

  return {
    leads, properties, associates, sales, telecallers, followups,
    loading, usingMockData,
    addLead, updateLeadStatus, assignLeadToTelecaller, deleteLead,
    addFollowup, updateFollowupOutcome,
    addTelecaller, updateTelecaller, deleteTelecaller,
    addProperty, updateProperty, deleteProperty,
    addSale, updateSaleStatus,
    refreshLeads: fetchLeads,
    refreshProperties: fetchProperties,
    refreshSales: fetchSales,
    refreshTelecallers: fetchTelecallers,
    refreshFollowups: fetchFollowups,
    isLive: isSupabaseConfigured() && !usingMockData,
  };
}
