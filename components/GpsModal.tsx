"use client";

import { Locale, t } from "@/lib/i18n";

/**
 * Shown when the browser denies / can't get location. Lets the user retry after
 * enabling GPS, or continue with an approximate location.
 */
export default function GpsModal({
  open,
  locale,
  onRetry,
  onContinue,
}: {
  open: boolean;
  locale: Locale;
  onRetry: () => void;
  onContinue: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-5 shadow-xl">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b45309]/10 text-[#b45309]">
            📍
          </span>
          <div className="text-[15px] font-semibold text-ink">
            {t.gpsOffTitle[locale]}
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-muted">
          {t.gpsOffBody[locale]}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onContinue}
            className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink transition hover:bg-subtle"
          >
            {t.continueAnyway[locale]}
          </button>
          <button
            onClick={onRetry}
            className="rounded-full bg-ink px-3 py-1.5 text-[13px] text-paper transition hover:opacity-90"
          >
            {t.enableRetry[locale]}
          </button>
        </div>
      </div>
    </div>
  );
}
