"use client";

import { Suspense, useState } from "react";
import Shell from "@/components/Shell";
import Chat from "@/components/chat/Chat";
import { Locale, t } from "@/lib/i18n";

export default function CitizenPage() {
  const [locale, setLocale] = useState<Locale>("en");
  return (
    <Shell
      locale={locale}
      onLocale={setLocale}
      topbar={
        <div className="flex items-center gap-2">
          <div className="text-[14px] font-medium tracking-tight">
            {t.appName[locale]}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t.online[locale]}
          </span>
        </div>
      }
    >
      <Suspense fallback={<div className="h-full" />}>
        <Chat locale={locale} variant="citizen" />
      </Suspense>
    </Shell>
  );
}
