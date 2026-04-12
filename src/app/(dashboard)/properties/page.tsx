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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-[#1e1b4b] text-xl font-bold">
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl p-0">
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
    <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
      {/* Media Section */}
      <div className="w-full md:w-3/5 bg-[#0f172a] relative flex items-center justify-center p-4">
        {showMap && property.map_image ? (
          <img 
            src={property.map_image} 
            alt="Property Map" 
            className="w-full h-full object-contain animate-in zoom-in-95 duration-300" 
          />
        ) : displayImages.length > 0 ? (
          <img 
            src={displayImages[activeImage]} 
            alt={property.name} 
            className="w-full h-full object-contain animate-in fade-in duration-500" 
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-white/20">
            <Building2 className="w-24 h-24" />
            <p className="font-medium">No photos available</p>
          </div>
        )}

        {/* Media Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
          <button 
            onClick={() => setShowMap(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!showMap ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
          >
            PHOTOS
          </button>
          {property.map_image && (
            <button 
              onClick={() => setShowMap(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${showMap ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'text-white/60 hover:text-white'}`}
            >
              LAND MAP
            </button>
          )}
        </div>

        {/* Image Selection Reels */}
        {!showMap && displayImages.length > 1 && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            {displayImages.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-white scale-110 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Info Section */}
      <div className="w-full md:w-2/5 p-8 flex flex-col bg-white overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Badge className="rounded-lg font-bold py-1 px-3" style={{ background: sc.bg, color: sc.color }}>
            {sc.label}
          </Badge>
          <Badge variant="outline" className="rounded-lg font-bold py-1 px-3 border-gray-200 text-gray-400 capitalize">
            {property.type}
          </Badge>
        </div>

        <h2 className="text-3xl font-extrabold text-[#1e1b4b] leading-tight mb-2 tracking-tight">{property.name}</h2>
        <div className="flex items-center gap-2 text-gray-500 font-medium mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#6366f1]">
            <MapPin className="w-4 h-4" />
          </div>
          {property.location}
        </div>

        <div className="grid grid-cols-1 gap-6 mb-12">
          <div className="p-6 rounded-3xl bg-gray-50/80 border border-gray-100">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Pricing From</p>
            <p className="text-4xl font-black text-[#6366f1] tracking-tight">{property.price_range}</p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-[#1e1b4b] flex items-center gap-2">
              <div className="w-1.5 h-6 rounded-full bg-[#6366f1]" />
              Property Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                <p className="text-sm font-bold text-slate-700 capitalize">{property.status}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Type</p>
                <p className="text-sm font-bold text-slate-700 capitalize">{property.type}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 flex gap-3">
          <Button className="flex-1 h-12 rounded-2xl font-bold bg-[#1e1b4b] text-white hover:bg-black transition-all">
            Share Details
          </Button>
          <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold border-2 border-slate-100 text-[#1e1b4b] hover:bg-slate-50 transition-all">
            Contact Owner
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
    <form className="space-y-8 py-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-sm font-bold text-[#1e1b4b] ml-1">Property Name *</Label>
          <Input 
            placeholder="e.g. Royal Meadows — Plot A-204" 
            className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all focus:ring-4 focus:ring-indigo-100"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-bold text-[#1e1b4b] ml-1">Location *</Label>
          <Input 
            placeholder="e.g. Sector 12, Gurgaon" 
            className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all focus:ring-4 focus:ring-indigo-100"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-bold text-[#1e1b4b] ml-1">Type *</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as any})}>
            <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-100"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-2xl border-0 shadow-2xl">
              <SelectItem value="plot">Plot</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-bold text-[#1e1b4b] ml-1">Price Range *</Label>
          <Input 
            placeholder="e.g. 85L or 2.2Cr" 
            className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all focus:ring-4 focus:ring-indigo-100"
            value={formData.price_range}
            onChange={(e) => setFormData({...formData, price_range: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-bold text-[#1e1b4b] ml-1">Status *</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v as any})}>
            <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-100"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-2xl border-0 shadow-2xl">
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Photos */}
        <div className="md:col-span-2 space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-[#1e1b4b] flex items-center gap-2 ml-1">
              <ImageIcon className="w-4 h-4 text-[#6366f1]" /> PROPERTY PHOTOS
            </Label>
            <span className="text-[10px] font-bold text-slate-400">MAX 10MB PER FILE</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Existing Images */}
            {formData.images.map((url, idx) => (
              <div key={url} className="relative aspect-square rounded-2xl bg-slate-50 overflow-hidden border-2 border-slate-100 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            {/* New Previews */}
            {previews.propertyImages.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl bg-indigo-50 overflow-hidden border-2 border-indigo-200 border-dashed group">
                <img src={url} alt="" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full shadow-sm">NEW</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFile(idx, "property")}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            {/* Upload Button */}
            <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#6366f1] hover:bg-indigo-50/30 transition-all group bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-[#6366f1]" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#6366f1]">ADD PHOTO</span>
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
        <div className="md:col-span-2 space-y-4 pt-2">
          <Label className="text-sm font-bold text-[#1e1b4b] flex items-center gap-2 ml-1">
            <Maximize2 className="w-4 h-4 text-[#6366f1]" /> LAND MAP / SITE PLAN
          </Label>
          
          <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-3xl bg-slate-50/50 border-2 border-dashed border-slate-200">
            {formData.map_image || previews.mapImage ? (
              <div className="relative w-full sm:w-48 aspect-video rounded-2xl bg-white overflow-hidden shadow-sm group border border-slate-100">
                <img src={previews.mapImage || formData.map_image} alt="" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => {
                    if (previews.mapImage) removeFile(0, "map");
                    else setFormData({...formData, map_image: ""});
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full sm:w-48 aspect-video rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-md transition-all group border border-slate-100">
                <Upload className="w-6 h-6 text-slate-300 group-hover:text-[#6366f1] group-hover:scale-110 transition-all" />
                <span className="text-[11px] font-black text-slate-400 group-hover:text-[#6366f1]">UPLOAD MAP</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, "map")}
                />
              </label>
            )}
            <div className="flex-1 space-y-2">
              <h5 className="text-sm font-bold text-[#1e1b4b]">Why upload a map?</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Adding a site plan or land map helps leads understand the location and surrounding area better, increasing conversion rates.</p>
              <ul className="text-[10px] font-bold text-indigo-600 flex gap-4 mt-4">
                <li className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-indigo-600"/> SITE VISITS ↑</li>
                <li className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-indigo-600"/> TRUST ↑</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-8">
        <Button variant="ghost" type="button" className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-50" onClick={onClose} disabled={submitting}>
          DISCARD
        </Button>
        <Button type="submit" disabled={submitting} className="flex-[2] h-14 rounded-2xl font-bold text-white shadow-xl shadow-indigo-200 transition-all" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
          {submitting ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              {uploading ? "UPLOADING MEDIA..." : "SAVING PROPERTY..."}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {initialData ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {initialData ? "UPDATE PROPERTY LISTING" : "PUBLISH PROPERTY LISTING"}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
