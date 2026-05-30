// Demo mode toggle stored in localStorage.
// When TRUE  → app uses in-memory sample data (no DB writes).
// When FALSE → app persists chats / messages / complaints to Supabase.

"use client";

import { useEffect, useSyncExternalStore } from "react";

const KEY = "rw_demo_mode";

function read(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(KEY);
  if (v === null) return true; // default ON for first-time users
  return v === "1";
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function snapshot() {
  return read();
}
function ssrSnapshot() {
  return true;
}

export function setDemoMode(v: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, v ? "1" : "0");
  listeners.forEach((cb) => cb());
}

export function useDemoMode(): boolean {
  return useSyncExternalStore(subscribe, snapshot, ssrSnapshot);
}

// Cross-tab sync.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) listeners.forEach((cb) => cb());
  });
}
