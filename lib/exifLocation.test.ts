import { describe, it, expect } from "vitest";
import { extractGps, formatLatLng } from "./exifLocation";

describe("extractGps", () => {
  it("returns null for null", () => {
    expect(extractGps(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(extractGps(undefined)).toBeNull();
  });

  it("returns null when latitude/longitude missing", () => {
    expect(extractGps({})).toBeNull();
    expect(extractGps({ latitude: 13.04 } as any)).toBeNull();
    expect(extractGps({ longitude: 80.24 } as any)).toBeNull();
  });

  it("parses a valid Chennai coordinate", () => {
    expect(extractGps({ latitude: 13.0413, longitude: 80.2418 })).toEqual({
      lat: 13.0413,
      lng: 80.2418,
    });
  });

  it("parses a valid Hyderabad coordinate", () => {
    expect(extractGps({ latitude: 17.385, longitude: 78.4867 })).toEqual({
      lat: 17.385,
      lng: 78.4867,
    });
  });

  // Null Island - many cameras write 0,0 when GPS lock fails. Treat as missing.
  it("rejects 0,0 (Null Island, common GPS failure)", () => {
    expect(extractGps({ latitude: 0, longitude: 0 })).toBeNull();
  });

  it("accepts a valid coordinate that has 0 in only one component", () => {
    expect(extractGps({ latitude: 13.04, longitude: 0 })).toEqual({
      lat: 13.04,
      lng: 0,
    });
  });

  it("rejects NaN", () => {
    expect(extractGps({ latitude: NaN, longitude: 80 })).toBeNull();
    expect(extractGps({ latitude: 13, longitude: NaN })).toBeNull();
  });

  it("rejects Infinity", () => {
    expect(
      extractGps({ latitude: Infinity, longitude: 80 }),
    ).toBeNull();
  });

  it("rejects out-of-range latitude", () => {
    expect(extractGps({ latitude: 91, longitude: 80 })).toBeNull();
    expect(extractGps({ latitude: -91, longitude: 80 })).toBeNull();
  });

  it("rejects out-of-range longitude", () => {
    expect(extractGps({ latitude: 13, longitude: 181 })).toBeNull();
    expect(extractGps({ latitude: 13, longitude: -181 })).toBeNull();
  });

  it("rejects non-number types (string from broken EXIF)", () => {
    expect(
      extractGps({ latitude: "13.04" as any, longitude: 80 }),
    ).toBeNull();
  });
});

describe("formatLatLng", () => {
  it("formats Chennai with 5 decimals (~1.1 m precision)", () => {
    expect(formatLatLng({ lat: 13.04127, lng: 80.24181 })).toBe(
      "13.04127, 80.24181",
    );
  });

  it("rounds to 5 decimals", () => {
    expect(formatLatLng({ lat: 13.0412765, lng: 80.2418123 })).toBe(
      "13.04128, 80.24181",
    );
  });

  it("returns a placeholder for null", () => {
    expect(formatLatLng(null)).toMatch(/-|no/i);
  });
});
