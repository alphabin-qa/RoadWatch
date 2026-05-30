"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { chats as sampleChats, complaints as sampleComplaints } from "@/lib/sampleData";
import { Locale, t } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import { useDemoMode } from "@/lib/demoMode";
import { getSessionId } from "@/lib/supabase-browser";
import { UserButton, useUser } from "@clerk/nextjs";

type ChatRow = {
  id: string;
  title: string;
  preview?: string;
  updatedAt: string;
  complaintId?: string | null;
};

// ---- inline icons (Gemini-style line icons) ----
const I = {
  Compose: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Complaints: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Gear: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9 1.65 1.65 0 0 0 21 10h.09a2 2 0 1 1 0 4H21a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  Person: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export default function Sidebar({
  locale,
  onLocale,
  open,
  onClose,
}: {
  locale: Locale;
  onLocale: (l: Locale) => void;
  open: boolean;
  onClose: () => void;
}) {
  const path = usePathname();
  const demo = useDemoMode();
  const { user } = useUser();
  const [liveChats, setLiveChats] = useState<ChatRow[]>([]);
  const [liveOpen, setLiveOpen] = useState(0);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Active chat from the ?chat= param (read from URL — Sidebar is outside the
  // page Suspense boundary, so useSearchParams isn't safe here).
  const [activeChat, setActiveChat] = useState<string | null>(null);
  useEffect(() => {
    const read = () =>
      setActiveChat(
        typeof window === "undefined"
          ? null
          : new URLSearchParams(window.location.search).get("chat"),
      );
    read();
    const onNew = () => setActiveChat(null);
    window.addEventListener("popstate", read);
    window.addEventListener("rw:new-chat", onNew);
    return () => {
      window.removeEventListener("popstate", read);
      window.removeEventListener("rw:new-chat", onNew);
    };
  }, [path]);

  useEffect(() => {
    if (demo) return;
    let cancel = false;
    (async () => {
      const sid = getSessionId();
      const [chatsRes, complaintsRes] = await Promise.all([
        fetch(`/api/chats?session_id=${encodeURIComponent(sid)}`).then((r) =>
          r.ok ? r.json() : { chats: [] },
        ),
        fetch(`/api/complaints?session_id=${encodeURIComponent(sid)}`).then(
          (r) => (r.ok ? r.json() : { complaints: [] }),
        ),
      ]);
      if (cancel) return;
      setLiveChats(
        (chatsRes.chats ?? []).map((c: any) => ({
          id: c.id,
          title: c.title || "New chat",
          preview: "",
          updatedAt: relTime(c.updated_at),
          complaintId: c.complaintId ?? null,
        })),
      );
      setLiveOpen(
        (complaintsRes.complaints ?? []).filter(
          (c: any) => c.status !== "resolved",
        ).length,
      );
    })();
    return () => {
      cancel = true;
    };
  }, [demo]);

  const chatList: ChatRow[] = demo
    ? sampleChats.map((c) => ({
        id: c.id,
        title: c.title,
        preview: c.preview,
        updatedAt: c.updatedAt,
        complaintId: c.complaintId ?? null,
      }))
    : liveChats;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chatList;
    return chatList.filter((c) => c.title.toLowerCase().includes(q));
  }, [chatList, search]);

  const openComplaints = demo
    ? sampleComplaints.filter((c) => c.status !== "resolved").length
    : liveOpen;

  const onComplaints = path?.startsWith("/complaints");

  function newChat() {
    onClose();
    setActiveChat(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("rw:new-chat"));
    }
  }

  const navItem =
    "flex items-center gap-3 rounded-full px-3 py-2 text-[14px] text-ink transition hover:bg-paper";

  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-ink/20 md:hidden"
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[268px] flex-col bg-subtle transition-transform md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/icon-192.png"
              alt="RoadWatch"
              className="h-8 w-8 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            />
            <span className="text-[17px] font-semibold tracking-tight text-ink">
              {t.appName[locale]}
            </span>
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-line md:hidden"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        {/* Primary nav */}
        <nav className="space-y-0.5 px-2">
          <Link href="/" onClick={newChat} className={navItem}>
            <I.Compose />
            {t.newChat[locale]}
          </Link>

          <button
            onClick={() => setSearchOpen((s) => !s)}
            className={`${navItem} w-full text-left ${searchOpen ? "bg-paper" : ""}`}
          >
            <I.Search />
            {t.searchChats[locale]}
          </button>

          <Link
            href="/complaints"
            onClick={onClose}
            className={`${navItem} ${onComplaints ? "bg-paper font-medium" : ""}`}
          >
            <I.Complaints />
            <span className="flex-1">{t.myComplaints[locale]}</span>
            {openComplaints > 0 && (
              <span className="rounded-full bg-ink px-1.5 py-0.5 text-[10px] text-paper">
                {openComplaints}
              </span>
            )}
          </Link>
        </nav>

        {/* Search input */}
        {searchOpen && (
          <div className="px-3 pt-2">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchChats[locale]}
              className="w-full rounded-full border border-line bg-paper px-3 py-1.5 text-[13px] outline-none placeholder:text-muted"
            />
          </div>
        )}

        {/* Recent */}
        <div className="mt-3 flex-1 overflow-y-auto px-2">
          <div className="px-3 pb-1 text-[12px] font-medium tracking-wide text-muted">
            {t.recent[locale]}
          </div>
          <ul className="space-y-0.5">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-[12px] text-muted">
                {search ? t.noMatches[locale] : t.noChats[locale]}
              </li>
            )}
            {filtered.map((c) => {
              const active = path === "/" && activeChat === c.id;
              return (
                <li key={c.id}>
                  <Link
                    href={`/?chat=${c.id}`}
                    onClick={() => {
                      setActiveChat(c.id);
                      onClose();
                    }}
                    className={`group flex items-center gap-2 rounded-full px-3 py-2 text-[13px] transition ${
                      active
                        ? "bg-paper font-medium text-ink"
                        : "text-ink hover:bg-paper"
                    }`}
                  >
                    <span className="flex-1 truncate">{c.title}</span>
                    {c.complaintId && (
                      <Link
                        href={`/complaints/${c.complaintId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 rounded-full border border-line bg-subtle px-1.5 py-0.5 font-mono text-[10px] text-muted opacity-0 transition group-hover:opacity-100 hover:text-ink"
                      >
                        {c.complaintId}
                      </Link>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Account footer */}
        <div className="border-t border-line p-2">
          <div className="mb-1 flex items-center justify-between px-2">
            <LanguageSwitcher value={locale} onChange={onLocale} />
            <Link
              href="/admin"
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted transition hover:bg-paper hover:text-ink"
            >
              <I.Gear />
              {t.adminTag[locale]}
            </Link>
          </div>
          <div className="flex items-center gap-2.5 rounded-full px-2 py-1.5">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{ elements: { avatarBox: "h-8 w-8" } }}
            />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[13px] font-medium text-ink">
                {user?.fullName ??
                  user?.primaryEmailAddress?.emailAddress ??
                  t.citizen[locale]}
              </span>
              <span className="text-[11px] text-muted">
                {demo ? t.demoMode[locale] : t.liveMode[locale]}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function relTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (!isFinite(d)) return "";
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
  const dt = new Date(iso);
  return dt.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
