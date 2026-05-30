"use client";

import { Locale, locales } from "@/lib/i18n";

/**
 * Compact language selector: a globe label plus a full-width segmented
 * control. The active language gets a solid surface so the choice reads
 * clearly rather than looking like a passive label.
 */
export default function LanguageSwitcher({
  value,
  onChange,
}: {
  value: Locale;
  onChange: (l: Locale) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-paper p-1">
      <span className="grid h-6 w-6 shrink-0 place-items-center text-muted">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      </span>
      <div className="flex flex-1 gap-1">
        {locales.map((l) => {
          const active = value === l.code;
          return (
            <button
              key={l.code}
              onClick={() => onChange(l.code)}
              aria-pressed={active}
              className={`flex-1 rounded-full px-2 py-1 text-[12px] font-medium transition ${
                active
                  ? "bg-ink text-paper shadow-sm"
                  : "text-muted hover:bg-subtle hover:text-ink"
              }`}
            >
              {l.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
