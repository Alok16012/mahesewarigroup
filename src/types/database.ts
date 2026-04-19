export type LeadStatus = "new" | "contacted" | "site_visit" | "negotiation" | "converted" | "lost";
export type UserRole = "admin" | "associate" | "sub-associate";

export interface Profile {
  id: string; // UUID
  email: string;
  full_name: string;
  role: UserRole;
  referral_code?: string;
  referred_by?: string;
  created_at: string;
}

// Associate is a profile with a specific role
export interface Associate extends Profile {
  role: "associate" | "sub-associate";
}

export interface Lead {
  id: string; // UUID
  name: string;
  phone: string;
  email: string;
  property_id?: string; // UUID
  property_name?: string; // Denormalized for display
  budget: number;
  status: LeadStatus;
  source: string;
  associate_id: string; // UUID
  associate_name?: string; // Denormalized
  notes: string;
  created_at: string;
}

export interface PlotUnit {
  id: string;
  property_id: string;
  unit_number: string;
  status: "available" | "reserved" | "sold";
  buyer_name?: string;
  price?: number;
  size?: string;
  facing?: string;
  created_at: string;
}

export interface Property {
  id: string; // UUID
  name: string;
  location: string;
  type: "residential" | "commercial" | "plot";
  price_range: string;
  status: "available" | "reserved" | "sold";
  image_url?: string;
  images?: string[];
  map_image?: string;
  plot_units?: PlotUnit[];
  associate_id?: string;
  associate_name?: string;
  created_at: string;
}

export interface Sale {
  id: string; // UUID
  property_id: string;
  property_name: string;
  associate_id: string;
  buyer_name: string;
  sale_amount: number;
  commission_amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}
