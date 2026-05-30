import { Locale, t } from "@/lib/i18n";
import { stretch as sample } from "@/lib/sampleData";
import type { ResolvedStretch } from "@/lib/types";
import { Icons, IconBadge, MapThumb } from "@/components/Illustration";

/**
 * The full "who built this road" dossier shown after a photo + GPS resolve:
 * road, contractor, work dates, license, owner, tender - every field the
 * proposal's accountability flow calls for, on one card.
 */
export default function DossierCard({
  locale,
  stretch = sample,
}: {
  locale: Locale;
  stretch?: ResolvedStretch;
}) {
  const s = stretch;
  const rows: { k: string; v: string; accent?: boolean }[] = [
    { k: t.roadName[locale], v: s.roadName ?? s.display },
    { k: t.roadType[locale], v: `${s.roadClassLabel} (${s.roadClass})` },
    { k: t.contractor[locale], v: s.contractor },
    { k: t.workDone[locale], v: s.workDate ?? s.lastRelay },
  ];
  const lic = s.license;
  const owner = s.owner;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      {/* Header with live GPS */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <IconBadge tone="ink">
            <Icons.Road />
          </IconBadge>
          <div>
            <div className="text-[13px] font-medium text-ink">
              {s.roadName ?? s.display}
            </div>
            {s.gps && (
              <div className="flex items-center gap-1 text-[11px] text-muted">
                <span className="text-accent">📍</span>
                <span className="font-mono">
                  {s.gps.lat.toFixed(4)}, {s.gps.lng.toFixed(4)}
                </span>
                {s.gps.live && (
                  <span className="ml-1 rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] text-accent">
                    {t.liveGps[locale]}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <MapThumb className="h-10 w-16 rounded-md border border-line" />
      </div>

      {/* Road + contractor */}
      <div className="grid grid-cols-2 gap-px bg-line">
        {rows.map((f) => (
          <div key={f.k} className="bg-paper px-4 py-2.5">
            <div className="text-[11px] font-medium tracking-wide text-muted">
              {f.k}
            </div>
            <div className="mt-0.5 text-[13px] tracking-tight text-ink">
              {f.v}
            </div>
          </div>
        ))}
      </div>

      {/* License */}
      {lic && (
        <div className="border-t border-line px-4 py-3">
          <div className="mb-1 flex items-center gap-2 text-[12px] font-medium text-ink">
            <Icons.Shield />
            {t.contractorLicense[locale]}
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${
                lic.valid
                  ? "bg-accent/10 text-accent"
                  : "bg-[#b45309]/10 text-[#b45309]"
              }`}
            >
              {lic.valid ? t.valid[locale] : t.expired[locale]}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
            <Field k={t.licenseNo[locale]} v={lic.no} />
            <Field k={t.licenseClass[locale]} v={lic.class} />
            <Field k={t.issued[locale]} v={lic.issued} />
            <Field k={t.renewed[locale]} v={lic.renewed} />
            <Field k={t.validTill[locale]} v={lic.validTill} />
          </div>
        </div>
      )}

      {/* Owner */}
      {owner && (
        <div className="flex items-center gap-2 border-t border-line px-4 py-3 text-[12px]">
          <IconBadge tone="ink">
            <Icons.User />
          </IconBadge>
          <div>
            <div className="text-ink">
              {owner.name} · <span className="text-muted">{owner.role}</span>
            </div>
            <div className="text-[11px] text-muted">{owner.group}</div>
          </div>
          <a
            href={s.tenderUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[11px] text-muted underline underline-offset-4"
          >
            {t.tender[locale]} {s.tenderId}
          </a>
        </div>
      )}

      {/* Admin disclaimer */}
      <div className="flex items-start gap-1.5 border-t border-line bg-subtle px-4 py-2 text-[10px] leading-snug text-muted">
        <span aria-hidden>ⓘ</span>
        <span>{t.verificationDisabled[locale]}</span>
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="text-muted">{k}: </span>
      <span className="text-ink">{v}</span>
    </div>
  );
}
