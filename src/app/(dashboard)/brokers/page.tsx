"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, Search, UserCheck, UserX, TrendingUp, ChevronDown,
  ChevronRight, Copy, Phone, Mail, Calendar, Hash
} from "lucide-react";

const brokers = [
  {
    id: "B-001", name: "Rahul Sharma", email: "rahul@email.com", phone: "+91 98765 43210",
    level: 1, status: "active", referralCode: "MG-RS-001", referredBy: "Admin",
    joined: "2023-10-15", sales: 24, commission: 960000, downline: 8,
  },
  {
    id: "B-002", name: "Priya Mehta", email: "priya@email.com", phone: "+91 87654 32109",
    level: 1, status: "active", referralCode: "MG-PM-002", referredBy: "Admin",
    joined: "2023-11-02", sales: 18, commission: 720000, downline: 5,
  },
  {
    id: "B-003", name: "Amit Kumar", email: "amit@email.com", phone: "+91 76543 21098",
    level: 2, status: "active", referralCode: "MG-AK-003", referredBy: "Rahul Sharma",
    joined: "2023-11-20", sales: 12, commission: 480000, downline: 3,
  },
  {
    id: "B-004", name: "Sneha Reddy", email: "sneha@email.com", phone: "+91 65432 10987",
    level: 2, status: "active", referralCode: "MG-SR-004", referredBy: "Priya Mehta",
    joined: "2023-12-05", sales: 9, commission: 360000, downline: 2,
  },
  {
    id: "B-005", name: "Vikram Patel", email: "vikram@email.com", phone: "+91 54321 09876",
    level: 2, status: "inactive", referralCode: "MG-VP-005", referredBy: "Rahul Sharma",
    joined: "2024-01-10", sales: 4, commission: 160000, downline: 0,
  },
  {
    id: "B-006", name: "Deepika Singh", email: "deepika@email.com", phone: "+91 43210 98765",
    level: 3, status: "active", referralCode: "MG-DS-006", referredBy: "Amit Kumar",
    joined: "2024-01-25", sales: 2, commission: 80000, downline: 0,
  },
];

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: "Active", bg: "#dcfce7", color: "#166534" },
  inactive: { label: "Inactive", bg: "#f1f5f9", color: "#64748b" },
  suspended: { label: "Suspended", bg: "#fee2e2", color: "#991b1b" },
};

const formatINR = (v: number) => `₹${(v / 100000).toFixed(1)}L`;

type TreeNode = {
  name: string;
  role?: string;
  id?: string;
  code?: string;
  sales?: number;
  children: TreeNode[];
};

// Referral tree data
const treeData: TreeNode = {
  name: "Admin (Root)",
  role: "Super Admin",
  children: [
    {
      name: "Rahul Sharma",
      id: "B-001",
      code: "MG-RS-001",
      sales: 24,
      children: [
        {
          name: "Amit Kumar",
          id: "B-003",
          code: "MG-AK-003",
          sales: 12,
          children: [
            { name: "Deepika Singh", id: "B-006", code: "MG-DS-006", sales: 2, children: [] },
          ],
        },
        {
          name: "Vikram Patel",
          id: "B-005",
          code: "MG-VP-005",
          sales: 4,
          children: [],
        },
      ],
    },
    {
      name: "Priya Mehta",
      id: "B-002",
      code: "MG-PM-002",
      sales: 18,
      children: [
        { name: "Sneha Reddy", id: "B-004", code: "MG-SR-004", sales: 9, children: [] },
      ],
    },
  ],
};

function ReferralNode({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const levelColors = ["#1e1b4b", "#6366f1", "#f59e0b", "#22c55e", "#f97316"];
  const color = levelColors[Math.min(depth, levelColors.length - 1)];

  return (
    <div className="ml-6">
      <div
        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-secondary/50 cursor-pointer group transition-colors"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Toggle */}
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
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

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: color + "20", color }}
        >
          {node.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#1e1b4b] truncate">{node.name}</p>
            {depth > 0 && (
              <Badge
                className="text-[10px] px-1.5 py-0"
                style={{ background: color + "15", color }}
              >
                L{depth}
              </Badge>
            )}
          </div>
          {"id" in node && (
            <p className="text-xs text-muted-foreground">{(node as { code?: string }).code}</p>
          )}
        </div>

        {"sales" in node && (
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              {(node as { sales?: number }).sales} sales
            </span>
            {hasChildren && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-500" />
                {node.children.length} direct
              </span>
            )}
          </div>
        )}
      </div>

      {/* Connector line + children */}
      {hasChildren && expanded && (
        <div className="border-l-2 border-dashed border-border ml-[22px]">
          {node.children.map((child) => (
            <ReferralNode key={child.name} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrokersPage() {
  const [search, setSearch] = useState("");

  const filtered = brokers.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Brokers", value: "1,284", icon: Users, color: "#6366f1", bg: "#eef2ff" },
            { label: "Active", value: "1,198", icon: UserCheck, color: "#22c55e", bg: "#dcfce7" },
            { label: "Inactive", value: "74", icon: UserX, color: "#64748b", bg: "#f1f5f9" },
            { label: "Avg. Sales/Broker", value: "8.2", icon: TrendingUp, color: "#D4AF37", bg: "#fefce8" },
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

        {/* Tabs */}
        <Tabs defaultValue="directory">
          <TabsList className="bg-secondary">
            <TabsTrigger value="directory">Broker Directory</TabsTrigger>
            <TabsTrigger value="tree">Referral Tree</TabsTrigger>
          </TabsList>

          {/* Directory Tab */}
          <TabsContent value="directory" className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID or referral code..."
                  className="pl-9 h-10 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <Card className="border border-border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    {["Broker", "Contact", "Referral Code", "Level", "Referred By", "Sales", "Commission", "Status", "Actions"].map((h) => (
                      <TableHead key={h} className="font-semibold text-[#1e1b4b] text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((broker) => {
                    const sc = statusConfig[broker.status];
                    return (
                      <TableRow key={broker.id} className="hover:bg-secondary/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                              style={{ background: "#ede9fe", color: "#1e1b4b" }}>
                              {broker.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1e1b4b] text-sm">{broker.name}</p>
                              <p className="text-xs text-muted-foreground">{broker.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {broker.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {broker.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <code className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-[#1e1b4b]">
                              {broker.referralCode}
                            </code>
                            <button className="text-muted-foreground hover:text-[#1e1b4b]">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="text-xs" style={{ background: "#eef2ff", color: "#6366f1" }}>
                            Level {broker.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{broker.referredBy}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm font-semibold text-[#1e1b4b]">
                            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                            {broker.sales}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-[#1e1b4b]">
                          {formatINR(broker.commission)}
                        </TableCell>
                        <TableCell>
                          <Badge className="text-xs px-2 py-0.5" style={{ background: sc.bg, color: sc.color }}>
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" className="h-7 text-xs px-2 text-[#1e1b4b] border-[#1e1b4b]/30">
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-7 text-xs px-2 ${
                                broker.status === "active"
                                  ? "text-red-500 border-red-200 hover:bg-red-50"
                                  : "text-green-600 border-green-200 hover:bg-green-50"
                              }`}
                            >
                              {broker.status === "active" ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Referral Tree Tab */}
          <TabsContent value="tree" className="mt-4">
            <Card className="border border-border shadow-sm">
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#1e1b4b]">Referral Hierarchy</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Visual tree showing who referred whom</p>
                  </div>
                  <div className="flex gap-3 text-xs">
                    {[
                      { label: "Level 0 (Root)", color: "#1e1b4b" },
                      { label: "Level 1", color: "#6366f1" },
                      { label: "Level 2", color: "#f59e0b" },
                      { label: "Level 3", color: "#22c55e" },
                    ].map((l) => (
                      <span key={l.label} className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                        {l.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 overflow-x-auto">
                {/* Root node */}
                <div className="flex items-center gap-3 py-2 px-3 mb-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "#1e1b4b", color: "white" }}>
                    M
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1e1b4b]">Masheuri Group (Admin)</p>
                    <p className="text-xs text-muted-foreground">Root — Super Admin</p>
                  </div>
                  <Badge className="ml-2 text-xs" style={{ background: "#ede9fe", color: "#1e1b4b" }}>Root</Badge>
                </div>
                <div className="border-l-2 border-dashed border-border ml-[22px]">
                  {treeData.children.map((child) => (
                    <ReferralNode key={child.name} node={child} depth={1} />
                  ))}
                </div>
              </div>
            </Card>

            {/* Broker Detail Card */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {brokers.slice(0, 3).map((broker) => (
                <Card key={broker.id} className="p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold"
                      style={{ background: "#ede9fe", color: "#1e1b4b" }}>
                      {broker.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1e1b4b] text-sm truncate">{broker.name}</p>
                      <p className="text-xs text-muted-foreground">{broker.id}</p>
                    </div>
                    <Badge className="text-xs flex-shrink-0" style={{ background: "#dcfce7", color: "#166534" }}>Active</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Sales", value: broker.sales },
                      { label: "Downline", value: broker.downline },
                      { label: "Level", value: broker.level },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg p-2" style={{ background: "#f8fafc" }}>
                        <p className="text-base font-bold text-[#1e1b4b]">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Hash className="w-3 h-3" />
                      <code className="font-mono text-[#1e1b4b]">{broker.referralCode}</code>
                      <Copy className="w-3 h-3 ml-auto cursor-pointer hover:text-[#1e1b4b]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      Joined {broker.joined}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
