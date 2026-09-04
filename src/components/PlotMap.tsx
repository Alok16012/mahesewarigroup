"use client";

import { useEffect, useMemo, useState } from "react";
import { PlotUnit } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import { IndianRupee, User, RefreshCw, Trash2, Pencil, Scissors } from "lucide-react";

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

async function reservePlot(id: string, data: Record<string, unknown>) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "reserve-plot", id, data }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Plot booking failed");
  return json;
}

const STATUS_STYLE = {
  available: { bg: "#22c55e", label: "Available", text: "white" },
  reserved:  { bg: "#f59e0b", label: "Reserved",  text: "white" },
  sold:      { bg: "#ef4444", label: "Sold",       text: "white" },
};

const formatPrice = (value?: number) => {
  if (!value) return "-";
  return value >= 10000000 ? `Rs ${(value / 10000000).toFixed(2)} Cr` : `Rs ${(value / 100000).toFixed(2)} L`;
};

const PLOT_META_PREFIX = "plot-meta:";

// `size` is free text ("1260", "200 sqyd"). Split needs the number, so pull the
// leading value out and keep whatever unit the user typed after it.
type PlotArea = { value: number; unit: string };

const parseArea = (size?: string | null): PlotArea | null => {
  const match = (size || "").trim().match(/^([\d.]+)\s*(.*)$/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { value, unit: match[2].trim() };
};

const formatArea = ({ value, unit }: PlotArea) =>
  `${Number(value.toFixed(2))}${unit ? ` ${unit}` : ""}`;

// Suggest 01-A, then 01-B, … so the leftover piece never collides with an existing plot.
const suggestSplitNumber = (baseNumber: string, taken: string[]) => {
  const used = new Set(taken.map((n) => n.toLowerCase()));
  for (let i = 0; i < 26; i++) {
    const candidate = `${baseNumber}-${String.fromCharCode(65 + i)}`;
    if (!used.has(candidate.toLowerCase())) return candidate;
  }
  return `${baseNumber}-${Date.now()}`;
};

type PlotDealDetails = {
  buyer_name?: string | null;
  telecaller_name?: string | null;
  final_amount?: number | null;
};

const parsePlotDealDetails = (plot: PlotUnit): PlotDealDetails => {
  if (typeof plot.buyer_name === "string" && plot.buyer_name.startsWith(PLOT_META_PREFIX)) {
    try {
      const parsed = JSON.parse(plot.buyer_name.slice(PLOT_META_PREFIX.length));
      return {
        buyer_name: typeof parsed.buyer_name === "string" ? parsed.buyer_name : null,
        telecaller_name: typeof parsed.telecaller_name === "string" ? parsed.telecaller_name : null,
        final_amount: typeof parsed.final_amount === "number" ? parsed.final_amount : null,
      };
    } catch {
      return {};
    }
  }

  return {
    buyer_name: plot.buyer_name || null,
    telecaller_name: plot.telecaller_name || null,
    final_amount: plot.final_amount || null,
  };
};

const buildPlotDealValue = (status: PlotUnit["status"], details: PlotDealDetails) => {
  if (status === "available") return null;

  return `${PLOT_META_PREFIX}${JSON.stringify({
    buyer_name: details.buyer_name?.trim() || null,
    telecaller_name: details.telecaller_name?.trim() || null,
    final_amount: details.final_amount || null,
  })}`;
};

type PlotFieldEdits = {
  unit_number: string;
  size: string;
  facing: string;
  price: number | null;
};

type SplitInput = {
  soldArea: PlotArea;
  remainingArea: PlotArea;
  remainingNumber: string;
  remainingPrice: number | null;
  soldPrice: number | null;
  deal: PlotDealDetails;
};

type PlotMapProps = {
  propertyId: string;
  plots: PlotUnit[];
  onUpdate?: (plots: PlotUnit[]) => void;
  readOnly?: boolean;
  bookingMode?: boolean;
  currentUserName?: string;
};

export default function PlotMap({
  propertyId,
  plots,
  onUpdate,
  readOnly = false,
  bookingMode = false,
  currentUserName,
}: PlotMapProps) {
  const [localPlots, setLocalPlots] = useState<PlotUnit[]>(plots);
  const [selected, setSelected] = useState<PlotUnit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlotUnit | null>(null);
  const [splitTarget, setSplitTarget] = useState<PlotUnit | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalPlots(plots);
  }, [plots]);

  const sortedPlots = useMemo(
    () => [...localPlots].sort((a, b) =>
      a.unit_number.localeCompare(b.unit_number, undefined, { numeric: true, sensitivity: "base" })
    ),
    [localPlots]
  );

  const counts = {
    available: sortedPlots.filter((p) => p.status === "available").length,
    reserved:  sortedPlots.filter((p) => p.status === "reserved").length,
    sold:      sortedPlots.filter((p) => p.status === "sold").length,
  };

  const updatePlotStatus = async (
    plot: PlotUnit,
    newStatus: PlotUnit["status"],
    dealDetails: PlotDealDetails,
    fields?: PlotFieldEdits,
  ) => {
    setSaving(true);
    const previousPlots = localPlots;
    const nextBuyer = buildPlotDealValue(newStatus, dealDetails);
    const editedFields = fields
      ? {
          unit_number: fields.unit_number.trim() || plot.unit_number,
          size: fields.size.trim() || undefined,
          facing: fields.facing.trim() || undefined,
          price: fields.price ?? undefined,
        }
      : {};
    const updated = {
      ...plot,
      ...editedFields,
      status: newStatus,
      buyer_name: nextBuyer,
      telecaller_name: newStatus === "available" ? null : dealDetails.telecaller_name || null,
      final_amount: newStatus === "available" ? null : dealDetails.final_amount || null,
    };
    const newPlots = localPlots.map((p) => (p.id === plot.id ? updated : p));
    setLocalPlots(newPlots);
    onUpdate?.(newPlots);

    if (isSupabaseConfigured()) {
      try {
        if (bookingMode) {
          await reservePlot(plot.id, { buyer_name: nextBuyer });
          toast.success(`Plot ${plot.unit_number} reserved`);
        } else {
          await dbMutate("update", "plot_units", {
            ...(fields
              ? {
                  unit_number: updated.unit_number,
                  size: editedFields.size ?? null,
                  facing: editedFields.facing ?? null,
                  price: editedFields.price ?? null,
                }
              : {}),
            status: newStatus,
            buyer_name: nextBuyer,
          }, plot.id);
          toast.success(`Plot ${updated.unit_number} updated`);
        }
      } catch (error) {
        setLocalPlots(previousPlots);
        onUpdate?.(previousPlots);
        toast.error((error as Error).message || "Failed to update plot");
      }
    } else {
      toast.success(`Plot ${updated.unit_number} updated (Demo)`);
    }
    setSaving(false);
    setSelected(null);
  };

  const addPlot = async (data: Partial<PlotUnit>) => {
    setSaving(true);
    const newPlot: PlotUnit = {
      id: `PU-${Date.now()}`,
      property_id: propertyId,
      unit_number: data.unit_number || "",
      status: "available",
      size: data.size,
      facing: data.facing,
      price: data.price,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data: inserted } = await dbMutate("insert", "plot_units", { ...newPlot, id: undefined });
        const withId = { ...newPlot, id: inserted.id };
        const newPlots = [...localPlots, withId];
        setLocalPlots(newPlots);
        onUpdate?.(newPlots);
        toast.success("Plot added");
      } catch { toast.error("Failed to add plot"); setSaving(false); return; }
    } else {
      const newPlots = [...localPlots, newPlot];
      setLocalPlots(newPlots);
      onUpdate?.(newPlots);
      toast.success("Plot added (Demo)");
    }
    setSaving(false);
    setAddOpen(false);
  };

  // Part of a plot got sold: shrink the original to the sold area and mark it
  // sold, then list the leftover area as a new available plot.
  const splitPlot = async (plot: PlotUnit, input: SplitInput) => {
    setSaving(true);
    const previousPlots = localPlots;
    const nextBuyer = buildPlotDealValue("sold", input.deal);

    const soldPlot: PlotUnit = {
      ...plot,
      status: "sold",
      size: formatArea(input.soldArea),
      price: input.soldPrice ?? undefined,
      buyer_name: nextBuyer,
      telecaller_name: input.deal.telecaller_name || null,
      final_amount: input.deal.final_amount || null,
    };
    const remainingPlot: PlotUnit = {
      id: `PU-${Date.now()}`,
      property_id: propertyId,
      unit_number: input.remainingNumber,
      status: "available",
      size: formatArea(input.remainingArea),
      facing: plot.facing,
      price: input.remainingPrice ?? undefined,
      created_at: new Date().toISOString(),
    };

    const optimistic = [...localPlots.map((p) => (p.id === plot.id ? soldPlot : p)), remainingPlot];
    setLocalPlots(optimistic);
    onUpdate?.(optimistic);

    const fail = (message: string) => {
      setLocalPlots(previousPlots);
      onUpdate?.(previousPlots);
      toast.error(message);
      setSaving(false);
    };

    if (isSupabaseConfigured()) {
      try {
        await dbMutate("update", "plot_units", {
          status: "sold",
          size: soldPlot.size,
          price: soldPlot.price ?? null,
          buyer_name: nextBuyer,
        }, plot.id);
      } catch (error) {
        fail((error as Error).message || "Failed to mark the sold part");
        return;
      }

      let insertedId: string;
      try {
        const { data: inserted } = await dbMutate("insert", "plot_units", {
          property_id: propertyId,
          unit_number: remainingPlot.unit_number,
          status: "available",
          size: remainingPlot.size,
          facing: remainingPlot.facing ?? null,
          price: remainingPlot.price ?? null,
        });
        insertedId = inserted.id;
      } catch (error) {
        // Put the original plot back the way it was so we don't leave the sold
        // half shrunk with no matching leftover plot.
        await dbMutate("update", "plot_units", {
          status: plot.status,
          size: plot.size ?? null,
          price: plot.price ?? null,
          buyer_name: plot.buyer_name ?? null,
        }, plot.id).catch(() => {});
        fail((error as Error).message || "Failed to create the remaining plot");
        return;
      }

      const settled = optimistic.map((p) => (p.id === remainingPlot.id ? { ...remainingPlot, id: insertedId } : p));
      setLocalPlots(settled);
      onUpdate?.(settled);
      toast.success(`Plot ${plot.unit_number} split — ${remainingPlot.unit_number} is available`);
    } else {
      toast.success(`Plot ${plot.unit_number} split (Demo)`);
    }
    setSaving(false);
    setSplitTarget(null);
  };

  const deletePlot = async (plot: PlotUnit) => {
    setSaving(true);
    const previousPlots = localPlots;
    const newPlots = localPlots.filter((p) => p.id !== plot.id);
    setLocalPlots(newPlots);
    onUpdate?.(newPlots);

    if (isSupabaseConfigured()) {
      try {
        await dbMutate("delete", "plot_units", undefined, plot.id);
        toast.success(`Plot ${plot.unit_number} deleted`);
      } catch (error) {
        setLocalPlots(previousPlots);
        onUpdate?.(previousPlots);
        toast.error((error as Error).message || "Failed to delete plot");
      }
    } else {
      toast.success(`Plot ${plot.unit_number} deleted (Demo)`);
    }
    setSaving(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Legend + Stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          {Object.entries(STATUS_STYLE).map(([status, style]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: style.bg }} />
              <span className="text-xs text-muted-foreground">{style.label}</span>
              <Badge className="text-xs px-1.5 py-0" style={{ background: style.bg + "22", color: style.bg }}>
                {counts[status as keyof typeof counts]}
              </Badge>
            </div>
          ))}
        </div>
        {!readOnly && !bookingMode && (
          <Button size="sm" className="h-8 text-xs" style={{ background: "#6366f1", color: "white" }}
            onClick={() => setAddOpen(true)}>
            + Add Plot
          </Button>
        )}
      </div>

      {/* Grid */}
      {localPlots.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
          No plots added yet. Click Add Plot to start building the map.
        </div>
      ) : (
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
          {sortedPlots.map((plot) => {
            const style = STATUS_STYLE[plot.status];
            const deal = parsePlotDealDetails(plot);
            return (
              <button
                key={plot.id}
                onClick={() => !readOnly && setSelected(plot)}
                className="relative min-h-20 rounded-lg p-2 text-center transition-all hover:scale-105 hover:shadow-lg border-2 border-white/20 group"
                style={{ background: style.bg, cursor: readOnly ? "default" : "pointer" }}
                title={`${plot.unit_number} — ${style.label}${deal.buyer_name ? ` — ${deal.buyer_name}` : ""}`}
              >
                <p className="text-white text-xs font-bold leading-tight">{plot.unit_number}</p>
                {plot.size && <p className="text-white/70 text-[9px] mt-0.5">{plot.size}</p>}
                <p className="text-white/80 text-[9px] mt-0.5">
                  {deal.final_amount ? formatPrice(deal.final_amount) : formatPrice(plot.price)}
                </p>
                {deal.buyer_name && (
                  <p className="text-white/80 text-[9px] truncate mt-0.5">{deal.buyer_name.split(" ")[0]}</p>
                )}
                {!readOnly && (
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
                    <RefreshCw className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Plot detail / update dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Plot {selected?.unit_number}</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            {selected && (
              <PlotDetail
                plot={selected}
                onSave={updatePlotStatus}
                onDelete={(plot) => { setSelected(null); setDeleteTarget(plot); }}
                onSplit={(plot) => { setSelected(null); setSplitTarget(plot); }}
                saving={saving}
                onClose={() => setSelected(null)}
                bookingMode={bookingMode}
                currentUserName={currentUserName}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add plot dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle>Add New Plot</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <AddPlotForm onSave={addPlot} saving={saving} onClose={() => setAddOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Partial sale — split the plot */}
      <Dialog open={!!splitTarget} onOpenChange={() => !saving && setSplitTarget(null)}>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle>Sell Part of Plot {splitTarget?.unit_number}</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            {splitTarget && (
              <SplitPlotForm
                plot={splitTarget}
                takenNumbers={localPlots.map((p) => p.unit_number)}
                saving={saving}
                currentUserName={currentUserName}
                onClose={() => setSplitTarget(null)}
                onSave={(input) => splitPlot(splitTarget, input)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete plot confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => !saving && setDeleteTarget(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete Plot {deleteTarget?.unit_number}?</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-500">
              This will permanently remove plot {deleteTarget?.unit_number} from the map. This action cannot be undone.
            </p>
            {deleteTarget && deleteTarget.status !== "available" && (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Warning: this plot is currently {deleteTarget.status}. Its booking details will be lost.
              </p>
            )}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={saving}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTarget && deletePlot(deleteTarget)}
                disabled={saving}
                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlotDetail({ plot, onSave, onDelete, onSplit, saving, onClose, bookingMode = false, currentUserName }: {
  plot: PlotUnit;
  onSave: (plot: PlotUnit, status: PlotUnit["status"], details: PlotDealDetails, fields?: PlotFieldEdits) => void;
  onDelete: (plot: PlotUnit) => void;
  onSplit: (plot: PlotUnit) => void;
  saving: boolean;
  onClose: () => void;
  bookingMode?: boolean;
  currentUserName?: string;
}) {
  const deal = parsePlotDealDetails(plot);
  const [status, setStatus] = useState<PlotUnit["status"]>(plot.status);
  const [buyer, setBuyer] = useState(deal.buyer_name || "");
  const [telecaller, setTelecaller] = useState(deal.telecaller_name || currentUserName || "");
  const [finalAmount, setFinalAmount] = useState(deal.final_amount ? String(deal.final_amount) : "");
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState<{ unit_number: string; size: string; facing: string; price: string }>({
    unit_number: plot.unit_number,
    size: plot.size || "",
    facing: plot.facing || "",
    price: plot.price ? String(plot.price) : "",
  });
  const statusStyle = STATUS_STYLE[status];
  const finalAmountNumber = finalAmount ? Number(finalAmount) : null;
  const fieldsPrice = fields.price ? Number(fields.price) : null;
  const canBook = bookingMode && plot.status === "available";
  const canManage = !bookingMode;
  const canSplit = canManage && plot.status !== "sold" && !!parseArea(plot.size);

  return (
    <div className="space-y-4 pt-1">
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Current Status</p>
          <p className="font-bold text-[#1e1b4b] capitalize">{plot.status}</p>
        </div>
        <Badge className="rounded-md font-bold" style={{ background: statusStyle.bg + "22", color: statusStyle.bg }}>
          {statusStyle.label}
        </Badge>
      </div>

      {canManage && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plot Details</p>
          <button
            onClick={() => setEditing(!editing)}
            disabled={saving}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-50"
          >
            <Pencil className="w-3 h-3" /> {editing ? "Done editing" : "Edit details"}
          </button>
        </div>
      )}

      {editing ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1e1b4b]">Plot Number *</Label>
            <Input className="h-10" value={fields.unit_number}
              onChange={(e) => setFields({ ...fields, unit_number: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1e1b4b]">Area</Label>
            <Input className="h-10" placeholder="e.g. 1000" value={fields.size}
              onChange={(e) => setFields({ ...fields, size: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1e1b4b]">Facing</Label>
            <Select value={fields.facing} onValueChange={(v: string | null) => setFields({ ...fields, facing: v ?? "" })}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Direction" /></SelectTrigger>
              <SelectContent>
                {FACING_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1e1b4b]">Listed Price (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="h-10 pl-9" placeholder="8500000" value={fields.price} inputMode="numeric"
                onChange={(e) => setFields({ ...fields, price: e.target.value.replace(/[^\d.]/g, "") })} />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "Unit", value: plot.unit_number },
            { label: "Area", value: plot.size || "-" },
            { label: "Facing", value: plot.facing || "-" },
            { label: "Listed Price", value: formatPrice(plot.price) },
            { label: "Final Amount", value: deal.final_amount ? formatPrice(deal.final_amount) : "-" },
            { label: "Telecaller", value: deal.telecaller_name || "-" },
          ].map((row) => (
            <div key={row.label} className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs text-muted-foreground">{row.label}</p>
              <p className="font-semibold text-[#1e1b4b]">{row.value}</p>
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as PlotUnit["status"])}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {((canManage && (status === "sold" || status === "reserved")) || canBook) && (
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1e1b4b]">
              <User className="w-3.5 h-3.5 inline mr-1" />
              {canBook ? "Reserve For / Buyer Name" : status === "sold" ? "Buyer Name" : "Reserved For"}
            </Label>
            <Input
              placeholder="e.g. Rajesh Kumar"
              className="h-10"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1e1b4b]">Telecaller Name</Label>
            <Input
              placeholder="e.g. Sunita Patel"
              className="h-10 bg-slate-50"
              value={telecaller}
              onChange={(e) => setTelecaller(e.target.value)}
              readOnly={bookingMode}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1e1b4b]">Final Amount After Negotiation</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="e.g. 1850000"
                className="h-10 pl-9"
                value={finalAmount}
                inputMode="numeric"
                onChange={(e) => setFinalAmount(e.target.value.replace(/[^\d.]/g, ""))}
              />
            </div>
          </div>
        </div>
      )}

      {bookingMode && plot.status !== "available" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          This plot is already {plot.status}. Telecaller can only book available plots.
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
        {(canManage || canBook) && (
          <Button className="flex-1" disabled={saving || (canBook && !buyer.trim()) || (canManage && !fields.unit_number.trim())}
            style={{ background: canBook ? "#f59e0b" : "linear-gradient(135deg, #1e1b4b, #8b5cf6)", color: "white" }}
            onClick={() => onSave(plot, canBook ? "reserved" : status, {
              buyer_name: buyer || null,
              telecaller_name: telecaller || null,
              final_amount: finalAmountNumber && Number.isFinite(finalAmountNumber) ? finalAmountNumber : null,
            }, canManage ? {
              unit_number: fields.unit_number,
              size: fields.size,
              facing: fields.facing,
              price: fieldsPrice && Number.isFinite(fieldsPrice) ? fieldsPrice : null,
            } : undefined)}>
            {saving ? "Saving…" : canBook ? "Reserve Plot" : "Update Plot"}
          </Button>
        )}
      </div>

      {canSplit && (
        <button
          onClick={() => onSplit(plot)}
          disabled={saving}
          className="w-full h-10 rounded-xl border border-indigo-200 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Scissors className="w-4 h-4" /> Sell Part of This Plot
        </button>
      )}

      {canManage && (
        <button
          onClick={() => onDelete(plot)}
          disabled={saving}
          className="w-full h-10 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" /> Delete Plot
        </button>
      )}
    </div>
  );
}

function SplitPlotForm({ plot, takenNumbers, saving, currentUserName, onSave, onClose }: {
  plot: PlotUnit;
  takenNumbers: string[];
  saving: boolean;
  currentUserName?: string;
  onSave: (input: SplitInput) => void;
  onClose: () => void;
}) {
  const total = parseArea(plot.size);
  const [soldAreaText, setSoldAreaText] = useState("");
  const [remainingNumber, setRemainingNumber] = useState(() => suggestSplitNumber(plot.unit_number, takenNumbers));
  const [buyer, setBuyer] = useState("");
  const [telecaller, setTelecaller] = useState(currentUserName || "");
  const [finalAmount, setFinalAmount] = useState("");

  if (!total) {
    return (
      <div className="space-y-4 pt-1">
        <p className="text-sm text-muted-foreground">
          This plot has no numeric area, so it can&apos;t be split. Add an area like &quot;1000&quot; first.
        </p>
        <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
      </div>
    );
  }

  const soldValue = Number(soldAreaText);
  const soldValid = soldAreaText !== "" && Number.isFinite(soldValue) && soldValue > 0 && soldValue < total.value;
  const remainingValue = soldValid ? total.value - soldValue : null;
  const numberTaken = takenNumbers.some((n) => n.toLowerCase() === remainingNumber.trim().toLowerCase());

  // Split the listed price across the two pieces by area; either piece can be
  // corrected afterwards from the plot's Edit details.
  const perUnit = plot.price ? plot.price / total.value : null;
  const soldPrice = perUnit && soldValid ? Math.round(perUnit * soldValue) : null;
  const remainingPrice = perUnit && remainingValue ? Math.round(perUnit * remainingValue) : null;

  const finalAmountNumber = finalAmount ? Number(finalAmount) : null;
  const canSubmit = soldValid && !numberTaken && !!remainingNumber.trim() && !!buyer.trim() && !saving;

  return (
    <div className="space-y-4 pt-1">
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <p className="text-xs text-muted-foreground">Total Area</p>
        <p className="font-bold text-[#1e1b4b]">{formatArea(total)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Area Sold *</Label>
          <Input className="h-10" placeholder={`e.g. ${Math.round(total.value * 0.8)}`} value={soldAreaText} inputMode="numeric"
            onChange={(e) => setSoldAreaText(e.target.value.replace(/[^\d.]/g, ""))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Area Left (Available)</Label>
          <div className="h-10 flex items-center rounded-lg border border-slate-100 bg-slate-50 px-3 font-semibold text-[#1e1b4b]">
            {remainingValue ? formatArea({ value: remainingValue, unit: total.unit }) : "-"}
          </div>
        </div>
      </div>

      {soldAreaText !== "" && !soldValid && (
        <p className="text-sm text-red-600">Area sold must be more than 0 and less than {formatArea(total)}.</p>
      )}

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#1e1b4b]">
          <User className="w-3.5 h-3.5 inline mr-1" /> Buyer Name *
        </Label>
        <Input className="h-10" placeholder="e.g. Rajesh Kumar" value={buyer}
          onChange={(e) => setBuyer(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Telecaller Name</Label>
          <Input className="h-10" placeholder="e.g. Sunita Patel" value={telecaller}
            onChange={(e) => setTelecaller(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Final Amount</Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="h-10 pl-9" placeholder="e.g. 1850000" value={finalAmount} inputMode="numeric"
              onChange={(e) => setFinalAmount(e.target.value.replace(/[^\d.]/g, ""))} />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-[#1e1b4b]">Plot Number For The Leftover Area *</Label>
        <Input className="h-10" value={remainingNumber}
          onChange={(e) => setRemainingNumber(e.target.value)} />
        {numberTaken && <p className="text-sm text-red-600">Plot {remainingNumber} already exists. Pick another number.</p>}
      </div>

      {soldValid && remainingValue && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-sm text-[#1e1b4b] space-y-1">
          <p className="font-semibold">After splitting:</p>
          <p>
            Plot {plot.unit_number} → {formatArea({ value: soldValue, unit: total.unit })}
            {soldPrice ? ` · ${formatPrice(soldPrice)}` : ""} · <span className="text-red-600 font-semibold">Sold</span>
          </p>
          <p>
            Plot {remainingNumber || "?"} → {formatArea({ value: remainingValue, unit: total.unit })}
            {remainingPrice ? ` · ${formatPrice(remainingPrice)}` : ""} · <span className="text-green-600 font-semibold">Available</span>
          </p>
          {perUnit && <p className="text-xs text-muted-foreground">Listed price split by area — you can edit either plot afterwards.</p>}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button className="flex-1" disabled={!canSubmit}
          style={{ background: "#6366f1", color: "white" }}
          onClick={() => onSave({
            soldArea: { value: soldValue, unit: total.unit },
            remainingArea: { value: remainingValue as number, unit: total.unit },
            remainingNumber: remainingNumber.trim(),
            remainingPrice,
            soldPrice,
            deal: {
              buyer_name: buyer || null,
              telecaller_name: telecaller || null,
              final_amount: finalAmountNumber && Number.isFinite(finalAmountNumber) ? finalAmountNumber : null,
            },
          })}>
          {saving ? "Splitting…" : "Split & Mark Sold"}
        </Button>
      </div>
    </div>
  );
}

const FACING_OPTIONS = [
  "North", "South", "East", "West",
  "North-East", "North-West", "South-East", "South-West",
];

function AddPlotForm({ onSave, saving, onClose }: {
  onSave: (data: Partial<PlotUnit>) => void;
  saving: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState({ unit_number: "", size: "", facing: "", price: "" });

  return (
    <div className="space-y-4 pt-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Plot Number *</Label>
          <Input placeholder="e.g. A-101" className="h-10" value={data.unit_number}
            onChange={(e) => setData({ ...data, unit_number: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Size</Label>
          <Input placeholder="e.g. 200 sqyd" className="h-10" value={data.size}
            onChange={(e) => setData({ ...data, size: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Facing</Label>
          <Select onValueChange={(v: string | null) => setData({ ...data, facing: v ?? "" })}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Direction" /></SelectTrigger>
            <SelectContent>
              {FACING_OPTIONS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#1e1b4b]">Price (₹)</Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="8500000" className="pl-9 h-10" value={data.price}
              onChange={(e) => setData({ ...data, price: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button className="flex-1" disabled={saving || !data.unit_number}
          style={{ background: "#22c55e", color: "white" }}
          onClick={() => onSave({ ...data, price: data.price ? Number(data.price) : undefined })}>
          {saving ? "Adding…" : "Add Plot"}
        </Button>
      </div>
    </div>
  );
}
