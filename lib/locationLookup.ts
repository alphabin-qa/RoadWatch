// Pure parsers + display formatters for two free APIs:
//   - OSRM /nearest      → snap a point to the nearest road centerline
//   - Nominatim /reverse → human-readable address breakdown
// Network calls live in app/api/locate/route.ts; this file is testable in Node.

import type { LatLng } from "./exifLocation";

export type RoadClass =
  | "NH"   // National Highway (OSM trunk)
  | "SH"   // State Highway (primary)
  | "MDR"  // Major District Road (secondary)
  | "ODR"  // Other District Road (tertiary)
  | "VR"   // Village Road / residential
  | "SVC"; // Service / unclassified

/**
 * Indian pincodes are 6 digits and the first digit indicates a region:
 *   1 = Delhi/HP/J&K     2 = HR/PB/UP-W     3 = RJ/GJ
 *   4 = MH/MP/CG         5 = AP/TG/KA       6 = TN/KL/Pondy
 *   7 = WB/OR/NE         8 = BR/JH         9 = APO/FPO
 * Anything not starting with 1-9 is invalid.
 */
export function isValidIndianPincode(pin: string | null | undefined): boolean {
  if (!pin) return false;
  return /^[1-9][0-9]{5}$/.test(pin);
}

export type Address = {
  road: string | null;
  neighbourhood: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
};

export type ResolvedLocation = {
  snapped: LatLng;
  roadName: string | null;
  distanceM: number | null;        // distance from raw point to snapped point
  address: Address | null;
  roadClass?: RoadClass | null;     // from OSM `highway=*` if available
};

// ---------- OSRM /nearest parser ----------

type OsrmWaypoint = {
  name?: string;
  distance?: number;
  location?: number[]; // [lng, lat]
};

export function parseOsrm(
  raw: any,
): { roadName: string | null; distanceM: number; snapped: LatLng } | null {
  if (!raw || raw.code !== "Ok") return null;
  const wps: OsrmWaypoint[] = Array.isArray(raw.waypoints) ? raw.waypoints : [];
  const wp = wps[0];
  if (!wp) return null;
  if (
    !Array.isArray(wp.location) ||
    wp.location.length < 2 ||
    typeof wp.location[0] !== "number" ||
    typeof wp.location[1] !== "number"
  ) {
    return null;
  }
  return {
    roadName:
      typeof wp.name === "string" && wp.name.trim().length > 0
        ? wp.name.trim()
        : null,
    distanceM: typeof wp.distance === "number" ? wp.distance : 0,
    snapped: { lat: wp.location[1], lng: wp.location[0] },
  };
}

// ---------- Nominatim /reverse parser ----------

type NominatimAddr = Record<string, string | undefined>;

export function parseNominatim(raw: any): Address | null {
  if (!raw || raw.error) return null;
  const a: NominatimAddr | undefined = raw.address;
  if (!a || typeof a !== "object") return null;

  const road =
    a.road ??
    a.pedestrian ??
    a.footway ??
    a.path ??
    a.cycleway ??
    null;

  const neighbourhood =
    a.neighbourhood ??
    a.suburb ??
    a.quarter ??
    a.residential ??
    a.hamlet ??
    null;

  // City is messy in India - try every level.
  const city =
    a.city ??
    a.town ??
    a.village ??
    a.municipality ??
    a.hamlet ??
    a.county ??
    null;

  // Filter obviously-wrong pincodes (Nominatim sometimes returns stale 6-digit
  // codes that don't match India's regional scheme - e.g. starting with 0 or
  // belonging to the wrong state). Show pincode only if it parses cleanly.
  const rawPin = a.postcode ?? null;
  const pincode = isValidIndianPincode(rawPin) ? rawPin! : null;

  return {
    road: road ?? null,
    neighbourhood: neighbourhood ?? null,
    city: city ?? null,
    state: a.state ?? null,
    country: a.country ?? null,
    pincode,
  };
}

// ---------- OSM highway tag → Indian road class ----------

export function classifyHighway(tag: string | undefined): RoadClass | null {
  if (!tag) return null;
  switch (tag) {
    case "motorway":
    case "trunk":
      return "NH";
    case "primary":
      return "SH";
    case "secondary":
      return "MDR";
    case "tertiary":
      return "ODR";
    case "residential":
    case "living_street":
      return "VR";
    case "service":
    case "unclassified":
      return "SVC";
    default:
      return null;
  }
}

// ---------- Display formatter ----------

/**
 * Compose a single line for the chat bubble / admin row.
 * Order: road → neighbourhood → city. Dedup if OSRM road equals Nominatim road.
 * Falls back to plain coordinates when nothing else resolves.
 */
export function buildDisplayLine(loc: ResolvedLocation): string {
  const parts: string[] = [];
  const seen = new Set<string>();

  const push = (s: string | null | undefined) => {
    if (!s) return;
    const k = s.trim().toLowerCase();
    if (!k || seen.has(k)) return;
    seen.add(k);
    parts.push(s.trim());
  };

  push(loc.roadName);
  push(loc.address?.road);
  push(loc.address?.neighbourhood);
  push(loc.address?.city);

  if (parts.length === 0) {
    const { lat, lng } = loc.snapped;
    return `${round2(lat)}, ${round2(lng)}`;
  }
  return parts.join(", ");
}

function round2(n: number): string {
  return (Math.round(n * 1e2) / 1e2).toFixed(2);
}
