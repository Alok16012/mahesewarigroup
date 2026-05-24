"use client";

import { useState, useMemo } from "react";
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
  MoreHorizontal, User, Calendar, Headphones, Clock,
} from "lucide-react";
import { useCrmData } from "@/hooks/use-crm-data";
import { useCurrentUser, getDownlineIds } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Lead, LeadStatus, FollowUp } from "@/types/database";

const stages: { key: LeadStatus; label: string; color: string; textColor: string; borderColor: string }[] = [
  { key: "new",         label: "New",         color: "#eef2ff", textColor: "#6366f1", borderColor: "#6366f1" },
  { key: "contacted",   label: "Contacted",   color: "#eff6ff", textColor: "#3b82f6", borderColor: "#3b82f6" },
  { key: "site_visit",  label: "Site Visit",  color: "#fffbeb", textColor: "#d97706", borderColor: "#f59e0b" },
  { key: "negotiation", label: "Negotiation", color: "#fff7ed", textColor: "#ea580c", borderColor: "#f97316" },
  { key: "converted",   label: "Converted",   color: "#f0fdf4", textColor: "#16a34a", borderColor: "#22c55e" },
  { key: "lost",        label: "Lost",        color: "#fef2f2", textColor: "#dc2626", borderColor: "#ef4444" },
];

const formatINR = (v: number) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : `₹${(v / 100000).toFixed(0)}L`;

const today = new Date().toISOString().split("T")[0];

function LeadCard({
  lead, stage, onStatusChange, onAssign, onFollowup,
}: {
  lead: Lead;
  stage: typeof stages[0];
  onStatusChange: (s: any) => void;
  onAssign: () => void;
  onFollowup: () => void;
}) {
  const dueToday = lead.next_followup_date === today;
  const overdue = lead.next_followup_date && lead.next_followup_date < today;

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
        <Select onValueChange={onStatusChange}>
          <SelectTrigger className="w-6 h-6 p-0 border-0 bg-transparent flex items-center justify-center text-muted-foreground hover:text-[#1e1b4b]">
            <MoreHorizontal className="w-4 h-4" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((s) => (
              <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{lead.property_name || "N/A"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <IndianRupee className="w-3 h-3 flex-shrink-0" />
          Budget: <span className="font-medium text-[#1e1b4b]">{formatINR(lead.budget)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="w-3 h-3 flex-shrink-0" />
          {lead.phone}
        </div>
        {lead.telecaller_name && (
          <div className="flex items-center gap-1.5 text-xs text-[#6366f1]">
            <Headphones className="w-3 h-3 flex-shrink-0" />
            {lead.telecaller_name}
          </div>
        )}
      </div>

      {/* Follow-up badge */}
      {lead.next_followup_date && (
        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg mb-2 ${
          overdue ? "bg-red-50 text-red-600" : dueToday ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
        }`}>
          <Clock className="w-3 h-3 flex-shrink-0" />
          {overdue ? "Overdue: " : dueToday ? "Due today: " : "Followup: "}
          {lead.next_followup_date}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border gap-1">
        <span className="text-xs text-muted-foreground">{(lead.associate_name || "Admin").split(" ")[0]}</span>
        <div className="flex gap-1">
          <button onClick={onAssign}
            className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-[#6366f1] hover:bg-[#eef2ff] transition-colors font-medium">
            Assign
          </button>
          <button onClick={onFollowup}
            className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-[#16a34a] hover:bg-[#f0fdf4] transition-colors font-medium">
            +Followup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [tcFilter, setTcFilter] = useState("all");
  const [dueTodayOnly, setDueTodayOnly] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [assignLead, setAssignLead] = useState<Lead | null>(null);
  const [followupLead, setFollowupLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);

  const {
    leads, associates, properties, telecallers, loading,
    addLead, updateLeadStatus, deleteLead, assignLeadToTelecaller, addFollowup,
  } = useCrmData();
  const { user } = useCurrentUser();

  const visibleLeads = useMemo(() => {
    if (!user || user.role === "admin") return leads;
    const downlineIds = getDownlineIds(user.referral_code, associates);
    const allowedIds = new Set([user.id, ...downlineIds]);
    return leads.filter((l) => allowedIds.has(l.associate_id || ""));
  }, [leads, associates, user]);

  const filtered = visibleLeads.filter((l) => {
    if (dueTodayOnly && l.next_followup_date !== today) return false;
    if (tcFilter !== "all" && l.telecaller_id !== tcFilter) return false;
    return (
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      (l.property_name && l.property_name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalLeads = visibleLeads.length;
  const converted = visibleLeads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
  const dueToday = visibleLeads.filter((l) => l.next_followup_date === today).length;

  const toggleSelect = (id: string) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filtered.length && filtered.length > 0) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filtered.map((l) => l.id)));
    }
  };

  const handleBulkAssign = async (tcId: string, tcName: string) => {
    const ids = Array.from(selectedLeads);
    await Promise.all(ids.map((id) => assignLeadToTelecaller(id, tcId, tcName)));
    toast.success(`${ids.length} leads assigned to ${tcName}`);
    setSelectedLeads(new Set());
    setBulkAssignOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 space-y-5 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: "Total Leads",    value: totalLeads,    color: "#6366f1", bg: "#eef2ff" },
            { label: "New",            value: visibleLeads.filter((l) => l.status === "new").length, color: "#6366f1", bg: "#eef2ff" },
            { label: "In Progress",    value: visibleLeads.filter((l) => ["contacted","site_visit","negotiation"].includes(l.status)).length, color: "#f59e0b", bg: "#fef3c7" },
            { label: "Converted",      value: converted,     color: "#22c55e", bg: "#dcfce7" },
            { label: "Due Today",      value: dueToday,      color: "#dc2626", bg: "#fef2f2" },
          ].map((s) => (
            <Card key={s.label} className="p-4 border border-border shadow-sm text-center">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-9 h-9 w-52 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Telecaller filter */}
            {user?.role === "admin" && telecallers.length > 0 && (
              <Select value={tcFilter} onValueChange={(v) => setTcFilter(v ?? "all")}>
                <SelectTrigger className="h-9 w-44 bg-white text-sm">
                  <SelectValue placeholder="All Telecallers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Telecallers</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {telecallers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Due today toggle */}
            <button
              onClick={() => setDueTodayOnly((v) => !v)}
              className={`h-9 px-3 rounded-xl text-sm font-medium flex items-center gap-1.5 border transition-colors ${
                dueTodayOnly
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-border text-muted-foreground hover:text-[#1e1b4b]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Due Today {dueToday > 0 && <span className="ml-0.5 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{dueToday}</span>}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <Plus className="w-4 h-4" />
                Add Lead
              </DialogTrigger>
              <DialogContent size="lg">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                </DialogHeader>
                <div className="px-6 py-5">
                  <AddLeadForm
                    currentUser={user}
                    properties={properties}
                    onClose={() => setAddOpen(false)}
                    onSubmit={async (data) => { await addLead(data); setAddOpen(false); }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedLeads.size > 0 && user?.role === "admin" && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#6366f1]/30 bg-[#eef2ff]">
            <input type="checkbox" checked readOnly className="w-4 h-4 accent-[#6366f1]" />
            <span className="text-sm font-semibold text-[#6366f1]">
              {selectedLeads.size} lead{selectedLeads.size > 1 ? "s" : ""} selected
            </span>
            <div className="h-4 w-px bg-[#6366f1]/20" />
            <button
              onClick={() => setBulkAssignOpen(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <Headphones className="w-3.5 h-3.5" />
              Bulk Assign Telecaller
            </button>
            <button
              onClick={() => setSelectedLeads(new Set())}
              className="text-sm text-[#6366f1]/60 hover:text-[#6366f1] transition-colors ml-auto">
              Clear Selection
            </button>
          </div>
        )}

        {/* Tabs */}
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
                    <div className="min-h-[200px] rounded-xl p-2 space-y-2" style={{ background: stage.color + "80" }}>
                      {stageLeads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          stage={stage}
                          onStatusChange={(s) => updateLeadStatus(lead.id, s)}
                          onAssign={() => setAssignLead(lead)}
                          onFollowup={() => setFollowupLead(lead)}
                        />
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
                    {user?.role === "admin" && (
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#6366f1] cursor-pointer"
                          checked={selectedLeads.size === filtered.length && filtered.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </TableHead>
                    )}
                    {["Lead", "Contact", "Property", "Budget", "Telecaller", "Status", "Next Followup", "Actions"].map((h) => (
                      <TableHead key={h} className="font-semibold text-[#1e1b4b] text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((lead) => {
                    const stage = stages.find((s) => s.key === lead.status)!;
                    const isLeadDueToday = lead.next_followup_date === today;
                    const overdue = lead.next_followup_date && lead.next_followup_date < today;
                    const isSelected = selectedLeads.has(lead.id);
                    return (
                      <TableRow key={lead.id} className={`hover:bg-secondary/30 transition-colors ${isSelected ? "bg-[#eef2ff]/60" : ""}`}>
                        {user?.role === "admin" && (
                          <TableCell className="w-10">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-[#6366f1] cursor-pointer"
                              checked={isSelected}
                              onChange={() => toggleSelect(lead.id)}
                            />
                          </TableCell>
                        )}
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
                        <TableCell className="text-sm text-muted-foreground">{lead.property_name || "N/A"}</TableCell>
                        <TableCell className="font-semibold text-sm text-[#1e1b4b]">{formatINR(lead.budget)}</TableCell>
                        <TableCell>
                          {lead.telecaller_name ? (
                            <div className="flex items-center gap-1.5 text-xs text-[#6366f1]">
                              <Headphones className="w-3 h-3" />
                              {lead.telecaller_name}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className="text-xs px-2 py-0.5" style={{ background: stage.color, color: stage.textColor }}>
                            {stage.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.next_followup_date ? (
                            <span className={`text-xs font-medium ${overdue ? "text-red-600" : isLeadDueToday ? "text-amber-600" : "text-muted-foreground"}`}>
                              {lead.next_followup_date}
                              {isLeadDueToday && " ⚡"}
                              {overdue && " ⚠"}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Select onValueChange={(v) => updateLeadStatus(lead.id, v as any)}>
                              <SelectTrigger className="h-7 text-xs w-24 border-[#1e1b4b]/30">
                                <SelectValue placeholder="Move to" />
                              </SelectTrigger>
                              <SelectContent>
                                {stages.map((s) => (
                                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {user?.role === "admin" && (
                              <>
                                <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-[#6366f1]"
                                  title="Assign Telecaller"
                                  onClick={() => setAssignLead(lead)}>
                                  <Headphones className="w-3 h-3" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-[#16a34a]"
                                  title="Add Follow-up"
                                  onClick={() => setFollowupLead(lead)}>
                                  <Calendar className="w-3 h-3" />
                                </Button>
                              </>
                            )}
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

      {/* Assign Telecaller Modal */}
      {assignLead && (
        <AssignTelecallerModal
          lead={assignLead}
          telecallers={telecallers}
          onClose={() => setAssignLead(null)}
          onAssign={async (tcId, tcName) => {
            await assignLeadToTelecaller(assignLead.id, tcId, tcName);
            setAssignLead(null);
          }}
        />
      )}

      {/* Add Follow-up Modal */}
      {followupLead && (
        <AddFollowupModal
          lead={followupLead}
          telecallers={telecallers}
          onClose={() => setFollowupLead(null)}
          onSubmit={async (data) => {
            await addFollowup({ ...data, lead_id: followupLead.id, lead_name: followupLead.name });
            setFollowupLead(null);
          }}
        />
      )}

      {/* Bulk Assign Modal */}
      {bulkAssignOpen && (
        <BulkAssignModal
          count={selectedLeads.size}
          telecallers={telecallers}
          onClose={() => setBulkAssignOpen(false)}
          onAssign={handleBulkAssign}
        />
      )}
    </div>
  );
}

// ── Add Lead Form ─────────────────────────────────────────────────────────────

function AddLeadForm({ onClose, onSubmit, currentUser, properties }: {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  currentUser: { id: string; full_name: string; role: string } | null;
  properties: { id: string; name: string }[];
}) {
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", property_name: "",
    budget: 5000000, source: "Website", status: "new" as any, notes: "",
    associate_id: currentUser?.id || "",
    associate_name: currentUser?.full_name || "Admin",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) { toast.error("Please fill required fields"); return; }
    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Buyer Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Full name" className="pl-9 h-10"
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Phone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="+91 98xxx xxxxx" className="pl-9 h-10"
              value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#1e1b4b]">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="email" placeholder="buyer@email.com" className="pl-9 h-10"
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Interested Property</Label>
          <Select value={formData.property_name} onValueChange={(v) => setFormData({ ...formData, property_name: v || "" })}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select property" /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
              {properties.length === 0 && <SelectItem value="Other">Other</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Budget (₹)</Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="number" placeholder="9000000" className="pl-9 h-10"
              value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Lead Source</Label>
          <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v || "Website" })}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Website">Website</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Social Media">Social Media</SelectItem>
              <SelectItem value="Advertisement">Advertisement</SelectItem>
              <SelectItem value="Direct">Direct / Walk-in</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Initial Status</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
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
        <Textarea placeholder="Any additional notes about this lead..." className="resize-none" rows={3}
          value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" type="button" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={submitting} className="flex-1"
          style={{ background: "linear-gradient(135deg, #1e1b4b, #8b5cf6)", color: "white" }}>
          {submitting ? "Adding..." : "Add Lead"}
        </Button>
      </div>
    </form>
  );
}

// ── Assign Telecaller Modal ───────────────────────────────────────────────────

function AssignTelecallerModal({ lead, telecallers, onClose, onAssign }: {
  lead: Lead;
  telecallers: any[];
  onClose: () => void;
  onAssign: (tcId: string, tcName: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState(lead.telecaller_id || "");
  const [submitting, setSubmitting] = useState(false);

  const activeTelecallers = telecallers.filter((t) => t.status === "active");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { toast.error("Please select a telecaller"); return; }
    const tc = telecallers.find((t) => t.id === selected);
    if (!tc) return;
    setSubmitting(true);
    await onAssign(tc.id, tc.full_name);
    setSubmitting(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Assign Telecaller</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground mb-4">
            Assign a telecaller for lead <span className="font-semibold text-[#1e1b4b]">{lead.name}</span>
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e1b4b]">Select Telecaller</Label>
              <Select value={selected} onValueChange={(v) => setSelected(v ?? "")}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Choose telecaller..." />
                </SelectTrigger>
                <SelectContent>
                  {activeTelecallers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex items-center gap-2">
                        <Headphones className="w-3.5 h-3.5 text-[#6366f1]" />
                        {t.full_name}
                        {t.phone && <span className="text-xs text-muted-foreground">· {t.phone}</span>}
                      </div>
                    </SelectItem>
                  ))}
                  {activeTelecallers.length === 0 && (
                    <SelectItem value="_none" disabled>No active telecallers</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {lead.telecaller_name && (
              <p className="text-xs text-muted-foreground">
                Currently assigned to: <span className="font-medium">{lead.telecaller_name}</span>
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" type="button" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex-1"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
                {submitting ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Follow-up Modal ───────────────────────────────────────────────────────

function AddFollowupModal({ lead, telecallers, onClose, onSubmit }: {
  lead: Lead;
  telecallers: any[];
  onClose: () => void;
  onSubmit: (data: Omit<FollowUp, "id" | "created_at" | "lead_id" | "lead_name">) => Promise<void>;
}) {
  const [form, setForm] = useState({
    telecaller_id: lead.telecaller_id || "",
    telecaller_name: lead.telecaller_name || "",
    follow_up_date: today,
    notes: "",
    outcome: "called" as FollowUp["outcome"],
    next_followup_date: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const outcomeOptions: { value: FollowUp["outcome"]; label: string }[] = [
    { value: "called",         label: "Called" },
    { value: "no_answer",      label: "No Answer" },
    { value: "interested",     label: "Interested" },
    { value: "not_interested", label: "Not Interested" },
    { value: "callback",       label: "Callback Requested" },
  ];

  const handleTelecallerChange = (tcId: string) => {
    const tc = telecallers.find((t) => t.id === tcId);
    setForm((f) => ({ ...f, telecaller_id: tcId, telecaller_name: tc?.full_name || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.follow_up_date) { toast.error("Please set follow-up date"); return; }
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Add Follow-up</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground mb-4">
            Recording follow-up for <span className="font-semibold text-[#1e1b4b]">{lead.name}</span>
            <span className="ml-2 text-xs">({lead.phone})</span>
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e1b4b]">Telecaller</Label>
                <Select value={form.telecaller_id} onValueChange={(v) => v && handleTelecallerChange(v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select telecaller" />
                  </SelectTrigger>
                  <SelectContent>
                    {telecallers.filter((t) => t.status === "active").map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e1b4b]">Follow-up Date *</Label>
                <Input type="date" className="h-10"
                  value={form.follow_up_date}
                  onChange={(e) => setForm((f) => ({ ...f, follow_up_date: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e1b4b]">Call Outcome</Label>
              <Select value={form.outcome} onValueChange={(v) => setForm((f) => ({ ...f, outcome: v as any }))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {outcomeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e1b4b]">Notes</Label>
              <Textarea placeholder="What happened on this call?" className="resize-none" rows={3}
                value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e1b4b]">Schedule Next Follow-up</Label>
              <Input type="date" className="h-10"
                value={form.next_followup_date}
                onChange={(e) => setForm((f) => ({ ...f, next_followup_date: e.target.value }))} />
              <p className="text-xs text-muted-foreground">Leave blank if no next follow-up needed</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" type="button" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex-1"
                style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)", color: "white" }}>
                {submitting ? "Saving..." : "Save Follow-up"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Bulk Assign Modal ─────────────────────────────────────────────────────────

function BulkAssignModal({ count, telecallers, onClose, onAssign }: {
  count: number;
  telecallers: any[];
  onClose: () => void;
  onAssign: (tcId: string, tcName: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const active = telecallers.filter((t) => t.status === "active");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { toast.error("Please select a telecaller"); return; }
    const tc = telecallers.find((t) => t.id === selected);
    if (!tc) return;
    setSubmitting(true);
    await onAssign(tc.id, tc.full_name);
    setSubmitting(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent size="default">
        <DialogHeader>
          <DialogTitle>Bulk Assign Telecaller</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[#eef2ff]">
            <Headphones className="w-4 h-4 text-[#6366f1]" />
            <p className="text-sm font-semibold text-[#6366f1]">
              {count} lead{count > 1 ? "s" : ""} will be assigned
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e1b4b]">Select Telecaller *</Label>
              <Select value={selected} onValueChange={(v) => setSelected(v ?? "")}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Choose telecaller..." />
                </SelectTrigger>
                <SelectContent>
                  {active.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#eef2ff] flex items-center justify-center text-[10px] font-bold text-[#6366f1]">
                          {t.full_name.charAt(0)}
                        </div>
                        {t.full_name}
                        {t.phone && <span className="text-xs text-muted-foreground">· {t.phone}</span>}
                      </div>
                    </SelectItem>
                  ))}
                  {active.length === 0 && (
                    <SelectItem value="_none" disabled>No active telecallers</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">All {count} selected leads will be assigned to this telecaller.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" type="button" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={submitting || !selected} className="flex-1"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
                {submitting ? `Assigning ${count}...` : `Assign ${count} Leads`}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
