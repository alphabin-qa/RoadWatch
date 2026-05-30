"use client";

import { useDemoMode, setDemoMode } from "@/lib/demoMode";
import { Locale, t } from "@/lib/i18n";

export default function DemoToggle({ locale }: { locale: Locale }) {
  const demo = useDemoMode();
  return (
    <button
      onClick={() => setDemoMode(!demo)}
      title={demo ? t.demoOnTip[locale] : t.liveOnTip[locale]}
      className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium transition ${
        demo
          ? "border-line bg-subtle text-muted hover:text-ink"
          : "border-accent/30 bg-accent/10 text-accent"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          demo ? "bg-muted" : "bg-accent"
        }`}
      />
      {demo ? t.demoMode[locale] : t.liveMode[locale]}
    </button>
  );
}
