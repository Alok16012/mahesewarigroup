"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Target, Plus, Search, Phone, Mail, Building2, IndianRupee,
  MoreHorizontal, Upload, Filter, User
} from "lucide-react";

type LeadStatus = "new" | "contacted" | "site_visit" | "negotiation" | "converted" | "lost";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  property: string;
  budget: number;
  status: LeadStatus;
  source: string;
  broker: string;
  notes: string;
  created: string;
}

const leads: Lead[] = [
  { id: "L-001", name: "Suresh Gupta", phone: "+91 98001 23456", email: "suresh@email.com", property: "Royal Meadows", budget: 9000000, status: "negotiation", source: "Website", broker: "Rahul Sharma", notes: "Interested in corner plot", created: "2024-04-01" },
  { id: "L-002", name: "Ritu Agarwal", phone: "+91 97002 34567", email: "ritu@email.com", property: "Silver Oak", budget: 13000000, status: "site_visit", source: "Referral", broker: "Priya Mehta", notes: "Wants 3BHK", created: "2024-04-02" },
  { id: "L-003", name: "Manoj Tiwari", phone: "+91 96003 45678", email: "manoj@email.com", property: "Green Valley", budget: 25000000, status: "converted", source: "Direct", broker: "Amit Kumar", notes: "Converted — Villa B-12", created: "2024-03-28" },
  { id: "L-004", name: "Kavita Sharma", phone: "+91 95004 56789", email: "kavita@email.com", property: "Palm Grove", budget: 6000000, status: "lost", source: "Advertisement", broker: "Sneha Reddy", notes: "Budget constraint", created: "2024-03-25" },
  { id: "L-005", name: "Ajay Nair", phone: "+91 94005 67890", email: "ajay@email.com", property: "Lotus Park", budget: 8000000, status: "contacted", source: "Website", broker: "Vikram Patel", notes: "Follow up on Tuesday", created: "2024-04-05" },
  { id: "L-006", name: "Pooja Joshi", phone: "+91 93006 78901", email: "pooja@email.com", property: "Royal Meadows", budget: 9500000, status: "new", source: "Walk-in", broker: "Rahul Sharma", notes: "Visited office today", created: "2024-04-08" },
  { id: "L-007", name: "Kiran Desai", phone: "+91 92007 89012", email: "kiran@email.com", property: "Sunrise Heights", budget: 16000000, status: "new", source: "Social Media", broker: "Priya Mehta", notes: "Interested in 2BHK", created: "2024-04-08" },
  { id: "L-008", name: "Ramesh Pillai", phone: "+91 91008 90123", email: "ramesh@email.com", property: "Heritage Hills", budget: 50000000, status: "site_visit", source: "Referral", broker: "Rahul Sharma", notes: "High-value client", created: "2024-04-03" },
];

const stages: { key: LeadStatus; label: string; color: string; textColor: string; borderColor: string }[] = [
  { key: "new", label: "New", color: "#eef2ff", textColor: "#6366f1", borderColor: "#6366f1" },
  { key: "contacted", label: "Contacted", color: "#eff6ff", textColor: "#3b82f6", borderColor: "#3b82f6" },
  { key: "site_visit", label: "Site Visit", color: "#fffbeb", textColor: "#d97706", borderColor: "#f59e0b" },
  { key: "negotiation", label: "Negotiation", color: "#fff7ed", textColor: "#ea580c", borderColor: "#f97316" },
  { key: "converted", label: "Converted", color: "#f0fdf4", textColor: "#16a34a", borderColor: "#22c55e" },
  { key: "lost", label: "Lost", color: "#fef2f2", textColor: "#dc2626", borderColor: "#ef4444" },
];

const formatINR = (v: number) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : `₹${(v / 100000).toFixed(0)}L`;

function LeadCard({ lead, stage }: { lead: Lead; stage: typeof stages[0] }) {
  return (
    <div className="bg-white rounded-xl p-3.5 border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: stage.color, color: stage.textColor }}>
            {lead.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1e1b4b]">{lead.name}</p>
            <p className="text-xs text-muted-foreground">{lead.id}</p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-[#1e1b4b] opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{lead.property}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <IndianRupee className="w-3 h-3 flex-shrink-0" />
          Budget: <span className="font-medium text-[#1e1b4b]">{formatINR(lead.budget)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="w-3 h-3 flex-shrink-0" />
          {lead.phone}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">{lead.broker.split(" ")[0]}</span>
        <Badge className="text-[10px] px-1.5 py-0.5" style={{ background: "#f1f5f9", color: "#64748b" }}>
          {lead.source}
        </Badge>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.property.toLowerCase().includes(search.toLowerCase())
  );

  const totalLeads = leads.length;
  const converted = leads.filter((l) => l.status === "converted").length;
  const conversionRate = Math.round((converted / totalLeads) * 100);

  return (
    <div className="flex flex-col min-h-screen">
      

      <div className="flex-1 p-6 space-y-5 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: "Total Leads", value: totalLeads, color: "#6366f1", bg: "#eef2ff" },
            { label: "New", value: leads.filter((l) => l.status === "new").length, color: "#6366f1", bg: "#eef2ff" },
            { label: "In Progress", value: leads.filter((l) => ["contacted","site_visit","negotiation"].includes(l.status)).length, color: "#f59e0b", bg: "#fef3c7" },
            { label: "Converted", value: converted, color: "#22c55e", bg: "#dcfce7" },
            { label: "Conversion Rate", value: `${conversionRate}%`, color: "#D4AF37", bg: "#fefce8" },
          ].map((s) => (
            <Card key={s.label} className="p-4 border border-border shadow-sm text-center">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-9 h-9 w-56 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger className="h-9 w-36 bg-white">
                <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brokers</SelectItem>
                <SelectItem value="rahul">Rahul Sharma</SelectItem>
                <SelectItem value="priya">Priya Mehta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 gap-2 text-sm border-[#1e1b4b]/30 text-[#1e1b4b]">
              <Upload className="w-3.5 h-3.5" />
              Import CSV
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <Plus className="w-4 h-4" />
                Add Lead
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-[#1e1b4b]">Add New Lead</DialogTitle>
                </DialogHeader>
                <AddLeadForm onClose={() => setAddOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs: Kanban + Table */}
        <Tabs defaultValue="kanban">
          <TabsList className="bg-secondary">
            <TabsTrigger value="kanban">Pipeline View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          {/* Kanban */}
          <TabsContent value="kanban" className="mt-4">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.map((stage) => {
                const stageLeads = filtered.filter((l) => l.status === stage.key);
                return (
                  <div key={stage.key} className="flex-shrink-0 w-64">
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: stage.borderColor }} />
                        <span className="text-sm font-semibold text-[#1e1b4b]">{stage.label}</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: stage.color, color: stage.textColor }}>
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Drop zone */}
                    <div className="min-h-[200px] rounded-xl p-2 space-y-2"
                      style={{ background: stage.color + "80" }}>
                      {stageLeads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} stage={stage} />
                      ))}
                      {stageLeads.length === 0 && (
                        <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                          No leads here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Table */}
          <TabsContent value="table" className="mt-4">
            <Card className="border border-border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    {["Lead", "Contact", "Property", "Budget", "Broker", "Source", "Status", "Actions"].map((h) => (
                      <TableHead key={h} className="font-semibold text-[#1e1b4b] text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((lead) => {
                    const stage = stages.find((s) => s.key === lead.status)!;
                    return (
                      <TableRow key={lead.id} className="hover:bg-secondary/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: stage.color, color: stage.textColor }}>
                              {lead.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1e1b4b] text-sm">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />{lead.phone}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />{lead.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{lead.property}</TableCell>
                        <TableCell className="font-semibold text-sm text-[#1e1b4b]">{formatINR(lead.budget)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{lead.broker}</TableCell>
                        <TableCell>
                          <Badge className="text-xs" style={{ background: "#f1f5f9", color: "#64748b" }}>
                            {lead.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="text-xs px-2 py-0.5" style={{ background: stage.color, color: stage.textColor }}>
                            {stage.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 text-[#1e1b4b] border-[#1e1b4b]/30">
                              Edit
                            </Button>
                            <Select>
                              <SelectTrigger className="h-7 text-xs w-24 border-[#1e1b4b]/30">
                                <SelectValue placeholder="Move to" />
                              </SelectTrigger>
                              <SelectContent>
                                {stages.map((s) => (
                                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AddLeadForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Buyer Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Full name" className="pl-9 h-10" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Phone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="+91 98xxx xxxxx" className="pl-9 h-10" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#1e1b4b]">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="email" placeholder="buyer@email.com" className="pl-9 h-10" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Interested Property</Label>
          <Select>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select property" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="p1">Royal Meadows</SelectItem>
              <SelectItem value="p2">Silver Oak</SelectItem>
              <SelectItem value="p3">Palm Grove</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Budget (₹)</Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="number" placeholder="9000000" className="pl-9 h-10" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Lead Source</Label>
          <Select>
            <SelectTrigger className="h-10"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="advertisement">Advertisement</SelectItem>
              <SelectItem value="direct">Direct / Walk-in</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Initial Status</Label>
          <Select>
            <SelectTrigger className="h-10"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#1e1b4b]">Notes</Label>
        <Textarea placeholder="Any additional notes about this lead..." className="resize-none" rows={3} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" style={{ background: "linear-gradient(135deg, #1e1b4b, #8b5cf6)", color: "white" }}>
          Add Lead
        </Button>
      </div>
    </div>
  );
}
