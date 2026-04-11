"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Settings, Percent, Bell, Building2, Shield, Plus, Trash2,
  CheckCircle2, Info, Save
} from "lucide-react";

type CommissionLevel = { level: number; relation: string; pct: number };

export default function SettingsPage() {
  const [commLevels, setCommLevels] = useState<CommissionLevel[]>([
    { level: 0, relation: "Direct Seller", pct: 4 },
    { level: 1, relation: "Level 1 Upline (Referrer)", pct: 1.5 },
    { level: 2, relation: "Level 2 Upline", pct: 0.5 },
  ]);

  const totalPct = commLevels.reduce((a, l) => a + l.pct, 0);
  const remaining = 6 - totalPct;

  const updatePct = (i: number, val: string) => {
    const updated = [...commLevels];
    updated[i].pct = parseFloat(val) || 0;
    setCommLevels(updated);
  };

  const addLevel = () => {
    setCommLevels([
      ...commLevels,
      { level: commLevels.length, relation: `Level ${commLevels.length} Upline`, pct: 0 },
    ]);
  };

  const removeLevel = (i: number) => {
    if (commLevels.length <= 1) return;
    setCommLevels(commLevels.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col min-h-screen">
      

      <div className="flex-1 p-6 animate-fade-in">
        <Tabs defaultValue="commission" orientation="vertical" className="flex gap-6">
          {/* Sidebar tabs */}
          <div className="flex-shrink-0 w-52">
            <TabsList className="flex flex-col items-start gap-1 bg-transparent p-0 h-auto">
              {[
                { value: "commission", icon: Percent, label: "Commission Rules" },
                { value: "company", icon: Building2, label: "Company Profile" },
                { value: "notifications", icon: Bell, label: "Notifications" },
                { value: "security", icon: Shield, label: "Security" },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="w-full justify-start gap-2.5 px-3 py-2.5 text-sm font-medium text-left rounded-xl data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-secondary data-[state=inactive]:hover:text-[#1e1b4b]"
                    style={{}}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="flex-1 space-y-5">
            {/* Commission Rules */}
            <TabsContent value="commission" className="mt-0">
              <Card className="p-6 border border-border shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-bold text-[#1e1b4b]">Commission Configuration</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Set percentage distribution for each referral level. Total pool = 6%.
                    </p>
                  </div>
                  <Button className="gap-2 text-sm"
                    style={{ background: "linear-gradient(135deg, #1e1b4b, #8b5cf6)", color: "white" }}>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>

                <Separator className="my-5" />

                {/* Total pool indicator */}
                <div className="rounded-xl p-4 mb-6 border border-border"
                  style={{ background: totalPct > 6 ? "#fef2f2" : totalPct === 6 ? "#f0fdf4" : "#fefce8" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e1b4b]">Commission Pool Usage</span>
                    <span className={`text-sm font-bold ${totalPct > 6 ? "text-red-600" : totalPct === 6 ? "text-green-600" : "text-amber-600"}`}>
                      {totalPct.toFixed(1)}% / 6%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((totalPct / 6) * 100, 100)}%`,
                        background: totalPct > 6 ? "#ef4444" : totalPct === 6 ? "#22c55e" : "#D4AF37",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">Distributed to brokers</span>
                    <span className="text-xs font-medium" style={{ color: remaining < 0 ? "#ef4444" : "#64748b" }}>
                      {remaining.toFixed(1)}% remains with company
                    </span>
                  </div>
                </div>

                {/* Level rows */}
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                    <span className="col-span-1">Level</span>
                    <span className="col-span-5">Relation / Description</span>
                    <span className="col-span-3">Percentage (%)</span>
                    <span className="col-span-2">Amount (₹10L sale)</span>
                    <span className="col-span-1"></span>
                  </div>

                  {commLevels.map((level, i) => (
                    <div key={i} className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl border border-border hover:border-[#1e1b4b]/30 transition-colors bg-white">
                      <div className="col-span-1">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ background: "#ede9fe", color: "#1e1b4b" }}>
                          {level.level}
                        </div>
                      </div>
                      <div className="col-span-5">
                        <Input
                          value={level.relation}
                          onChange={(e) => {
                            const updated = [...commLevels];
                            updated[i].relation = e.target.value;
                            setCommLevels(updated);
                          }}
                          className="h-9 text-sm border-0 bg-secondary focus:bg-white focus:border-[#1e1b4b]"
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="6"
                            value={level.pct}
                            onChange={(e) => updatePct(i, e.target.value)}
                            className="h-9 pr-8 text-sm font-semibold"
                          />
                          <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-semibold text-[#1e1b4b]">
                          ₹{(1000000 * level.pct / 100 * 10).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {i > 0 && (
                          <button onClick={() => removeLevel(i)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Company retention row */}
                  <div className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl border border-dashed border-border bg-secondary/30">
                    <div className="col-span-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="col-span-5">
                      <span className="text-sm text-muted-foreground italic">Company (Retained from 6% pool)</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm font-semibold" style={{ color: remaining < 0 ? "#ef4444" : "#64748b" }}>
                        {remaining.toFixed(1)}%
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-semibold" style={{ color: remaining < 0 ? "#ef4444" : "#64748b" }}>
                        ₹{Math.max(0, (1000000 * remaining / 100 * 10)).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="col-span-1" />
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="mt-4 gap-2 text-sm border-dashed border-[#1e1b4b]/40 text-[#1e1b4b] hover:bg-[#1e1b4b] hover:text-white"
                  onClick={addLevel}
                >
                  <Plus className="w-4 h-4" />
                  Add Commission Level
                </Button>

                <div className="mt-6 flex items-start gap-2.5 p-4 rounded-xl bg-[#ede9fe] border border-[#1e1b4b]/10">
                  <Info className="w-4 h-4 text-[#1e1b4b] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#1e1b4b]/80 leading-relaxed">
                    <strong>How it works:</strong> When a broker sells a property, the system automatically traverses their referral chain upward and creates commission entries for each level. If a level&apos;s referrer doesn&apos;t exist, that percentage stays with the company.
                  </p>
                </div>
              </Card>
            </TabsContent>

            {/* Company Profile */}
            <TabsContent value="company" className="mt-0">
              <Card className="p-6 border border-border shadow-sm">
                <h2 className="text-lg font-bold text-[#1e1b4b] mb-1">Company Profile</h2>
                <p className="text-sm text-muted-foreground mb-5">Update your company information</p>
                <Separator className="mb-5" />

                <div className="space-y-5 max-w-lg">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#1e1b4b]">Company Name</Label>
                    <Input defaultValue="Masheuri Group" className="h-10" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-[#1e1b4b]">Email</Label>
                      <Input defaultValue="info@masheuri.com" className="h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-[#1e1b4b]">Phone</Label>
                      <Input defaultValue="+91 11 4567 8900" className="h-10" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#1e1b4b]">Address</Label>
                    <Input defaultValue="123 Business Tower, Connaught Place, New Delhi - 110001" className="h-10" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-[#1e1b4b]">GSTIN</Label>
                      <Input defaultValue="07AABCM1234D1Z5" className="h-10 font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-[#1e1b4b]">RERA Number</Label>
                      <Input defaultValue="RERA/DL/2024/001234" className="h-10 font-mono" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button className="gap-2 text-sm"
                      style={{ background: "linear-gradient(135deg, #1e1b4b, #8b5cf6)", color: "white" }}>
                      <Save className="w-4 h-4" />
                      Save Profile
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="mt-0">
              <Card className="p-6 border border-border shadow-sm">
                <h2 className="text-lg font-bold text-[#1e1b4b] mb-1">Notification Settings</h2>
                <p className="text-sm text-muted-foreground mb-5">Control when and how you receive alerts</p>
                <Separator className="mb-5" />

                <div className="space-y-4 max-w-lg">
                  {[
                    { label: "New Broker Registration", desc: "Notify when a new broker joins the platform", email: true, sms: false },
                    { label: "Sale Submitted for Approval", desc: "Notify when a broker records a new sale", email: true, sms: true },
                    { label: "Sale Approved / Rejected", desc: "Notify the broker when their sale is actioned", email: true, sms: true },
                    { label: "Commission Payout Processed", desc: "Notify broker when commission is marked as paid", email: true, sms: false },
                    { label: "New Lead Assigned", desc: "Notify broker when a lead is assigned to them", email: true, sms: true },
                    { label: "Lead Follow-up Reminder", desc: "Remind broker to follow up on stale leads", email: false, sms: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-border bg-white">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium text-[#1e1b4b]">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" defaultChecked={item.email} className="w-3.5 h-3.5 accent-[#1e1b4b]" />
                          Email
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" defaultChecked={item.sms} className="w-3.5 h-3.5 accent-[#1e1b4b]" />
                          SMS
                        </label>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <Button className="gap-2 text-sm"
                      style={{ background: "linear-gradient(135deg, #1e1b4b, #8b5cf6)", color: "white" }}>
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="mt-0">
              <Card className="p-6 border border-border shadow-sm">
                <h2 className="text-lg font-bold text-[#1e1b4b] mb-1">Security Settings</h2>
                <p className="text-sm text-muted-foreground mb-5">Manage passwords and access controls</p>
                <Separator className="mb-5" />

                <div className="space-y-6 max-w-lg">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1e1b4b] mb-3">Change Password</h3>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-[#1e1b4b]">Current Password</Label>
                        <Input type="password" placeholder="••••••••" className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-[#1e1b4b]">New Password</Label>
                        <Input type="password" placeholder="Min. 8 characters" className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-[#1e1b4b]">Confirm New Password</Label>
                        <Input type="password" placeholder="Repeat new password" className="h-10" />
                      </div>
                      <Button className="gap-2 text-sm"
                        style={{ background: "linear-gradient(135deg, #1e1b4b, #8b5cf6)", color: "white" }}>
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold text-[#1e1b4b] mb-3">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-white">
                      <div>
                        <p className="text-sm font-medium text-[#1e1b4b]">OTP via SMS</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Requires OTP on every login</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">Enabled</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold text-[#1e1b4b] mb-3">Audit Log</h3>
                    <div className="space-y-2">
                      {[
                        { action: "Commission config updated", by: "Admin", time: "2024-04-08 14:32" },
                        { action: "Sale SL-2024-089 approved", by: "Admin", time: "2024-04-07 11:15" },
                        { action: "Broker B-005 deactivated", by: "Admin", time: "2024-04-06 09:42" },
                        { action: "Bulk lead import (47 leads)", by: "Admin", time: "2024-04-05 16:00" },
                      ].map((log) => (
                        <div key={log.action} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 text-sm">
                          <span className="text-[#1e1b4b] font-medium">{log.action}</span>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{log.by}</p>
                            <p className="text-xs text-muted-foreground">{log.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
