import { NextRequest, NextResponse } from "next/server";
import {
  parseOsrm,
  parseNominatim,
  buildDisplayLine,
  type ResolvedLocation,
} from "@/lib/locationLookup";

export const runtime = "nodejs";

// Public OSM endpoints. Nominatim asks for a real User-Agent + email.
const OSRM = "https://router.project-osrm.org/nearest/v1/driving";
const NOMINATIM = "https://nominatim.openstreetmap.org/reverse";

const UA =
  "RoadWatch/0.1 (IIT Madras CoERS Hackathon 2026; civic non-commercial)";

export async function POST(req: NextRequest) {
  try {
    const { lat, lng, locale } = (await req.json()) as {
      lat: number;
      lng: number;
      locale?: string;
    };
    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
    }
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return NextResponse.json({ error: "out of range" }, { status: 400 });
    }

    // Pan-India language support — Nominatim falls back to English when
    // a translation isn't present, so passing the user's mother tongue is safe.
    const SUPPORTED = new Set([
      "en", "hi", "ta",                                   // already in UI
      "gu", "mr", "bn", "te", "kn", "ml", "pa", "or", "as", // big Indian languages
    ]);
    const acceptLang =
      typeof locale === "string" && SUPPORTED.has(locale) ? locale : "en";

    // Run OSRM + Nominatim in parallel.
    const [osrmRes, nomRes] = await Promise.allSettled([
      fetch(`${OSRM}/${lng},${lat}?number=1`, {
        headers: { "User-Agent": UA },
      }).then((r) => (r.ok ? r.json() : null)),
      fetch(
        `${NOMINATIM}?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&zoom=18&accept-language=${acceptLang}`,
        { headers: { "User-Agent": UA, "Accept-Language": acceptLang } },
      ).then((r) => (r.ok ? r.json() : null)),
    ]);

    const osrm =
      osrmRes.status === "fulfilled" ? parseOsrm(osrmRes.value) : null;
    const address =
      nomRes.status === "fulfilled" ? parseNominatim(nomRes.value) : null;

    const resolved: ResolvedLocation = {
      snapped: osrm?.snapped ?? { lat, lng },
      roadName: osrm?.roadName ?? address?.road ?? null,
      distanceM: osrm?.distanceM ?? null,
      address,
    };

    return NextResponse.json({
      ...resolved,
      display: buildDisplayLine(resolved),
      raw: { lat, lng },
    });
  } catch (e: any) {
    console.error("[/api/locate] error:", e?.message ?? e);
    return NextResponse.json(
      { error: e?.message ?? "internal error" },
      { status: 500 },
    );
  }
}
