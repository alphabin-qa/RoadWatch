// Synthetic demo seed for RoadWatch - ~25 road segments each for Ahmedabad and
// Chennai, with real GPS centres so map pins resolve to a contract. Idempotent:
// wipes prior SEED:% rows and re-inserts. Deterministic: a tiny LCG drives all
// "randomness", so every run produces identical data.
//
//   cd app && node scripts/seed.mjs
//
// Requires SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) + SUPABASE_SECRET_KEY,
// read from app/.env.local automatically.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- load .env.local (simple parser; no dependency) ----
function loadEnv() {
  try {
    const raw = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env.local - rely on real env */
  }
}
loadEnv();

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SECRET_KEY. Add them to app/.env.local.",
  );
  process.exit(1);
}
const sb = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---- deterministic PRNG (LCG) ----
let _s = 1234567;
const rnd = () => ((_s = (_s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const between = (a, b) => a + rnd() * (b - a);
const round = (n, p = 0) => Math.round(n * 10 ** p) / 10 ** p;

// ---- ₹/km norm bands (mirror cost_norms) for plausible amounts + flags ----
const NORM = {
  NH: [25000000, 32000000],
  SH: [18000000, 22000000],
  MDR: [12000000, 16000000],
  ODR: [8000000, 12000000],
  MUN: [10000000, 15000000],
};

const WORK = ["overlay", "relaying", "widening", "maintenance"];

// ---- real-ish road centres per city ----
const CITIES = {
  Ahmedabad: {
    state: "Gujarat",
    contractors: [
      "ABC Constructions Pvt Ltd",
      "XYZ Roadways Ltd",
      "PQR Builders Pvt Ltd",
      "GHI Civil Works",
      "JKL Construction Co",
    ],
    roads: [
      ["SG Highway", "SH", 23.0325, 72.5079],
      ["Ashram Road", "MDR", 23.0376, 72.5713],
      ["CG Road", "MDR", 23.0265, 72.5610],
      ["Iscon–Ambli Road", "MDR", 23.0289, 72.5070],
      ["SP Ring Road", "SH", 23.0216, 72.6650],
      ["Naroda Road", "SH", 23.0719, 72.6320],
      ["132 Ft Ring Road", "MDR", 23.0380, 72.5320],
      ["Bopal–Ambli Road", "ODR", 23.0335, 72.4660],
      ["Maninagar Main Road", "MUN", 22.9930, 72.6010],
      ["Gota–Vande Mataram Road", "MDR", 23.1010, 72.5480],
      ["Chandkheda Road", "ODR", 23.1040, 72.5810],
      ["Sabarmati Riverfront Road", "MUN", 23.0560, 72.5790],
      ["Thaltej–Shilaj Road", "ODR", 23.0530, 72.4980],
      ["Prahlad Nagar Road", "MUN", 23.0090, 72.5070],
      ["Satellite Road", "MDR", 23.0270, 72.5210],
      ["Paldi–Vasna Road", "MUN", 23.0080, 72.5640],
      ["Ghatlodia Main Road", "ODR", 23.0720, 72.5390],
      ["Memnagar Road", "MUN", 23.0490, 72.5420],
      ["Navrangpura Road", "MUN", 23.0380, 72.5610],
      ["Sarkhej–Okaf Road", "SH", 22.9870, 72.5040],
      ["Gandhinagar Sector-21 Approach", "SH", 23.2090, 72.6280],
      ["Ch-0 Road Gandhinagar", "SH", 23.2230, 72.6500],
      ["Adalaj–Uvarsad Road", "MDR", 23.1660, 72.5810],
      ["Kalol Highway Approach", "SH", 23.2480, 72.5010],
      ["Vavol–Pethapur Road", "ODR", 23.2010, 72.6230],
    ],
  },
  Chennai: {
    state: "Tamil Nadu",
    contractors: [
      "ABC Constructions Pvt Ltd",
      "XYZ Roadways Pvt Ltd",
      "PQR Builders Pvt Ltd",
      "LMN Roadways Ltd",
      "MNO Civil Works",
    ],
    roads: [
      ["OMR Service Road", "SH", 12.9520, 80.2430],
      ["East Coast Road (ECR)", "SH", 12.9020, 80.2300],
      ["Anna Salai", "SH", 13.0600, 80.2640],
      ["GST Road", "NH", 12.9500, 80.1430],
      ["Poonamallee High Road", "SH", 13.0700, 80.1800],
      ["Sardar Patel Road", "MDR", 13.0100, 80.2400],
      ["Velachery Main Road", "MDR", 12.9750, 80.2180],
      ["Inner Ring Road", "SH", 13.0800, 80.2100],
      ["Kamarajar Salai", "MUN", 13.0600, 80.2820],
      ["Usman Road T Nagar", "MUN", 13.0420, 80.2330],
      ["Adyar Bridge Road", "MDR", 13.0050, 80.2540],
      ["Porur–Kundrathur Road", "ODR", 13.0330, 80.1610],
      ["GST Tambaram Bypass", "NH", 12.9220, 80.1230],
      ["Guindy Industrial Road", "MDR", 13.0100, 80.2120],
      ["Nungambakkam High Road", "MUN", 13.0600, 80.2430],
      ["Mylapore Luz Church Road", "MUN", 13.0330, 80.2680],
      ["Perungudi Link Road", "ODR", 12.9620, 80.2420],
      ["Sholinganallur Junction Road", "SH", 12.9010, 80.2270],
      ["Thoraipakkam–Pallavaram Road", "MDR", 12.9410, 80.2330],
      ["Pallikaranai Marsh Road", "ODR", 12.9320, 80.2110],
      ["Medavakkam Main Road", "MDR", 12.9180, 80.1920],
      ["Vadapalani Arcot Road", "MUN", 13.0500, 80.2120],
      ["Ambattur Industrial Estate Road", "MDR", 13.1010, 80.1620],
      ["Mount Poonamallee Road", "SH", 13.0220, 80.1750],
      ["Velachery–Tambaram Road", "MDR", 12.9450, 80.1500],
    ],
  },
};

function ladderFor(city, state) {
  const base = [
    [1, "Junior Engineer", "Er. John Doe"],
    [2, "Assistant Engineer", "Er. Jane Smith"],
    [3, "Executive Engineer", "Er. Richard Roe"],
    [4, "Superintending Engineer", "Er. Mary Major"],
    [5, "Chief Engineer", "Er. James Poe"],
  ];
  const slug = city.toLowerCase().replace(/[^a-z]/g, "");
  return base.map(([rank, role, name]) => ({
    jurisdiction_city: city,
    jurisdiction_state: state,
    rank,
    role,
    name,
    email: `${role.split(" ")[0].toLowerCase()}.${slug}@pwd.gov.in`,
    phone: `+91 ${98000 + rank * 11}${String(10000 + rank).slice(0, 5)}`,
    sla_days: 30,
  }));
}

function buildContracts(cityName, conf, contractorRows) {
  const out = [];
  conf.roads.forEach(([name, klass, lat, lng], i) => {
    const work = pick(WORK);
    const band = NORM[klass] ?? NORM.MDR;
    const lengthKm = round(between(0.8, 11), 1);
    // 70% within norm, 30% over (to trigger red flags in the demo)
    const overrun = rnd() < 0.3;
    const perKm = overrun
      ? band[1] * between(1.2, 1.6)
      : between(band[0], band[1]);
    const sanctioned = Math.round((perKm * lengthKm) / 100000) * 100000;
    const spent = Math.round(sanctioned * between(0.9, 1.02));
    // relay date: spread 2017..2025 so some DLPs are expired, some active
    const year = 2017 + Math.floor(rnd() * 9);
    const month = 1 + Math.floor(rnd() * 12);
    const relay = `${year}-${String(month).padStart(2, "0")}-12`;
    const dlpMonths = 60;
    const dlpY = year + 5;
    const dlpUntil = `${dlpY}-${String(month).padStart(2, "0")}-11`;
    const tenderId = `${cityName === "Chennai" ? "TN" : "GJ"}-${year}-${1000 + i}`;
    out.push({
      contractor_id: contractorRows[i % contractorRows.length].id,
      tender_id: tenderId,
      road_name: name,
      road_match_pattern: name.split(/[ –-(]/)[0].toLowerCase(),
      road_class: klass,
      jurisdiction_city: cityName,
      jurisdiction_state: conf.state,
      sanctioned_inr: sanctioned,
      spent_inr: spent,
      start_date: `${year}-01-10`,
      end_date: relay,
      last_relay_date: relay,
      dlp_months: dlpMonths,
      dlp_until: dlpUntil,
      status: "active",
      tender_url: `https://eprocure.gov.in/cppp/tenderdetails/${tenderId}`,
      center_lat: round(lat, 5),
      center_lng: round(lng, 5),
      match_radius_m: 1500,
      length_km: lengthKm,
      work_type: work,
      terrain: "plain",
    });
  });
  return out;
}

async function main() {
  console.log("Wiping prior SEED:% demo rows…");
  const { data: oldC } = await sb
    .from("contractors")
    .select("id")
    .like("name", "SEED:%");
  const oldIds = (oldC ?? []).map((r) => r.id);
  if (oldIds.length) {
    await sb.from("officers").delete().in("contractor_id", oldIds);
    await sb.from("contracts").delete().in("contractor_id", oldIds);
    await sb.from("contractors").delete().in("id", oldIds);
  }

  let totalContracts = 0;
  for (const [cityName, conf] of Object.entries(CITIES)) {
    // contractors
    const contractorRows = [];
    for (const name of conf.contractors) {
      const { data, error } = await sb
        .from("contractors")
        .insert({
          name: `SEED:${name}`,
          jurisdiction_city: cityName,
          jurisdiction_state: conf.state,
          road_classes: ["NH", "SH", "MDR", "ODR", "MUN"],
        })
        .select("id")
        .single();
      if (error) throw error;
      contractorRows.push(data);
    }

    // contracts
    const contracts = buildContracts(cityName, conf, contractorRows);
    const { error: cErr } = await sb.from("contracts").insert(contracts);
    if (cErr) throw cErr;
    totalContracts += contracts.length;

    // officers - one ladder per city, linked to the first contractor row
    const ladder = ladderFor(cityName, conf.state).map((o) => ({
      ...o,
      contractor_id: contractorRows[0].id,
    }));
    const { error: oErr } = await sb.from("officers").insert(ladder);
    if (oErr) throw oErr;

    console.log(
      `  ${cityName}: ${conf.contractors.length} contractors, ${contracts.length} contracts, ${ladder.length} officers`,
    );
  }

  console.log(`Done. Seeded ${totalContracts} contracts across 2 cities.`);
}

main().catch((e) => {
  console.error("Seed failed:", e.message ?? e);
  process.exit(1);
});
