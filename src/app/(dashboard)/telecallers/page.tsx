"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Headphones, Plus, Search, Eye, EyeOff, Trash2, Phone,
  Calendar, Target, RefreshCw, Copy, ChevronRight, User,
  TrendingUp, Clock,
} from "lucide-react";
import { useCrmData } from "@/hooks/use-crm-data";
import { useCurrentUser } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Telecaller, FollowUp } from "@/types/database";

const outcomeLabel: Record<FollowUp["outcome"], { label: string; color: string; bg: string }> = {
  pending:       { label: "Pending",        color: "#6366f1", bg: "#eef2ff" },
  called:        { label: "Called",         color: "#3b82f6", bg: "#eff6ff" },
  no_answer:     { label: "No Answer",      color: "#d97706", bg: "#fffbeb" },
  interested:    { label: "Interested",     color: "#16a34a", bg: "#f0fdf4" },
  not_interested:{ label: "Not Interested", color: "#dc2626", bg: "#fef2f2" },
  callback:      { label: "Callback",       color: "#7c3aed", bg: "#f5f3ff" },
};

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
  return "MG@" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "") + ".tc";
}

export default function TelecallersPage() {
  const { leads, telecallers, followups, addTelecaller, updateTelecaller, deleteTelecaller } = useCrmData();
  const { user } = useCurrentUser();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [detailTc, setDetailTc] = useState<Telecaller | null>(null);
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Access restricted to admins.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  const filtered = telecallers.filter((t) =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.username.toLowerCase().includes(search.toLowerCase()) ||
    (t.phone || "").includes(search)
  );

  const statsFor = (tcId: string) => {
    const assigned = leads.filter((l) => l.telecaller_id === tcId);
    const converted = assigned.filter((l) => l.status === "converted").length;
    const dueToday = assigned.filter((l) => l.next_followup_date === today).length;
    return { total: assigned.length, converted, dueToday };
  };

  const totalLeadsAssigned = leads.filter((l) => l.telecaller_id).length;
  const dueToday = leads.filter((l) => l.next_followup_date === today).length;
  const activeCount = telecallers.filter((t) => t.status === "active").length;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1e1b4b]">Telecaller Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Add telecallers, assign leads, track follow-ups</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Telecallers", value: telecallers.length, color: "#6366f1", bg: "#eef2ff", icon: Headphones },
            { label: "Active",            value: activeCount,        color: "#16a34a", bg: "#f0fdf4", icon: User },
            { label: "Leads Assigned",   value: totalLeadsAssigned, color: "#f59e0b", bg: "#fef3c7", icon: Target },
            { label: "Followups Due Today", value: dueToday,        color: "#dc2626", bg: "#fef2f2", icon: Clock },
          ].map((s) => (
            <Card key={s.label} className="p-4 border border-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Content */}
        <Card className="border border-border shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search telecallers..."
                className="pl-9 h-9 w-60 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <Plus className="w-4 h-4" />
              Add Telecaller
            </button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                {["Telecaller", "Phone", "Username", "Password", "Leads", "Due Today", "Status", "Actions"].map((h) => (
                  <TableHead key={h} className="font-semibold text-[#1e1b4b] text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tc) => {
                const stats = statsFor(tc.id);
                const pwdVisible = showPwd[tc.id];
                return (
                  <TableRow key={tc.id} className="hover:bg-secondary/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: "#eef2ff", color: "#6366f1" }}>
                          {tc.full_name.charAt(0)}
                        </div>
                        <p className="font-semibold text-[#1e1b4b] text-sm">{tc.full_name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tc.phone || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">{tc.username}</code>
                        <button onClick={() => { navigator.clipboard.writeText(tc.username); toast.success("Username copied"); }}
                          className="text-muted-foreground hover:text-[#6366f1] transition-colors">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">
                          {pwdVisible ? tc.password : "●●●●●●●●"}
                        </code>
                        <button onClick={() => setShowPwd((p) => ({ ...p, [tc.id]: !p[tc.id] }))}
                          className="text-muted-foreground hover:text-[#6366f1] transition-colors">
                          {pwdVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(tc.password); toast.success("Password copied"); }}
                          className="text-muted-foreground hover:text-[#6366f1] transition-colors">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-[#1e1b4b]">{stats.total}</span>
                      {stats.converted > 0 && (
                        <span className="ml-1 text-xs text-green-600">({stats.converted} conv.)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {stats.dueToday > 0 ? (
                        <Badge className="text-xs px-2 py-0.5 bg-red-50 text-red-600 border-red-200">
                          {stats.dueToday} due
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select value={tc.status} onValueChange={(v) => updateTelecaller(tc.id, { status: v as any })}>
                        <SelectTrigger className="h-7 text-xs w-24 border-0 p-0 bg-transparent">
                          <Badge className="text-xs px-2 py-0.5" style={
                            tc.status === "active"
                              ? { background: "#f0fdf4", color: "#16a34a" }
                              : { background: "#f1f5f9", color: "#64748b" }
                          }>
                            {tc.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1"
                          onClick={() => setDetailTc(tc)}>
                          <ChevronRight className="w-3 h-3" /> View
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                          onClick={() => deleteTelecaller(tc.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                    No telecallers found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle>Add New Telecaller</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5">
            <AddTelecallerForm
              onClose={() => setAddOpen(false)}
              onSubmit={async (data) => { await addTelecaller(data); setAddOpen(false); }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      {detailTc && (
        <TelecallerDetailModal
          tc={detailTc}
          leads={leads.filter((l) => l.telecaller_id === detailTc.id)}
          followups={followups.filter((f) => f.telecaller_id === detailTc.id)}
          onClose={() => setDetailTc(null)}
        />
      )}
    </div>
  );
}

// ── Add Form ──────────────────────────────────────────────────────────────────

function AddTelecallerForm({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: Omit<Telecaller, "id" | "created_at">) => Promise<void>;
}) {
  const [form, setForm] = useState({ full_name: "", phone: "", username: "", password: generatePassword(), status: "active" as const });
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(true);

  const handleNameBlur = () => {
    if (form.full_name && !form.username) {
      setForm((f) => ({ ...f, username: slugify(f.full_name) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.username || !form.password) {
      toast.error("Name, username and password are required");
      return;
    }
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Ramesh Yadav" className="pl-9 h-10"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              onBlur={handleNameBlur}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Phone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="+91 99xxx xxxxx" className="pl-9 h-10"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#1e1b4b]">Username *</Label>
        <Input placeholder="ramesh.tc" className="h-10 font-mono"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
        />
        <p className="text-xs text-muted-foreground">Auto-generated from name. Can be edited.</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#1e1b4b]">Password *</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input className="h-10 font-mono pr-10"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#6366f1]">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="button" variant="outline" className="h-10 gap-1.5"
            onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}>
            <RefreshCw className="w-3.5 h-3.5" /> Generate
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" type="button" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={submitting} className="flex-1"
          style={{ background: "linear-gradient(135deg, #1e1b4b, #8b5cf6)", color: "white" }}>
          {submitting ? "Adding..." : "Add Telecaller"}
        </Button>
      </div>
    </form>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function TelecallerDetailModal({ tc, leads, followups, onClose }: {
  tc: Telecaller;
  leads: any[];
  followups: FollowUp[];
  onClose: () => void;
}) {
  const stages: Record<string, { color: string; textColor: string }> = {
    new:         { color: "#eef2ff", textColor: "#6366f1" },
    contacted:   { color: "#eff6ff", textColor: "#3b82f6" },
    site_visit:  { color: "#fffbeb", textColor: "#d97706" },
    negotiation: { color: "#fff7ed", textColor: "#ea580c" },
    converted:   { color: "#f0fdf4", textColor: "#16a34a" },
    lost:        { color: "#fef2f2", textColor: "#dc2626" },
  };

  const converted = leads.filter((l) => l.status === "converted").length;
  const convRate = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "#eef2ff", color: "#6366f1" }}>
              {tc.full_name.charAt(0)}
            </div>
            {tc.full_name}
            <Badge className="ml-1 text-xs" style={tc.status === "active" ? { background: "#f0fdf4", color: "#16a34a" } : { background: "#f1f5f9", color: "#64748b" }}>
              {tc.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Leads Assigned", value: leads.length, color: "#6366f1" },
              { label: "Converted",      value: converted,    color: "#16a34a" },
              { label: "Conv. Rate",     value: `${convRate}%`, color: "#D4AF37" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-secondary/50">
                <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="leads">
            <TabsList className="bg-secondary">
              <TabsTrigger value="leads">Assigned Leads ({leads.length})</TabsTrigger>
              <TabsTrigger value="followups">Follow-up History ({followups.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="leads" className="mt-3">
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      {["Lead", "Phone", "Property", "Status", "Next Followup"].map((h) => (
                        <TableHead key={h} className="text-xs font-semibold text-[#1e1b4b]">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((l) => {
                      const s = stages[l.status] || stages.new;
                      return (
                        <TableRow key={l.id}>
                          <TableCell className="font-semibold text-sm text-[#1e1b4b]">{l.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{l.phone}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{l.property_name || "—"}</TableCell>
                          <TableCell>
                            <Badge className="text-[10px] px-1.5 py-0.5" style={{ background: s.color, color: s.textColor }}>
                              {l.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {l.next_followup_date || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {leads.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">
                          No leads assigned yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="followups" className="mt-3">
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {followups.map((fu) => {
                  const o = outcomeLabel[fu.outcome];
                  return (
                    <div key={fu.id} className="flex gap-3 p-3 rounded-xl border border-border bg-white">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: o.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-[#1e1b4b]">{fu.lead_name}</p>
                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px] px-1.5 py-0.5" style={{ background: o.bg, color: o.color }}>
                              {o.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground shrink-0">{fu.follow_up_date}</span>
                          </div>
                        </div>
                        {fu.notes && <p className="text-xs text-muted-foreground">{fu.notes}</p>}
                        {fu.next_followup_date && (
                          <p className="text-xs text-[#6366f1] mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Next: {fu.next_followup_date}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {followups.length === 0 && (
                  <div className="text-center py-6 text-sm text-muted-foreground">No follow-up history</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
