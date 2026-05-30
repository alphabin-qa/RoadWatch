"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import PotholePhoto from "@/components/PotholePhoto";
import { complaints as sampleComplaints, type Status } from "@/lib/sampleData";
import { Locale, t } from "@/lib/i18n";
import { useDemoMode } from "@/lib/demoMode";
import { getSessionId } from "@/lib/supabase-browser";

type Row = {
  id: string;
  subject: string;
  status: Status;
  filedAt: string;
  lastUpdateAt: string;
  stretch: string;
  chainage: string;
  photos: number[];
  photoUrls: string[];
};

function relTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const dt = new Date(iso);
  return dt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ComplaintsPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const demo = useDemoMode();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (demo) {
      setRows(
        sampleComplaints.map((c) => ({
          id: c.id,
          subject: c.subject,
          status: c.status,
          filedAt: c.filedAt,
          lastUpdateAt: c.lastUpdateAt,
          stretch: c.stretch,
          chainage: c.chainage,
          photos: c.photos,
          photoUrls: c.photoUrls ?? [],
        })),
      );
      return;
    }
    let cancel = false;
    (async () => {
      const sid = getSessionId();
      const r = await fetch(`/api/complaints?session_id=${encodeURIComponent(sid)}`);
      if (!r.ok) return;
      const j = (await r.json()) as { complaints: any[] };
      if (cancel) return;
      setRows(
        (j.complaints ?? []).map((c) => ({
          id: c.id,
          subject: c.subject ?? "Untitled",
          status: (c.status as Status) ?? "filed",
          filedAt: relTime(c.filed_at),
          lastUpdateAt: relTime(c.updated_at ?? c.filed_at),
          stretch: c.road_name || c.neighbourhood || c.city || "-",
          chainage: c.pincode || c.state || "",
          photos: [1],
          photoUrls: (c.complaint_photos ?? []).map((p: any) => p.url),
        })),
      );
    })();
    return () => {
      cancel = true;
    };
  }, [demo]);

  return (
    <Shell
      locale={locale}
      onLocale={setLocale}
      topbar={
        <div>
          <p className="text-[13px] font-medium tracking-[0.04em] text-muted">
            {t.myComplaints[locale]}
          </p>
          <h1 className="text-[15px] font-medium tracking-tight">
            {t.allComplaints[locale]}
          </h1>
        </div>
      }
    >
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
          {rows.length === 0 ? (
            <Empty locale={locale} />
          ) : (
            <ul className="space-y-3">
              {rows.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/complaints/${c.id}`}
                    className="group flex gap-4 rounded-2xl border border-line bg-paper p-4 transition hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                  >
                    {c.photoUrls[0] ? (
                      <img
                        src={c.photoUrls[0]}
                        alt=""
                        className="h-[84px] w-[112px] shrink-0 rounded-md border border-line object-cover"
                      />
                    ) : (
                      <PotholePhoto
                        variant={c.photos[0] ?? 1}
                        className="h-[84px] w-[112px] shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded border border-line bg-subtle px-1.5 py-0.5 font-mono text-[10px] text-ink">
                          {c.id}
                        </span>
                        <StatusBadge status={c.status} size="xs" />
                        <span className="ml-auto text-[11px] text-muted">
                          {c.lastUpdateAt}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-[14px] text-ink">
                        {c.subject}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted">
                        <span>
                          {t.filedOn[locale]} · {c.filedAt}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-muted">
                        {c.stretch}
                        {c.chainage ? ` · ${c.chainage}` : ""}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Empty({ locale }: { locale: Locale }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-subtle/40 py-14 text-center">
      <div className="mb-3 h-10 w-10 rounded-full bg-subtle" />
      <p className="text-[15px]">{t.noComplaintsTitle[locale]}</p>
      <p className="mt-1 max-w-xs text-[12px] text-muted">
        {t.noComplaintsSub[locale]}
      </p>
    </div>
  );
}
