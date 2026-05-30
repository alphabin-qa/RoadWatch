import { Locale, t } from "@/lib/i18n";
import { stretch as sample } from "@/lib/sampleData";
import type { ResolvedStretch } from "@/lib/types";
import { Icons, IconBadge, MapThumb } from "@/components/Illustration";

export default function AttributionCard({
  locale,
  stretch = sample,
}: {
  locale: Locale;
  stretch?: ResolvedStretch;
}) {
  const s = stretch;
  const warranty = s.dlpActive
    ? `${t.warrantyActive[locale]} · ${s.dlpUntil}`
    : t.warrantyExpired[locale];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <IconBadge tone="ink">
            <Icons.Road />
          </IconBadge>
          <div>
            <div className="text-[13px] font-medium text-ink">{s.display}</div>
            <div className="text-[11px] text-muted">
              {s.roadClassLabel} · {s.chainage}
            </div>
          </div>
        </div>
        <MapThumb className="h-10 w-16 rounded-md border border-line" />
      </div>

      {s.hasContract ? (
        <div className="grid grid-cols-2 gap-px bg-line">
          {[
            { k: t.roadType[locale], v: s.roadClass },
            { k: t.lastRelay[locale], v: s.lastRelay },
            { k: t.contractor[locale], v: s.contractor },
            { k: t.warranty[locale], v: warranty, accent: s.dlpActive },
          ].map((f) => (
            <div key={f.k} className="bg-paper px-4 py-3">
              <div className="text-[12px] font-medium tracking-wide text-muted">
                {f.k}
              </div>
              <div
                className={`mt-1 text-[13px] tracking-tight ${
                  f.accent ? "text-accent" : "text-ink"
                }`}
              >
                {f.v}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-3 text-[12px] text-muted">
          {t.noContract[locale]}
        </div>
      )}
    </div>
  );
}
