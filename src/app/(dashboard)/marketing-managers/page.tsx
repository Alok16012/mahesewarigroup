"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  FileCheck2,
  IdCard,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MARKETING_MANAGER_MARKER = "__marketing_manager__";

type MarketingManager = {
  id: string;
  full_name: string;
  username: string;
  password: string;
  phone?: string | null;
  email?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  aadhaar_last_four?: string | null;
  aadhaar_front_path?: string | null;
  aadhaar_back_path?: string | null;
  staff_role?: "telecaller" | "marketing-manager";
  status: "active" | "inactive";
  created_at: string;
};

type ManagerForm = {
  full_name: string;
  username: string;
  password: string;
  phone: string;
  email: string;
  date_of_birth: string;
  address: string;
  aadhaar_last_four: string;
  status: MarketingManager["status"];
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

async function uploadAadhaar(file: File, staffRef: string, side: "front" | "back") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("staffRef", staffRef);
  formData.append("side", side);
  const res = await fetch("/api/staff-documents", { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Aadhaar upload failed");
  return json.path as string;
}

const generatePassword = () => `MG-MKT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const blankForm = (): ManagerForm => ({
  full_name: "",
  username: "",
  password: generatePassword(),
  phone: "",
  email: "",
  date_of_birth: "",
  address: "",
  aadhaar_last_four: "",
  status: "active",
});

export default function MarketingManagersPage() {
  const { user } = useCurrentUser();
  const [managers, setManagers] = useState<MarketingManager[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ManagerForm>(blankForm);
  const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<File | null>(null);

  const fetchManagers = async () => {
    try {
      const data = await dbSelect("telecallers");
      setManagers(data.filter((item) =>
        item.staff_role === "marketing-manager" || item.phone === MARKETING_MANAGER_MARKER
      ));
    } catch {
      toast.error("Failed to load marketing managers");
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return managers.filter((manager) =>
      [manager.full_name, manager.username, manager.email, manager.phone]
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [managers, search]);

  const resetForm = () => {
    setForm(blankForm());
    setAadhaarFront(null);
    setAadhaarBack(null);
  };

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.full_name.trim() || !form.username.trim() || !form.password.trim() || !form.phone.trim()) {
      toast.error("Name, mobile, username and password are required");
      return;
    }
    if (form.aadhaar_last_four && !/^\d{4}$/.test(form.aadhaar_last_four)) {
      toast.error("Enter only the last 4 digits of Aadhaar");
      return;
    }
    if ((aadhaarFront && !aadhaarBack) || (!aadhaarFront && aadhaarBack)) {
      toast.error("Please upload both front and back of Aadhaar");
      return;
    }

    setSaving(true);
    try {
      const staffRef = crypto.randomUUID();
      const [frontPath, backPath] = aadhaarFront && aadhaarBack
        ? await Promise.all([
            uploadAadhaar(aadhaarFront, staffRef, "front"),
            uploadAadhaar(aadhaarBack, staffRef, "back"),
          ])
        : [null, null];

      await dbMutate("insert", "telecallers", {
        full_name: form.full_name.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        date_of_birth: form.date_of_birth || null,
        address: form.address.trim() || null,
        aadhaar_last_four: form.aadhaar_last_four || null,
        aadhaar_front_path: frontPath,
        aadhaar_back_path: backPath,
        staff_role: "marketing-manager",
        status: form.status,
      });
      toast.success("Marketing login created", {
        description: aadhaarFront ? "Profile and Aadhaar documents saved securely." : "Staff profile is ready.",
      });
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
    setManagers((current) => current.map((manager) => manager.id === id ? { ...manager, ...updates } : manager));
    try {
      await dbMutate("update", "telecallers", updates as Record<string, unknown>, id);
      toast.success("Marketing manager updated");
    } catch {
      toast.error("Failed to update manager");
      await fetchManagers();
    }
  };

  const deleteManager = async (id: string) => {
    setManagers((current) => current.filter((manager) => manager.id !== id));
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
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Access restricted to admins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in text-[#1e1b4b]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing Managers</h1>
          <p className="mt-0.5 text-sm text-gray-400">Create staff logins with contact and KYC details</p>
        </div>
        <Button
          className="h-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => { resetForm(); setDialogOpen(true); }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Marketing Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-0 p-4 shadow-sm">
          <p className="text-2xl font-bold text-indigo-600">{managers.length}</p>
          <p className="text-xs text-muted-foreground">Total Staff</p>
        </Card>
        <Card className="border-0 p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{managers.filter((manager) => manager.status === "active").length}</p>
          <p className="text-xs text-muted-foreground">Active Logins</p>
        </Card>
        <Card className="border-0 p-4 shadow-sm">
          <p className="text-2xl font-bold text-amber-600">
            {managers.filter((manager) => manager.aadhaar_front_path && manager.aadhaar_back_path).length}
          </p>
          <p className="text-xs text-muted-foreground">KYC Uploaded</p>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
        <Input
          placeholder="Search name, mobile or username..."
          className="h-10 rounded-xl border-0 bg-white pl-10 text-sm shadow-sm"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-0 bg-[#fcfcff] hover:bg-[#fcfcff]">
              {["Staff", "Contact", "Login", "KYC", "Status", "Actions"].map((heading) => (
                <TableHead key={heading} className="h-12 text-xs font-bold text-[#1e1b4b]">{heading}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((manager) => (
              <TableRow key={manager.id} className="border-gray-50 transition-colors hover:bg-[#f9f8ff]">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{manager.full_name}</p>
                      {manager.date_of_birth && <p className="text-[11px] text-slate-400">DOB {manager.date_of_birth}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-xs text-slate-600">
                    {manager.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{manager.phone}</p>}
                    {manager.email && <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{manager.email}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-mono text-xs text-slate-600">{manager.username}</p>
                  <p className="mt-1 font-mono text-[11px] text-slate-400">{manager.password}</p>
                </TableCell>
                <TableCell>
                  {manager.aadhaar_front_path && manager.aadhaar_back_path ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <BadgeCheck className="h-4 w-4" />
                      Aadhaar •••• {manager.aadhaar_last_four || "verified"}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Not uploaded</span>
                  )}
                </TableCell>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50"
                    onClick={() => deleteManager(manager.id)}
                    aria-label={`Delete ${manager.full_name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                  No marketing staff found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Create Marketing Staff Login</DialogTitle>
            <p className="text-sm text-muted-foreground">Login, contact and KYC details in one place.</p>
          </DialogHeader>
          <form className="space-y-5 px-6 py-5" onSubmit={handleAdd}>
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                <UserRound className="h-4 w-4" /> Personal details
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full Name *">
                  <Input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} placeholder="e.g. Sanjay Kumar" />
                </Field>
                <Field label="Mobile Number *">
                  <Input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="10-digit mobile number" />
                </Field>
                <Field label="Email Address">
                  <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" />
                </Field>
                <Field label="Date of Birth">
                  <Input type="date" value={form.date_of_birth} onChange={(event) => setForm({ ...form, date_of_birth: event.target.value })} />
                </Field>
              </div>
              <Field label="Address">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                  <Textarea className="min-h-20 pl-10" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Complete residential address" />
                </div>
              </Field>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                <KeyRound className="h-4 w-4" /> Login details
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Login Username *">
                  <Input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="e.g. sanjay.marketing" />
                </Field>
                <Field label="Password *">
                  <div className="flex gap-2">
                    <Input className="font-mono" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                    <Button type="button" variant="outline" size="icon" onClick={() => setForm({ ...form, password: generatePassword() })} aria-label="Generate password">
                      <KeyRound className="h-4 w-4" />
                    </Button>
                  </div>
                </Field>
              </div>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                <IdCard className="h-4 w-4" /> Aadhaar KYC
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
                For privacy, enter only the last 4 digits. Documents are stored in a private bucket.
              </div>
              <Field label="Aadhaar Last 4 Digits">
                <Input
                  inputMode="numeric"
                  maxLength={4}
                  className="max-w-48 font-mono tracking-[0.3em]"
                  value={form.aadhaar_last_four}
                  onChange={(event) => setForm({ ...form, aadhaar_last_four: event.target.value.replace(/\D/g, "").slice(0, 4) })}
                  placeholder="••••"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <DocumentPicker label="Aadhaar Front" file={aadhaarFront} onChange={setAadhaarFront} />
                <DocumentPicker label="Aadhaar Back" file={aadhaarBack} onChange={setAadhaarBack} />
              </div>
            </section>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as MarketingManager["status"] })}>
                  <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700" disabled={saving}>
                  {saving ? "Creating..." : "Create Login"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function DocumentPicker({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="group flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
      <input
        type="file"
        className="sr-only"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
      {file ? (
        <>
          <FileCheck2 className="mb-2 h-6 w-6 text-emerald-600" />
          <span className="max-w-full truncate text-xs font-semibold text-slate-700">{file.name}</span>
          <span className="mt-1 text-[11px] text-slate-400">Click to replace</span>
        </>
      ) : (
        <>
          <Upload className="mb-2 h-6 w-6 text-slate-400 group-hover:text-indigo-500" />
          <span className="text-xs font-semibold text-slate-700">{label}</span>
          <span className="mt-1 text-[11px] text-slate-400">JPG, PNG, WebP or PDF · max 5 MB</span>
        </>
      )}
    </label>
  );
}
