"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js for lite offline support. Only in production builds — a
 * service worker in `next dev` fights with HMR. Renders nothing.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
