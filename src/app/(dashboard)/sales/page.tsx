"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp, Plus, Search, CheckCircle2, Clock, XCircle,
  IndianRupee, Users, FileText, ChevronDown, ChevronUp
} from "lucide-react";

const sales = [
  {
    id: "SL-2024-091", property: "Royal Meadows - Plot A-204", broker: "Rahul Sharma",
    buyerName: "Suresh Gupta", buyerPhone: "+91 98001 23456",
    amount: 8500000, date: "2024-04-08", status: "approved",
    commissions: [
      { broker: "Rahul Sharma", role: "Seller (L0)", pct: 4, amount: 340000, status: "pending" },
      { broker: "Admin", role: "Upline (L1)", pct: 1.5, amount: 127500, status: "pending" },
    ],
  },
  {
    id: "SL-2024-090", property: "Silver Oak - Plot C-88", broker: "Priya Mehta",
    buyerName: "Ritu Agarwal", buyerPhone: "+91 97002 34567",
    amount: 12000000, date: "2024-04-06", status: "pending",
    commissions: [
      { broker: "Priya Mehta", role: "Seller (L0)", pct: 4, amount: 480000, status: "pending" },
      { broker: "Admin", role: "Upline (L1)", pct: 1.5, amount: 180000, status: "pending" },
    ],
  },
  {
    id: "SL-2024-089", property: "Green Valley - Villa B-12", broker: "Amit Kumar",
    buyerName: "Manoj Tiwari", buyerPhone: "+91 96003 45678",
    amount: 22000000, date: "2024-04-02", status: "approved",
    commissions: [
      { broker: "Amit Kumar", role: "Seller (L0)", pct: 4, amount: 880000, status: "paid" },
      { broker: "Rahul Sharma", role: "Upline (L1)", pct: 1.5, amount: 330000, status: "paid" },
      { broker: "Admin", role: "Upline (L2)", pct: 0.5, amount: 110000, status: "paid" },
    ],
  },
  {
    id: "SL-2024-088", property: "Palm Grove - Plot D-41", broker: "Sneha Reddy",
    buyerName: "Kavita Sharma", buyerPhone: "+91 95004 56789",
    amount: 5500000, date: "2024-03-28", status: "rejected",
    commissions: [],
  },
  {
    id: "SL-2024-087", property: "Lotus Park - Plot E-19", broker: "Vikram Patel",
    buyerName: "Ajay Nair", buyerPhone: "+91 94005 67890",
    amount: 7200000, date: "2024-03-22", status: "approved",
    commissions: [
      { broker: "Vikram Patel", role: "Seller (L0)", pct: 4, amount: 288000, status: "paid" },
      { broker: "Rahul Sharma", role: "Upline (L1)", pct: 1.5, amount: 108000, status: "paid" },
    ],
  },
];

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", bg: "#fef3c7", color: "#92400e", icon: Clock },
  approved: { label: "Approved", bg: "#dcfce7", color: "#166534", icon: CheckCircle2 },
  rejected: { label: "Rejected", bg: "#fee2e2", color: "#991b1b", icon: XCircle },
};

const commStatusConfig: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#fef3c7", color: "#92400e" },
  paid: { bg: "#dcfce7", color: "#166534" },
};

const formatINR = (v: number) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(2)} Cr` : `₹${(v / 100000).toFixed(2)}L`;

function SaleRow({ sale }: { sale: typeof sales[0] }) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusConfig[sale.status];
  const Icon = sc.icon;

  return (
    <>
      <TableRow
        className="hover:bg-secondary/30 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell>
          <div className="flex items-center gap-1.5">
            <code className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-[#1e1b4b]">
              {sale.id}
            </code>
          </div>
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium text-[#1e1b4b] text-sm">{sale.property}</p>
            <p className="text-xs text-muted-foreground">{sale.date}</p>
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">{sale.broker}</TableCell>
        <TableCell>
          <div>
            <p className="text-sm font-medium text-[#1e1b4b]">{sale.buyerName}</p>
            <p className="text-xs text-muted-foreground">{sale.buyerPhone}</p>
          </div>
        </TableCell>
        <TableCell>
          <span className="font-bold text-[#1e1b4b]">{formatINR(sale.amount)}</span>
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
                  onClick={(e) => e.stopPropagation()}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 text-red-500 border-red-200"
                  onClick={(e) => e.stopPropagation()}>
                  Reject
                </Button>
              </>
            )}
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded Commission Detail */}
      {expanded && sale.commissions.length > 0 && (
        <TableRow>
          <TableCell colSpan={7} className="bg-secondary/20 p-0">
            <div className="p-4">
              <p className="text-xs font-semibold text-[#1e1b4b] mb-3 flex items-center gap-2">
                <IndianRupee className="w-3.5 h-3.5 text-[#D4AF37]" />
                Commission Breakdown — Sale Value: {formatINR(sale.amount)}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {sale.commissions.map((c, i) => {
                  const cs = commStatusConfig[c.status];
                  return (
                    <div key={i} className="bg-white rounded-xl p-3 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-[#1e1b4b]">{c.broker}</p>
                        <Badge className="text-xs" style={{ background: cs.bg, color: cs.color }}>
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{c.pct}% of sale</span>
                        <span className="font-bold text-[#1e1b4b]">₹{c.amount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = sales.filter(
    (s) =>
      s.property.toLowerCase().includes(search.toLowerCase()) ||
      s.broker.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalSales = sales.reduce((a, s) => a + s.amount, 0);
  const approved = sales.filter((s) => s.status === "approved");
  const pending = sales.filter((s) => s.status === "pending");

  return (
    <div className="flex flex-col min-h-screen">
      

      <div className="flex-1 p-6 space-y-5 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Sales Value", value: formatINR(totalSales), color: "#1e1b4b", bg: "#ede9fe", icon: IndianRupee },
            { label: "Approved Sales", value: approved.length, color: "#22c55e", bg: "#dcfce7", icon: CheckCircle2 },
            { label: "Pending Approval", value: pending.length, color: "#f59e0b", bg: "#fef3c7", icon: Clock },
            { label: "Total Commission", value: "₹56.6L", color: "#D4AF37", bg: "#fefce8", icon: Users },
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
          <div className="flex items-center justify-between">
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
                <DialogTrigger
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  <Plus className="w-4 h-4" />
                  Record Sale
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-[#1e1b4b]">Record New Sale</DialogTitle>
                  </DialogHeader>
                  <RecordSaleForm onClose={() => setAddOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Sales Tab */}
          <TabsContent value="sales" className="mt-4">
            <Card className="border border-border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    {["Sale ID", "Property", "Broker", "Buyer", "Sale Amount", "Status", "Actions"].map((h) => (
                      <TableHead key={h} className="font-semibold text-[#1e1b4b] text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sale) => (
                    <SaleRow key={sale.id} sale={sale} />
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Commission Ledger Tab */}
          <TabsContent value="commissions" className="mt-4">
            <CommissionLedger />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CommissionLedger() {
  const ledger = [
    { broker: "Rahul Sharma", saleId: "SL-2024-091", property: "Royal Meadows A-204", role: "L0 Seller", pct: 4, amount: 340000, status: "pending", date: "2024-04-08" },
    { broker: "Amit Kumar", saleId: "SL-2024-089", property: "Green Valley Villa B-12", role: "L0 Seller", pct: 4, amount: 880000, status: "paid", date: "2024-04-02" },
    { broker: "Rahul Sharma", saleId: "SL-2024-089", property: "Green Valley Villa B-12", role: "L1 Upline", pct: 1.5, amount: 330000, status: "paid", date: "2024-04-02" },
    { broker: "Vikram Patel", saleId: "SL-2024-087", property: "Lotus Park E-19", role: "L0 Seller", pct: 4, amount: 288000, status: "paid", date: "2024-03-22" },
    { broker: "Rahul Sharma", saleId: "SL-2024-087", property: "Lotus Park E-19", role: "L1 Upline", pct: 1.5, amount: 108000, status: "paid", date: "2024-03-22" },
    { broker: "Priya Mehta", saleId: "SL-2024-090", property: "Silver Oak C-88", role: "L0 Seller", pct: 4, amount: 480000, status: "pending", date: "2024-04-06" },
  ];

  const totalPaid = ledger.filter((l) => l.status === "paid").reduce((a, l) => a + l.amount, 0);
  const totalPending = ledger.filter((l) => l.status === "pending").reduce((a, l) => a + l.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Total Earned", value: `₹${((totalPaid + totalPending) / 100000).toFixed(1)}L`, color: "#1e1b4b", bg: "#ede9fe" },
          { label: "Total Paid", value: `₹${(totalPaid / 100000).toFixed(1)}L`, color: "#22c55e", bg: "#dcfce7" },
          { label: "Pending Payout", value: `₹${(totalPending / 100000).toFixed(1)}L`, color: "#f59e0b", bg: "#fef3c7" },
        ].map((s) => (
          <Card key={s.label} className="p-4 border border-border shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              {["Broker", "Sale ID", "Property", "Role", "Rate", "Amount", "Status", "Date", "Action"].map((h) => (
                <TableHead key={h} className="font-semibold text-[#1e1b4b] text-xs">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.map((entry, i) => {
              const cs = commStatusConfig[entry.status];
              return (
                <TableRow key={i} className="hover:bg-secondary/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "#ede9fe", color: "#1e1b4b" }}>
                        {entry.broker.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-[#1e1b4b]">{entry.broker}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">{entry.saleId}</code>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">{entry.property}</TableCell>
                  <TableCell>
                    <Badge className="text-xs" style={{ background: "#eef2ff", color: "#6366f1" }}>{entry.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#1e1b4b]">{entry.pct}%</TableCell>
                  <TableCell className="font-bold text-[#1e1b4b]">
                    ₹{entry.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge className="text-xs px-2 py-0.5" style={{ background: cs.bg, color: cs.color }}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{entry.date}</TableCell>
                  <TableCell>
                    {entry.status === "pending" && (
                      <Button size="sm" className="h-7 text-xs px-2.5"
                        style={{ background: "#D4AF37", color: "#1e1b4b" }}>
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function RecordSaleForm({ onClose }: { onClose: () => void }) {
  const [saleAmount, setSaleAmount] = useState("");

  const commPreview = saleAmount
    ? [
        { role: "Seller (You, L0)", pct: 4, amount: Number(saleAmount) * 0.04 },
        { role: "Your Referrer (L1)", pct: 1.5, amount: Number(saleAmount) * 0.015 },
        { role: "L2 Upline", pct: 0.5, amount: Number(saleAmount) * 0.005 },
      ]
    : [];

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#1e1b4b]">Select Property *</Label>
        <Select>
          <SelectTrigger className="h-10"><SelectValue placeholder="Choose property" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="p1">Royal Meadows - Plot A-204</SelectItem>
            <SelectItem value="p2">Silver Oak - Plot C-88</SelectItem>
            <SelectItem value="p3">Palm Grove - Plot D-41</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Buyer Name *</Label>
          <Input placeholder="e.g. Suresh Gupta" className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Buyer Phone *</Label>
          <Input placeholder="+91 98xxx xxxxx" className="h-10" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#1e1b4b]">Sale Amount (₹) *</Label>
        <Input
          type="number"
          placeholder="e.g. 8500000"
          className="h-10"
          value={saleAmount}
          onChange={(e) => setSaleAmount(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#1e1b4b]">Sale Date</Label>
        <Input type="date" className="h-10" defaultValue="2024-04-10" />
      </div>

      {/* Commission Preview */}
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
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" style={{ background: "linear-gradient(135deg, #1e1b4b, #8b5cf6)", color: "white" }}>
          Submit for Approval
        </Button>
      </div>
    </div>
  );
}
