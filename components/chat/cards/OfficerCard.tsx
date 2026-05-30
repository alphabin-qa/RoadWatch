import { Locale, t } from "@/lib/i18n";
import { stretch as sample } from "@/lib/sampleData";
import type { ResolvedStretch } from "@/lib/types";
import { Icons, IconBadge } from "@/components/Illustration";

export default function OfficerCard({
  locale,
  stretch = sample,
}: {
  locale: Locale;
  stretch?: ResolvedStretch;
}) {
  const o = stretch.officer;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <IconBadge tone="ink">
          <Icons.User />
        </IconBadge>
        <div className="text-[13px] font-medium text-ink">
          {t.officer[locale]}
        </div>
      </div>
      <div className="px-4 py-3 text-[13px]">
        <div className="text-ink">{o.name}</div>
        <div className="mt-0.5 text-[12px] text-muted">
          {o.designation} · {o.division}
        </div>
        <div className="mt-2 text-[12px] text-muted">{o.email}</div>
        <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">
          {t.sla[locale]} · {o.slaDays} {t.days[locale]}
        </div>
      </div>
    </div>
  );
}
