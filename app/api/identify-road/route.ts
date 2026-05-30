import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM = `You are RoadWatch's vision fallback. Given a single photo of a road in India and NO GPS, produce only what you can confidently READ from the image (signs, kilometre posts, building boards, language scripts). Do NOT guess.

Return strict JSON.`;

const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    confidence: {
      type: SchemaType.STRING,
      enum: ["low", "medium", "high"],
      format: "enum",
    },
    visibleClues: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description:
        "Concrete things visible in the photo: shop signs, kilometre posts, language script, road markings.",
    },
    likelyState: {
      type: SchemaType.STRING,
      description:
        "Best guess Indian state, only if a strong textual clue is visible (e.g. Tamil script => Tamil Nadu). Empty otherwise.",
    },
    likelyArea: {
      type: SchemaType.STRING,
      description:
        "Best guess locality / road from board text. Empty if nothing readable.",
    },
    note: {
      type: SchemaType.STRING,
      description:
        "One short sentence telling the user the photo's location is uncertain and asking them to confirm on the map.",
    },
  },
  required: ["confidence", "visibleClues", "likelyState", "likelyArea", "note"],
};

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = (await req.json()) as {
      imageBase64?: string;
      mimeType?: string;
    };
    if (!imageBase64) {
      return NextResponse.json(
        { error: "imageBase64 required" },
        { status: 400 },
      );
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not set" },
        { status: 500 },
      );
    }

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as any,
        temperature: 0.2,
      },
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Identify visible textual clues only. No guessing." },
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType || "image/jpeg",
              },
            },
          ],
        },
      ],
    });

    const text = result.response.text();
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {}

    return NextResponse.json({
      confidence: parsed.confidence ?? "low",
      visibleClues: Array.isArray(parsed.visibleClues) ? parsed.visibleClues : [],
      likelyState: parsed.likelyState ?? "",
      likelyArea: parsed.likelyArea ?? "",
      note:
        parsed.note ??
        "Unable to confirm location from the photo alone. Please tap the location on the map.",
    });
  } catch (e: any) {
    console.error("[/api/identify-road] error:", e?.message ?? e);
    return NextResponse.json(
      { error: e?.message ?? "internal error" },
      { status: 500 },
    );
  }
}
