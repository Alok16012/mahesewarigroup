"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, UserRound, KeyRound, Power } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MARKETING_MANAGER_MARKER = "__marketing_manager__";

type MarketingManager = {
  id: string;
  full_name: string;
  username: string;
  password: string;
  phone?: string;
  status: "active" | "inactive";
  created_at: string;
};

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

async function dbSelect(table: string): Promise<MarketingManager[]> {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "select", table }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Database error");
  return json.data || [];
}

const generatePassword = () => `MG-MKT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export default function MarketingManagersPage() {
  const { user } = useCurrentUser();
  const [managers, setManagers] = useState<MarketingManager[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    password: generatePassword(),
    status: "active" as MarketingManager["status"],
  });

  const fetchManagers = async () => {
    try {
      const data = await dbSelect("telecallers");
      setManagers(data.filter((item) => item.phone === MARKETING_MANAGER_MARKER));
    } catch {
      toast.error("Failed to load marketing managers");
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return managers.filter((manager) =>
      manager.full_name.toLowerCase().includes(q) ||
      manager.username.toLowerCase().includes(q)
    );
  }, [managers, search]);

  const resetForm = () => {
    setForm({ full_name: "", username: "", password: generatePassword(), status: "active" });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.username.trim() || !form.password.trim()) {
      toast.error("Please fill name, username and password");
      return;
    }

    setSaving(true);
    try {
      await dbMutate("insert", "telecallers", {
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
        phone: MARKETING_MANAGER_MARKER,
        status: form.status,
      });
      toast.success("Marketing manager added");
      resetForm();
      setDialogOpen(false);
      await fetchManagers();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const updateManager = async (id: string, updates: Partial<MarketingManager>) => {
    setManagers((prev) => prev.map((manager) => manager.id === id ? { ...manager, ...updates } : manager));
    try {
      await dbMutate("update", "telecallers", updates as Record<string, unknown>, id);
      toast.success("Marketing manager updated");
    } catch {
      toast.error("Failed to update manager");
      await fetchManagers();
    }
  };

  const deleteManager = async (id: string) => {
    setManagers((prev) => prev.filter((manager) => manager.id !== id));
    try {
      await dbMutate("delete", "telecallers", undefined, id);
      toast.success("Marketing manager deleted");
    } catch {
      toast.error("Failed to delete manager");
      await fetchManagers();
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Access restricted to admins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in text-[#1e1b4b]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing Managers</h1>
          <p className="text-sm text-gray-400 mt-0.5">Create login IDs for marketing staff</p>
        </div>
        <Button
          className="h-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => { resetForm(); setDialogOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Manager
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-2xl font-bold text-indigo-600">{managers.length}</p>
          <p className="text-xs text-muted-foreground">Total Managers</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{managers.filter((m) => m.status === "active").length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-2xl font-bold text-slate-600">{managers.filter((m) => m.status === "inactive").length}</p>
          <p className="text-xs text-muted-foreground">Inactive</p>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <Input
          placeholder="Search managers..."
          className="pl-10 h-10 rounded-xl bg-white border-0 shadow-sm text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fcfcff] hover:bg-[#fcfcff] border-0">
              {["Name", "Username", "Password", "Status", "Actions"].map((h) => (
                <TableHead key={h} className="font-bold text-[#1e1b4b] text-xs h-12">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((manager) => (
              <TableRow key={manager.id} className="hover:bg-[#f9f8ff] transition-colors border-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <UserRound className="w-4 h-4" />
                    </div>
                    <p className="font-bold text-sm">{manager.full_name}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-600">{manager.username}</TableCell>
                <TableCell className="font-mono text-xs text-slate-600">{manager.password}</TableCell>
                <TableCell>
                  <Select
                    value={manager.status}
                    onValueChange={(value) => updateManager(manager.id, { status: value as MarketingManager["status"] })}
                  >
                    <SelectTrigger className="h-8 w-28 rounded-lg bg-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50"
                      onClick={() => deleteManager(manager.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                  No marketing managers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle>Add Marketing Manager</DialogTitle>
          </DialogHeader>
          <form className="px-6 py-5 space-y-4" onSubmit={handleAdd}>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Full Name *</Label>
              <Input
                className="h-10"
                placeholder="e.g. Ramesh Kumar"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Login Username *</Label>
              <Input
                className="h-10"
                placeholder="e.g. ramesh.marketing"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Password *</Label>
              <div className="flex gap-2">
                <Input
                  className="h-10 font-mono"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <Button type="button" variant="outline" className="h-10" onClick={() => setForm({ ...form, password: generatePassword() })}>
                  <KeyRound className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as MarketingManager["status"] })}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 flex gap-2 text-xs text-indigo-700">
              <Power className="w-4 h-4 shrink-0" />
              Marketing managers can view property listings and add their own leads.
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700" disabled={saving}>
                {saving ? "Saving..." : "Create Login"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
