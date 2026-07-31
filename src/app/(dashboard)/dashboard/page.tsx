"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Users, Building2, TrendingUp, Wallet, Target,
  Clock, CheckCircle2, ChevronRight, Star, IndianRupee,
} from "lucide-react";
import { useCrmData } from "@/hooks/use-crm-data";
import { useCurrentUser } from "@/hooks/use-auth";

const formatINR = (v: number) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : `₹${(v / 100000).toFixed(0)}L`;

const STATUS_COLORS: Record<string, string> = {
  available: "#22c55e",
  reserved: "#f59e0b",
  sold: "#6366f1",
};

export default function DashboardPage() {
  const { leads, properties, associates, sales, telecallers, loading } = useCrmData();
  const { user, loading: userLoading } = useCurrentUser();

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  if (user?.role === "telecaller" || user?.role === "marketing-manager") {
    const allPlots = properties.flatMap((property) => property.plot_units || []);
    const ownLeads = leads.filter((lead) => lead.telecaller_id === user.id);
    const plotCounts = {
      available: allPlots.filter((plot) => plot.status === "available").length,
      reserved: allPlots.filter((plot) => plot.status === "reserved").length,
      sold: allPlots.filter((plot) => plot.status === "sold").length,
    };

    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1e1b4b]">
              Welcome, {user.full_name}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Check live plot availability before booking.</p>
          </div>
          <Link
            href="/properties"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Open Plot Inventory
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Plots", value: allPlots.length, color: "#6366f1", bg: "#eef2ff" },
            { label: "Available", value: plotCounts.available, color: "#16a34a", bg: "#dcfce7" },
            { label: "Reserved", value: plotCounts.reserved, color: "#d97706", bg: "#fef3c7" },
            { label: "Sold", value: plotCounts.sold, color: "#dc2626", bg: "#fee2e2" },
          ].map((item) => (
            <Card key={item.label} className="p-4 bg-white border-0 shadow-sm rounded-2xl">
              <div className="w-9 h-9 rounded-xl mb-3" style={{ background: item.bg }} />
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">{item.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#1e1b4b]">Property Plot Status</h2>
              <span className="text-xs text-gray-400">{properties.length} properties</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {properties.map((property) => {
                const plots = property.plot_units || [];
                const available = plots.filter((plot) => plot.status === "available").length;
                const reserved = plots.filter((plot) => plot.status === "reserved").length;
                const sold = plots.filter((plot) => plot.status === "sold").length;
                return (
                  <Card key={property.id} className="p-4 bg-white border-0 shadow-sm rounded-2xl">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-bold text-sm text-[#1e1b4b]">{property.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{property.location}</p>
                      </div>
                      <Building2 className="w-5 h-5 text-indigo-500 shrink-0" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="rounded-lg bg-green-50 p-2 text-center">
                        <p className="text-base font-bold text-green-600">{available}</p>
                        <p className="text-[10px] text-green-700">Available</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-2 text-center">
                        <p className="text-base font-bold text-amber-600">{reserved}</p>
                        <p className="text-[10px] text-amber-700">Reserved</p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-2 text-center">
                        <p className="text-base font-bold text-red-600">{sold}</p>
                        <p className="text-[10px] text-red-700">Sold</p>
                      </div>
                    </div>
                    <Link
                      href="/properties"
                      className="inline-flex w-full h-9 items-center justify-center rounded-xl border border-slate-200 text-xs font-medium text-[#1e1b4b] hover:bg-slate-50"
                    >
                      View and Book Plot
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="p-5 bg-white border-0 shadow-sm rounded-2xl h-fit">
            <h2 className="font-bold text-[#1e1b4b] mb-4">My Leads</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Assigned Leads</span>
                <span className="font-bold text-indigo-600">{ownLeads.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">New</span>
                <span className="font-bold text-[#1e1b4b]">{ownLeads.filter((lead) => lead.status === "new").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Converted</span>
                <span className="font-bold text-green-600">{ownLeads.filter((lead) => lead.status === "converted").length}</span>
              </div>
            </div>
            <Link
              href="/leads"
              className="inline-flex w-full mt-4 h-9 items-center justify-center rounded-xl bg-[#1e1b4b] text-sm font-semibold text-white hover:bg-[#0f0d24]"
            >
              Open My Leads
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // ── Leads ──
  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.status === "converted").length;
  const inProgressLeads = leads.filter((l) => ["contacted", "site_visit", "negotiation"].includes(l.status)).length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const overdueFollowups = leads.filter((l) => l.next_followup_date && l.next_followup_date < todayStr).length;
  const dueTodayFollowups = leads.filter((l) => l.next_followup_date === todayStr).length;

  // ── Properties ──
  const totalProps = properties.length;
  const availableProps = properties.filter((p) => p.status === "available").length;
  const pieData = ["available", "reserved", "sold"]
    .map((st) => ({
      name: st.charAt(0).toUpperCase() + st.slice(1),
      value: properties.filter((p) => p.status === st).length,
      color: STATUS_COLORS[st],
    }))
    .filter((d) => d.value > 0);

  // ── Telecallers ──
  const activeTelecallers = telecallers.filter((t) => t.status === "active").length;

  // ── Sales ──
  const approvedSales = sales.filter((s) => s.status === "approved");
  const pendingSales = sales.filter((s) => s.status === "pending");
  const totalSalesValue = approvedSales.reduce((sum, s) => sum + (s.sale_amount || 0), 0);

  // Last 7 months revenue from real sales
  const now = new Date();
  const salesData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const monthSales = sales.filter((s) => {
      const sd = new Date(s.sale_date || s.created_at);
      return `${sd.getFullYear()}-${sd.getMonth()}` === key;
    });
    return {
      month: d.toLocaleString("en-US", { month: "short" }),
      sales: monthSales.length,
      commissions: monthSales.reduce((x, s) => x + (s.commission_amount || 0), 0),
    };
  });

  const recentSales = [...sales]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)
    .map((s) => ({
      property: s.property_name,
      associate: s.associate_name || "—",
      amount: s.sale_amount,
      status: s.status,
      date: new Date(s.sale_date || s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

  // ── Associates ──
  const topAssociates = [...associates]
    .sort((a, b) => (b.commission || 0) - (a.commission || 0))
    .slice(0, 4)
    .map((a) => ({ name: a.full_name, sales: a.sales || 0, commission: a.commission || 0 }));

  // ── Priority tasks (derived from real data) ──
  const priorityTasks = [
    { title: "Approve pending sales", due: "Today", done: `${pendingSales.length} pending`, icon: CheckCircle2, color: "#6366f1" },
    { title: "Contact new leads", due: "Today", done: `${newLeads} new`, icon: Target, color: "#ec4899" },
    { title: "Overdue follow-ups", due: "Now", done: `${overdueFollowups} overdue`, icon: Clock, color: "#f59e0b" },
    { title: "Follow-ups due today", due: "Today", done: `${dueTodayFollowups} due`, icon: Wallet, color: "#14b8a6" },
  ];

  const statCards = [
    { title: "Total Leads", value: totalLeads.toString(), sub: `${newLeads} new`, icon: Target, color: "#ec4899", bg: "#fce7f3" },
    { title: "Converted", value: convertedLeads.toString(), sub: `${conversionRate}% conversion`, icon: CheckCircle2, color: "#22c55e", bg: "#dcfce7" },
    { title: "Properties", value: totalProps.toString(), sub: `${availableProps} available`, icon: Building2, color: "#14b8a6", bg: "#ccfbf1" },
    { title: "Telecallers", value: telecallers.length.toString(), sub: `${activeTelecallers} active`, icon: Users, color: "#6366f1", bg: "#ede9fe" },
    { title: "Sales Value", value: totalSalesValue ? formatINR(totalSalesValue) : "₹0", sub: `${sales.length} deals`, icon: TrendingUp, color: "#6366f1", bg: "#eef2ff" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1e1b4b]">Good morning, Admin 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here&apos;s what&apos;s happening with Maheshwari Group today</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/70 px-3 py-2 rounded-xl border border-white">
          <Clock className="w-3.5 h-3.5" />
          <span>Last updated: just now</span>
        </div>
      </div>

      {/* Stat Cards — 2x2 on mobile, 5 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-4 bg-white border-0 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: card.bg }}>
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <p className="text-2xl font-bold text-[#1e1b4b] mb-0.5">{card.value}</p>
              <p className="text-xs font-semibold text-gray-600">{card.title}</p>
              <p className="text-xs font-medium mt-1" style={{ color: card.color }}>{card.sub}</p>
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
          <p className="text-xs text-gray-400 mb-4">{totalProps} total listings</p>
          {totalProps === 0 ? (
            <div className="flex items-center justify-center h-[160px] text-xs text-gray-400">No properties yet</div>
          ) : (
            <>
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
                    <span className="text-xs font-bold text-[#1e1b4b]">{item.value} <span className="text-gray-400 font-normal">({Math.round(item.value / totalProps * 100)}%)</span></span>
                  </div>
                ))}
              </div>
            </>
          )}
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
            {recentSales.length === 0 && (
              <div className="flex items-center justify-center h-24 text-xs text-gray-400">No sales recorded yet</div>
            )}
            {recentSales.map((sale, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f5f3ff] transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: sale.status === "approved" ? "#dcfce7" : "#fef3c7" }}>
                  <IndianRupee className="w-4 h-4" style={{ color: sale.status === "approved" ? "#16a34a" : "#d97706" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1e1b4b] truncate">{sale.property}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sale.associate} · {sale.date}</p>
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
            {topAssociates.length === 0 && (
              <div className="flex items-center justify-center h-24 text-xs text-gray-400">No associates yet</div>
            )}
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
            <p className="text-[11px] text-gray-500 mb-2">{pendingSales.length} sale{pendingSales.length === 1 ? "" : "s"} waiting for your approval</p>
            <Button className="w-full h-7 text-xs rounded-lg" style={{ background: "#6366f1", color: "white" }}>
              Review Sales →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
