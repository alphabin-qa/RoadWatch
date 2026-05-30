// Maps a road class + state to the correct government grievance portal.
// RoadWatch's job is to route a citizen to the *right* one of India's many
// disconnected complaint apps instead of a generic "PWD helpline".

export type Portal = {
  name: string;
  url: string;
  /** portal-mandated SLA in days (best-effort) */
  slaDays: number;
};

const CPGRAMS: Portal = {
  name: "CPGRAMS",
  url: "https://pgportal.gov.in/",
  slaDays: 30,
};

const RAJMARGYATRA: Portal = {
  name: "NHAI Rajmargyatra",
  url: "https://rajmargyatra.nhai.gov.in/",
  slaDays: 7,
};

const MERI_SADAK: Portal = {
  name: "PMGSY Meri Sadak",
  url: "https://meri-sadak.in/",
  slaDays: 30,
};

const GUJ_MARG: Portal = {
  name: "Guj-MARG",
  url: "https://marg.gujarat.gov.in/",
  slaDays: 15,
};

/**
 * Choose the portal for a given road class + state.
 *   NH                → Rajmargyatra (NHAI)
 *   PMGSY rural       → Meri Sadak
 *   Gujarat state/mun → Guj-MARG
 *   everything else   → CPGRAMS (central default)
 */
export function portalFor(
  roadClass: string | null | undefined,
  state: string | null | undefined,
): Portal {
  const rc = (roadClass ?? "").toUpperCase();
  if (rc === "NH") return RAJMARGYATRA;
  if (rc === "PMGSY") return MERI_SADAK;
  if ((state ?? "").toLowerCase().includes("gujarat")) return GUJ_MARG;
  return CPGRAMS;
}
