"use client";

import { useState } from "react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AdminCommandBar from "@/components/admin/AdminCommandBar";
import {
  KPIRow,
  ComplaintsTable,
  CostHeatmap,
  ContractorScorecard,
} from "@/components/admin/Widgets";
import { Locale, t } from "@/lib/i18n";

export default function AdminPage() {
  const [locale, setLocale] = useState<Locale>("en");
  return (
    <div className="min-h-dvh bg-subtle">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-ink" />
              <div className="text-[14px] font-medium tracking-tight">
                {t.appName[locale]}
              </div>
            </Link>
            <span className="rounded-full border border-line px-2 py-0.5 text-[12px] font-medium tracking-wide text-muted">
              {t.adminTag[locale]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher value={locale} onChange={setLocale} />
            <Link
              href="/"
              className="rounded-full border border-line px-3 py-1 text-[12px] text-muted transition hover:text-ink"
            >
              ← Citizen
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
        <div>
          <p className="text-[13px] font-medium tracking-[0.04em] text-muted">
            District dashboard
          </p>
          <h1 className="mt-1 text-[26px] leading-tight tracking-tight">
            {t.adminTitle[locale]}
          </h1>
        </div>

        <AdminCommandBar locale={locale} />

        <div className="pt-2">
          <KPIRow locale={locale} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          <ComplaintsTable locale={locale} />
          <CostHeatmap locale={locale} />
        </div>

        <ContractorScorecard />
      </main>
    </div>
  );
}
