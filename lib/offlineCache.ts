// District cache for offline road lookup. Populated on the first online resolve
// in a city; queried by GPS when the network is gone.

"use client";

import { idbGet, idbPut, idbGetAll } from "./idb";
import { haversineM } from "./format";
import type { ResolvedStretch } from "./types";

type CachedStretch = ResolvedStretch & {
  centerLat: number;
  centerLng: number;
  radiusM: number;
};
type DistrictRecord = { city: string; stretches: CachedStretch[]; cachedAt: number };

/** Cache (or refresh) a city's road data for offline use. */
export async function cacheDistrict(city: string): Promise<void> {
  if (!city) return;
  const existing = await idbGet<DistrictRecord>("districts", city).catch(() => undefined);
  // refresh at most once per day
  if (existing && Date.now() - existing.cachedAt < 24 * 3600 * 1000) return;
  try {
    const res = await fetch(`/api/district?city=${encodeURIComponent(city)}`);
    if (!res.ok) return;
    const { stretches } = (await res.json()) as { stretches: CachedStretch[] };
    if (Array.isArray(stretches) && stretches.length) {
      await idbPut("districts", { city, stretches, cachedAt: Date.now() });
    }
  } catch {
    /* offline or no DB - skip */
  }
}

/** Nearest cached stretch to a point, across all cached districts. */
export async function findNearestCached(
  lat: number,
  lng: number,
): Promise<ResolvedStretch | null> {
  let districts: DistrictRecord[] = [];
  try {
    districts = await idbGetAll<DistrictRecord>("districts");
  } catch {
    return null;
  }
  let best: { s: CachedStretch; d: number } | null = null;
  for (const dr of districts) {
    for (const s of dr.stretches ?? []) {
      if (s.centerLat == null || s.centerLng == null) continue;
      const d = haversineM({ lat, lng }, { lat: s.centerLat, lng: s.centerLng });
      if (d <= (s.radiusM ?? 1500) && (!best || d < best.d)) best = { s, d };
    }
  }
  if (!best) return null;
  // strip the geo helper fields before handing to a card
  const { centerLat, centerLng, radiusM, ...stretch } = best.s;
  return { ...stretch, lat, lng };
}

export async function hasAnyDistrictCached(): Promise<boolean> {
  try {
    const all = await idbGetAll<DistrictRecord>("districts");
    return all.length > 0;
  } catch {
    return false;
  }
}
