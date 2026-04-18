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
import { Plus, Search, Filter, MapPin, IndianRupee, LayoutGrid, List, Edit, Trash2, Eye, Building2, Maximize2, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useCrmData } from "@/hooks/use-crm-data";
import { toast } from "sonner";
import { Property } from "@/types/database";
import { supabase } from "@/lib/supabase";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const { properties, loading, addProperty, updateProperty } = useCrmData();

  const filtered = (properties || []).filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleEdit = (prop: Property) => {
    setEditingProperty(prop);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProperty(null);
    setDialogOpen(true);
  };

  const handleView = (prop: Property) => {
    setViewingProperty(prop);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in text-[#1e1b4b]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e1b4b]">Properties</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage all real estate listings</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger 
              onClick={handleAdd}
              className="h-10 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Add Property
            </DialogTrigger>
            <DialogContent size="xl" className="p-4 sm:p-6">
              <DialogHeader className="mb-2">
                <DialogTitle className="text-lg sm:text-xl font-bold text-[#1e1b4b]">
                  {editingProperty ? "Edit Property" : "Add New Property"}
                </DialogTitle>
              </DialogHeader>
              <PropertyForm 
                initialData={editingProperty}
                onClose={() => setDialogOpen(false)} 
                onSubmit={async (data) => {
                  if (editingProperty) {
                    await updateProperty(editingProperty.id, data);
                    toast.success("Property updated successfully!");
                  } else {
                    await addProperty(data);
                    toast.success("Property added successfully!");
                  }
                  setDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Property Details Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent size="property">
          {viewingProperty && (
            <PropertyDetailView 
              property={viewingProperty} 
              onClose={() => setDetailOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total", value: properties.length, color: "#6366f1", bg: "#ede9fe" },
          { label: "Available", value: properties.filter(p => p.status === "available").length, color: "#16a34a", bg: "#dcfce7" },
          { label: "Reserved", value: properties.filter(p => p.status === "reserved").length, color: "#d97706", bg: "#fef3c7" },
          { label: "Sold", value: properties.filter(p => p.status === "sold").length, color: "#dc2626", bg: "#fee2e2" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm border-0 cursor-default hover:shadow-md transition-shadow">
            <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
            <span className="text-sm text-gray-400 font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <Input placeholder="Search properties..." className="pl-10 h-10 rounded-xl bg-white border-0 shadow-sm text-sm focus-visible:ring-1 focus-visible:ring-[#6366f1]" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "all")}>
          <SelectTrigger className="w-36 h-10 rounded-xl bg-white border-0 shadow-sm text-sm">
            <Filter className="w-3.5 h-3.5 mr-1 text-gray-400" /><SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-0 shadow-xl">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center bg-white shadow-sm rounded-xl overflow-hidden p-1 border border-gray-100">
          <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-[#6366f1] text-white shadow-md shadow-indigo-100" : "text-gray-400 hover:bg-[#f5f3ff]"}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-[#6366f1] text-white shadow-md shadow-indigo-100" : "text-gray-400 hover:bg-[#f5f3ff]"}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map((prop, idx) => {
            const sc = statusConfig[prop.status] || statusConfig.available;
            return (
              <Card key={prop.id} className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-white">
                <div onClick={() => handleView(prop)} className="h-40 relative overflow-hidden" style={{ background: bgPalette[idx % bgPalette.length] }}>
                  {prop.images && prop.images.length > 0 ? (
                    <img 
                      src={prop.images[0]} 
                      alt={prop.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-white/40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg backdrop-blur-md" style={{ background: `${sc.bg}cc`, color: sc.color }}>{sc.label.toUpperCase()}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleView(prop); }} className="w-9 h-9 rounded-xl bg-white shadow-xl flex items-center justify-center text-[#6366f1] hover:scale-110 transition-transform active:scale-95"><Eye className="w-4.5 h-4.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(prop); }} className="w-9 h-9 rounded-xl bg-white shadow-xl flex items-center justify-center text-[#6366f1] hover:scale-110 transition-transform active:scale-95"><Edit className="w-4.5 h-4.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); }} className="w-9 h-9 rounded-xl bg-white shadow-xl flex items-center justify-center text-red-500 hover:scale-110 transition-transform active:scale-95"><Trash2 className="w-4.5 h-4.5" /></button>
                  </div>
                </div>
                <div className="p-4" onClick={() => handleView(prop)}>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="font-bold text-[#1e1b4b] text-sm leading-snug group-hover:text-[#6366f1] transition-colors line-clamp-1">{prop.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-[11px] mb-3">
                    <MapPin className="w-3 h-3 text-[#6366f1]/60" />{prop.location}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-[#6366f1] text-base">{prop.price_range}</span>
                    <div className="flex gap-3">
                      <Button 
                        onClick={(e) => { e.stopPropagation(); handleView(prop); }}
                        className="inline-flex items-center justify-center rounded-xl border border-foreground/10 bg-transparent text-foreground hover:bg-accent text-xs py-1 px-3 h-8 font-medium transition-colors">
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View Details
                      </Button>

                      {prop.map_image && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100" title="Land Map Available">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
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
              <TableRow className="bg-[#fcfcff] hover:bg-[#fcfcff] border-0">
                {["Property", "Location", "Price", "Status", "Actions"].map((h) => (
                  <TableHead key={h} className="font-bold text-[#1e1b4b] text-xs h-12">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((prop) => {
                const sc = statusConfig[prop.status] || statusConfig.available;
                return (
                  <TableRow key={prop.id} className="hover:bg-[#f9f8ff] transition-colors border-gray-50">
                    <TableCell onClick={() => handleView(prop)} className="cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#f5f3ff] overflow-hidden border border-[#ede9fe]">
                          {prop.images && prop.images.length > 0 ? (
                            <img src={prop.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-[#6366f1]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#1e1b4b] text-sm">{prop.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono tracking-tight uppercase">{prop.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleView(prop)} className="cursor-pointer">
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#6366f1]/40" />{prop.location}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleView(prop)} className="cursor-pointer">
                      <span className="font-bold text-[#6366f1] text-sm">{prop.price_range}</span>
                    </TableCell>
                    <TableCell onClick={() => handleView(prop)} className="cursor-pointer">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button onClick={() => handleView(prop)} variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-[#6366f1] hover:bg-[#ede9fe] rounded-xl transition-all"><Eye className="w-4 h-4" /></Button>
                        <Button onClick={() => handleEdit(prop)} variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-[#6366f1] hover:bg-[#ede9fe] rounded-xl transition-all"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></Button>
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

function PropertyDetailView({ property, onClose }: { property: Property; onClose: () => void }) {
  const [activeImage, setActiveImage] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const sc = statusConfig[property.status] || statusConfig.available;

  const displayImages = property.images && property.images.length > 0 ? property.images : [];

  return (
    <div className="flex flex-col lg:flex-row h-[70vh] lg:h-[80vh]">
      {/* Media Section - Left Side */}
      <div className="w-full lg:w-3/5 h-56 sm:h-64 lg:h-full bg-[#0f172a] relative flex items-center justify-center overflow-hidden rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
        {showMap && property.map_image ? (
          <img 
            src={property.map_image} 
            alt="Property Map" 
            className="absolute inset-0 w-full h-full object-contain animate-in zoom-in-95 duration-300" 
          />
        ) : displayImages.length > 0 ? (
          <img 
            src={displayImages[activeImage]} 
            alt={property.name} 
            className="absolute inset-0 w-full h-full object-cover lg:object-contain animate-in fade-in duration-500" 
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/30">
            <Building2 className="w-16 h-16 lg:w-24 lg:h-24" />
            <p className="font-medium text-sm text-white/50">No photos available</p>
          </div>
        )}

        {/* Image Counter */}
        {displayImages.length > 0 && !showMap && (
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white">
            {activeImage + 1} / {displayImages.length}
          </div>
        )}

        {/* Media Controls */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-10">
          <button 
            onClick={() => setShowMap(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!showMap ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            PHOTOS
          </button>
          {property.map_image && (
            <button 
              onClick={() => setShowMap(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showMap ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              MAP
            </button>
          )}
        </div>

        {/* Image Thumbnails */}
        {!showMap && displayImages.length > 1 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex lg:flex-col gap-1.5 z-10 max-h-[60%] overflow-y-auto py-2">
            {displayImages.slice(0, 6).map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-9 h-9 lg:w-11 lg:h-11 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-white scale-110 shadow-xl ring-2 ring-indigo-500' : 'border-white/30 opacity-60 hover:opacity-100 hover:border-white'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Info Section - Right Side */}
      <div className="w-full lg:w-2/5 h-auto lg:h-full p-5 sm:p-6 lg:p-8 flex flex-col bg-white rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none overflow-hidden">
        {/* Mobile Close */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 lg:hidden w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 z-20"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        
        {/* Status & Type Badges */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className="rounded-md font-bold py-0.5 px-2.5 text-[11px]" style={{ background: sc.bg, color: sc.color }}>
            {sc.label}
          </Badge>
          <Badge variant="outline" className="rounded-md font-bold py-0.5 px-2.5 border-gray-200 text-gray-500 capitalize text-[11px]">
            {property.type}
          </Badge>
        </div>

        {/* Property Name */}
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1e1b4b] leading-tight mb-2 tracking-tight pr-8">{property.name}</h2>
        
        {/* Location */}
        <div className="flex items-center gap-2 text-gray-500 font-medium mb-4 sm:mb-5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-indigo-50 flex items-center justify-center text-[#6366f1]">
            <MapPin className="w-3 h-3" />
          </div>
          <span className="text-xs sm:text-sm">{property.location}</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-4 sm:space-y-5">
          {/* Price Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Pricing From</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#6366f1] tracking-tight">{property.price_range}</p>
          </div>
          
          {/* Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#1e1b4b] text-sm flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-[#6366f1]" />
              Details
            </h4>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Status</p>
                <p className="text-sm font-bold text-slate-700 capitalize">{property.status}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Type</p>
                <p className="text-sm font-bold text-slate-700 capitalize">{property.type}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Area</p>
                <p className="text-sm font-bold text-slate-700">500 sq.ft</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Facing</p>
                <p className="text-sm font-bold text-slate-700">East</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-100 flex gap-2.5">
          <Button className="flex-1 h-10 sm:h-11 rounded-xl font-bold bg-[#1e1b4b] text-white hover:bg-[#0f0d24] transition-all text-sm">
            Share
          </Button>
          <Button variant="outline" className="flex-1 h-10 sm:h-11 rounded-xl font-bold border border-gray-200 text-[#1e1b4b] hover:bg-gray-50 transition-all text-sm">
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
}

function PropertyForm({ initialData, onClose, onSubmit }: { initialData?: Property | null; onClose: () => void; onSubmit: (data: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    location: initialData?.location || "",
    type: initialData?.type || "plot" as any,
    price_range: initialData?.price_range || "",
    status: initialData?.status || "available" as any,
    images: initialData?.images || [] as string[],
    map_image: initialData?.map_image || "",
  });

  const [files, setFiles] = useState<{ propertyImages: File[]; mapImage: File | null }>({
    propertyImages: [],
    mapImage: null
  });
  
  const [previews, setPreviews] = useState<{ propertyImages: string[]; mapImage: string | null }>({
    propertyImages: [],
    mapImage: null
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "property" | "map") => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    if (type === "property") {
      const newFiles = Array.from(selectedFiles);
      setFiles(prev => ({ ...prev, propertyImages: [...prev.propertyImages, ...newFiles] }));
      
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      setPreviews(prev => ({ ...prev, propertyImages: [...prev.propertyImages, ...newPreviews] }));
    } else {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, mapImage: file }));
      setPreviews(prev => ({ ...prev, mapImage: URL.createObjectURL(file) }));
    }
  };

  const removeFile = (index: number, type: "property" | "map") => {
    if (type === "property") {
      setFiles(prev => ({ ...prev, propertyImages: prev.propertyImages.filter((_, i) => i !== index) }));
      setPreviews(prev => ({ ...prev, propertyImages: prev.propertyImages.filter((_, i) => i !== index) }));
    } else {
      setFiles(prev => ({ ...prev, mapImage: null }));
      setPreviews(prev => ({ ...prev, mapImage: null }));
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `property-media/${fileName}`;

    const { data, error } = await supabase.storage
      .from('properties')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      toast.error("Please fill required fields");
      return;
    }

    setSubmitting(true);
    try {
      let finalImages = [...formData.images];
      let finalMapImage = formData.map_image;

      if (files.propertyImages.length > 0 || files.mapImage) {
        setUploading(true);
        
        if (files.propertyImages.length > 0) {
          const uploadedUrls = await Promise.all(files.propertyImages.map(uploadFile));
          finalImages = [...finalImages, ...uploadedUrls];
        }

        if (files.mapImage) {
          finalMapImage = await uploadFile(files.mapImage);
        }
        
        setUploading(false);
      }

      await onSubmit({
        ...formData,
        images: finalImages,
        map_image: finalMapImage
      });
    } catch (error: any) {
      toast.error("Failed to upload images: " + error.message);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Basic Info Section */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Property Name *</Label>
          <Input 
            placeholder="e.g. Royal Meadows — Plot A-204" 
            className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location *</Label>
            <Input 
              placeholder="e.g. Sector 12, Gurgaon" 
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
        
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type *</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as any})}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="plot">Plot</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Price Range *</Label>
            <Input 
              placeholder="e.g. 85L or 2.2Cr" 
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
              value={formData.price_range}
              onChange={(e) => setFormData({...formData, price_range: e.target.value})}
            />
          </div>
        
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status *</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v as any})}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Property Photos */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> Property Photos
          </Label>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {formData.images.map((url, idx) => (
            <div key={url} className="relative aspect-square rounded-xl bg-slate-100 overflow-hidden group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center">
                  <X className="w-4 h-4" />
                </div>
              </button>
            </div>
          ))}
            
          {previews.propertyImages.map((url, idx) => (
            <div key={url} className="relative aspect-square rounded-xl bg-indigo-50 overflow-hidden group border-2 border-dashed border-indigo-200">
              <img src={url} alt="" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-2 left-2">
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">NEW</span>
              </div>
              <button 
                type="button" 
                onClick={() => removeFile(idx, "property")}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center">
                  <X className="w-4 h-4" />
                </div>
              </button>
            </div>
          ))}
            
          <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all bg-slate-50">
            <Plus className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-400">Add Photo</span>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, "property")}
            />
          </label>
        </div>
      </div>

      {/* Land Map */}
      <div className="space-y-3 pt-2">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
          <Maximize2 className="w-3.5 h-3.5 text-indigo-500" /> Land Map / Site Plan
        </Label>
        
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          {formData.map_image || previews.mapImage ? (
            <div className="relative w-full sm:w-40 h-28 rounded-xl bg-white overflow-hidden shadow-sm border border-slate-100">
              <img src={previews.mapImage || formData.map_image} alt="" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => {
                  if (previews.mapImage) removeFile(0, "map");
                  else setFormData({...formData, map_image: ""});
                }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center">
                  <X className="w-4 h-4" />
                </div>
              </button>
            </div>
          ) : (
            <label className="w-full sm:w-40 h-28 rounded-xl bg-white flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all border border-dashed border-slate-200">
              <Upload className="w-6 h-6 text-slate-300" />
              <span className="text-[10px] font-medium text-slate-400">Upload Map</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, "map")}
              />
            </label>
          )}
          <div className="flex-1 space-y-2">
            <p className="text-xs font-medium text-slate-600">Add site plan to build trust</p>
            <p className="text-[10px] text-slate-400 leading-relaxed">Visual maps help leads understand property layout better.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" type="button" className="flex-1 h-11 rounded-xl font-medium text-slate-600" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="flex-1 h-11 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
          {submitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {initialData ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {initialData ? "Update Property" : "Add Property"}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
