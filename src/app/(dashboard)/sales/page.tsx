"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp, Plus, Search, CheckCircle2, Clock, XCircle,
  IndianRupee, Users, ChevronDown, ChevronUp,
} from "lucide-react";
import { useCrmData, SaleRecord } from "@/hooks/use-crm-data";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  pending:  { label: "Pending",  bg: "#fef3c7", color: "#92400e", icon: Clock },
  approved: { label: "Approved", bg: "#dcfce7", color: "#166534", icon: CheckCircle2 },
  rejected: { label: "Rejected", bg: "#fee2e2", color: "#991b1b", icon: XCircle },
};

const formatINR = (v: number) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(2)} Cr` : `₹${(v / 100000).toFixed(2)}L`;

function SaleRow({ sale, onApprove, onReject }: {
  sale: SaleRecord;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusConfig[sale.status];
  const Icon = sc.icon;

  const sellerComm = sale.sale_amount * 0.04;
  const l1Comm = sale.sale_amount * 0.015;
  const l2Comm = sale.sale_amount * 0.005;

  return (
    <>
      <TableRow
        className="hover:bg-secondary/30 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell>
          <code className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-[#1e1b4b]">
            {sale.id.length > 15 ? sale.id.substring(0, 15) + "…" : sale.id}
          </code>
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium text-[#1e1b4b] text-sm">{sale.property_name}</p>
            <p className="text-xs text-muted-foreground">{sale.sale_date || sale.created_at?.split("T")[0]}</p>
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">{sale.associate_name || "—"}</TableCell>
        <TableCell>
          <div>
            <p className="text-sm font-medium text-[#1e1b4b]">{sale.buyer_name}</p>
            <p className="text-xs text-muted-foreground">{sale.buyer_phone || ""}</p>
          </div>
        </TableCell>
        <TableCell>
          <span className="font-bold text-[#1e1b4b]">{formatINR(sale.sale_amount)}</span>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit" style={{ background: sc.bg }}>
            <Icon className="w-3.5 h-3.5" style={{ color: sc.color }} />
            <span className="text-xs font-medium" style={{ color: sc.color }}>{sc.label}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
            {sale.status === "pending" && (
              <>
                <Button size="sm" className="h-7 text-xs px-2.5"
                  style={{ background: "#22c55e", color: "white" }}
                  onClick={(e) => { e.stopPropagation(); onApprove(sale.id); }}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 text-red-500 border-red-200"
                  onClick={(e) => { e.stopPropagation(); onReject(sale.id); }}>
                  Reject
                </Button>
              </>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />}
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-secondary/20 p-0">
            <div className="p-4">
              <p className="text-xs font-semibold text-[#1e1b4b] mb-3 flex items-center gap-2">
                <IndianRupee className="w-3.5 h-3.5 text-[#D4AF37]" />
                Commission Breakdown — Sale Value: {formatINR(sale.sale_amount)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { role: `${sale.associate_name || "Seller"} (L0 Seller)`, pct: 4, amount: sellerComm },
                  { role: "Referrer (L1 Upline)", pct: 1.5, amount: l1Comm },
                  { role: "L2 Upline", pct: 0.5, amount: l2Comm },
                ].map((c) => (
                  <div key={c.role} className="bg-white rounded-xl p-3 border border-border">
                    <p className="text-sm font-semibold text-[#1e1b4b] mb-1 truncate">{c.role}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{c.pct}% of sale</span>
                      <span className="font-bold text-[#1e1b4b]">₹{c.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function SalesPage() {
  const { sales, properties, loading, addSale, updateSaleStatus, usingMockData } = useCrmData();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = sales.filter(
    (s) =>
      s.property_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.associate_name || "").toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalSales = sales.reduce((a, s) => a + s.sale_amount, 0);
  const approved = sales.filter((s) => s.status === "approved");
  const pending = sales.filter((s) => s.status === "pending");
  const totalComm = sales.filter((s) => s.status === "approved").reduce((a, s) => a + s.commission_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-3 sm:p-6 space-y-5 animate-fade-in">

        {usingMockData && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-amber-50 border border-amber-200 text-amber-700">
            <Clock className="w-4 h-4 shrink-0" />
            Demo Mode — Run the SQL schema in Supabase to enable live data
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Sales Value", value: formatINR(totalSales), color: "#1e1b4b", bg: "#ede9fe", icon: IndianRupee },
            { label: "Approved Sales", value: approved.length, color: "#22c55e", bg: "#dcfce7", icon: CheckCircle2 },
            { label: "Pending Approval", value: pending.length, color: "#f59e0b", bg: "#fef3c7", icon: Clock },
            { label: "Total Commission", value: formatINR(totalComm), color: "#D4AF37", bg: "#fefce8", icon: Users },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-4 border border-border shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#1e1b4b]">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="sales">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList className="bg-secondary">
              <TabsTrigger value="sales">Sales History</TabsTrigger>
              <TabsTrigger value="commissions">Commission Ledger</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sales..."
                  className="pl-9 h-9 w-52 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-lg shadow-indigo-200"
                  style={{ background: "#6366f1" }}>
                  <Plus className="w-4 h-4" />
                  Record Sale
                </DialogTrigger>
                <DialogContent size="lg">
                  <DialogHeader>
                    <DialogTitle>Record New Sale</DialogTitle>
                  </DialogHeader>
                  <div className="px-6 py-5">
                    <RecordSaleForm
                      properties={properties}
                      onSubmit={async (data) => {
                        await addSale(data);
                        setAddOpen(false);
                      }}
                      onClose={() => setAddOpen(false)}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="sales" className="mt-4">
            <Card className="border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    {["Sale ID", "Property", "Associate", "Buyer", "Sale Amount", "Status", "Actions"].map((h) => (
                      <TableHead key={h} className="font-semibold text-[#1e1b4b] text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                        No sales found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((sale) => (
                      <SaleRow
                        key={sale.id}
                        sale={sale}
                        onApprove={(id) => updateSaleStatus(id, "approved")}
                        onReject={(id) => updateSaleStatus(id, "rejected")}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="mt-4">
            <CommissionLedger sales={sales} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CommissionLedger({ sales }: { sales: SaleRecord[] }) {
  const approvedSales = sales.filter((s) => s.status === "approved");
  const totalPaid = approvedSales.reduce((a, s) => a + s.commission_amount, 0);
  const totalPending = sales.filter((s) => s.status === "pending").reduce((a, s) => a + s.commission_amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Total Earned", value: formatINR(totalPaid + totalPending), color: "#1e1b4b", bg: "#ede9fe" },
          { label: "Approved Commission", value: formatINR(totalPaid), color: "#22c55e", bg: "#dcfce7" },
          { label: "Pending Payout", value: formatINR(totalPending), color: "#f59e0b", bg: "#fef3c7" },
        ].map((s) => (
          <Card key={s.label} className="p-4 border border-border shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              {["Associate", "Sale ID", "Property", "Sale Amount", "Commission (4%)", "Status", "Date"].map((h) => (
                <TableHead key={h} className="font-semibold text-[#1e1b4b] text-xs">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((s) => {
              const cs = s.status === "approved"
                ? { bg: "#dcfce7", color: "#166534" }
                : s.status === "pending"
                ? { bg: "#fef3c7", color: "#92400e" }
                : { bg: "#fee2e2", color: "#991b1b" };
              return (
                <TableRow key={s.id} className="hover:bg-secondary/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "#ede9fe", color: "#1e1b4b" }}>
                        {(s.associate_name || "?").charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-[#1e1b4b]">{s.associate_name || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">
                      {s.id.length > 14 ? s.id.substring(0, 14) + "…" : s.id}
                    </code>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">{s.property_name}</TableCell>
                  <TableCell className="font-semibold text-[#1e1b4b]">{formatINR(s.sale_amount)}</TableCell>
                  <TableCell className="font-bold text-[#1e1b4b]">₹{s.commission_amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge className="text-xs px-2 py-0.5" style={{ background: cs.bg, color: cs.color }}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.sale_date || s.created_at?.split("T")[0]}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </Card>
    </div>
  );
}

function RecordSaleForm({
  properties,
  onSubmit,
  onClose,
}: {
  properties: { id: string; name: string }[];
  onSubmit: (data: Omit<SaleRecord, "id" | "created_at">) => Promise<void>;
  onClose: () => void;
}) {
  const [propertyId, setPropertyId] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [saleAmount, setSaleAmount] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  const amount = Number(saleAmount) || 0;
  const commPreview = amount > 0 ? [
    { role: "Seller (You, L0)", pct: 4, amount: amount * 0.04 },
    { role: "Your Referrer (L1)", pct: 1.5, amount: amount * 0.015 },
    { role: "L2 Upline", pct: 0.5, amount: amount * 0.005 },
  ] : [];

  const handleSubmit = async () => {
    if (!propertyName || !buyerName || !amount) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        property_id: propertyId || undefined,
        property_name: propertyName,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        sale_amount: amount,
        commission_amount: Math.round(amount * 0.04),
        status: "pending",
        sale_date: saleDate,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#1e1b4b]">Select Property *</Label>
        <Select onValueChange={(val) => {
          const prop = properties.find((p) => p.id === val);
          if (prop) { setPropertyId(prop.id); setPropertyName(prop.name); }
        }}>
          <SelectTrigger className="h-10"><SelectValue placeholder="Choose property" /></SelectTrigger>
          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!propertyId && (
          <Input
            placeholder="Or type property name manually"
            className="h-9 text-sm"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Buyer Name *</Label>
          <Input placeholder="e.g. Suresh Gupta" className="h-10" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Buyer Phone</Label>
          <Input placeholder="+91 98xxx xxxxx" className="h-10" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Sale Amount (₹) *</Label>
          <Input type="number" placeholder="e.g. 8500000" className="h-10" value={saleAmount} onChange={(e) => setSaleAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Sale Date</Label>
          <Input type="date" className="h-10" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
        </div>
      </div>

      {commPreview.length > 0 && (
        <div className="rounded-xl p-4 border border-[#D4AF37]/30" style={{ background: "#fefce8" }}>
          <p className="text-xs font-semibold text-[#1e1b4b] mb-3 flex items-center gap-2">
            <IndianRupee className="w-3.5 h-3.5 text-[#D4AF37]" />
            Commission Preview
          </p>
          <div className="space-y-2">
            {commPreview.map((c) => (
              <div key={c.role} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{c.role} ({c.pct}%)</span>
                <span className="font-semibold text-[#1e1b4b]">₹{c.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button className="flex-1" style={{ background: "linear-gradient(135deg, #1e1b4b, #8b5cf6)", color: "white" }}
          onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit for Approval"}
        </Button>
      </div>
    </div>
  );
}
