"use client";

import { useEffect, useState } from "react";
import type { ReasoningStep } from "@/lib/types";

/**
 * Agent-style reasoning trace (like ChatGPT/Codex "thinking"). Reveals steps
 * one-by-one with a spinner → check, then collapses to a summary the user can
 * re-expand.
 */
export default function ReasoningTrace({
  steps,
  stepMs = 650,
}: {
  steps: ReasoningStep[];
  stepMs?: number;
}) {
  const [revealed, setRevealed] = useState(0);
  const [open, setOpen] = useState(true);
  const done = revealed >= steps.length;

  useEffect(() => {
    if (revealed >= steps.length) {
      // auto-collapse shortly after finishing
      const t = setTimeout(() => setOpen(false), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealed((r) => r + 1), stepMs);
    return () => clearTimeout(t);
  }, [revealed, steps.length, stepMs]);

  return (
    <div className="rounded-xl border border-line bg-subtle/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {!done ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-line border-t-ink" />
        ) : (
          <span className="text-[12px] text-accent">✓</span>
        )}
        <span className="text-[12px] font-medium text-muted">
          {done ? `Resolved · ${steps.length} steps` : "Working…"}
        </span>
        <span className="ml-auto text-[11px] text-muted">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <ol className="space-y-1.5 border-t border-line px-3 py-2">
          {steps.slice(0, revealed + 1).map((s, i) => {
            const active = i === revealed && !done;
            const complete = i < revealed || done;
            return (
              <li key={i} className="flex items-start gap-2 text-[12px]">
                <span className="mt-0.5 shrink-0">
                  {active ? (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-line border-t-ink" />
                  ) : complete ? (
                    <span className="text-accent">✓</span>
                  ) : (
                    <span className="text-muted">·</span>
                  )}
                </span>
                <span className="flex-1">
                  <span className={complete ? "text-ink" : "text-muted"}>
                    {s.label}
                  </span>
                  {s.detail && (
                    <span className="ml-1 text-muted">- {s.detail}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
