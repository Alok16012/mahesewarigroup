"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Users, Building2, TrendingUp, Wallet, Target,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2,
  ChevronRight, Star, IndianRupee,
} from "lucide-react";

const salesData = [
  { month: "Oct", sales: 12, commissions: 480000 },
  { month: "Nov", sales: 18, commissions: 720000 },
  { month: "Dec", sales: 15, commissions: 600000 },
  { month: "Jan", sales: 22, commissions: 880000 },
  { month: "Feb", sales: 28, commissions: 1120000 },
  { month: "Mar", sales: 35, commissions: 1400000 },
  { month: "Apr", sales: 30, commissions: 1200000 },
];

const pieData = [
  { name: "Available", value: 320, color: "#22c55e" },
  { name: "Reserved", value: 85, color: "#f59e0b" },
  { name: "Sold", value: 212, color: "#6366f1" },
];

const topAssociates = [
  { name: "Rahul Sharma", sales: 24, commission: 960000, trend: "+18%" },
  { name: "Priya Mehta", sales: 18, commission: 720000, trend: "+12%" },
  { name: "Amit Kumar", sales: 12, commission: 480000, trend: "+8%" },
  { name: "Sneha Reddy", sales: 9, commission: 360000, trend: "+5%" },
];

const recentSales = [
  { property: "Royal Meadows - Plot A-204", associate: "Rahul Sharma", amount: 8500000, status: "approved", date: "Apr 8" },
  { property: "Silver Oak - Plot C-88", associate: "Priya Mehta", amount: 12000000, status: "pending", date: "Apr 6" },
  { property: "Green Valley - Villa B-12", associate: "Amit Kumar", amount: 22000000, status: "approved", date: "Apr 2" },
  { property: "Lotus Park - Plot E-19", associate: "Vikram Patel", amount: 7200000, status: "approved", date: "Mar 22" },
];

const priorityTasks = [
  { title: "Approve 2 pending sales", due: "Today", done: "0/2", icon: CheckCircle2, color: "#6366f1" },
  { title: "Process commission payouts", due: "Apr 11", done: "3/8 paid", icon: Wallet, color: "#14b8a6" },
  { title: "Review new associate registrations", due: "Apr 12", done: "2/5 reviewed", icon: Users, color: "#f59e0b" },
  { title: "Follow up on stale leads", due: "Apr 13", done: "12/28 contacted", icon: Target, color: "#ec4899" },
];

const formatINR = (v: number) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : `₹${(v / 100000).toFixed(0)}L`;

import { useCrmData } from "@/hooks/use-crm-data";

export default function DashboardPage() {
  const { leads, loading } = useCrmData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  // Aggregate stats from leads
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === "converted").length;
  const inProgressLeads = leads.filter(l => ["contacted", "site_visit", "negotiation"].includes(l.status)).length;
  const newLeadsThisMonth = leads.filter(l => l.status === "new").length; // Simplified for now

  // Format INR helper
  const formatINR = (v: number) =>
    v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : `₹${(v / 100000).toFixed(0)}L`;

  const statCards = [
    { title: "Total Brokers", value: "1,284", change: "+12%", up: true, sub: "48 new this month", icon: Users, color: "#6366f1", bg: "#ede9fe" },
    { title: "Properties Listed", value: "617", change: "+8%", up: true, sub: "320 available now", icon: Building2, color: "#14b8a6", bg: "#ccfbf1" },
    { title: "Sales This Month", value: "₹4.8Cr", change: "+23%", up: true, sub: "35 transactions", icon: TrendingUp, color: "#22c55e", bg: "#dcfce7" },
    { title: "Total Leads", value: totalLeads.toString(), change: "+17%", up: true, sub: `${newLeadsThisMonth} new leads`, icon: Target, color: "#ec4899", bg: "#fce7f3" },
    { title: "Active Contacts", value: inProgressLeads.toString(), change: "+5%", up: true, sub: "In pipeline", icon: Clock, color: "#6366f1", bg: "#eef2ff" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1e1b4b]">Good morning, Admin 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here&apos;s what&apos;s happening with Masheuri Group today</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/70 px-3 py-2 rounded-xl border border-white">
          <Clock className="w-3.5 h-3.5" />
          <span>Last updated: just now</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-4 bg-white border-0 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: card.bg }}>
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${card.up ? "text-green-500" : "text-red-400"}`}>
                  {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1e1b4b] mb-0.5">{card.value}</p>
              <p className="text-xs font-medium text-gray-500">{card.title}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Revenue Chart — 2 cols */}
        <Card className="col-span-1 lg:col-span-2 p-5 bg-white border-0 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[#1e1b4b]">Revenue Analytics</h3>
              <p className="text-xs text-gray-400 mt-0.5">Sales value trend — last 7 months</p>
            </div>
            <div className="flex gap-1">
              {["3M", "6M", "1Y"].map((t, i) => (
                <button key={t} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${i === 1 ? "bg-[#6366f1] text-white" : "text-gray-400 hover:bg-[#f5f3ff]"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} yAxisId="l" />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} yAxisId="r" orientation="right" tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 12 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => name === "commissions" ? [formatINR(Number(value)), "Commission"] : [value, "Sales"]} />
              <Area yAxisId="l" type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradPurple)" dot={false} />
              <Area yAxisId="r" type="monotone" dataKey="commissions" stroke="#14b8a6" strokeWidth={2.5} fill="url(#gradTeal)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-2">
            {[{ label: "Sales Count", color: "#6366f1" }, { label: "Commission (₹)", color: "#14b8a6" }].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </Card>

        {/* Property Status Pie */}
        <Card className="p-5 bg-white border-0 shadow-sm rounded-2xl">
          <h3 className="font-bold text-[#1e1b4b] mb-1">Property Status</h3>
          <p className="text-xs text-gray-400 mb-4">617 total listings</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </span>
                <span className="text-xs font-bold text-[#1e1b4b]">{item.value} <span className="text-gray-400 font-normal">({Math.round(item.value/617*100)}%)</span></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Recent Sales */}
        <Card className="p-5 bg-white border-0 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1e1b4b]">Recent Sales</h3>
            <button className="text-xs font-medium text-[#6366f1] hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentSales.map((sale, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f5f3ff] transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: sale.status === "approved" ? "#dcfce7" : "#fef3c7" }}>
                  <IndianRupee className="w-4 h-4" style={{ color: sale.status === "approved" ? "#16a34a" : "#d97706" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1e1b4b] truncate">{sale.property}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sale.broker} · {sale.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-[#1e1b4b]">{formatINR(sale.amount)}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sale.status === "approved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Associates */}
        <Card className="p-5 bg-white border-0 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1e1b4b]">Top Associates</h3>
            <Badge className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#ede9fe", color: "#6366f1" }}>This Month</Badge>
          </div>
          <div className="space-y-3">
            {topAssociates.map((associate, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? "bg-amber-100 text-amber-600" : "bg-[#ede9fe] text-[#6366f1]"}`}>
                  {i === 0 ? <Star className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1e1b4b] truncate">{associate.name}</p>
                  <p className="text-xs text-gray-400">{formatINR(associate.commission)} earned</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-[#6366f1]">{associate.sales} sales</p>
                  <p className="text-[10px] text-green-500">{associate.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Priority Tasks */}
        <Card className="md:col-span-2 lg:col-span-1 p-5 bg-white border-0 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1e1b4b]">Priority Tasks</h3>
            <button className="text-xs font-medium text-[#6366f1] hover:underline">See all</button>
          </div>
          <div className="space-y-2">
            {priorityTasks.map((task, i) => {
              const Icon = task.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f3ff] transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: task.color + "18" }}>
                    <Icon className="w-4 h-4" style={{ color: task.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1e1b4b] truncate">{task.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Due {task.due} · {task.done}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#6366f1] transition-colors flex-shrink-0" />
                </div>
              );
            })}
          </div>

          {/* Quick action */}
          <div className="mt-4 p-3 rounded-xl border border-dashed border-[#c4b5fd] bg-[#faf5ff]">
            <p className="text-xs font-medium text-[#6366f1] mb-1">💡 Quick Action</p>
            <p className="text-[11px] text-gray-500 mb-2">2 sales are waiting for your approval</p>
            <Button className="w-full h-7 text-xs rounded-lg" style={{ background: "#6366f1", color: "white" }}>
              Review Sales →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
