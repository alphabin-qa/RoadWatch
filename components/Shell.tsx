"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import DemoToggle from "./DemoToggle";
import { Locale } from "@/lib/i18n";

export default function Shell({
  children,
  locale,
  onLocale,
  topbar,
}: {
  children: React.ReactNode;
  locale: Locale;
  onLocale: (l: Locale) => void;
  topbar?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-dvh bg-paper">
      <Sidebar
        locale={locale}
        onLocale={onLocale}
        open={open}
        onClose={() => setOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-line px-3 py-2 md:px-4">
          <button
            onClick={() => setOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-subtle md:hidden"
            aria-label="menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <img
            src="/icon-192.png"
            alt="RoadWatch"
            className="h-7 w-7 rounded-lg md:hidden"
          />
          <div className="min-w-0 flex-1">{topbar}</div>
          <DemoToggle locale={locale} />
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
