// Merge a /api/locate result + a /api/match-contractor result into the
// ResolvedStretch shape the chat cards render. Client-safe (no Node/DOM APIs).

import type { LatLng } from "./exifLocation";
import type { Address } from "./locationLookup";
import type { MatchResult, ResolvedStretch } from "./types";
import { stretch as sample } from "./sampleData";
import { roadClassLabel } from "./format";

export type LocateResult = {
  display: string;
  roadName: string | null;
  address: Address | null;
  snapped: LatLng;
};

export function buildResolvedStretch(
  raw: LatLng,
  loc: LocateResult,
  match: MatchResult | null,
): ResolvedStretch {
  const addr = loc.address;
  const roadClass = match?.roadClass ?? "SH";
  const hasContract = !!match?.found;

  return {
    display: loc.display || loc.roadName || sample.display,
    roadClass,
    roadClassLabel: roadClassLabel(roadClass),
    chainage: addr?.neighbourhood ?? addr?.city ?? "—",
    lastRelay: hasContract ? match!.lastRelay ?? "—" : "—",
    contractor: hasContract ? match!.contractor ?? "—" : "—",
    contractorId: match?.contractorId ?? null,
    contractId: match?.contractId ?? null,
    tenderId: match?.tenderId ?? "—",
    sanctioned: hasContract ? match!.sanctioned ?? "—" : "—",
    spent: hasContract ? match!.spent ?? "—" : "—",
    norm: match?.norm ?? "—",
    flag: match?.flag ?? "—",
    dlpActive: match?.dlpActive ?? false,
    dlpUntil: match?.dlpUntil ?? "—",
    tenderUrl: match?.tenderUrl ?? null,
    hasContract,
    officer: match?.officer
      ? {
          name: match.officer.name,
          designation: match.officer.designation,
          division: match.officer.division,
          email: match.officer.email,
          phone: match.officer.phone,
          slaDays: match.officer.slaDays,
          rank: match.officer.rank,
        }
      : sample.officer,
    // resolved-location context for filing a real complaint
    city: addr?.city ?? null,
    state: addr?.state ?? null,
    neighbourhood: addr?.neighbourhood ?? null,
    pincode: addr?.pincode ?? null,
    roadName: loc.roadName ?? addr?.road ?? null,
    lat: raw.lat,
    lng: raw.lng,
    snappedLat: loc.snapped?.lat ?? null,
    snappedLng: loc.snapped?.lng ?? null,
  };
}
