import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { formatINR, formatDate, isDlpActive, haversineM, roadClassLabel } from "@/lib/format";
import type { MatchResult } from "@/lib/types";

export const runtime = "nodejs";

const EMPTY: MatchResult = {
  found: false,
  contractorId: null,
  contractId: null,
  contractor: null,
  tenderId: null,
  roadClass: null,
  sanctioned: null,
  spent: null,
  norm: null,
  flag: null,
  lastRelay: null,
  dlpActive: false,
  dlpUntil: null,
  tenderUrl: null,
  officer: null,
};

/**
 * POST { city?, state?, road_name?, road_class?, lat?, lng? }
 *   → finds the contract + contractor + responsible officer for a pinned road.
 *
 * Match order:
 *   1. nearest contract within match_radius_m of (lat,lng) - the map-pin path
 *   2. road_name regex against contracts.road_match_pattern
 *   3. city (+ road_class) match
 *   4. state-level fallback
 * Returns a fully-formatted MatchResult; found=false when nothing matches.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const city: string | undefined = body.city ?? undefined;
    const state: string | undefined = body.state ?? undefined;
    const roadName: string | undefined = body.road_name ?? undefined;
    const roadClass: string | undefined = body.road_class ?? undefined;
    const lat: number | undefined =
      typeof body.lat === "number" ? body.lat : undefined;
    const lng: number | undefined =
      typeof body.lng === "number" ? body.lng : undefined;

    if (!city && !state && !roadName && lat == null) {
      return NextResponse.json(EMPTY);
    }

    let contract: any = null;

    // 1) nearest by GPS (the map-pin path)
    if (lat != null && lng != null) {
      let q = supabaseAdmin
        .from("contracts")
        .select("*")
        .not("center_lat", "is", null);
      if (city) q = q.ilike("jurisdiction_city", city);
      const { data } = await q;
      const here = { lat, lng };
      let best: { c: any; d: number } | null = null;
      for (const c of data ?? []) {
        const d = haversineM(here, { lat: c.center_lat, lng: c.center_lng });
        if (d <= (c.match_radius_m ?? 1500) && (!best || d < best.d)) {
          best = { c, d };
        }
      }
      contract = best?.c ?? null;
    }

    // 2) road_name pattern
    if (!contract && roadName) {
      const { data } = await supabaseAdmin
        .from("contracts")
        .select("*")
        .not("road_match_pattern", "is", null);
      contract =
        (data ?? []).find((c) => {
          try {
            return new RegExp(c.road_match_pattern, "i").test(roadName);
          } catch {
            return roadName
              .toLowerCase()
              .includes(String(c.road_match_pattern).toLowerCase());
          }
        }) ?? null;
    }

    // 3) city (+ road_class)
    if (!contract && city) {
      const base = supabaseAdmin
        .from("contracts")
        .select("*")
        .ilike("jurisdiction_city", city)
        .limit(1);
      const { data } = roadClass
        ? await base.eq("road_class", roadClass)
        : await base;
      contract = data?.[0] ?? null;
    }

    // 4) state fallback
    if (!contract && state) {
      const { data } = await supabaseAdmin
        .from("contracts")
        .select("*")
        .ilike("jurisdiction_state", state)
        .limit(1);
      contract = data?.[0] ?? null;
    }

    // contractor name (only when a contract matched)
    let contractorName: string | null = null;
    if (contract?.contractor_id) {
      const { data } = await supabaseAdmin
        .from("contractors")
        .select("name")
        .eq("id", contract.contractor_id)
        .single();
      contractorName = data?.name?.replace(/^SEED:/, "") ?? null;
    }

    // officer = lowest rank (>= AE) for this jurisdiction - resolved even when
    // no contract matched, so complaint routing still works ("we don't know the
    // contractor, but here is the EE responsible for this jurisdiction").
    let officer: MatchResult["officer"] = null;
    const offCity = contract?.jurisdiction_city ?? city;
    if (offCity) {
      const { data } = await supabaseAdmin
        .from("officers")
        .select("*")
        .ilike("jurisdiction_city", offCity)
        .gte("rank", 2)
        .order("rank", { ascending: true })
        .limit(1);
      const o = data?.[0];
      if (o) {
        officer = {
          name: o.name,
          designation: o.role,
          division: `${roadClassLabel(contract?.road_class ?? roadClass)} Division, ${offCity}`,
          email: o.email,
          phone: o.phone,
          slaDays: o.sla_days ?? 30,
          rank: o.rank,
        };
      }
    }

    // No contract matched → return officer (if any) but found=false.
    if (!contract) {
      return NextResponse.json({ ...EMPTY, officer });
    }

    // ₹/km norm + red-flag
    let norm: string | null = null;
    let flag: string | null = null;
    if (contract.length_km && contract.sanctioned_inr) {
      const perKm = contract.sanctioned_inr / contract.length_km;
      const { data: normRows } = await supabaseAdmin
        .from("cost_norms")
        .select("*")
        .eq("road_class", contract.road_class);
      // Prefer the exact work_type; fall back to any norm for this road class.
      const n =
        (normRows ?? []).find((x) => x.work_type === contract.work_type) ??
        (normRows ?? [])[0];
      if (n) {
        norm = `${formatINR(n.cost_per_km_min)}–${formatINR(n.cost_per_km_max)}/km`;
        if (perKm > n.cost_per_km_max * 1.2) {
          flag = `Over norm by ${Math.round((perKm / n.cost_per_km_max - 1) * 100)}%`;
        } else if (perKm < n.cost_per_km_min * 0.5) {
          flag = "Suspiciously low ₹/km";
        } else {
          flag = "Within norm";
        }
      }
    }

    const result: MatchResult = {
      found: true,
      contractorId: contract.contractor_id ?? null,
      contractId: contract.id,
      contractor: contractorName,
      tenderId: contract.tender_id ?? null,
      roadClass: contract.road_class ?? null,
      sanctioned: formatINR(contract.sanctioned_inr),
      spent: formatINR(contract.spent_inr),
      norm,
      flag,
      lastRelay: formatDate(contract.last_relay_date),
      dlpActive: isDlpActive(contract.dlp_until),
      dlpUntil: formatDate(contract.dlp_until),
      tenderUrl: contract.tender_url ?? null,
      officer,
    };
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "internal error" },
      { status: 500 },
    );
  }
}
