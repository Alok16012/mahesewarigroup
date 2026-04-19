"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, Search, UserCheck, UserX, TrendingUp, ChevronDown,
  ChevronRight, Copy, Phone, Mail, Calendar, Hash, Plus,
  Lock, Percent, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// ─── MLM Rules ────────────────────────────────────────────────────────────────
// Admin (L0)  →  L1 associates  →  L2 associates  →  L3 associates
// L3 CANNOT create anyone below them (vertical depth 2 per chain exhausted)
// Horizontal: any level can create unlimited direct recruits
// Commission: seller earns 4% · their sponsor earns 2% (total 6%)
// ─────────────────────────────────────────────────────────────────────────────

type AssociateLevel = 1 | 2 | 3;
type AssociateStatus = "active" | "inactive" | "suspended";

type Associate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: AssociateLevel;
  status: AssociateStatus;
  referralCode: string;
  parentId: string | "admin";
  parentName: string;
  joined: string;
  sales: number;
  commission: number;
};

const INITIAL_ASSOCIATES: Associate[] = [
  // Level 1 — direct under Admin
  {
    id: "A-001", name: "Alok Kumar", email: "alok@email.com", phone: "+91 98765 00001",
    level: 1, status: "active", referralCode: "MG-AK-001", parentId: "admin", parentName: "Admin",
    joined: "2024-01-10", sales: 18, commission: 720000,
  },
  {
    id: "A-002", name: "Priya Mehta", email: "priya@email.com", phone: "+91 98765 00002",
    level: 1, status: "active", referralCode: "MG-PM-002", parentId: "admin", parentName: "Admin",
    joined: "2024-01-15", sales: 22, commission: 880000,
  },
  // Level 2 — under Alok (A-001)
  {
    id: "A-003", name: "Ram Singh", email: "ram@email.com", phone: "+91 98765 00003",
    level: 2, status: "active", referralCode: "MG-RS-003", parentId: "A-001", parentName: "Alok Kumar",
    joined: "2024-02-01", sales: 10, commission: 400000,
  },
  {
    id: "A-004", name: "Subham Gupta", email: "subham@email.com", phone: "+91 98765 00004",
    level: 2, status: "active", referralCode: "MG-SG-004", parentId: "A-001", parentName: "Alok Kumar",
    joined: "2024-02-10", sales: 8, commission: 320000,
  },
  // Level 2 — under Priya (A-002)
  {
    id: "A-005", name: "Vikram Joshi", email: "vikram@email.com", phone: "+91 98765 00005",
    level: 2, status: "inactive", referralCode: "MG-VJ-005", parentId: "A-002", parentName: "Priya Mehta",
    joined: "2024-02-20", sales: 4, commission: 160000,
  },
  // Level 3 — under Ram (A-003), CANNOT create more
  {
    id: "A-006", name: "Amar Patel", email: "amar@email.com", phone: "+91 98765 00006",
    level: 3, status: "active", referralCode: "MG-AP-006", parentId: "A-003", parentName: "Ram Singh",
    joined: "2024-03-05", sales: 3, commission: 120000,
  },
  {
    id: "A-007", name: "Geeta Sharma", email: "geeta@email.com", phone: "+91 98765 00007",
    level: 3, status: "active", referralCode: "MG-GS-007", parentId: "A-003", parentName: "Ram Singh",
    joined: "2024-03-10", sales: 5, commission: 200000,
  },
  // Level 3 — under Subham (A-004), CANNOT create more
  {
    id: "A-008", name: "Deepika Rao", email: "deepika@email.com", phone: "+91 98765 00008",
    level: 3, status: "active", referralCode: "MG-DR-008", parentId: "A-004", parentName: "Subham Gupta",
    joined: "2024-03-15", sales: 2, commission: 80000,
  },
  // Level 3 — under Vikram (A-005), CANNOT create more
  {
    id: "A-009", name: "Sneha Reddy", email: "sneha@email.com", phone: "+91 98765 00009",
    level: 3, status: "active", referralCode: "MG-SR-009", parentId: "A-005", parentName: "Vikram Joshi",
    joined: "2024-03-20", sales: 1, commission: 40000,
  },
];

const statusConfig: Record<AssociateStatus, { label: string; bg: string; color: string }> = {
  active: { label: "Active", bg: "#dcfce7", color: "#166534" },
  inactive: { label: "Inactive", bg: "#f1f5f9", color: "#64748b" },
  suspended: { label: "Suspended", bg: "#fee2e2", color: "#991b1b" },
};

const levelConfig: Record<AssociateLevel, { color: string; bg: string; label: string }> = {
  1: { color: "#6366f1", bg: "#eef2ff", label: "Level 1" },
  2: { color: "#f59e0b", bg: "#fffbeb", label: "Level 2" },
  3: { color: "#22c55e", bg: "#f0fdf4", label: "Level 3" },
};

const formatINR = (v: number) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(2)}Cr` : `₹${(v / 100000).toFixed(1)}L`;

// ─── Tree Node ────────────────────────────────────────────────────────────────
function AssociateNode({
  associate,
  allAssociates,
  depth,
  onAdd,
}: {
  associate: Associate;
  allAssociates: Associate[];
  depth: number;
  onAdd: (parent: Associate) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = allAssociates.filter((a) => a.parentId === associate.id);
  const hasChildren = children.length > 0;
  const lc = levelConfig[associate.level];
  const canCreate = associate.level < 3;

  return (
    <div className="ml-5">
      <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#f5f3ff]/60 group transition-colors">
        {/* expand/collapse toggle */}
        <div
          className="w-5 h-5 flex items-center justify-center flex-shrink-0 cursor-pointer"
          onClick={() => hasChildren && setExpanded(!expanded)}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
          )}
        </div>

        {/* avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: lc.bg, color: lc.color }}
        >
          {associate.name.charAt(0)}
        </div>

        {/* info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#1e1b4b] truncate">{associate.name}</p>
            <Badge className="text-[10px] px-1.5 py-0" style={{ background: lc.bg, color: lc.color }}>
              L{associate.level}
            </Badge>
            {!canCreate && (
              <span className="flex items-center gap-1 text-[10px] text-orange-500 font-medium">
                <Lock className="w-3 h-3" /> Vertical limit reached
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{associate.referralCode}</p>
        </div>

        {/* stats */}
        <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            {associate.sales} sales
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400" />
            {children.length} direct
          </span>
        </div>

        {/* add button */}
        {canCreate && (
          <button
            onClick={() => onAdd(associate)}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-[#6366f1] bg-[#eef2ff] hover:bg-[#e0e7ff] px-2 py-1 rounded-lg"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        )}
      </div>

      {/* children */}
      {hasChildren && expanded && (
        <div className="border-l-2 border-dashed border-border/60 ml-[22px]">
          {children.map((child) => (
            <AssociateNode
              key={child.id}
              associate={child}
              allAssociates={allAssociates}
              depth={depth + 1}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Associate Dialog ──────────────────────────────────────────────────────
function AddAssociateDialog({
  open,
  defaultParent,
  allAssociates,
  onClose,
  onAdd,
}: {
  open: boolean;
  defaultParent: Associate | null;
allAssociates: Associate[];
  onClose: () => void;
  onAdd: (data: Omit<Associate, "id" | "referralCode">, creds: { username: string; password: string }) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    parentId: defaultParent?.id ?? "admin",
    status: "active" as AssociateStatus,
  });

  // Sync parent selection when dialog is opened from a different node
  useEffect(() => {
    setForm((prev) => ({ ...prev, parentId: defaultParent?.id ?? "admin" }));
  }, [defaultParent, open]);

  const eligibleParents = allAssociates.filter((a) => a.level < 3 && a.status === "active");

  const resolveParent = (parentId: string) => {
    if (parentId === "admin") return { name: "Admin", level: 0 };
    const p = allAssociates.find((a) => a.id === parentId);
    return p ? { name: p.name, level: p.level } : { name: "Admin", level: 0 };
  };

  const parentInfo = resolveParent(form.parentId);
  const newLevel = (parentInfo.level + 1) as AssociateLevel;

  const generateUsername = (name: string) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, ".");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${cleanName}${random}`;
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Name and phone are required");
      return;
    }
    const username = form.username || generateUsername(form.name);
    const password = form.password || generatePassword();
    
    const parent = form.parentId === "admin"
      ? { id: "admin" as const, name: "Admin" }
      : allAssociates.find((a) => a.id === form.parentId)!;
    onAdd({
      name: form.name,
      email: form.email,
      phone: form.phone,
      level: newLevel,
      status: form.status,
      parentId: form.parentId,
      parentName: parent.name,
      joined: new Date().toISOString().split("T")[0],
      sales: 0,
      commission: 0,
    }, { username, password });
  };

  const handleClose = () => {
    setForm({ name: "", email: "", phone: "", username: "", password: "", parentId: "admin", status: "active" });
    onClose();
  };

  const lc = newLevel <= 3 ? levelConfig[newLevel as AssociateLevel] : levelConfig[3];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md p-0">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
          <DialogTitle className="text-xl font-bold text-white">Add New Associate</DialogTitle>
          <p className="text-indigo-100 text-xs mt-1">Create a new team member in your network</p>
        </div>

        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl text-xs text-amber-800 border border-amber-100">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">MLM Rules</p>
              <p className="mt-1">Max 2 levels deep (L1→L2→L3). L3 cannot recruit. Commission: 4% direct + 2% sponsor.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Referred By *</Label>
            <Select
              value={form.parentId}
              onValueChange={(v) => v && setForm({ ...form, parentId: v })}
            >
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Select referrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (Maheshwari Group)</SelectItem>
                {eligibleParents.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — L{p.level} [{p.referralCode}]
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: lc.bg }}>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: lc.color }}>
                L{newLevel}
              </span>
              <span className="text-sm font-semibold" style={{ color: lc.color }}>
                New Level
              </span>
            </div>
            {newLevel === 3 && (
              <span className="text-xs text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                <Lock className="w-3 h-3" /> Cannot recruit
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Full Name *</Label>
            <Input
              placeholder="Enter full name"
              className="h-12 rounded-xl border-slate-200 bg-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Phone *</Label>
              <Input
                placeholder="+91 98765 XXXXX"
                className="h-12 rounded-xl border-slate-200 bg-white"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Email</Label>
              <Input
                placeholder="name@email.com"
                type="email"
                className="h-12 rounded-xl border-slate-200 bg-white"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Username</Label>
              <Input
                placeholder="Auto-generated"
                className="h-12 rounded-xl border-slate-200 bg-white"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative">
                <Input
                  placeholder="Auto-generated"
                  type={showPassword ? "text" : "password"}
                  className="h-12 rounded-xl border-slate-200 bg-white pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-1.172 2.872M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
            Leave username and password empty to auto-generate secure credentials
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" /> Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Credentials Modal ────────────────────────────────────────────────────────
function CredentialsModal({
  open,
  name,
  referralCode,
  username,
  password,
  onClose,
}: {
  open: boolean;
  name: string;
  referralCode: string;
  username: string;
  password: string;
  onClose: () => void;
}) {
  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 rounded-t-2xl -mx-0 -mt-0">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">Associate Created!</DialogTitle>
          <p className="text-green-100 text-xs mt-1">Share these credentials with {name}</p>
        </div>

        <div className="px-6 py-5 space-y-3">
          {/* Referral Code */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Referral Code</p>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
              <code className="flex-1 font-mono text-sm font-bold text-[#1e1b4b]">{referralCode}</code>
              <button onClick={() => copy(referralCode, "Referral code")} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Username</p>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
              <code className="flex-1 font-mono text-sm text-[#1e1b4b]">{username}</code>
              <button onClick={() => copy(username, "Username")} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Password</p>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
              <code className="flex-1 font-mono text-sm text-[#1e1b4b]">{password}</code>
              <button onClick={() => copy(password, "Password")} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-xs text-amber-700 border border-amber-100 mt-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Save these credentials now. The password will not be shown again.</span>
          </div>

          <Button
            className="w-full h-11 rounded-xl bg-[#1e1b4b] text-white hover:bg-[#0f0d24] font-semibold mt-2"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AssociatesPage() {
  const [associates, setAssociates] = useState<Associate[]>(INITIAL_ASSOCIATES);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addParent, setAddParent] = useState<Associate | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{
    name: string; referralCode: string; username: string; password: string;
  } | null>(null);

  const filtered = associates.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.referralCode.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === "all" || String(a.level) === filterLevel;
    return matchSearch && matchLevel;
  });

  const l1 = associates.filter((a) => a.level === 1);
  const l2 = associates.filter((a) => a.level === 2);
  const l3 = associates.filter((a) => a.level === 3);
  const active = associates.filter((a) => a.status === "active");

  const openAddFor = (parent: Associate | null) => {
    setAddParent(parent);
    setAddDialogOpen(true);
  };

  const handleAddAssociate = (data: Omit<Associate, "id" | "referralCode">, creds: { username: string; password: string }) => {
    const initials = data.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const newId = `A-${String(associates.length + 1).padStart(3, "0")}`;
    const referralCode = `MG-${initials}-${String(associates.length + 1).padStart(3, "0")}`;
    setAssociates((prev) => [...prev, { ...data, id: newId, referralCode }]);
    setAddDialogOpen(false);
    // Show credentials modal after a brief delay so the add dialog fully closes first
    setTimeout(() => {
      setCreatedCreds({ name: data.name, referralCode, username: creds.username, password: creds.password });
    }, 200);
  };

  // top-level associates (L1 under admin)
  const topLevel = associates.filter((a) => a.parentId === "admin");

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e1b4b]">Associates</h1>
          <p className="text-sm text-gray-400 mt-0.5">MLM hierarchy · L1→L2→L3 · 4% + 2% commission</p>
        </div>
        <Button
          onClick={() => openAddFor(null)}
          className="h-10 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Associate
        </Button>
      </div>

      {/* Commission structure banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Percent className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-base font-bold text-[#1e1b4b]">6%</p>
            <p className="text-xs text-muted-foreground">Total Commission</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-base font-bold text-[#1e1b4b]">4%</p>
            <p className="text-xs text-muted-foreground">Direct Seller Earns</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-base font-bold text-[#1e1b4b]">2%</p>
            <p className="text-xs text-muted-foreground">Sponsor Earns</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Associates", value: associates.length, color: "#6366f1", bg: "#eef2ff", icon: Users },
          { label: "Active", value: active.length, color: "#22c55e", bg: "#dcfce7", icon: UserCheck },
          { label: "Level 1", value: l1.length, color: "#6366f1", bg: "#eef2ff", icon: Users },
          { label: "Level 2", value: l2.length, color: "#f59e0b", bg: "#fffbeb", icon: Users },
          { label: "Level 3 (Leaf)", value: l3.length, color: "#22c55e", bg: "#f0fdf4", icon: Lock },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 border border-border shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-[#1e1b4b]">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tree">
        <TabsList className="bg-secondary">
          <TabsTrigger value="tree">Hierarchy Tree</TabsTrigger>
          <TabsTrigger value="directory">Directory</TabsTrigger>
        </TabsList>

        {/* ── Hierarchy Tree ── */}
        <TabsContent value="tree" className="mt-4">
          <Card className="border border-border shadow-sm">
            {/* header */}
            <div className="p-5 border-b border-border">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-[#1e1b4b]">MLM Hierarchy</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Vertical depth: 2 levels per chain · Horizontal: unlimited
                  </p>
                </div>
                <div className="flex gap-3 text-xs flex-wrap">
                  {([
                    { label: "Admin (Root)", color: "#1e1b4b" },
                    { label: "Level 1", color: "#6366f1" },
                    { label: "Level 2", color: "#f59e0b" },
                    { label: "Level 3 🔒", color: "#22c55e" },
                  ] as const).map((l) => (
                    <span key={l.label} className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 overflow-x-auto">
              {/* Admin root */}
              <div className="flex items-center gap-3 py-2 px-3 mb-1">
                <div className="w-5 h-5 flex-shrink-0" />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "#1e1b4b", color: "white" }}>
                  M
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1e1b4b]">Maheshwari Group (Admin)</p>
                  <p className="text-xs text-muted-foreground">Root — can create L1 associates</p>
                </div>
                <Badge className="ml-2 text-xs" style={{ background: "#ede9fe", color: "#1e1b4b" }}>Root</Badge>
                <button
                  onClick={() => openAddFor(null)}
                  className="ml-auto flex items-center gap-1 text-xs font-medium text-[#6366f1] bg-[#eef2ff] hover:bg-[#e0e7ff] px-2 py-1 rounded-lg"
                >
                  <Plus className="w-3 h-3" /> Add L1
                </button>
              </div>

              <div className="border-l-2 border-dashed border-border/60 ml-[22px]">
                {topLevel.map((a) => (
                  <AssociateNode
                    key={a.id}
                    associate={a}
                    allAssociates={associates}
                    depth={1}
                    onAdd={openAddFor}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Commission flow illustration */}
          <Card className="border border-border shadow-sm p-5 mt-4">
            <h4 className="font-semibold text-[#1e1b4b] mb-4 text-sm">Commission Flow Example</h4>
            <div className="flex items-center gap-0 overflow-x-auto">
              {[
                { name: "Amar Patel", role: "Makes a ₹10L sale", level: "L3", earn: "₹40,000 (4%)", bg: "#f0fdf4", color: "#22c55e", arrow: true },
                { name: "Ram Singh", role: "Amar's Sponsor", level: "L2", earn: "₹20,000 (2%)", bg: "#fffbeb", color: "#f59e0b", arrow: false },
              ].map((node) => (
                <div key={node.name} className="flex items-center gap-0 flex-shrink-0">
                  <div className="p-4 rounded-xl border text-center min-w-[140px]"
                    style={{ background: node.bg, borderColor: node.color + "40" }}>
                    <div className="w-9 h-9 rounded-full mx-auto flex items-center justify-center text-sm font-bold mb-2"
                      style={{ background: node.color + "20", color: node.color }}>
                      {node.name.charAt(0)}
                    </div>
                    <p className="text-xs font-bold text-[#1e1b4b]">{node.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{node.role}</p>
                    <p className="text-sm font-bold mt-2" style={{ color: node.color }}>{node.earn}</p>
                    <Badge className="text-[10px] mt-1" style={{ background: node.color + "20", color: node.color }}>
                      {node.level}
                    </Badge>
                  </div>
                  {node.arrow && (
                    <div className="flex items-center px-2 text-muted-foreground">
                      <div className="w-8 h-px bg-border" />
                      <ChevronRight className="w-4 h-4 -ml-1" />
                    </div>
                  )}
                </div>
              ))}
              <div className="ml-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 max-w-[160px]">
                <p className="font-semibold text-[#1e1b4b] mb-1">Total: ₹60,000</p>
                <p>4% + 2% = 6% of ₹10L</p>
                <p className="mt-1 text-orange-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Alok (L1) earns 0% from Amar&apos;s sale
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── Directory ── */}
        <TabsContent value="directory" className="mt-4 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search name, ID or referral code..."
                className="pl-9 h-10 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterLevel} onValueChange={(v) => setFilterLevel(v ?? "all")}>
              <SelectTrigger className="w-36 h-10 bg-white border-0 shadow-sm rounded-xl text-sm">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  {["Associate", "Contact", "Referral Code", "Level", "Referred By", "Sales", "Commission", "Status", "Actions"].map(
                    (h) => (
                      <TableHead key={h} className="font-semibold text-[#1e1b4b] text-xs">
                        {h}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((associate) => {
                  const sc = statusConfig[associate.status];
                  const lc = levelConfig[associate.level];
                  const canCreate = associate.level < 3;
                  return (
                    <TableRow key={associate.id} className="hover:bg-secondary/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: lc.bg, color: lc.color }}
                          >
                            {associate.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1e1b4b] text-sm">{associate.name}</p>
                            <p className="text-xs text-muted-foreground">{associate.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {associate.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {associate.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-[#1e1b4b]">
                            {associate.referralCode}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(associate.referralCode);
                              toast.success("Copied!");
                            }}
                            className="text-muted-foreground hover:text-[#1e1b4b]"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge className="text-xs" style={{ background: lc.bg, color: lc.color }}>
                            {lc.label}
                          </Badge>
                          {!canCreate && <Lock className="w-3 h-3 text-orange-400" aria-label="Cannot create further" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{associate.parentName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-semibold text-[#1e1b4b]">
                          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                          {associate.sales}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-sm text-[#1e1b4b]">
                        {formatINR(associate.commission)}
                      </TableCell>
                      <TableCell>
                        <Badge className="text-xs px-2 py-0.5" style={{ background: sc.bg, color: sc.color }}>
                          {sc.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {canCreate ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                              onClick={() => openAddFor(associate)}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Below
                            </Button>
                          ) : (
                            <span className="text-[10px] text-orange-400 flex items-center gap-1 px-2">
                              <Lock className="w-3 h-3" /> Leaf node
                            </span>
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

      {/* Add Associate Dialog */}
      <AddAssociateDialog
        open={addDialogOpen}
        defaultParent={addParent}
        allAssociates={associates}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddAssociate}
      />

      {/* Credentials Modal — shown after successful creation */}
      {createdCreds && (
        <CredentialsModal
          open={!!createdCreds}
          name={createdCreds.name}
          referralCode={createdCreds.referralCode}
          username={createdCreds.username}
          password={createdCreds.password}
          onClose={() => setCreatedCreds(null)}
        />
      )}
    </div>
  );
}
