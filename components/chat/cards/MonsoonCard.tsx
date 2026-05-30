import { Locale, t } from "@/lib/i18n";
import { stretch as sample } from "@/lib/sampleData";
import type { ResolvedStretch } from "@/lib/types";
import { Icons, IconBadge } from "@/components/Illustration";

export default function MonsoonCard({
  locale,
  stretch = sample,
}: {
  locale: Locale;
  stretch?: ResolvedStretch;
}) {
  const { current, forecast } = stretch.monsoon ?? sample.monsoon!;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <IconBadge tone="ink">
          <Icons.Cloud />
        </IconBadge>
        <div className="text-[13px] font-medium text-ink">
          {t.monsoonWatch[locale]}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-line">
        <div className="bg-paper px-4 py-4">
          <div className="text-[12px] font-medium tracking-wide text-muted">
            {t.now[locale]}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div
              className="rounded bg-ink"
              style={{ width: current.w / 2, height: current.l / 3 }}
            />
            <div className="text-[11px] text-muted">
              {current.w}×{current.l} cm<br />
              {current.d} mm
            </div>
          </div>
        </div>
        <div className="bg-paper px-4 py-4">
          <div className="inline-flex items-center gap-1 rounded-full bg-ai/10 px-2 py-0.5 text-[12px] font-medium tracking-wide text-ai">
            <span className="h-1.5 w-1.5 rounded-full bg-ai" />
            {t.bySep[locale]}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div
              className="rounded bg-ink"
              style={{ width: forecast.w / 2, height: forecast.l / 3 }}
            />
            <div className="text-[11px] text-muted">
              {forecast.w}×{forecast.l} cm<br />
              {forecast.d} mm
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-4 py-2 text-[11px] text-muted">
        +4× area · +3× depth · High confidence
      </div>
    </div>
  );
}
