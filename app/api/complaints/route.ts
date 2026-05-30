import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function shortId(): string {
  // CP-XXXXX (5 digits)
  const n = Math.floor(10000 + Math.random() * 89999);
  return `CP-${n}`;
}

/** GET /api/complaints?session_id=... → list complaints */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  const all = req.nextUrl.searchParams.get("all") === "1";
  const q = supabaseAdmin
    .from("complaints")
    .select(
      "*, complaint_photos(url, source), contractors(name)"
    )
    .order("filed_at", { ascending: false });
  const { data, error } = all
    ? await q
    : sessionId
      ? await q.eq("session_id", sessionId)
      : { data: [], error: null };
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ complaints: data ?? [] });
}

/** POST /api/complaints → file a new complaint (assistant-orchestrated). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      session_id,
      chat_id,
      subject,
      description,
      original_text,
      lat,
      lng,
      snapped_lat,
      snapped_lng,
      road_name,
      road_class,
      neighbourhood,
      city,
      state,
      pincode,
      contractor_id,
      contract_id,
      sla_days,
      current_rank,
      photo_urls,
    } = body ?? {};

    if (!session_id) {
      return NextResponse.json({ error: "session_id required" }, { status: 400 });
    }

    let id = shortId();
    // Avoid collision (rarely needed, but cheap to check)
    for (let i = 0; i < 3; i++) {
      const { data: dup } = await supabaseAdmin
        .from("complaints")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      if (!dup) break;
      id = shortId();
    }

    const { error } = await supabaseAdmin.from("complaints").insert({
      id,
      session_id,
      chat_id: chat_id ?? null,
      subject,
      description,
      original_text,
      status: "filed",
      lat,
      lng,
      snapped_lat,
      snapped_lng,
      road_name,
      road_class,
      neighbourhood,
      city,
      state,
      pincode,
      contractor_id: contractor_id ?? null,
      contract_id: contract_id ?? null,
      sla_days: sla_days ?? 30,
      current_rank: current_rank ?? 2,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (Array.isArray(photo_urls) && photo_urls.length > 0) {
      const rows = photo_urls.map((url: string) => ({
        complaint_id: id,
        url,
        source: "gallery",
      }));
      await supabaseAdmin.from("complaint_photos").insert(rows);
    }

    // Seed a default timeline.
    await supabaseAdmin.from("complaint_events").insert([
      { complaint_id: id, label: "Filed to CPGRAMS", done: true },
      {
        complaint_id: id,
        label: "Acknowledged · Ref generated",
        done: true,
      },
    ]);

    return NextResponse.json({ id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "internal error" },
      { status: 500 },
    );
  }
}
