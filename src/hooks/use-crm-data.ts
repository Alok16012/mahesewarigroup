import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Lead, Property, PlotUnit, LeadStatus } from "@/types/database";
import { toast } from "sonner";

const MOCK_PLOT_UNITS: PlotUnit[] = [
  { id: "U-001", property_id: "P-001", unit_number: "A-101", status: "sold", buyer_name: "Rajesh Kumar", price: 8500000, size: "200 sqyd", facing: "East", created_at: "2024-02-15" },
  { id: "U-002", property_id: "P-001", unit_number: "A-102", status: "sold", buyer_name: "Priya Singh", price: 8200000, size: "200 sqyd", facing: "West", created_at: "2024-03-01" },
  { id: "U-003", property_id: "P-001", unit_number: "A-103", status: "available", size: "200 sqyd", facing: "North", created_at: "2024-01-10" },
  { id: "U-004", property_id: "P-001", unit_number: "A-104", status: "reserved", size: "250 sqyd", facing: "South", created_at: "2024-01-10" },
  { id: "U-005", property_id: "P-001", unit_number: "A-105", status: "available", size: "250 sqyd", facing: "East", created_at: "2024-01-10" },
  { id: "U-006", property_id: "P-001", unit_number: "A-106", status: "sold", buyer_name: "Anil Reddy", price: 9500000, size: "300 sqyd", facing: "West", created_at: "2024-03-10" },
  { id: "U-007", property_id: "P-001", unit_number: "A-107", status: "available", size: "300 sqyd", facing: "North", created_at: "2024-01-10" },
  { id: "U-008", property_id: "P-001", unit_number: "A-108", status: "available", size: "200 sqyd", facing: "South", created_at: "2024-01-10" },
  { id: "U-009", property_id: "P-001", unit_number: "B-101", status: "sold", buyer_name: "Sunita Devi", price: 8800000, size: "200 sqyd", facing: "East", created_at: "2024-02-20" },
  { id: "U-010", property_id: "P-001", unit_number: "B-102", status: "available", size: "200 sqyd", facing: "West", created_at: "2024-01-10" },
  { id: "U-011", property_id: "P-001", unit_number: "B-103", status: "available", size: "250 sqyd", facing: "North", created_at: "2024-01-10" },
  { id: "U-012", property_id: "P-001", unit_number: "B-104", status: "sold", buyer_name: "Mohit Shah", price: 9200000, size: "300 sqyd", facing: "South", created_at: "2024-03-15" },
];

const MOCK_LEADS: Lead[] = [
  { id: "L-001", name: "Suresh Gupta", phone: "+91 98001 23456", email: "suresh@email.com", property_name: "Royal Meadows", budget: 9000000, status: "negotiation", source: "Website", associate_id: "A-001", associate_name: "Rahul Sharma", notes: "Interested in corner plot", created_at: "2024-04-01" },
  { id: "L-002", name: "Ritu Agarwal", phone: "+91 97002 34567", email: "ritu@email.com", property_name: "Silver Oak", budget: 13000000, status: "site_visit", source: "Referral", associate_id: "A-002", associate_name: "Priya Mehta", notes: "Wants 3BHK", created_at: "2024-04-02" },
];

const MOCK_PROPERTIES: Property[] = [
  { id: "P-001", name: "Royal Meadows — Sector 12", location: "Sector 12, Gurgaon", type: "plot", price_range: "75L - 1.2Cr", status: "available", images: [], plot_units: MOCK_PLOT_UNITS, created_at: "2024-01-01" },
  { id: "P-002", name: "Green Valley — Villa B-12", location: "Baner, Pune", type: "residential", price_range: "2.2Cr", status: "sold", images: [], created_at: "2024-01-02" },
  { id: "P-003", name: "Skyline Tower — Office Space", location: "Cyber City, Gurgaon", type: "commercial", price_range: "1.5Cr", status: "available", images: [], created_at: "2024-01-03" },
];

type Associate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: number;
  status: "active" | "inactive" | "suspended";
  referralCode: string;
  parentId: string;
  parentName: string;
  joined: string;
  sales: number;
  commission: number;
};

const MOCK_ASSOCIATES: Associate[] = [
  { id: "A-001", name: "Alok Kumar", email: "alok@email.com", phone: "+91 98765 00001", level: 1, status: "active", referralCode: "MG-AK-001", parentId: "admin", parentName: "Admin", joined: "2024-01-10", sales: 18, commission: 720000 },
  { id: "A-002", name: "Priya Mehta", email: "priya@email.com", phone: "+91 98765 00002", level: 1, status: "active", referralCode: "MG-PM-002", parentId: "admin", parentName: "Admin", joined: "2024-01-15", sales: 22, commission: 880000 },
  { id: "A-003", name: "Ram Singh", email: "ram@email.com", phone: "+91 98765 00003", level: 2, status: "active", referralCode: "MG-RS-003", parentId: "A-001", parentName: "Alok Kumar", joined: "2024-02-01", sales: 10, commission: 400000 },
  { id: "A-004", name: "Subham Gupta", email: "subham@email.com", phone: "+91 98765 00004", level: 2, status: "active", referralCode: "MG-SG-004", parentId: "A-001", parentName: "Alok Kumar", joined: "2024-02-10", sales: 8, commission: 320000 },
  { id: "A-005", name: "Vikram Joshi", email: "vikram@email.com", phone: "+91 98765 00005", level: 2, status: "inactive", referralCode: "MG-VJ-005", parentId: "A-002", parentName: "Priya Mehta", joined: "2024-02-20", sales: 4, commission: 160000 },
  { id: "A-006", name: "Amar Patel", email: "amar@email.com", phone: "+91 98765 00006", level: 3, status: "active", referralCode: "MG-AP-006", parentId: "A-003", parentName: "Ram Singh", joined: "2024-03-05", sales: 3, commission: 120000 },
  { id: "A-007", name: "Geeta Sharma", email: "geeta@email.com", phone: "+91 98765 00007", level: 3, status: "active", referralCode: "MG-GS-007", parentId: "A-003", parentName: "Ram Singh", joined: "2024-03-10", sales: 5, commission: 200000 },
  { id: "A-008", name: "Deepika Rao", email: "deepika@email.com", phone: "+91 98765 00008", level: 3, status: "active", referralCode: "MG-DR-008", parentId: "A-004", parentName: "Subham Gupta", joined: "2024-03-15", sales: 2, commission: 80000 },
  { id: "A-009", name: "Sneha Reddy", email: "sneha@email.com", phone: "+91 98765 00009", level: 3, status: "active", referralCode: "MG-SR-009", parentId: "A-005", parentName: "Vikram Joshi", joined: "2024-03-20", sales: 1, commission: 40000 },
];

export function useCrmData() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLeads(MOCK_LEADS);
      return;
    }

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } else {
      setLeads(data || []);
    }
  }, []);

  const fetchProperties = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setProperties(MOCK_PROPERTIES);
      return;
    }

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching properties:", error);
    } else {
      setProperties(data || []);
    }
  }, []);

  const fetchAssociates = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setAssociates(MOCK_ASSOCIATES);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("role", ["associate", "sub-associate"]);

    if (error) {
      console.error("Error fetching associates:", error);
    } else {
      setAssociates(data as unknown as Associate[]);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchLeads(), fetchProperties(), fetchAssociates()]);
      setLoading(false);
    }
    init();

    // Setup Realtime subscription for leads and properties
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel("crm-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, fetchLeads)
        .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, fetchProperties)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchLeads, fetchProperties, fetchAssociates]);

  const addLead = async (newLead: Omit<Lead, "id" | "created_at">) => {
    if (!isSupabaseConfigured()) {
      const lead: Lead = {
        ...newLead,
        id: `L-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
      };
      setLeads((prev) => [lead, ...prev]);
      toast.info("Lead added (Demo Mode)");
      return;
    }

    const { data, error } = await supabase
      .from("leads")
      .insert([newLead])
      .select();

    if (error) {
      toast.error(`Error adding lead: ${error.message}`);
      throw error;
    }
    
    if (data) {
      setLeads((prev) => [...data, ...prev]);
      toast.success("Lead added successfully");
    }
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    // Optimistic update
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

    if (!isSupabaseConfigured()) return;

    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      fetchLeads(); // Rollback
    }
  };

  const addProperty = async (newProp: Omit<Property, "id" | "created_at">) => {
    if (!isSupabaseConfigured()) {
      const prop: Property = {
        ...newProp,
        id: `P-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
      };
      setProperties((prev) => [prop, ...prev]);
      return;
    }

    const { data, error } = await supabase
      .from("properties")
      .insert([newProp])
      .select();

    if (error) {
      toast.error(`Error adding property: ${error.message}`);
      throw error;
    }
    
    if (data) {
      setProperties((prev) => [...data, ...prev]);
      toast.success("Property added");
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

    if (!isSupabaseConfigured()) return;

    const { error } = await supabase
      .from("properties")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update property");
      fetchProperties();
    }
  };

  return {
    leads,
    properties,
    associates,
    loading,
    error,
    addLead,
    updateLeadStatus,
    addProperty,
    updateProperty,
    refreshLeads: fetchLeads,
    refreshProperties: fetchProperties,
    isLive: isSupabaseConfigured(),
  };
}
