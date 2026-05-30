import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/** GET /api/chats?session_id=... → list this user's chats with their attached complaint id (if any) */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ chats: [] });
  }
  const { data: chats, error } = await supabaseAdmin
    .from("chats")
    .select("id,title,locale,created_at,updated_at")
    .eq("session_id", sessionId)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Attach complaint ID per chat (one query)
  const ids = (chats ?? []).map((c) => c.id);
  let byChat: Record<string, string> = {};
  if (ids.length > 0) {
    const { data: cps } = await supabaseAdmin
      .from("complaints")
      .select("id,chat_id")
      .in("chat_id", ids);
    for (const r of cps ?? []) byChat[r.chat_id] = r.id;
  }
  return NextResponse.json({
    chats: (chats ?? []).map((c) => ({
      ...c,
      complaintId: byChat[c.id] ?? null,
    })),
  });
}

/** POST /api/chats { session_id, locale, title? } → create a new chat */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { session_id, locale = "en", title = "New chat" } = body ?? {};
  if (!session_id) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("chats")
    .insert({ session_id, locale, title })
    .select("id,title,locale,created_at,updated_at")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ chat: data });
}
