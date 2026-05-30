// Offline complaint queue. When a complaint is filed with no network (or the
// POST fails), the payload is stored in IndexedDB and flushed to /api/complaints
// when the browser comes back online.

"use client";

import { idbPut, idbGetAll, idbDelete } from "./idb";

export type QueuedComplaint = {
  id?: number; // autoincrement key
  localTicket: string; // CP-…-Q shown to the user until synced
  payload: Record<string, any>; // body for POST /api/complaints
  queuedAt: number;
};

export async function enqueueComplaint(
  localTicket: string,
  payload: Record<string, any>,
): Promise<void> {
  await idbPut("queue", { localTicket, payload, queuedAt: Date.now() });
}

export async function queueCount(): Promise<number> {
  try {
    return (await idbGetAll<QueuedComplaint>("queue")).length;
  } catch {
    return 0;
  }
}

/** Try to POST every queued complaint; remove the ones that succeed. */
export async function flushQueue(): Promise<{ synced: number; remaining: number }> {
  let items: QueuedComplaint[] = [];
  try {
    items = await idbGetAll<QueuedComplaint>("queue");
  } catch {
    return { synced: 0, remaining: 0 };
  }
  let synced = 0;
  for (const item of items) {
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
      });
      if (res.ok && item.id != null) {
        await idbDelete("queue", item.id);
        synced++;
      }
    } catch {
      /* still offline — stop trying for now */
      break;
    }
  }
  const remaining = (await idbGetAll<QueuedComplaint>("queue").catch(() => [])).length;
  return { synced, remaining };
}
