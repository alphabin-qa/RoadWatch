"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Locale, t } from "@/lib/i18n";
import { Heatmap, MapThumb } from "@/components/Illustration";
import { useDemoMode } from "@/lib/demoMode";

export function KPIRow({ locale }: { locale: Locale }) {
  const demo = useDemoMode();
  const [live, setLive] = useState<{ open: number; total: number; cities: number } | null>(null);

  useEffect(() => {
    if (demo) return;
    fetch(`/api/complaints?all=1`)
      .then((r) => (r.ok ? r.json() : { complaints: [] }))
      .then((j: any) => {
        const all = (j.complaints ?? []) as any[];
        const open = all.filter((c) => c.status !== "resolved").length;
        const cities = new Set(
          all.map((c) => c.city).filter(Boolean),
        ).size;
        setLive({ open, total: all.length, cities });
      })
      .catch(() => {});
  }, [demo]);

  const kpis = demo
    ? [
        { k: t.openComplaints[locale], v: "148", d: "+12 today" },
        { k: t.slaBreaches[locale], v: "23", d: "9 critical" },
        { k: t.costInaction[locale], v: "₹11.4 L", d: "across 42 stretches" },
        { k: t.topContractor[locale], v: "ABC Constructions", d: "4 reopened" },
      ]
    : [
        {
          k: t.openComplaints[locale],
          v: live?.open?.toString() ?? "-",
          d: `${live?.total ?? 0} total`,
        },
        { k: t.slaBreaches[locale], v: "-", d: "live" },
        { k: t.costInaction[locale], v: "-", d: "live" },
        {
          k: "Cities",
          v: live?.cities?.toString() ?? "-",
          d: "covered",
        },
      ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
      {kpis.map((f) => (
        <div key={f.k} className="bg-paper p-4">
          <div className="text-[12px] font-medium tracking-wide text-muted">
            {f.k}
          </div>
          <div className="mt-1 text-[22px] tracking-tight">{f.v}</div>
          <div className="mt-0.5 text-[11px] text-muted">{f.d}</div>
        </div>
      ))}
    </div>
  );
}

export function ComplaintsTable({ locale }: { locale: Locale }) {
  const demo = useDemoMode();
  const [liveRows, setLiveRows] = useState<
    Array<{ id: string; subject: string; city: string; status: string; contractor: string }>
  >([]);
  useEffect(() => {
    if (demo) return;
    fetch(`/api/complaints?all=1`)
      .then((r) => (r.ok ? r.json() : { complaints: [] }))
      .then((j: any) => {
        const all = (j.complaints ?? []) as any[];
        setLiveRows(
          all.slice(0, 8).map((c) => ({
            id: c.id,
            subject: c.subject ?? c.road_name ?? "-",
            city: c.city ?? "-",
            status: c.status,
            contractor: c.contractors?.name?.replace(/^SEED:/, "") ?? "-",
          })),
        );
      })
      .catch(() => {});
  }, [demo]);

  const sampleRows = [
    ["OMR Service Rd · 14.2 km", "SH", "ABC Constructions", 12, "₹86,750"],
    ["ECR · 3.4 km", "SH", "XYZ Roadways", 9, "₹71,200"],
    ["Anna Salai · 0.8 km", "MDR", "PQR Builders", 7, "₹58,900"],
    ["GST Rd · 22.1 km", "NH", "DEF Concessionaire", 5, "₹41,300"],
    ["Poonamallee HW · 9.0 km", "SH", "ABC Constructions", 4, "₹33,800"],
  ];
  const rows: any[][] = demo
    ? sampleRows
    : liveRows.length > 0
      ? liveRows.map((r) => [r.subject, r.city, r.contractor, r.status, r.id])
      : [];
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="flex items-center justify-between border-b border-line bg-subtle px-4 py-2.5">
        <div className="text-[13px] font-medium tracking-wide text-muted">
          {t.stretchesByCost[locale]}
        </div>
        <button className="text-[11px] text-muted underline underline-offset-4 hover:text-ink">
          Export
        </button>
      </div>
      <div className="grid grid-cols-[1.6fr_.4fr_1fr_.5fr_.7fr] gap-px bg-line text-[13px] font-medium tracking-wide text-muted">
        {["Stretch", "Class", "Contractor", "Cmpl.", "₹/day"].map((h) => (
          <div key={h} className="bg-subtle px-4 py-2.5">
            {h}
          </div>
        ))}
      </div>
      {rows.length === 0 && !demo && (
        <div className="px-4 py-8 text-center text-[13px] text-muted">
          No complaints filed yet. They'll appear here as citizens file them.
        </div>
      )}
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-[1.6fr_.4fr_1fr_.5fr_.7fr] gap-px bg-line text-[13px]"
        >
          {r.map((c, j) => (
            <div
              key={j}
              className={`bg-paper px-4 py-3 ${j === 4 ? "font-medium" : ""}`}
            >
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CostHeatmap({ locale }: { locale: Locale }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="border-b border-line bg-subtle px-4 py-2.5 text-[13px] font-medium tracking-wide text-muted">
        {t.heatmap[locale]}
      </div>
      <div className="relative">
        <Heatmap className="h-40 w-full" />
        <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-3 text-[10px] text-muted">
          <span>Chennai South</span>
          <span>42 stretches</span>
        </div>
      </div>
    </div>
  );
}

export function ContractorScorecard() {
  const rows = [
    ["ABC Constructions Pvt Ltd", 14, 4, "₹22.1 Cr", "68%"],
    ["XYZ Roadways Pvt Ltd", 9, 2, "₹14.6 Cr", "81%"],
    ["PQR Builders Pvt Ltd", 6, 1, "₹8.2 Cr", "77%"],
    ["DEF Concessionaire Ltd", 3, 1, "₹6.4 Cr", "72%"],
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="flex items-center justify-between border-b border-line bg-subtle px-4 py-2.5">
        <div className="text-[13px] font-medium tracking-wide text-muted">
          Contractor scorecard
        </div>
        <div className="flex items-center gap-2">
          <MapThumb className="h-5 w-8 rounded border border-line" />
          <span className="text-[11px] text-muted">Chennai South</span>
        </div>
      </div>
      <div className="grid grid-cols-[2fr_.6fr_.8fr_1fr_.6fr] gap-px bg-line text-[13px] font-medium tracking-wide text-muted">
        {["Contractor", "Jobs", "Reopened", "Value", "On-time"].map((h) => (
          <div key={h} className="bg-subtle px-4 py-2.5">
            {h}
          </div>
        ))}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-[2fr_.6fr_.8fr_1fr_.6fr] gap-px bg-line text-[13px]"
        >
          {r.map((c, j) => (
            <div key={j} className="bg-paper px-4 py-3">
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
