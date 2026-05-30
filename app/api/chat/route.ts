import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Card kinds the UI can render. Gemini must pick one.
const CARD_ENUM = [
  "attribution",
  "budget",
  "officer",
  "complaint",
  "tracking",
  "cost",
  "crash",
  "monsoon",
  "none",
] as const;

const SYSTEM = `You are RoadWatch, a citizen-facing assistant for Indian road quality, accountability and safety.

Users are ordinary citizens, often non-native English speakers. They may write in English, Hindi (Devanagari), Tamil, or code-mixed (Hinglish/Tanglish). ALWAYS reply in the same language as the user's last message.

CRITICAL - you do NOT know which road the user means unless a resolved road is given in the CONTEXT line.
- If CONTEXT says a road IS resolved, answer using ONLY those facts.
- If CONTEXT says NO road is resolved, DO NOT invent or assume any road, contractor or amount. Briefly ask the user to share a photo of the road or drop a pin on the map so you can look up the contractor, budget, officer and warranty, and set "card" to "none".

Your reply must be:
- Short (2-3 sentences max), warm, conversational
- Free of bureaucratic jargon. Plain words.
- End by suggesting one helpful next step in one sentence.

You must also pick exactly one "card" to render alongside your reply, from this fixed list:
- attribution - when user wants to know who built / when relaid / type of road / contractor
- budget - when user asks about money, sanctioned, spent, cost overrun
- officer - when user asks who is responsible / which authority / where to complain
- complaint - when user wants to file or draft a complaint
- tracking - when user asks about complaint status, ticket, progress, escalation
- cost - when user asks about pollution, fuel, noise, time loss, or "true cost"
- crash - when user asks about accidents, fatalities, safety record
- monsoon - when user asks about monsoon, rain, future damage, prediction
- none - only if no card fits at all (greetings, off-topic chitchat)

Return strict JSON only.`;

const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    reply: {
      type: SchemaType.STRING,
      description: "Short warm reply in the user's language (2-3 sentences).",
    },
    card: {
      type: SchemaType.STRING,
      enum: [...CARD_ENUM],
      format: "enum",
    },
  },
  required: ["reply", "card"],
};

type Message = { role: "user" | "model"; text: string };

export async function POST(req: NextRequest) {
  try {
    const { message, history, locale, context } = (await req.json()) as {
      message: string;
      history?: Message[];
      locale?: "en" | "hi" | "ta";
      context?: Record<string, any> | null;
    };

    const contextLine = context?.resolved
      ? `CONTEXT: A road IS resolved - ${context.road} (${context.roadClass}), contractor ${context.contractor}, last relaid ${context.lastRelay}, sanctioned ${context.sanctioned}, spent ${context.spent}, warranty ${context.dlpActive ? `active until ${context.dlpUntil}` : "expired"}, responsible ${context.officer}. Answer using ONLY these facts.`
      : "CONTEXT: NO road is resolved yet. Do not invent a road. Ask the user to share a photo or drop a pin, and set card to none.";

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message required" }, { status: 400 });
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
        temperature: 0.6,
      },
    });

    const contents = [
      ...(history ?? []).slice(-6).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      {
        role: "user" as const,
        parts: [
          {
            text: `Locale hint: ${locale ?? "en"}\n${contextLine}\n\nUser: ${message}`,
          },
        ],
      },
    ];

    const result = await model.generateContent({ contents });
    const text = result.response.text();

    let parsed: { reply: string; card: string };
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { reply: text, card: "none" };
    }

    return NextResponse.json({
      reply: parsed.reply,
      card: CARD_ENUM.includes(parsed.card as any) ? parsed.card : "none",
    });
  } catch (e: any) {
    console.error("[/api/chat] error:", e?.message ?? e);
    return NextResponse.json(
      { error: e?.message ?? "internal error" },
      { status: 500 },
    );
  }
}
