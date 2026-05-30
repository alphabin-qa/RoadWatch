import { Locale, t } from "@/lib/i18n";
import { stretch as sample } from "@/lib/sampleData";
import type { ResolvedStretch } from "@/lib/types";
import { Icons, IconBadge } from "@/components/Illustration";

export default function CrashCard({
  locale,
  stretch = sample,
}: {
  locale: Locale;
  stretch?: ResolvedStretch;
}) {
  const c = stretch.crashes ?? sample.crashes!;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <IconBadge tone="ink">
          <Icons.Warning />
        </IconBadge>
        <div className="text-[13px] font-medium text-ink">
          {t.crashHistory[locale]} · {c.year}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-px bg-line">
        {[
          { k: t.fatalities[locale], v: c.fatal },
          { k: t.injuries[locale], v: c.serious + c.minor },
          { k: "2W", v: "72%" },
        ].map((f) => (
          <div key={f.k} className="bg-paper px-4 py-3">
            <div className="text-[12px] font-medium tracking-wide text-muted">
              {f.k}
            </div>
            <div className="mt-1 text-[18px] tracking-tight text-ink">{f.v}</div>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1 px-4 py-3">
        {[8, 6, 12, 9, 14, 11, 7, 13, 18, 15, 10, 16].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h * 2}px` }}
            className="w-3 bg-ink opacity-70"
          />
        ))}
      </div>
      <div className="border-t border-line px-4 py-2 text-[11px] text-muted">
        Monthly incidents · 12 mo
      </div>
    </div>
  );
}
