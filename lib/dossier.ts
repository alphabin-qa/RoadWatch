// Deterministic demo dossier. For the demo, ANY uploaded photo resolves to this
// same contractor record - but the GPS coordinates shown are the device's real
// live coordinates. This keeps the narrative ("it found my road") while the
// underlying data stays stable and verifiable across repeated uploads.

import type { ResolvedStretch, ReasoningStep } from "./types";
import type { CardKind } from "./sampleData";
import type { Locale } from "./i18n";
import type { GeoFix } from "./geo";

export const DEMO_DOSSIER: ResolvedStretch = {
  id: "chn-omr-14",
  display: "OMR Service Rd · Chennai",
  roadName: "OMR Service Road (Rajiv Gandhi Salai)",
  roadClass: "SH",
  roadClassLabel: "State Highway",
  chainage: "14.2 km",
  lastRelay: "14 Feb 2024",
  workDate: "10 Jan 2024 – 14 Feb 2024",
  contractor: "Chennai Infra Pvt Ltd",
  contractorId: null,
  contractId: null,
  tenderId: "TN-2023-1148",
  sanctioned: "₹2.30 Cr",
  spent: "₹2.10 Cr",
  norm: "₹1.80–2.10 Cr/km",
  flag: "Over norm by 9%",
  dlpActive: true,
  dlpUntil: "13 Feb 2029",
  hasContract: true,
  tenderUrl: "https://eprocure.gov.in/cppp/tenderdetails/TN-2023-1148",
  license: {
    no: "CIPL/TN-PWD/2019/0473",
    class: "PWD Class-I (Roads & Bridges)",
    issued: "08 Jun 2019",
    renewed: "12 Jan 2024",
    validTill: "31 Mar 2027",
    valid: true,
  },
  owner: {
    name: "Mr. S. Rajaratnam",
    role: "Managing Director",
    group: "Chennai Infra Group",
  },
  officer: {
    name: "Er. Ramesh Kumar",
    designation: "Executive Engineer",
    division: "Highways Division, Chennai South",
    email: "ee.south@tnhighways.gov.in",
    phone: "+91 98400 12342",
    slaDays: 30,
    rank: 3,
  },
  city: "Chennai",
  state: "Tamil Nadu",
  neighbourhood: "Thoraipakkam",
  pincode: "600097",
  crashes: { fatal: 3, serious: 9, minor: 4, year: 2024, history: [1, 2, 3] },
  monsoon: {
    current: { w: 20, l: 30, d: 40 },
    forecast: { w: 80, l: 120, d: 120 },
  },
  cost: {
    fuelLitres: 312,
    co2Kg: 740,
    noiseEvents: 1240,
    hoursLost: 1420,
    inrPerDay: 86750,
    inrPerYear: "₹3.17 Cr",
  },
};

/** Build the dossier for a given live (or fallback) GPS fix. */
export function dossierFor(fix: GeoFix | null, live: boolean): ResolvedStretch {
  const gps = fix
    ? { lat: fix.lat, lng: fix.lng, accuracyM: fix.accuracyM, live }
    : { lat: 12.952, lng: 80.243, accuracyM: 0, live: false };
  return {
    ...DEMO_DOSSIER,
    lat: gps.lat,
    lng: gps.lng,
    snappedLat: gps.lat,
    snappedLng: gps.lng,
    gps,
  };
}

function fmt(n: number): string {
  return n.toFixed(4);
}

/** The animated agent-style reasoning trace shown while "processing". */
export function reasoningSteps(
  fix: GeoFix | null,
  gpsOn: boolean,
): ReasoningStep[] {
  const coord = fix ? `${fmt(fix.lat)}, ${fmt(fix.lng)}` : "approx. location";
  const steps: ReasoningStep[] = [];
  if (gpsOn && fix) {
    steps.push({
      label: "Live location recorded",
      detail: `${coord}  (±${Math.round(fix.accuracyM)} m)`,
    });
  } else {
    steps.push({
      label: "GPS unavailable - using last known area",
      detail: "Enable location for precise road matching",
    });
  }
  steps.push({ label: "Reverse-geocoding coordinates", detail: "OMR Service Road, Thoraipakkam, Chennai" });
  steps.push({ label: "Matching road & tender records", detail: "Contract TN-2023-1148 found" });
  steps.push({ label: "Resolving contractor", detail: "Chennai Infra Pvt Ltd" });
  steps.push({ label: "Verifying contractor license", detail: "CIPL/TN-PWD/2019/0473 · valid till 31 Mar 2027" });
  steps.push({ label: "Checking warranty (DLP)", detail: "Active until 13 Feb 2029" });
  return steps;
}

/** Follow-up suggestion chips offered after a road is resolved. */
export const SUGGESTIONS: Record<Locale, string[]> = {
  en: [
    "Who built this road?",
    "What was the tender amount?",
    "Show the contractor license",
    "Who owns the contractor?",
    "Is it under warranty?",
    "File a complaint",
  ],
  hi: [
    "यह सड़क किसने बनाई?",
    "टेंडर राशि कितनी थी?",
    "ठेकेदार का लाइसेंस दिखाएँ",
    "ठेकेदार का मालिक कौन है?",
    "क्या यह वारंटी में है?",
    "शिकायत दर्ज करें",
  ],
  ta: [
    "இந்தச் சாலையை யார் கட்டினார்?",
    "டெண்டர் தொகை எவ்வளவு?",
    "ஒப்பந்ததாரர் உரிமத்தைக் காட்டு",
    "ஒப்பந்ததாரரின் உரிமையாளர் யார்?",
    "உத்தரவாதத்தில் உள்ளதா?",
    "புகார் பதிவு செய்",
  ],
};

/**
 * Deterministic intent → {reply, card} for a resolved dossier. Used in demo
 * mode (no LLM) and as a guaranteed-correct fast path. Keeps every answer
 * consistent no matter how many times the user asks.
 */
export function answerFromDossier(
  text: string,
  d: ResolvedStretch,
  locale: Locale,
): { reply: string; card?: CardKind; matched: boolean } {
  const s = text.toLowerCase();
  const L = (en: string, hi: string, ta: string) =>
    locale === "hi" ? hi : locale === "ta" ? ta : en;

  if (/(licen|लाइसेंस|உரிம)/.test(s)) {
    return {
      matched: true,
      reply: L(
        `${d.contractor} holds ${d.license?.class}, licence ${d.license?.no}, renewed ${d.license?.renewed}, valid till ${d.license?.validTill}.`,
        `${d.contractor} के पास ${d.license?.class} है, लाइसेंस ${d.license?.no}, नवीनीकरण ${d.license?.renewed}, ${d.license?.validTill} तक वैध।`,
        `${d.contractor} இடம் ${d.license?.class} உள்ளது, உரிமம் ${d.license?.no}, ${d.license?.validTill} வரை செல்லுபடியாகும்.`,
      ),
      card: "dossier",
    };
  }
  if (/(owner|own|proprietor|director|company|मालिक|कंपनी|உரிமை|நிறுவன)/.test(s)) {
    return {
      matched: true,
      reply: L(
        `${d.contractor} is run by ${d.owner?.name}, ${d.owner?.role}, part of ${d.owner?.group}.`,
        `${d.contractor} को ${d.owner?.name} (${d.owner?.role}) चलाते हैं, जो ${d.owner?.group} का हिस्सा है।`,
        `${d.contractor} நிறுவனத்தை ${d.owner?.name} (${d.owner?.role}) நடத்துகிறார், ${d.owner?.group}.`,
      ),
      card: "dossier",
    };
  }
  if (/(tender|amount|budget|cost|price|sanction|spent|राशि|बजट|टेंडर|தொகை|பட்ஜெட்)/.test(s)) {
    return {
      matched: true,
      reply: L(
        `${d.sanctioned} sanctioned, ${d.spent} spent on ${d.roadName} (tender ${d.tenderId}). ${d.flag}.`,
        `${d.roadName} के लिए ${d.sanctioned} स्वीकृत, ${d.spent} खर्च (टेंडर ${d.tenderId})। ${d.flag}।`,
        `${d.roadName}-க்கு ${d.sanctioned} அனுமதி, ${d.spent} செலவு (டெண்டர் ${d.tenderId}).`,
      ),
      card: "budget",
    };
  }
  if (/(warrant|dlp|वारंटी|உத்தரவாத)/.test(s)) {
    return {
      matched: true,
      reply: d.dlpActive
        ? L(
            `Yes - still under defect liability period until ${d.dlpUntil}. ${d.contractor} must repair defects free.`,
            `हाँ - ${d.dlpUntil} तक दोष दायित्व अवधि में है। ${d.contractor} को मुफ्त मरम्मत करनी होगी।`,
            `ஆம் - ${d.dlpUntil} வரை குறைபாடு பொறுப்புக் காலத்தில். ${d.contractor} இலவசமாக சரிசெய்ய வேண்டும்.`,
          )
        : L("Warranty has expired.", "वारंटी समाप्त।", "உத்தரவாதம் காலாவதி."),
      card: "attribution",
    };
  }
  if (/(officer|authority|engineer|responsible|complain to|अधिकारी|பொறுப்|அதிகாரி)/.test(s)) {
    return {
      matched: true,
      reply: L(
        `${d.officer.name}, ${d.officer.designation}, ${d.officer.division} is responsible.`,
        `${d.officer.name}, ${d.officer.designation}, ${d.officer.division} जिम्मेदार हैं।`,
        `${d.officer.name}, ${d.officer.designation} பொறுப்பு.`,
      ),
      card: "officer",
    };
  }
  if (/(complaint|file|complain|शिकायत|புகார்)/.test(s)) {
    return {
      matched: true,
      reply: L(
        "Here's a ready-to-file complaint to the Executive Engineer with the clause cited.",
        "कार्यकारी अभियंता को क्लॉज सहित दर्ज करने के लिए तैयार शिकायत।",
        "செயற்பொறியாளருக்கு வாசகம் சேர்த்து தயாரான புகார்.",
      ),
      card: "complaint",
    };
  }
  if (/(crash|accident|safety|fatal|सुरक्षा|விபத்து)/.test(s)) {
    return { matched: true, reply: L("Crash history for this stretch:", "इस हिस्से का दुर्घटना इतिहास:", "விபத்து வரலாறு:"), card: "crash" };
  }
  if (/(monsoon|rain|predict|मानसून|மழை)/.test(s)) {
    return { matched: true, reply: L("Monsoon damage forecast:", "मानसून पूर्वानुमान:", "பருவமழை முன்னறிவிப்பு:"), card: "monsoon" };
  }
  // default → who built / road attribution (also the report's opening summary)
  return {
    matched: false,
    reply: L(
      `${d.roadName} was last relaid on ${d.lastRelay} by ${d.contractor}.`,
      `${d.roadName} को ${d.lastRelay} को ${d.contractor} ने बनाया।`,
      `${d.roadName} ${d.lastRelay} அன்று ${d.contractor} மூலம் அமைக்கப்பட்டது.`,
    ),
    card: "dossier",
  };
}
