// Live device GPS via the browser Geolocation API.
// Resolves with real phone/browser coordinates, or rejects with a typed reason
// so the UI can show the right popup / warning.

"use client";

export type GeoFix = { lat: number; lng: number; accuracyM: number };
export type GeoErrorCode = "unsupported" | "denied" | "unavailable" | "timeout";

export class GeoError extends Error {
  code: GeoErrorCode;
  constructor(code: GeoErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export function getLivePosition(timeoutMs = 10000): Promise<GeoFix> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject(new GeoError("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy ?? 0,
        }),
      (err) => {
        const code: GeoErrorCode =
          err.code === err.PERMISSION_DENIED
            ? "denied"
            : err.code === err.TIMEOUT
              ? "timeout"
              : "unavailable";
        reject(new GeoError(code, err.message));
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
    );
  });
}

/** Best-effort permission state without prompting (where supported). */
export async function geoPermissionState(): Promise<
  "granted" | "denied" | "prompt" | "unknown"
> {
  try {
    if (typeof navigator === "undefined" || !("permissions" in navigator))
      return "unknown";
    const res = await (navigator as any).permissions.query({
      name: "geolocation",
    });
    return res.state ?? "unknown";
  } catch {
    return "unknown";
  }
}
