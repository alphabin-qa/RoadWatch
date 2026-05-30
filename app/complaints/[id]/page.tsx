"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import PotholePhoto from "@/components/PotholePhoto";
import { complaints, type Complaint, type EscalationStep } from "@/lib/sampleData";
import { Locale, t } from "@/lib/i18n";
import { useDemoMode } from "@/lib/demoMode";

export default function ComplaintDetail() {
  const [locale, setLocale] = useState<Locale>("en");
  const demo = useDemoMode();
  const params = useParams();
  const id = decodeURIComponent(params.id as string);

  const sample = useMemo(() => complaints.find((c) => c.id === id), [id]);
  const [liveComplaint, setLiveComplaint] = useState<Complaint | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (demo) {
      setLiveComplaint(null);
      setLoaded(true);
      return;
    }
    let cancel = false;
    (async () => {
      const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`);
      if (cancel) return;
      if (!res.ok) {
        setLoaded(true);
        return;
      }
      const j = (await res.json()) as { complaint: any; officers: any[] };
      const c = j.complaint;
      const officers: EscalationStep[] = (j.officers ?? []).map((o: any) => ({
        rank: o.rank,
        role: o.role,
        name: o.name,
        phone: o.phone ?? "",
        email: o.email ?? "",
        active: false,
        reached: false,
      }));
      // Build a Complaint-shaped object for the existing UI.
      const photos = (c.complaint_photos ?? []).map((_: any, i: number) => i + 1);
      const events = (c.complaint_events ?? []).map((e: any) => ({
        at: new Date(e.occurred_at).toLocaleString("en-IN"),
        label: e.label,
        done: e.done,
      }));
      const ladder = officers.map((o) => ({
        ...o,
        active: o.rank === (c.current_rank ?? 2),
        reached: o.rank <= (c.current_rank ?? 2),
      }));
      const current = ladder.find((o) => o.active) ?? ladder[1];
      const filedAt = c.filed_at
        ? new Date(c.filed_at).toLocaleString("en-IN")
        : "";
      const updatedAt = c.updated_at
        ? new Date(c.updated_at).toLocaleString("en-IN")
        : filedAt;

      const built: Complaint = {
        id: c.id,
        chatId: c.chat_id ?? "",
        subject: c.subject ?? "",
        description: c.description ?? "",
        originalUserText: c.original_text ?? "",
        photos: photos.length > 0 ? photos : [1],
        stretch: c.road_name || c.neighbourhood || c.city || "-",
        chainage: c.pincode || "",
        contractor: c.contractors?.name?.replace(/^SEED:/, "") ?? "-",
        filedAt,
        lastUpdateAt: updatedAt,
        status: (c.status as any) ?? "filed",
        slaDays: c.sla_days ?? 30,
        daysElapsed: Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(c.filed_at).getTime()) / 86400000,
          ),
        ),
        currentRank: c.current_rank ?? 2,
        officer: {
          name: current?.name ?? "-",
          designation: current?.role ?? "-",
          division: c.city ? `${c.city} division` : "-",
          email: current?.email ?? "",
          phone: current?.phone ?? "",
          slaDays: c.sla_days ?? 30,
        },
        timeline:
          events.length > 0
            ? events
            : [{ at: filedAt, label: "Filed to CPGRAMS", done: true }],
        escalation: ladder,
      };
      // attach photo URLs onto the object via a side property
      (built as any)._photoUrls = (c.complaint_photos ?? []).map(
        (p: any) => p.url,
      );
      setLiveComplaint(built);
      setLoaded(true);
    })();
    return () => {
      cancel = true;
    };
  }, [demo, id]);

  const complaint = demo ? sample : liveComplaint;
  const [rank, setRank] = useState(2);
  useEffect(() => {
    if (complaint) setRank(complaint.currentRank ?? 2);
  }, [complaint]);
  const [escOpen, setEscOpen] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  if (!loaded && !demo) {
    return (
      <Shell locale={locale} onLocale={setLocale} topbar={null}>
        <div className="flex h-full items-center justify-center text-[13px] text-muted">
          Loading…
        </div>
      </Shell>
    );
  }

  if (!complaint) {
    return (
      <Shell locale={locale} onLocale={setLocale} topbar={null}>
        <div className="flex h-full items-center justify-center text-[13px] text-muted">
          Complaint not found.
        </div>
      </Shell>
    );
  }

  const current = complaint!.escalation.find((e) => e.rank === rank)!;
  const daysLeft = complaint!.slaDays - complaint!.daysElapsed;
  const pct = Math.min(
    100,
    (complaint!.daysElapsed / complaint!.slaDays) * 100,
  );

  function escalateNow() {
    if (rank < 5) setRank(rank + 1);
    setEscOpen(false);
  }

  return (
    <Shell
      locale={locale}
      onLocale={setLocale}
      topbar={
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Link
              href="/complaints"
              className="text-[11px] text-muted hover:text-ink"
            >
              ← {t.backToComplaints[locale]}
            </Link>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="rounded border border-line bg-subtle px-1.5 py-0.5 font-mono text-[10px] text-ink">
                {complaint!.id}
              </span>
              <StatusBadge status={complaint!.status} size="xs" />
            </div>
          </div>
          <Link
            href={`/?chat=${complaint!.chatId}`}
            className="hidden rounded-full border border-line px-3 py-1 text-[11px] text-muted hover:text-ink md:inline-flex"
          >
            {t.openChat[locale]}
          </Link>
        </div>
      }
    >
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-6 md:py-8">
          {/* Subject */}
          <section>
            <div className="text-[13px] font-medium tracking-wide text-muted">
              {t.subjectLine[locale]}
            </div>
            <h1 className="mt-1 text-[22px] leading-tight tracking-tight">
              {complaint!.subject}
            </h1>
            <div className="mt-1 text-[12px] text-muted">
              {complaint!.stretch} · {complaint!.chainage} ·{" "}
              {complaint!.contractor}
            </div>
          </section>

          {/* Photos */}
          <section>
            <div className="mb-2 text-[13px] font-medium tracking-wide text-muted">
              {t.photos[locale]}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {((((complaint as any)._photoUrls ?? (complaint as any).photoUrls) as string[] | undefined) ?? []).length > 0
                ? ((((complaint as any)._photoUrls ?? (complaint as any).photoUrls) as string[]).map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className="overflow-hidden rounded-xl border border-line"
                    >
                      <img
                        src={url}
                        alt={`photo ${i + 1}`}
                        className="aspect-[4/3] w-full object-cover transition hover:scale-[1.02]"
                      />
                    </button>
                  )))
                : complaint!.photos.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className="overflow-hidden rounded-xl"
                    >
                      <PotholePhoto
                        variant={p}
                        className="aspect-[4/3] w-full transition hover:scale-[1.02]"
                        label={`${i + 1}/${complaint!.photos.length}`}
                      />
                    </button>
                  ))}
            </div>
            {activePhoto !== null && (
              <div className="mt-3 text-[11px] text-muted">
                Captured at the time of filing · GPS attached
              </div>
            )}
          </section>

          {/* Description (AI-polished) */}
          <section className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-medium tracking-wide text-muted">
                {t.description[locale]}
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-ai/10 px-2 py-0.5 text-[10px] text-ai">
                <span className="h-1.5 w-1.5 rounded-full bg-ai" />
                {t.aiPolished[locale]}
              </div>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-ink">
              {complaint!.description}
            </p>
            <button
              onClick={() => setShowOriginal((v) => !v)}
              className="mt-3 text-[11px] text-muted underline underline-offset-4 hover:text-ink"
            >
              {showOriginal ? "Hide" : "Show"} {t.yourWords[locale]}
            </button>
            {showOriginal && (
              <blockquote className="mt-2 border-l-2 border-line pl-3 text-[13px] italic text-muted">
                “{complaint!.originalUserText}”
              </blockquote>
            )}
          </section>

          {/* Progress / SLA */}
          <section className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-muted">
                {t.slaRemaining[locale]}
              </span>
              <span
                className={
                  daysLeft < 0
                    ? "font-medium text-[#b91c1c]"
                    : daysLeft < 5
                      ? "font-medium text-[#b45309]"
                      : "text-ink"
                }
              >
                {daysLeft} / {complaint!.slaDays} {t.days[locale]}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-subtle">
              <div
                className={`h-full ${
                  daysLeft < 0
                    ? "bg-[#dc2626]"
                    : daysLeft < 5
                      ? "bg-[#d97706]"
                      : "bg-ink"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-3 text-[12px] font-medium tracking-wide text-muted">
              {t.timeline[locale]}
            </div>
            <ol className="mt-2 space-y-2">
              {complaint!.timeline.map((s, i) => (
                <li key={i} className="flex gap-3 text-[12px]">
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      s.done ? "bg-ink" : "border border-dashed border-line bg-paper"
                    }`}
                  />
                  <div className="flex-1">
                    <div className={s.done ? "text-ink" : "text-muted"}>
                      {s.label}
                    </div>
                    <div className="text-[11px] text-muted">{s.at}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Responsible officer + actions */}
          <section className="rounded-2xl border border-line bg-paper p-4">
            <div className="text-[13px] font-medium tracking-wide text-muted">
              {t.currentlyWith[locale]}
            </div>
            <div className="mt-1 flex items-start justify-between gap-4">
              <div>
                <div className="text-[15px] tracking-tight text-ink">
                  {current.name}
                </div>
                <div className="text-[12px] text-muted">{current.role}</div>
                <div className="mt-1 font-mono text-[12px] text-ink">
                  {current.phone}
                </div>
                <div className="font-mono text-[12px] text-ink">
                  {current.email}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={`tel:${current.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] text-ink transition hover:bg-subtle"
                >
                  📞 {t.call[locale]}
                </a>
                <a
                  href={`mailto:${current.email}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] text-ink transition hover:bg-subtle"
                >
                  ✉ {t.email[locale]}
                </a>
              </div>
            </div>

            {/* Escalation ladder */}
            <div className="mt-4">
              <div className="mb-2 text-[12px] font-medium tracking-wide text-muted">
                {t.escalationPath[locale]}
              </div>
              <ol className="space-y-1.5">
                {complaint!.escalation.map((e) => {
                  const isActive = e.rank === rank;
                  const reached = e.rank <= rank;
                  return (
                    <li key={e.rank} className="flex items-center gap-2 text-[12px]">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                          isActive
                            ? "bg-ink text-paper"
                            : reached
                              ? "border border-line bg-paper text-muted"
                              : "border border-dashed border-line bg-paper text-muted"
                        }`}
                      >
                        {e.rank}
                      </span>
                      <span
                        className={
                          isActive
                            ? "text-ink"
                            : reached
                              ? "text-muted line-through"
                              : "text-muted"
                        }
                      >
                        {e.role}
                      </span>
                      <span className="text-muted">· {e.name}</span>
                    </li>
                  );
                })}
              </ol>
              {rank < 5 && complaint!.status !== "resolved" && (
                <button
                  onClick={() => setEscOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] text-paper transition hover:opacity-90"
                >
                  ↑ {t.escalate[locale]}
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Escalate confirm */}
      {escOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/20 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-5 shadow-xl">
            <div className="text-[14px] text-ink">
              {t.escalateConfirm[locale]}
            </div>
            <div className="mt-1 text-[12px] text-muted">
              {current.role} → {complaint!.escalation[rank]?.role}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEscOpen(false)}
                className="rounded-full border border-line px-3 py-1.5 text-[12px] text-muted hover:text-ink"
              >
                {t.cancel[locale]}
              </button>
              <button
                onClick={escalateNow}
                className="rounded-full bg-ink px-3 py-1.5 text-[12px] text-paper hover:opacity-90"
              >
                {t.yes[locale]}
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
