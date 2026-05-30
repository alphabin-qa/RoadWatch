"use client";

import { Locale, t } from "@/lib/i18n";
import { stretch as sample } from "@/lib/sampleData";
import type { ResolvedStretch, FiledInfo } from "@/lib/types";
import { portalFor } from "@/lib/portals";
import { aiUrl } from "@/lib/aiBackend";
import { Icons, IconBadge } from "@/components/Illustration";
import { useEffect, useState } from "react";

const STATIC_CHIPS = ["IRC SP-16", "MoRTH 5.3", "DLP"];

export type ComplaintDraft = {
  subject: string;
  description: string;
  originalText: string;
  citedClauses: string[];
};

export default function ComplaintCard({
  locale,
  stretch = sample,
  onFile,
}: {
  locale: Locale;
  stretch?: ResolvedStretch;
  onFile?: (s: ResolvedStretch, draft: ComplaintDraft) => Promise<FiledInfo | null>;
}) {
  const s = stretch;
  const o = s.officer;
  const portal = portalFor(s.roadClass, s.state);

  const [filing, setFiling] = useState(false);
  const [filed, setFiled] = useState<FiledInfo | null>(null);
  const [chips, setChips] = useState<string[]>(
    s.citedClauses?.map((c) => c.id) ?? STATIC_CHIPS,
  );

  // Pull real IRC/MoRTH clause citations from the RAG backend; fall back to the
  // static chips if the backend isn't reachable (demo never breaks).
  useEffect(() => {
    let alive = true;
    fetch(aiUrl("/api/cite-clauses"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        defect_type: "pothole",
        road_class: s.roadClass,
        context: `${s.display}; contractor ${s.contractor}; DLP ${s.dlpActive ? "active" : "expired"}`,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j?.clauses?.length) {
          setChips(j.clauses.map((c: any) => c.id).slice(0, 4));
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [s.roadClass, s.display, s.contractor, s.dlpActive]);

  const draftBody = {
    en: `Dear ${o.name}, a defect on ${s.display} was reported.${
      s.hasContract
        ? ` The stretch was last relaid on ${s.lastRelay} by ${s.contractor}. Warranty (DLP) ${s.dlpActive ? `active until ${s.dlpUntil}` : "has expired"}.`
        : ""
    } Request inspection and repair under ${chips.join(", ")}.`,
    hi: `महोदय ${o.name}, ${s.display} पर दोष की सूचना है।${
      s.hasContract
        ? ` यह हिस्सा ${s.lastRelay} को ${s.contractor} द्वारा बनाया गया। वारंटी ${s.dlpActive ? `${s.dlpUntil} तक सक्रिय` : "समाप्त"}।`
        : ""
    } ${chips.join(", ")} के तहत मरम्मत का अनुरोध।`,
    ta: `ஐயா ${o.name}, ${s.display}-இல் சேதம் தெரிவிக்கப்பட்டது.${
      s.hasContract
        ? ` ${s.lastRelay}-இல் ${s.contractor} பணி செய்தார். உத்தரவாதம் ${s.dlpActive ? `${s.dlpUntil} வரை செயலில்` : "காலாவதி"}.`
        : ""
    } ${chips.join(", ")}-இன் கீழ் பழுதுபார்க்கக் கோருகிறேன்.`,
  };

  async function handleFile() {
    if (filing || filed) return;
    setFiling(true);
    const draft: ComplaintDraft = {
      subject: `Road defect on ${s.display}`,
      description: draftBody.en,
      originalText: draftBody[locale],
      citedClauses: chips,
    };
    try {
      const result = onFile
        ? await onFile(s, draft)
        : ({
            ticketId: `CP-${Math.floor(10000 + Math.random() * 89999)}`,
            slaDays: o.slaDays,
            officerName: o.name,
            officerRole: o.designation,
            portal: portal.name,
            portalUrl: portal.url,
          } as FiledInfo);
      setFiled(result);
    } finally {
      setFiling(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <IconBadge tone="ink">
          <Icons.Shield />
        </IconBadge>
        <div className="text-[13px] font-medium text-ink">Draft · {o.name}</div>
      </div>
      <div className="px-4 py-3 text-[13px] leading-relaxed text-muted">
        {draftBody[locale]}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
        {chips.map((c) => (
          <span
            key={c}
            className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-muted"
          >
            {c}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        {filed ? (
          <span className="text-[12px] text-accent">
            ✓ {t.filedTo[locale]} {filed.portal} · {filed.ticketId} · SLA{" "}
            {filed.slaDays} {t.days[locale]}
          </span>
        ) : (
          <>
            <span className="text-[11px] text-muted">
              {t.filedTo[locale]}: {portal.name}
            </span>
            <button
              onClick={handleFile}
              disabled={filing}
              className="rounded-full bg-ink px-3 py-1.5 text-[12px] text-paper transition hover:opacity-90 disabled:opacity-50"
            >
              {filing ? "…" : t.fileComplaint[locale]}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
