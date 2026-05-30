"use client";

import { useState } from "react";
import { Locale, t } from "@/lib/i18n";
import { tracking } from "@/lib/sampleData";
import type { FiledInfo } from "@/lib/types";
import { Icons, IconBadge } from "@/components/Illustration";

export default function TrackingCard({
  locale,
  filed,
}: {
  locale: Locale;
  filed?: FiledInfo;
}) {
  const [copied, setCopied] = useState(false);

  // A freshly-filed complaint has 0 days elapsed and a minimal 2-step timeline.
  const ticketId = filed?.ticketId ?? tracking.ticketId;
  const slaDays = filed?.slaDays ?? tracking.slaDays;
  const daysElapsed = filed ? 0 : tracking.daysElapsed;
  const daysLeft = slaDays - daysElapsed;
  const pct = Math.min(100, (daysElapsed / slaDays) * 100);
  const escalation = filed
    ? [
        {
          rank: 2,
          role: filed.officerRole,
          name: filed.officerName,
          active: true,
          reached: true,
        },
      ]
    : tracking.escalation;
  const timeline = filed
    ? [
        { at: "just now", label: `Filed to ${filed.portal}`, done: true },
        { at: "just now", label: "Acknowledged · Ref generated", done: true },
        { at: "—", label: "Assigned for site inspection", done: false },
      ]
    : tracking.timeline;

  async function copy() {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <IconBadge tone="ink">
          <Icons.Shield />
        </IconBadge>
        <div className="flex-1">
          <div className="text-[13px] font-medium text-ink">
            {t.tracking[locale]}
          </div>
          <div className="text-[11px] text-muted">
            {t.ticket[locale]}{" "}
            <span className="font-mono text-ink">{ticketId}</span>
          </div>
        </div>
        <button
          onClick={copy}
          className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted transition hover:text-ink"
        >
          {copied ? `✓ ${t.copied[locale]}` : t.copyTicket[locale]}
        </button>
      </div>

      {/* SLA bar */}
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-muted">
            {t.slaRemaining[locale]}
          </span>
          <span className="text-ink">
            {daysLeft} / {slaDays} {t.days[locale]}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-subtle">
          <div
            className="h-full bg-ink transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {t.inProgress[locale]}
        </div>
      </div>

      {/* Currently with (escalation) */}
      <div className="border-b border-line px-4 py-3">
        <div className="mb-2 text-[12px] font-medium tracking-wide text-muted">
          {t.currentlyWith[locale]} · {t.escalationPath[locale]}
        </div>
        <ol className="space-y-1.5">
          {escalation.map((e) => (
            <li
              key={e.rank}
              className="flex items-center gap-2 text-[12px]"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                  e.active
                    ? "bg-ink text-paper"
                    : e.reached
                      ? "border border-line bg-paper text-muted"
                      : "border border-dashed border-line bg-paper text-muted"
                }`}
              >
                {e.rank}
              </span>
              <span
                className={
                  e.active
                    ? "text-ink"
                    : e.reached
                      ? "text-muted line-through"
                      : "text-muted"
                }
              >
                {e.role}
              </span>
              <span className="text-muted">· {e.name}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Timeline */}
      <div className="px-4 py-3">
        <div className="mb-2 text-[12px] font-medium tracking-wide text-muted">
          {t.timeline[locale]}
        </div>
        <ol className="space-y-2">
          {timeline.map((s, i) => (
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
      </div>
    </div>
  );
}
