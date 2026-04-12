import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Lead, Property, LeadStatus } from "@/types/database";
import { toast } from "sonner";

// Mock Data (Fallback for Development without Supabase)
const MOCK_LEADS: Lead[] = [
  { id: "L-001", name: "Suresh Gupta", phone: "+91 98001 23456", email: "suresh@email.com", property_name: "Royal Meadows", budget: 9000000, status: "negotiation", source: "Website", associate_id: "A-001", associate_name: "Rahul Sharma", notes: "Interested in corner plot", created_at: "2024-04-01" },
  { id: "L-002", name: "Ritu Agarwal", phone: "+91 97002 34567", email: "ritu@email.com", property_name: "Silver Oak", budget: 13000000, status: "site_visit", source: "Referral", associate_id: "A-002", associate_name: "Priya Mehta", notes: "Wants 3BHK", created_at: "2024-04-02" },
];

const MOCK_PROPERTIES: Property[] = [
  { id: "P-001", name: "Royal Meadows — Plot A-204", location: "Sector 12, Gurgaon", type: "plot", price_range: "85L", status: "available", created_at: "2024-01-01" },
  { id: "P-002", name: "Green Valley — Villa B-12", location: "Baner, Pune", type: "residential", price_range: "2.2Cr", status: "sold", created_at: "2024-01-02" },
];

export function useCrmData() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
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

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchLeads(), fetchProperties()]);
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
  }, [fetchLeads, fetchProperties]);

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
