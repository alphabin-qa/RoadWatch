import { Locale, t } from "@/lib/i18n";
import { stretch as sample } from "@/lib/sampleData";
import type { ResolvedStretch } from "@/lib/types";
import { Icons, IconBadge } from "@/components/Illustration";

export default function BudgetCard({
  locale,
  stretch = sample,
}: {
  locale: Locale;
  stretch?: ResolvedStretch;
}) {
  const s = stretch;
  const overNorm = /over/i.test(s.flag);

  if (!s.hasContract) {
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-paper">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <IconBadge tone="ink">
            <Icons.Rupee />
          </IconBadge>
          <div className="text-[13px] font-medium text-ink">{t.budget[locale]}</div>
        </div>
        <div className="px-4 py-3 text-[12px] text-muted">{t.noContract[locale]}</div>
      </div>
    );
  }

  const fields: { k: string; v: string; warn?: boolean }[] = [
    { k: t.sanctioned[locale], v: s.sanctioned },
    { k: t.spent[locale], v: s.spent },
    { k: t.norm[locale], v: s.flag, warn: overNorm },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <IconBadge tone="ink">
          <Icons.Rupee />
        </IconBadge>
        <div className="text-[13px] font-medium text-ink">Tender {s.tenderId}</div>
      </div>
      <div className="grid grid-cols-3 gap-px bg-line">
        {fields.map((f) => (
          <div key={f.k} className="bg-paper px-4 py-3">
            <div className="text-[12px] font-medium tracking-wide text-muted">
              {f.k}
            </div>
            <div className="mt-1 text-[13px] tracking-tight text-ink">
              {f.v}
              {f.warn && (
                <span className="ml-1 inline-flex align-middle text-[#b45309]">
                  <Icons.Warning />
                </span>
              )}
            </div>
            {s.tenderUrl ? (
              <a
                href={s.tenderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-[10px] text-muted underline underline-offset-4"
              >
                {t.source[locale]}
              </a>
            ) : (
              <span className="mt-1 block text-[10px] text-muted/60">
                {t.source[locale]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
