import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/** GET /api/complaints/CP-12345 → full complaint with photos + events + officer chain */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = decodeURIComponent(params.id);
  const { data: complaint, error } = await supabaseAdmin
    .from("complaints")
    .select(
      "*, complaint_photos(url, source, created_at), complaint_events(label, occurred_at, done), contractors(name)"
    )
    .eq("id", id)
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!complaint)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  // 5-rung escalation ladder for the city
  let officers: any[] = [];
  if (complaint.city) {
    const { data } = await supabaseAdmin
      .from("officers")
      .select("rank,role,name,email,phone,sla_days")
      .ilike("jurisdiction_city", complaint.city)
      .order("rank", { ascending: true });
    officers = data ?? [];
  }

  return NextResponse.json({ complaint, officers });
}

/** PATCH /api/complaints/CP-12345 { status?, current_rank? } → escalate / mark resolved */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = decodeURIComponent(params.id);
  const body = await req.json();
  const patch: any = {};
  if (typeof body.status === "string") patch.status = body.status;
  if (typeof body.current_rank === "number")
    patch.current_rank = body.current_rank;
  patch.updated_at = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from("complaints")
    .update(patch)
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (patch.current_rank) {
    await supabaseAdmin.from("complaint_events").insert({
      complaint_id: id,
      label: `Auto-escalated to rank ${patch.current_rank}`,
      done: true,
    });
  }
  return NextResponse.json({ ok: true });
}
