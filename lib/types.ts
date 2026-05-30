// Shared shapes for a "resolved stretch" - the data a chat card renders.
//
// The hardcoded `stretch` in sampleData.ts conforms to ResolvedStretch and is the
// fallback. When a citizen pins a real road, /api/match-contractor + /api/locate
// produce a fresh ResolvedStretch that flows through Chat → Message → cards.

export type StretchOfficer = {
  name: string;
  designation: string;
  division: string;
  email: string;
  phone: string;
  slaDays: number;
  rank?: number;
};

export type ResolvedStretch = {
  id?: string;
  display: string;
  roadClass: string;
  roadClassLabel: string;
  chainage: string;
  lastRelay: string;
  contractor: string;
  contractorId?: string | null;
  contractId?: string | null;
  tenderId: string;
  sanctioned: string; // formatted "₹2.30 Cr"
  spent: string;
  norm: string;
  flag: string;
  dlpActive: boolean;
  dlpUntil: string;
  tenderUrl?: string | null;
  officer: StretchOfficer;
  // resolved-location context (for filing a real complaint)
  city?: string | null;
  state?: string | null;
  neighbourhood?: string | null;
  pincode?: string | null;
  roadName?: string | null;
  lat?: number | null;
  lng?: number | null;
  snappedLat?: number | null;
  snappedLng?: number | null;
  /** false → no contract row matched; cards show a graceful "no contract on file" state */
  hasContract: boolean;
  /** contractor work / completion date */
  workDate?: string;
  /** contractor licensing details (shown in the dossier) */
  license?: {
    no: string;
    class: string;
    issued: string;
    renewed: string;
    validTill: string;
    valid: boolean;
  };
  /** the human/company behind the contractor */
  owner?: { name: string; role: string; group: string };
  /** GPS the dossier was resolved at (real device coords) */
  gps?: { lat: number; lng: number; accuracyM?: number; live: boolean };
  /** clause chips (filled by RAG when available; else the static defaults) */
  citedClauses?: { id: string; title?: string; document?: string; url?: string }[];
  // optional extras used by the static crash/cost/monsoon cards
  crashes?: { fatal: number; serious: number; minor: number; year: number; history: number[] };
  monsoon?: {
    current: { w: number; l: number; d: number };
    forecast: { w: number; l: number; d: number };
  };
  cost?: {
    fuelLitres: number;
    co2Kg: number;
    noiseEvents: number;
    hoursLost: number;
    inrPerDay: number;
    inrPerYear: string;
  };
};

/** A single step in the agent-style reasoning trace shown in chat. */
export type ReasoningStep = {
  label: string;
  detail?: string;
};

/** Result of actually filing a complaint - drives the live TrackingCard. */
export type FiledInfo = {
  ticketId: string;
  slaDays: number;
  officerName: string;
  officerRole: string;
  portal: string;
  portalUrl: string;
};

/** The raw shape /api/match-contractor returns (pre-merge with location). */
export type MatchResult = {
  found: boolean;
  contractorId: string | null;
  contractId: string | null;
  contractor: string | null;
  tenderId: string | null;
  roadClass: string | null;
  sanctioned: string | null;
  spent: string | null;
  norm: string | null;
  flag: string | null;
  lastRelay: string | null;
  dlpActive: boolean;
  dlpUntil: string | null;
  tenderUrl: string | null;
  officer: StretchOfficer | null;
};
