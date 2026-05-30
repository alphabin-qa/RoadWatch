import { Locale, t } from "@/lib/i18n";
import { stretch as sample } from "@/lib/sampleData";
import type { ResolvedStretch } from "@/lib/types";
import { Icons, IconBadge } from "@/components/Illustration";

export default function CostCard({
  locale,
  stretch = sample,
}: {
  locale: Locale;
  stretch?: ResolvedStretch;
}) {
  const c = stretch.cost ?? sample.cost!;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <IconBadge tone="ink">
          <Icons.Leaf />
        </IconBadge>
        <div className="text-[13px] font-medium text-ink">
          {t.costOfBadRoad[locale]}
        </div>
      </div>
      <div className="bg-gradient-to-br from-ai/5 to-transparent px-4 py-3">
        <div className="text-[13px] font-medium tracking-wide text-muted">
          ₹ {t.perDay[locale]}
        </div>
        <div className="mt-1 text-[28px] tracking-tight text-ink">
          ₹{c.inrPerDay.toLocaleString("en-IN")}
        </div>
        <div className="mt-1 text-[11px] text-muted">
          ≈ {c.inrPerYear} {t.perYear[locale]}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-line">
        {[
          { k: "Fuel", v: `+${c.fuelLitres} L/day` },
          { k: "CO₂", v: `${c.co2Kg} kg/day` },
          { k: "Noise", v: `${c.noiseEvents} events` },
          { k: "Time", v: `${c.hoursLost} hrs lost` },
        ].map((f) => (
          <div key={f.k} className="bg-paper px-4 py-3">
            <div className="text-[12px] font-medium tracking-wide text-muted">
              {f.k}
            </div>
            <div className="mt-1 text-[13px] tracking-tight text-ink">{f.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
