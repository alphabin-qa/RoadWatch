import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/** GET /api/messages?chat_id=... → list messages in a chat (oldest first) */
export async function GET(req: NextRequest) {
  const chatId = req.nextUrl.searchParams.get("chat_id");
  if (!chatId) return NextResponse.json({ messages: [] });
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data ?? [] });
}

/** POST /api/messages → append a message */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    chat_id,
    role,
    text,
    image_url,
    lat,
    lng,
    resolved_address,
    resolved_display,
    card_kind,
    variant,
  } = body ?? {};
  if (!chat_id || !role) {
    return NextResponse.json(
      { error: "chat_id + role required" },
      { status: 400 },
    );
  }
  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      chat_id,
      role,
      text,
      image_url,
      lat,
      lng,
      resolved_address,
      resolved_display,
      card_kind,
      variant,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Bump chat.updated_at + lazily set title from first user message.
  await supabaseAdmin
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chat_id);
  if (role === "user" && text) {
    const { data: chat } = await supabaseAdmin
      .from("chats")
      .select("title")
      .eq("id", chat_id)
      .single();
    if (chat?.title === "New chat") {
      const title = text.length > 60 ? text.slice(0, 60) + "…" : text;
      await supabaseAdmin.from("chats").update({ title }).eq("id", chat_id);
    }
  }

  return NextResponse.json({ message: data });
}
