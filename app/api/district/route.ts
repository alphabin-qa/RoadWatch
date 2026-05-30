import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { formatINR, formatDate, isDlpActive, roadClassLabel } from "@/lib/format";
import type { ResolvedStretch } from "@/lib/types";

export const runtime = "nodejs";

/**
 * GET /api/district?city=Chennai
 *   → every geocoded contract in the city, pre-shaped as ResolvedStretch, plus
 *     the responsible officer. The client caches this in IndexedDB so offline
 *     pins still resolve. Returns { city, stretches }.
 */
export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  if (!city) return NextResponse.json({ city: null, stretches: [] });

  const [{ data: contracts }, { data: officers }, { data: norms }] = await Promise.all([
    supabaseAdmin
      .from("contracts")
      .select("*")
      .ilike("jurisdiction_city", city)
      .not("center_lat", "is", null),
    supabaseAdmin
      .from("officers")
      .select("*")
      .ilike("jurisdiction_city", city)
      .gte("rank", 2)
      .order("rank", { ascending: true }),
    supabaseAdmin.from("cost_norms").select("*"),
  ]);

  const officer = officers?.[0]
    ? {
        name: officers[0].name,
        designation: officers[0].role,
        division: `${city} Division`,
        email: officers[0].email,
        phone: officers[0].phone,
        slaDays: officers[0].sla_days ?? 30,
        rank: officers[0].rank,
      }
    : null;

  // contractor names in one shot
  const ids = Array.from(
    new Set((contracts ?? []).map((c) => c.contractor_id).filter(Boolean)),
  );
  const { data: contractorRows } = ids.length
    ? await supabaseAdmin.from("contractors").select("id, name").in("id", ids)
    : { data: [] as any[] };
  const nameById = new Map(
    (contractorRows ?? []).map((r) => [r.id, String(r.name).replace(/^SEED:/, "")]),
  );

  const normFor = (rc: string, wt: string) =>
    (norms ?? []).find((n) => n.road_class === rc && n.work_type === wt) ??
    (norms ?? []).find((n) => n.road_class === rc);

  const stretches = (contracts ?? []).map((c) => {
    const n = normFor(c.road_class, c.work_type);
    let norm = "-";
    let flag = "-";
    if (n && c.length_km && c.sanctioned_inr) {
      const perKm = c.sanctioned_inr / c.length_km;
      norm = `${formatINR(n.cost_per_km_min)}–${formatINR(n.cost_per_km_max)}/km`;
      flag =
        perKm > n.cost_per_km_max * 1.2
          ? `Over norm by ${Math.round((perKm / n.cost_per_km_max - 1) * 100)}%`
          : perKm < n.cost_per_km_min * 0.5
            ? "Suspiciously low ₹/km"
            : "Within norm";
    }
    const s: ResolvedStretch & { centerLat: number; centerLng: number; radiusM: number } = {
      display: `${c.road_name ?? c.road_match_pattern ?? "Road"} · ${city}`,
      roadClass: c.road_class,
      roadClassLabel: roadClassLabel(c.road_class),
      chainage: "-",
      lastRelay: formatDate(c.last_relay_date),
      contractor: nameById.get(c.contractor_id) ?? "-",
      contractorId: c.contractor_id ?? null,
      contractId: c.id,
      tenderId: c.tender_id ?? "-",
      sanctioned: formatINR(c.sanctioned_inr),
      spent: formatINR(c.spent_inr),
      norm,
      flag,
      dlpActive: isDlpActive(c.dlp_until),
      dlpUntil: formatDate(c.dlp_until),
      tenderUrl: c.tender_url ?? null,
      hasContract: true,
      officer: officer ?? {
        name: "Area Authority",
        designation: "Executive Engineer",
        division: `${city} Division`,
        email: "",
        phone: "",
        slaDays: 30,
      },
      city,
      state: c.jurisdiction_state ?? null,
      // geo for offline nearest-match
      centerLat: c.center_lat,
      centerLng: c.center_lng,
      radiusM: c.match_radius_m ?? 1500,
    };
    return s;
  });

  return NextResponse.json({ city, stretches });
}
