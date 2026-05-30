"use client";

import { useState } from "react";
import { Locale } from "@/lib/i18n";
import { Icons } from "@/components/Illustration";

const suggestions = {
  en: ["Show SLA breaches", "Contractors with reopened complaints", "Top 5 stretches by cost"],
  hi: ["SLA उल्लंघन दिखाएँ", "ठेकेदार जिनकी शिकायतें फिर खुलीं", "शीर्ष 5 सड़कें"],
  ta: ["SLA மீறல்களைக் காட்டு", "திரும்பத் திறக்கப்பட்ட புகார்கள்", "முதல் 5 பாதைகள்"],
};

export default function AdminCommandBar({ locale }: { locale: Locale }) {
  const [value, setValue] = useState("");
  const [answered, setAnswered] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!value.trim()) return;
          setAnswered(value);
          setValue("");
        }}
        className="flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-paper">
          <Icons.Arrow />
        </div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask your district…"
          className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        {suggestions[locale].map((s) => (
          <button
            key={s}
            onClick={() => setAnswered(s)}
            className="rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] text-ink transition hover:bg-subtle"
          >
            {s}
          </button>
        ))}
      </div>

      {answered && (
        <div className="rounded-xl border border-line bg-paper p-4 text-[13px]">
          <div className="text-[13px] font-medium tracking-wide text-muted">
            Answer
          </div>
          <div className="mt-1 text-ink">
            Sample response for “{answered}”. Widgets below reflect the same query.
          </div>
        </div>
      )}
    </div>
  );
}
