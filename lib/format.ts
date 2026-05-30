// Pure formatters shared by server (API routes) and client (cards).
// No DOM, no Node APIs — safe to import anywhere.

/**
 * Format a paise-free INR integer as a compact Indian-style string.
 *   23000000  → "₹2.30 Cr"
 *   500000    → "₹5.00 Lakh"
 *   42000     → "₹42,000"
 */
export function formatINR(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} Lakh`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** ISO date ("2024-02-14") → "14 Feb 2024". Returns "—" on bad input. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Is a DLP-until date still in the future, relative to `now`? */
export function isDlpActive(
  dlpUntil: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!dlpUntil) return false;
  const d = new Date(dlpUntil);
  return !isNaN(d.getTime()) && d.getTime() > now.getTime();
}

/** Haversine distance in metres between two lat/lng points. */
export function haversineM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Map a road_class code to a human label. */
export function roadClassLabel(code: string | null | undefined): string {
  switch ((code ?? "").toUpperCase()) {
    case "NH": return "National Highway";
    case "SH": return "State Highway";
    case "MDR": return "Major District Road";
    case "ODR": return "Other District Road";
    case "VR": return "Village Road";
    case "MUN": return "Municipal Road";
    case "PMGSY": return "PMGSY Rural Road";
    case "SVC": return "Service Road";
    default: return code || "Road";
  }
}
