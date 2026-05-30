"use client";

import { Locale, locales } from "@/lib/i18n";

export default function LanguageSwitcher({
  value,
  onChange,
}: {
  value: Locale;
  onChange: (l: Locale) => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-line bg-paper p-0.5 text-[12px]">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`rounded-full px-2.5 py-1 transition ${
            value === l.code
              ? "bg-ink text-paper"
              : "text-muted hover:text-ink"
          }`}
          aria-pressed={value === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
