import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Server-side admin client — bypasses RLS entirely
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Body =
  | { op: "insert"; table: string; data: Record<string, unknown> }
  | { op: "update"; table: string; id: string; data: Record<string, unknown> }
  | { op: "delete"; table: string; id: string };

export async function POST(req: NextRequest) {
  try {
    const body: Body = await req.json();

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
