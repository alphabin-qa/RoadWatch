// Sample data for the skeleton. No API calls - keyword matcher picks a card.

import type { ResolvedStretch } from "./types";

export type CardKind =
  | "attribution"
  | "budget"
  | "officer"
  | "complaint"
  | "tracking"
  | "cost"
  | "crash"
  | "monsoon"
  | "dossier";

export type Status =
  | "filed"
  | "acknowledged"
  | "in_progress"
  | "escalated"
  | "resolved"
  | "reopened";

export type TimelineItem = { at: string; label: string; done: boolean };
export type Officer = {
  name: string;
  designation: string;
  division: string;
  email: string;
  phone: string;
  slaDays: number;
};
export type EscalationStep = {
  rank: number;
  role: string;
  name: string;
  phone: string;
  email: string;
  active: boolean;
  reached: boolean;
};

export type Complaint = {
  id: string; // short ID shown in UI
  chatId: string;
  subject: string;          // AI-summarised subject line
  description: string;      // AI-polished formal body (what is filed)
  originalUserText: string; // citizen's own words, shown as "original"
  photos: number[];         // 1..3 - picked by PotholePhoto (fallback)
  photoUrls?: string[];     // real photos under /public/defects (preferred)
  stretch: string;
  chainage: string;
  contractor: string;
  filedAt: string;
  lastUpdateAt: string;
  status: Status;
  slaDays: number;
  daysElapsed: number;
  currentRank: number;      // 1..5
  officer: Officer;         // the current handler
  timeline: TimelineItem[];
  escalation: EscalationStep[];
};

export type ChatSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string; // relative label e.g. "Today", "Yesterday", "2d"
  complaintId?: string; // if a complaint was filed from this chat
};

// ---------- Officers (reused across complaints) ----------
const officers: EscalationStep[] = [
  {
    rank: 1,
    role: "Junior Engineer",
    name: "Er. S. Kavin",
    phone: "+91 98400 12340",
    email: "je.omr@tnhighways.gov.in",
    active: false,
    reached: true,
  },
  {
    rank: 2,
    role: "Assistant Engineer",
    name: "Er. P. Lakshmi",
    phone: "+91 98400 12341",
    email: "ae.south@tnhighways.gov.in",
    active: false,
    reached: true,
  },
  {
    rank: 3,
    role: "Executive Engineer",
    name: "Er. Ramesh Kumar",
    phone: "+91 98400 12342",
    email: "ee.south@tnhighways.gov.in",
    active: false,
    reached: false,
  },
  {
    rank: 4,
    role: "Superintending Engineer",
    name: "Er. A. Natarajan",
    phone: "+91 98400 12343",
    email: "se.chennai@tnhighways.gov.in",
    active: false,
    reached: false,
  },
  {
    rank: 5,
    role: "Chief Engineer",
    name: "Er. M. Venkatesh",
    phone: "+91 98400 12344",
    email: "ce.tn@tnhighways.gov.in",
    active: false,
    reached: false,
  },
];

function ladder(activeRank: number): EscalationStep[] {
  return officers.map((o) => ({
    ...o,
    active: o.rank === activeRank,
    reached: o.rank <= activeRank,
  }));
}
function activeOfficer(activeRank: number): Officer {
  const o = officers[activeRank - 1];
  return {
    name: o.name,
    designation: o.role,
    division: "Highways Division, Chennai South",
    email: o.email,
    phone: o.phone,
    slaDays: 30,
  };
}

// ---------- Current stretch (used by cards when nothing else specified) ----------
export const stretch: ResolvedStretch = {
  id: "chn-omr-14",
  display: "OMR Service Rd · Chennai",
  roadClass: "SH",
  roadClassLabel: "State Highway",
  chainage: "14.2 km",
  lastRelay: "14 Feb 2024",
  contractor: "Chennai Infra Pvt Ltd",
  tenderId: "TN-2023-1148",
  sanctioned: "₹2.30 Cr",
  spent: "₹2.10 Cr",
  norm: "₹1.80–2.10 Cr/km",
  flag: "Over norm by 9%",
  dlpActive: true,
  dlpUntil: "13 Feb 2029",
  hasContract: true,
  tenderUrl: "https://eprocure.gov.in/cppp/tenderdetails/TN-2023-1148",
  officer: {
    name: "Er. Ramesh Kumar",
    designation: "Executive Engineer",
    division: "Highways Division, Chennai South",
    email: "ee.south@tnhighways.gov.in",
    phone: "+91 98400 12342",
    slaDays: 30,
  },
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

// ---------- Complaints (seeded) ----------
export const complaints: Complaint[] = [
  {
    id: "CP-18342",
    chatId: "chat-1",
    subject: "Large pothole on OMR Service Rd near Thoraipakkam",
    description:
      "A cluster of potholes (approx. 20×30 cm, 4 cm deep) has formed on the OMR service road at chainage 14.2 km, Thoraipakkam. The stretch was last relaid on 14 Feb 2024 and is within the Defect Liability Period. Request inspection and repair under MoRTH Specifications clause 5.3.",
    originalUserText:
      "Big pothole near amma kadai bus stop, so dangerous for bikes in night",
    photos: [1, 2, 3],
    photoUrls: [
      "/defects/pothole-1.jpg",
      "/defects/pothole-2.jpg",
      "/defects/waterlogging.jpg",
    ],
    stretch: "OMR Service Rd · Thoraipakkam",
    chainage: "14.2 km",
    contractor: "Chennai Infra Pvt Ltd",
    filedAt: "22 Apr 2026, 14:02",
    lastUpdateAt: "24 Apr 2026, 10:11",
    status: "in_progress",
    slaDays: 30,
    daysElapsed: 3,
    currentRank: 2,
    officer: activeOfficer(2),
    timeline: [
      { at: "22 Apr 2026, 14:02", label: "Filed to CPGRAMS", done: true },
      { at: "22 Apr 2026, 14:04", label: "Acknowledged · Ref generated", done: true },
      { at: "23 Apr 2026, 10:11", label: "Assigned to AE, Chennai South", done: true },
      { at: "-", label: "Site inspection scheduled", done: false },
      { at: "-", label: "Repair order issued", done: false },
      { at: "-", label: "Closed", done: false },
    ],
    escalation: ladder(2),
  },
  {
    id: "CP-18201",
    chatId: "chat-2",
    subject: "Missing guardrail on ECR curve, 3.4 km from Injambakkam",
    description:
      "The outer guardrail on the ECR curve at chainage 3.4 km (Injambakkam side) is missing for approximately 40 m. Per IRC 129, roadside safety barriers are mandatory on curves of this radius. Reopened due to contractor inaction past initial SLA.",
    originalUserText: "Guardrail missing, already one accident happened here",
    photos: [1, 2],
    photoUrls: ["/defects/guardrail-missing.jpg", "/defects/pothole-2.jpg"],
    stretch: "ECR · Injambakkam curve",
    chainage: "3.4 km",
    contractor: "Coromandel Constructions",
    filedAt: "29 Mar 2026, 09:44",
    lastUpdateAt: "21 Apr 2026, 16:00",
    status: "escalated",
    slaDays: 30,
    daysElapsed: 27,
    currentRank: 3,
    officer: activeOfficer(3),
    timeline: [
      { at: "29 Mar 2026, 09:44", label: "Filed to CPGRAMS", done: true },
      { at: "29 Mar 2026, 09:47", label: "Acknowledged · Ref generated", done: true },
      { at: "30 Mar 2026, 12:30", label: "Assigned to AE, Chennai South", done: true },
      { at: "14 Apr 2026, 11:05", label: "Inspection done · No action taken", done: true },
      { at: "21 Apr 2026, 16:00", label: "Auto-escalated to Executive Engineer", done: true },
      { at: "-", label: "Repair order issued", done: false },
    ],
    escalation: ladder(3),
  },
  {
    id: "CP-17988",
    chatId: "chat-3",
    subject: "Bleeding + cracking on Anna Salai near LIC",
    description:
      "Bituminous surface on Anna Salai near LIC building (chainage 0.8 km) showed heavy bleeding and longitudinal cracking. The segment was relaid within the last 18 months and was within DLP. Successfully repaired.",
    originalUserText: "Road becomes sticky and slippery in sun, near LIC office",
    photos: [1, 2, 3],
    photoUrls: [
      "/defects/bleeding-cracking.jpg",
      "/defects/pothole-1.jpg",
      "/defects/waterlogging.jpg",
    ],
    stretch: "Anna Salai · LIC",
    chainage: "0.8 km",
    contractor: "Madras Build Corp",
    filedAt: "04 Feb 2026, 11:22",
    lastUpdateAt: "18 Mar 2026, 09:00",
    status: "resolved",
    slaDays: 30,
    daysElapsed: 42,
    currentRank: 3,
    officer: activeOfficer(3),
    timeline: [
      { at: "04 Feb 2026, 11:22", label: "Filed to CPGRAMS", done: true },
      { at: "04 Feb 2026, 11:24", label: "Acknowledged · Ref generated", done: true },
      { at: "05 Feb 2026, 09:15", label: "Assigned to AE, Chennai South", done: true },
      { at: "22 Feb 2026, 15:30", label: "Site inspection completed", done: true },
      { at: "02 Mar 2026, 10:00", label: "Repair order issued to contractor", done: true },
      { at: "18 Mar 2026, 09:00", label: "Work completed · Closed", done: true },
    ],
    escalation: ladder(3).map((e) => ({ ...e, active: false })),
  },
];

// ---------- Chats (left sidebar) ----------
export const chats: ChatSummary[] = [
  {
    id: "chat-1",
    title: "OMR Service Rd pothole",
    preview: "Who built this road?",
    updatedAt: "Today",
    complaintId: "CP-18342",
  },
  {
    id: "chat-2",
    title: "ECR guardrail missing",
    preview: "File complaint on missing guardrail",
    updatedAt: "Yesterday",
    complaintId: "CP-18201",
  },
  {
    id: "chat-3",
    title: "Anna Salai LIC surface",
    preview: "Road becomes sticky in sun",
    updatedAt: "Mar 18",
    complaintId: "CP-17988",
  },
  {
    id: "chat-4",
    title: "GST Rd contractor query",
    preview: "Show budget for GST Rd",
    updatedAt: "Feb 02",
  },
];

// Legacy export for cards that still use it
export const tracking = {
  ticketId: complaints[0].id,
  filedAt: complaints[0].filedAt,
  slaDays: complaints[0].slaDays,
  daysElapsed: complaints[0].daysElapsed,
  currentRank: complaints[0].currentRank,
  timeline: complaints[0].timeline,
  escalation: complaints[0].escalation,
};

export const starters = {
  en: [
    "Who built this road?",
    "File a complaint about a pothole",
    "Show me the budget",
    "Is this road under warranty?",
  ],
  hi: [
    "यह सड़क किसने बनाई?",
    "गड्ढे की शिकायत दर्ज करें",
    "बजट दिखाएँ",
    "क्या यह सड़क वारंटी में है?",
  ],
  ta: [
    "இந்த சாலையை யார் கட்டினார்கள்?",
    "பள்ளத்தைப் பற்றி புகார் பதிவு செய்",
    "பட்ஜெட்டைக் காட்டு",
    "இந்த சாலை உத்தரவாதத்தில் உள்ளதா?",
  ],
};

export function pickCard(text: string): CardKind {
  const s = text.toLowerCase();
  if (/(track|status|ticket|progress|ट्रैक|கண்காணி)/.test(s)) return "tracking";
  if (/(complaint|file|complain|शिकायत|புகார்)/.test(s)) return "complaint";
  if (/(budget|sanction|spent|बजट|பட்ஜெட்)/.test(s)) return "budget";
  if (/(officer|authority|engineer|अधिकारी|அதிகாரி)/.test(s)) return "officer";
  if (/(crash|accident|safety|सुरक்षा|விபத்து)/.test(s)) return "crash";
  if (/(cost|pollution|fuel|noise|प्रदूषण|மாசு)/.test(s)) return "cost";
  if (/(monsoon|rain|predict|मानसून|மழை)/.test(s)) return "monsoon";
  return "attribution";
}

export function statusLabel(s: Status): string {
  return {
    filed: "Filed",
    acknowledged: "Acknowledged",
    in_progress: "In progress",
    escalated: "Escalated",
    resolved: "Resolved",
    reopened: "Reopened",
  }[s];
}

export function statusTone(
  s: Status,
): "neutral" | "info" | "accent" | "amber" | "success" | "danger" {
  return {
    filed: "neutral",
    acknowledged: "info",
    in_progress: "accent",
    escalated: "amber",
    resolved: "success",
    reopened: "danger",
  }[s] as any;
}
