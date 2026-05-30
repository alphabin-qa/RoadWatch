"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Locale, t } from "@/lib/i18n";
import { starters } from "@/lib/sampleData";
import Composer from "./Composer";
import Message, { Msg } from "./Message";
import { validateImage, validationMessage } from "@/lib/imageValidation";
import { useDemoMode } from "@/lib/demoMode";
import { getSessionId } from "@/lib/supabase-browser";
import { aiUrl } from "@/lib/aiBackend";
import type { ResolvedStretch, FiledInfo } from "@/lib/types";
import type { ComplaintDraft } from "./cards/ComplaintCard";
import { portalFor } from "@/lib/portals";
import { enqueueComplaint, flushQueue, queueCount } from "@/lib/offlineQueue";
import { getLivePosition, type GeoFix } from "@/lib/geo";
import {
  dossierFor,
  reasoningSteps,
  SUGGESTIONS,
  answerFromDossier,
} from "@/lib/dossier";
import GpsModal from "@/components/GpsModal";

export default function Chat({
  locale,
  variant = "citizen",
}: {
  locale: Locale;
  variant?: "citizen" | "admin";
}) {
  const demo = useDemoMode();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  // Most recently resolved road - reused by text follow-ups so they answer about
  // the resolved road (the dossier), not a hardcoded sample.
  const [lastStretch, setLastStretch] = useState<ResolvedStretch | null>(null);
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);
  const [locating, setLocating] = useState(false);
  const [gpsModalOpen, setGpsModalOpen] = useState(false);
  const [pendingReport, setPendingReport] = useState<File | null>(null);
  const [pendingCaption, setPendingCaption] = useState<string | undefined>(undefined);
  const bottom = useRef<HTMLDivElement>(null);

  // Track connectivity; flush any queued complaints when we come back online.
  useEffect(() => {
    function refreshQueue() {
      queueCount().then(setQueued).catch(() => {});
    }
    function goOnline() {
      setOnline(true);
      flushQueue().then(() => refreshQueue());
    }
    function goOffline() {
      setOnline(false);
    }
    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    refreshQueue();
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Ensure a DB chat row exists once we leave demo mode and the user starts typing.
  async function ensureChat(): Promise<string | null> {
    if (demo) return null;
    if (chatId) return chatId;
    const session_id = getSessionId();
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id, locale }),
    });
    if (!res.ok) return null;
    const { chat } = (await res.json()) as { chat: { id: string } };
    setChatId(chat.id);
    return chat.id;
  }

  async function persistMessage(payload: {
    role: "user" | "assistant";
    text?: string;
    image_url?: string;
    lat?: number;
    lng?: number;
    resolved_address?: any;
    resolved_display?: string;
    card_kind?: string;
    variant?: string;
  }) {
    if (demo) return;
    const chat_id = await ensureChat();
    if (!chat_id) return;
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, ...payload }),
    }).catch(() => {});
  }

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // React to URL changes - clear when no ?chat= present, hydrate when one is.
  const searchParams = useSearchParams();
  const chatParam = searchParams.get("chat");

  useEffect(() => {
    if (demo) return;
    if (!chatParam) {
      setMessages([]);
      setChatId(null);
      return;
    }
    setChatId(chatParam);
    fetch(`/api/messages?chat_id=${encodeURIComponent(chatParam)}`)
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((j: any) => {
        const rows = (j.messages ?? []) as any[];
        setMessages(
          rows.map((r) => ({
            id: r.id,
            role: r.role,
            text: r.text ?? undefined,
            imageUrl: r.image_url ?? undefined,
            location:
              r.lat != null && r.lng != null
                ? { lat: r.lat, lng: r.lng }
                : undefined,
            resolvedDisplay: r.resolved_display ?? undefined,
            card: r.card_kind ?? undefined,
            variant: r.variant ?? undefined,
          })),
        );
      })
      .catch(() => {});
  }, [demo, chatParam]);

  // Explicit reset for the sidebar's "+ New chat" button.
  useEffect(() => {
    function onNewChat() {
      setMessages([]);
      setChatId(null);
      setLastStretch(null);
    }
    window.addEventListener("rw:new-chat", onNewChat);
    return () => window.removeEventListener("rw:new-chat", onNewChat);
  }, []);

  // ---- Complaint filing (live insert / offline queue / demo) ----
  async function fileComplaint(
    s: ResolvedStretch,
    draft: ComplaintDraft,
  ): Promise<FiledInfo | null> {
    const portal = portalFor(s.roadClass, s.state);
    const slaDays = s.officer.slaDays || portal.slaDays;

    let ticketId = `CP-${Math.floor(10000 + Math.random() * 89999)}`;
    if (!demo) {
      const chat_id = await ensureChat().catch(() => null);
      const payload = {
        session_id: getSessionId(),
        chat_id,
        subject: draft.subject,
        description: draft.description,
        original_text: draft.originalText,
        lat: s.lat,
        lng: s.lng,
        snapped_lat: s.snappedLat,
        snapped_lng: s.snappedLng,
        road_name: s.roadName,
        road_class: s.roadClass,
        neighbourhood: s.neighbourhood,
        city: s.city,
        state: s.state,
        pincode: s.pincode,
        contractor_id: s.contractorId,
        contract_id: s.contractId,
        sla_days: slaDays,
        current_rank: s.officer.rank ?? 2,
      };

      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      if (offline) {
        ticketId = `${ticketId}-Q`;
        await enqueueComplaint(ticketId, payload).catch(() => {});
        setQueued((q) => q + 1);
      } else {
        try {
          const res = await fetch("/api/complaints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const j = (await res.json()) as { id: string };
            if (j.id) ticketId = j.id;
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
        } catch {
          ticketId = `${ticketId}-Q`;
          await enqueueComplaint(ticketId, payload).catch(() => {});
          setQueued((q) => q + 1);
        }
      }
    }

    const filed: FiledInfo = {
      ticketId,
      slaDays,
      officerName: s.officer.name,
      officerRole: s.officer.designation,
      portal: portal.name,
      portalUrl: portal.url,
    };

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: t.trackLater[locale],
        card: "tracking",
        filed,
      },
    ]);
    return filed;
  }

  const [pending, setPending] = useState(false);
  const [prefill, setPrefill] = useState<{ text: string; nonce: number }>({
    text: "",
    nonce: 0,
  });
  function pickStarter(text: string) {
    setPrefill((p) => ({ text, nonce: p.nonce + 1 }));
  }

  // ---- Send: text and/or a staged photo ----
  async function send(text: string, image?: File) {
    // A photo was attached in the composer: run the photo report flow, carrying
    // the typed text (if any) as the caption on the user's message.
    if (image) {
      await attach(image, text);
      return;
    }

    const uid = crypto.randomUUID();
    const aid = crypto.randomUUID();
    const history = messages.map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      text: m.text ?? "",
    }));

    setMessages((prev) => [
      ...prev,
      { id: uid, role: "user", text },
      { id: aid, role: "assistant", text: "" },
    ]);
    setPending(true);
    void persistMessage({ role: "user", text });

    const finish = (patch: Partial<Msg>) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === aid ? { ...m, text: "", ...patch } : m)),
      );

    const suggestions = lastStretch ? SUGGESTIONS[locale] : undefined;

    // DEMO MODE - app-driven, deterministic. Answer from the resolved dossier,
    // or ask for a location when nothing is resolved.
    if (demo) {
      await new Promise((r) => setTimeout(r, 350));
      if (lastStretch) {
        const a = answerFromDossier(text, lastStretch, locale);
        finish({ text: a.reply, card: a.card, stretch: lastStretch, suggestions });
      } else {
        // Text alone cannot identify a specific road - ask for a photo.
        finish({ text: t.needPhoto[locale] });
      }
      setPending(false);
      return;
    }

    // LIVE MODE - core accountability questions (who built / tender / license /
    // owner / warranty / officer) are answered deterministically so the facts are
    // always correct and consistent. Free-form questions go to the real LLM with
    // the resolved road as context.
    const det = lastStretch ? answerFromDossier(text, lastStretch, locale) : null;
    if (det && det.matched && lastStretch) {
      finish({ text: det.reply, card: det.card, stretch: lastStretch, suggestions });
      void persistMessage({ role: "assistant", text: det.reply, card_kind: det.card });
      setPending(false);
      return;
    }
    // No road resolved yet: a text question alone can't identify a specific
    // road, so ask the user for a photo instead of guessing.
    if (!lastStretch) {
      await new Promise((r) => setTimeout(r, 300));
      finish({ text: t.needPhoto[locale] });
      setPending(false);
      return;
    }
    try {
      const res = await fetch(aiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          locale,
          context: lastStretch
            ? {
                resolved: true,
                road: lastStretch.roadName ?? lastStretch.display,
                roadClass: lastStretch.roadClassLabel,
                contractor: lastStretch.contractor,
                lastRelay: lastStretch.lastRelay,
                sanctioned: lastStretch.sanctioned,
                spent: lastStretch.spent,
                dlpActive: lastStretch.dlpActive,
                dlpUntil: lastStretch.dlpUntil,
                officer: `${lastStretch.officer.name}, ${lastStretch.officer.designation}`,
                license: lastStretch.license
                  ? `${lastStretch.license.class} ${lastStretch.license.no}, renewed ${lastStretch.license.renewed}, valid till ${lastStretch.license.validTill}`
                  : undefined,
                owner: lastStretch.owner
                  ? `${lastStretch.owner.name}, ${lastStretch.owner.role}, ${lastStretch.owner.group}`
                  : undefined,
              }
            : { resolved: false },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { reply: string; card: string };

      const card =
        data.card && data.card !== "none" ? (data.card as Msg["card"]) : undefined;
      finish({ text: data.reply, card, stretch: lastStretch ?? undefined, suggestions });
      void persistMessage({
        role: "assistant",
        text: data.reply,
        card_kind: card,
      });
    } catch (err) {
      // LLM unreachable → deterministic dossier answer (or ask for a location).
      if (det && lastStretch) {
        finish({ text: det.reply, card: det.card, stretch: lastStretch, suggestions });
      } else {
        finish({ text: t.askLocation[locale] });
      }
    } finally {
      setPending(false);
    }
  }

  // ---- Photo report → live GPS → reasoning → dossier ----
  // `caption` is any text the user typed alongside the photo in the composer.
  async function attach(file: File, caption?: string) {
    const code = await validateImage(file);
    if (code !== "ok") {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: validationMessage(code, locale),
          variant: "error",
        },
      ]);
      return;
    }
    setPendingReport(file);
    setPendingCaption(caption);
    await tryGpsAndProcess(file, caption);
  }

  async function tryGpsAndProcess(file: File, caption?: string) {
    setLocating(true);
    try {
      const fix = await getLivePosition();
      setLocating(false);
      setGpsModalOpen(false);
      setPendingReport(null);
      setPendingCaption(undefined);
      await processReport(file, fix, true, caption);
    } catch {
      // GPS off / denied / unavailable → show the popup.
      setLocating(false);
      setGpsModalOpen(true);
    }
  }

  async function processReport(
    file: File,
    fix: GeoFix | null,
    gpsOn: boolean,
    caption?: string,
  ) {
    const url = URL.createObjectURL(file);
    const uid = crypto.randomUUID();
    const aid = crypto.randomUUID();
    const loc = fix ? { lat: fix.lat, lng: fix.lng } : undefined;
    const steps = reasoningSteps(fix, gpsOn);

    setMessages((prev) => [
      ...prev,
      { id: uid, role: "user", imageUrl: url, location: loc, text: caption?.trim() || undefined },
      ...(gpsOn
        ? []
        : [
            {
              id: crypto.randomUUID(),
              role: "assistant" as const,
              text: t.gpsWarnChat[locale],
              variant: "error" as const,
            },
          ]),
      { id: aid, role: "assistant", reasoning: steps },
    ]);

    // Upload photo + persist user message in live mode.
    if (!demo) {
      let publicUrl: string | undefined;
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("session_id", getSessionId());
        const upRes = await fetch("/api/upload-photo", { method: "POST", body: fd });
        if (upRes.ok) publicUrl = ((await upRes.json()) as { url: string }).url;
      } catch {}
      void persistMessage({
        role: "user",
        image_url: publicUrl,
        lat: loc?.lat,
        lng: loc?.lng,
      });
    }

    // Resolve to the deterministic dossier (same contractor every time; GPS real).
    const dossier = dossierFor(fix, gpsOn);
    setLastStretch(dossier);

    // Reveal the answer after the reasoning trace has animated.
    const total = steps.length * 650 + 1100;
    window.setTimeout(() => {
      const reply = answerFromDossier("who built this road", dossier, locale).reply;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aid
            ? {
                ...m,
                text: reply,
                card: "dossier",
                stretch: dossier,
                suggestions: SUGGESTIONS[locale],
              }
            : m,
        ),
      );
      void persistMessage({
        role: "assistant",
        text: reply,
        card_kind: "dossier",
        resolved_display: dossier.display,
      });
    }, total);
  }

  const empty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-6">
          {empty ? (
            <EmptyState locale={locale} onPick={pickStarter} variant={variant} />
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <Message
                  key={m.id}
                  m={m}
                  locale={locale}
                  onFileComplaint={fileComplaint}
                  onSuggestion={send}
                />
              ))}
              <div ref={bottom} />
            </div>
          )}
        </div>
      </div>

      <GpsModal
        open={gpsModalOpen}
        locale={locale}
        onRetry={() => pendingReport && tryGpsAndProcess(pendingReport, pendingCaption)}
        onContinue={() => {
          setGpsModalOpen(false);
          const f = pendingReport;
          const cap = pendingCaption;
          setPendingReport(null);
          setPendingCaption(undefined);
          if (f) void processReport(f, null, false, cap);
        }}
      />

      <div className="bg-paper/80 backdrop-blur">
        <div className="mx-auto w-full max-w-2xl px-4 py-3">
          {locating && (
            <div className="mb-2 flex items-center justify-center gap-2 text-[12px] text-muted">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-line border-t-ink" />
              {t.locating[locale]}
            </div>
          )}
          <Composer locale={locale} onSend={send} prefill={prefill} />
          <p className="mt-2 flex items-center justify-center gap-2 text-center text-[10px] text-muted">
            {!online && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#b45309]/10 px-2 py-0.5 text-[#b45309]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
                Offline · cached lookup
              </span>
            )}
            {queued > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5">
                {queued} complaint{queued > 1 ? "s" : ""} queued
              </span>
            )}
            <span>{demo ? "Demo mode" : "Live mode"} · {online ? "online" : "offline"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  locale,
  onPick,
  variant,
}: {
  locale: Locale;
  onPick: (text: string) => void;
  variant: "citizen" | "admin";
}) {
  return (
    <div className="flex flex-col items-center pt-10 text-center">
      <img
        src="/hero.jpg"
        alt="A citizen photographing a pothole to report it"
        className="mb-6 w-[300px] max-w-full rounded-2xl border border-line"
      />
      <h1 className="text-[26px] leading-tight tracking-tight text-ink">
        {t.emptyTitle[locale]}
      </h1>
      <p className="mt-2 max-w-sm text-[14px] text-muted">{t.emptySub[locale]}</p>

      {variant === "citizen" && (
        <div className="mt-8 flex w-full flex-wrap justify-center gap-2">
          {starters[locale].map((s) => (
            <button
              key={s}
              onClick={() => onPick(s)}
              className="rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] text-ink transition hover:bg-subtle"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
