import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type Body =
  | { op: "select"; table: string }
  | { op: "telecaller-login"; username: string; password: string }
  | { op: "marketing-login"; username: string; password: string }
  | { op: "reserve-plot"; id: string; data: Record<string, unknown> }
  | { op: "insert"; table: string; data: Record<string, unknown> }
  | { op: "update"; table: string; id: string; data: Record<string, unknown> }
  | { op: "delete"; table: string; id: string };

const MARKETING_MANAGER_MARKER = "__marketing_manager__";

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminClient();
    const body: Body = await req.json();

    if (body.op === "telecaller-login") {
      const { data, error } = await admin
        .from("telecallers")
        .select("id, full_name, username, status, phone")
        .eq("username", body.username)
        .eq("password", body.password)
        .eq("status", "active")
        .single();
      if (error || !data || data.phone === MARKETING_MANAGER_MARKER) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      return NextResponse.json({ data });
    }

    if (body.op === "marketing-login") {
      const { data, error } = await admin
        .from("telecallers")
        .select("id, full_name, username, status")
        .eq("username", body.username)
        .eq("password", body.password)
        .eq("status", "active")
        .eq("phone", MARKETING_MANAGER_MARKER)
        .single();
      if (error || !data) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      return NextResponse.json({ data });
    }

    if (body.op === "reserve-plot") {
      const { data, error } = await admin
        .from("plot_units")
        .update({ ...body.data, status: "reserved" })
        .eq("id", body.id)
        .eq("status", "available")
        .select()
        .maybeSingle();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (!data) return NextResponse.json({ error: "Plot is no longer available" }, { status: 409 });
      return NextResponse.json({ data });
    }

    if (body.op === "select") {
      if (body.table === "properties") {
        const { data, error } = await admin
          .from("properties")
          .select("*, plot_units(*)")
          .order("created_at", { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });

        const withSortedPlots = (data || []).map((property) => ({
          ...property,
          plot_units: [...(property.plot_units || [])].sort((a, b) =>
            String(a.unit_number).localeCompare(String(b.unit_number), undefined, {
              numeric: true,
              sensitivity: "base",
            })
          ),
        }));

        return NextResponse.json({ data: withSortedPlots });
      }

      const { data, error } = await admin
        .from(body.table)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    if (body.op === "insert") {
      const { data, error } = await admin
        .from(body.table)
        .insert([body.data])
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    if (body.op === "update") {
      const { data, error } = await admin
        .from(body.table)
        .update(body.data)
        .eq("id", body.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    if (body.op === "delete") {
      const { error } = await admin.from(body.table).delete().eq("id", body.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown operation" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
