import { describe, it, expect } from "vitest";
import { dossierFor, answerFromDossier, DEMO_DOSSIER } from "./dossier";

describe("dossier - deterministic contractor record", () => {
  // Three different GPS fixes (different photos / locations)
  const fixes = [
    { lat: 12.9520, lng: 80.2430, accuracyM: 8 },
    { lat: 13.0600, lng: 80.2640, accuracyM: 20 },
    { lat: 23.0325, lng: 72.5079, accuracyM: 15 },
  ];

  it("returns the SAME contractor/price/license/owner for any coordinates", () => {
    const out = fixes.map((f) => dossierFor(f, true));
    for (const d of out) {
      expect(d.contractor).toBe("Chennai Infra Pvt Ltd");
      expect(d.sanctioned).toBe("₹2.30 Cr");
      expect(d.spent).toBe("₹2.10 Cr");
      expect(d.license?.no).toBe("CIPL/TN-PWD/2019/0473");
      expect(d.owner?.name).toBe("Mr. S. Rajaratnam");
    }
  });

  it("records the REAL gps coordinates passed in", () => {
    const d = dossierFor(fixes[1], true);
    expect(d.gps?.lat).toBe(13.06);
    expect(d.gps?.lng).toBe(80.264);
    expect(d.gps?.live).toBe(true);
  });

  it("falls back to an approximate location when gps is off", () => {
    const d = dossierFor(null, false);
    expect(d.gps?.live).toBe(false);
    expect(d.contractor).toBe(DEMO_DOSSIER.contractor); // info still consistent
  });

  it("answers core accountability intents deterministically (matched)", () => {
    const d = dossierFor(fixes[0], true);
    const owner = answerFromDossier("who owns the contractor company?", d, "en");
    expect(owner.matched).toBe(true);
    expect(owner.reply).toContain("Mr. S. Rajaratnam");

    const tender = answerFromDossier("what was the tender amount?", d, "en");
    expect(tender.matched).toBe(true);
    expect(tender.reply).toContain("₹2.30 Cr");

    const lic = answerFromDossier("show the contractor license", d, "en");
    expect(lic.matched).toBe(true);
    expect(lic.reply).toContain("CIPL/TN-PWD/2019/0473");

    const warranty = answerFromDossier("is it under warranty?", d, "en");
    expect(warranty.matched).toBe(true);
    expect(warranty.reply).toContain("13 Feb 2029");
  });

  it("is stable across repeated identical questions", () => {
    const d = dossierFor(fixes[0], true);
    const a = answerFromDossier("who built this road", d, "en");
    const b = answerFromDossier("who built this road", d, "en");
    expect(a.reply).toBe(b.reply);
  });
});
