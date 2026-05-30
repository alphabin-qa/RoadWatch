import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, PHOTO_BUCKET } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * POST multipart/form-data { file, session_id, source? }
 * Streams the file into the public Supabase bucket and returns the public URL.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const sessionId = (form.get("session_id") as string) || "anon";
    const source = (form.get("source") as string) || "gallery";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "empty file" }, { status: 400 });
    }
    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "file too large" }, { status: 400 });
    }

    const ext =
      file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1].toLowerCase() ||
      (file.type.includes("png") ? "png" : "jpg");
    const path = `${sessionId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error } = await supabaseAdmin.storage
      .from(PHOTO_BUCKET)
      .upload(path, Buffer.from(arrayBuffer), {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: pub } = supabaseAdmin.storage
      .from(PHOTO_BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({ url: pub.publicUrl, path, source });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "upload failed" },
      { status: 500 },
    );
  }
}
