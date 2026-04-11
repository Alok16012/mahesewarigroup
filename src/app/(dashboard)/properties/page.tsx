"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, MapPin, IndianRupee, LayoutGrid, List, Edit, Trash2, Eye, Building2, Maximize2, Upload } from "lucide-react";

const properties = [
  { id: "P-001", name: "Royal Meadows — Plot A-204", location: "Sector 12, Gurgaon", area: 200, price: 8500000, status: "available", level: 1, images: 4 },
  { id: "P-002", name: "Green Valley — Villa B-12", location: "Baner, Pune", area: 450, price: 22000000, status: "sold", level: 1, images: 8 },
  { id: "P-003", name: "Sunrise Heights — Flat 301", location: "Andheri West, Mumbai", area: 120, price: 15000000, status: "reserved", level: 2, images: 5 },
  { id: "P-004", name: "Silver Oak — Plot C-88", location: "Whitefield, Bangalore", area: 300, price: 12000000, status: "available", level: 1, images: 3 },
  { id: "P-005", name: "Palm Grove — Plot D-41", location: "Noida Extension", area: 150, price: 5500000, status: "available", level: 2, images: 2 },
  { id: "P-006", name: "Heritage Hills — Bungalow 7", location: "Jubilee Hills, Hyderabad", area: 600, price: 45000000, status: "sold", level: 1, images: 12 },
  { id: "P-007", name: "Lotus Park — Plot E-19", location: "Hinjewadi, Pune", area: 180, price: 7200000, status: "available", level: 2, images: 3 },
  { id: "P-008", name: "Maple Court — 2BHK-402", location: "Powai, Mumbai", area: 95, price: 13500000, status: "reserved", level: 1, images: 6 },
];

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  available: { label: "Available", bg: "#dcfce7", color: "#16a34a" },
  sold: { label: "Sold", bg: "#fee2e2", color: "#dc2626" },
  reserved: { label: "Reserved", bg: "#fef3c7", color: "#d97706" },
};

const bgPalette = [
  "linear-gradient(135deg, #ede9fe, #ddd6fe)",
  "linear-gradient(135deg, #ccfbf1, #99f6e4)",
  "linear-gradient(135deg, #fce7f3, #fbcfe8)",
  "linear-gradient(135deg, #e0f2fe, #bae6fd)",
  "linear-gradient(135deg, #fef3c7, #fde68a)",
  "linear-gradient(135deg, #dcfce7, #bbf7d0)",
  "linear-gradient(135deg, #f0fdf4, #d1fae5)",
  "linear-gradient(135deg, #ede9fe, #c4b5fd)",
];

const formatPrice = (p: number) =>
  p >= 10000000 ? `₹${(p / 10000000).toFixed(2)} Cr` : `₹${(p / 100000).toFixed(1)} L`;

export default function PropertiesPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = properties.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e1b4b]">Properties</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage all real estate listings</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Plus className="w-4 h-4" /> Add Property
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader><DialogTitle className="text-[#1e1b4b] text-lg font-bold">Add New Property</DialogTitle></DialogHeader>
            <AddPropertyForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total", value: 617, color: "#6366f1", bg: "#ede9fe" },
          { label: "Available", value: 320, color: "#16a34a", bg: "#dcfce7" },
          { label: "Reserved", value: 85, color: "#d97706", bg: "#fef3c7" },
          { label: "Sold", value: 212, color: "#dc2626", bg: "#fee2e2" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
            <span className="text-sm text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <Input placeholder="Search properties..." className="pl-10 h-10 rounded-xl bg-white border-0 shadow-sm text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "all")}>
          <SelectTrigger className="w-36 h-10 rounded-xl bg-white border-0 shadow-sm text-sm">
            <Filter className="w-3.5 h-3.5 mr-1 text-gray-400" /><SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center bg-white shadow-sm rounded-xl overflow-hidden">
          <button onClick={() => setView("grid")} className={`p-2.5 transition-colors ${view === "grid" ? "bg-[#6366f1] text-white" : "text-gray-400 hover:bg-[#f5f3ff]"}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView("list")} className={`p-2.5 transition-colors ${view === "list" ? "bg-[#6366f1] text-white" : "text-gray-400 hover:bg-[#f5f3ff]"}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map((prop, idx) => {
            const sc = statusConfig[prop.status];
            return (
              <Card key={prop.id} className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group bg-white">
                <div className="h-36 relative" style={{ background: bgPalette[idx % bgPalette.length] }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 rounded-lg bg-white/90 shadow flex items-center justify-center text-[#6366f1]"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 rounded-lg bg-white/90 shadow flex items-center justify-center text-[#6366f1]"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 rounded-lg bg-white/90 shadow flex items-center justify-center text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <h3 className="font-bold text-[#1e1b4b] text-sm leading-snug">{prop.name}</h3>
                    <span className="text-[10px] bg-[#ede9fe] text-[#6366f1] font-medium px-1.5 py-0.5 rounded-lg flex-shrink-0">L{prop.level}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                    <MapPin className="w-3 h-3" />{prop.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#6366f1] text-base">{formatPrice(prop.price)}</span>
                    <span className="flex items-center gap-1 text-gray-400 text-xs"><Maximize2 className="w-3 h-3" />{prop.area} sq.yd</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f5f3ff] hover:bg-[#f5f3ff]">
                {["Property", "Location", "Area", "Price", "Visibility", "Status", "Actions"].map((h) => (
                  <TableHead key={h} className="font-bold text-[#1e1b4b] text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((prop) => {
                const sc = statusConfig[prop.status];
                return (
                  <TableRow key={prop.id} className="hover:bg-[#f9f8ff] transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#ede9fe" }}>
                          <Building2 className="w-4.5 h-4.5 text-[#6366f1]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1e1b4b] text-sm">{prop.name}</p>
                          <p className="text-xs text-gray-400">{prop.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="w-3 h-3" />{prop.location}</div></TableCell>
                    <TableCell className="text-sm text-gray-500">{prop.area} sq.yd</TableCell>
                    <TableCell><span className="font-bold text-[#6366f1]">{formatPrice(prop.price)}</span></TableCell>
                    <TableCell><span className="text-xs bg-[#ede9fe] text-[#6366f1] font-medium px-2 py-1 rounded-lg">Level {prop.level}+</span></TableCell>
                    <TableCell><span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#6366f1] hover:bg-[#ede9fe]"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#6366f1] hover:bg-[#ede9fe]"><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function AddPropertyForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-sm font-semibold text-[#1e1b4b]">Property Name *</Label>
          <Input placeholder="e.g. Royal Meadows — Plot A-204" className="h-10 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-[#1e1b4b]">Location *</Label>
          <Input placeholder="e.g. Sector 12, Gurgaon" className="h-10 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-[#1e1b4b]">Area (sq.yd) *</Label>
          <Input type="number" placeholder="200" className="h-10 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-[#1e1b4b]">Price (₹) *</Label>
          <div className="relative"><IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input type="number" placeholder="8500000" className="pl-9 h-10 rounded-xl" /></div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-[#1e1b4b]">Status *</Label>
          <Select><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent className="rounded-xl"><SelectItem value="available">Available</SelectItem><SelectItem value="reserved">Reserved</SelectItem><SelectItem value="sold">Sold</SelectItem></SelectContent></Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-[#1e1b4b]">Visibility</Label>
          <Select><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="All brokers" /></SelectTrigger>
            <SelectContent className="rounded-xl"><SelectItem value="1">Level 1+ (Premium)</SelectItem><SelectItem value="2">Level 2+ (All)</SelectItem></SelectContent></Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-sm font-semibold text-[#1e1b4b]">Description</Label>
          <Textarea placeholder="Property details, amenities, highlights..." className="resize-none rounded-xl" rows={3} />
        </div>
      </div>
      <div className="border-2 border-dashed border-[#c4b5fd] rounded-2xl p-8 text-center hover:border-[#6366f1] transition-colors cursor-pointer bg-[#faf5ff]">
        <Upload className="w-7 h-7 text-[#6366f1]/40 mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#6366f1]">Drop images or click to upload</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB · Max 15 images</p>
      </div>
      <div className="flex gap-3 pt-1">
        <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Cancel</Button>
        <Button className="flex-1 rounded-xl" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>Add Property</Button>
      </div>
    </div>
  );
}
