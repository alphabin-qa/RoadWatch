// Read GPS from a photo's EXIF metadata.
// `extractGps` is pure (testable in Node). `readGpsFromFile` wraps `exifr`.

export type LatLng = { lat: number; lng: number };

type ParsedGps = {
  latitude?: unknown;
  longitude?: unknown;
};

/** Pure: validate and unwrap a parsed EXIF GPS object. */
export function extractGps(
  parsed: ParsedGps | null | undefined,
): LatLng | null {
  if (!parsed) return null;
  const { latitude, longitude } = parsed;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  // Null Island - most cameras write (0,0) when GPS lock fails. Reject.
  if (latitude === 0 && longitude === 0) return null;
  return { lat: latitude, lng: longitude };
}

/** Browser-side helper. Reads EXIF GPS from a File. Returns null on failure. */
export async function readGpsFromFile(
  file: File,
): Promise<LatLng | null> {
  try {
    // Lazy import keeps server bundle small.
    const exifr = (await import("exifr")).default;
    const parsed = await exifr.gps(file);
    return extractGps(parsed as ParsedGps);
  } catch {
    return null;
  }
}

/** "13.04127, 80.24181" - 5 decimals ≈ 1.1 m precision. */
export function formatLatLng(p: LatLng | null): string {
  if (!p) return "-";
  return `${round5(p.lat)}, ${round5(p.lng)}`;
}

function round5(n: number): string {
  return (Math.round(n * 1e5) / 1e5).toFixed(5);
}
