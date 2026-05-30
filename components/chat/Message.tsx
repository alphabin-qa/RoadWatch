import { Fragment } from "react";
import { CardKind } from "@/lib/sampleData";
import type { ResolvedStretch, FiledInfo, ReasoningStep } from "@/lib/types";
import { Locale, t } from "@/lib/i18n";
import { formatLatLng, type LatLng } from "@/lib/exifLocation";
import type { ComplaintDraft } from "./cards/ComplaintCard";
import ReasoningTrace from "./ReasoningTrace";
import Suggestions from "./Suggestions";

function renderInlineBold(text: string) {
  // Split on **...** and wrap matched runs in <strong>.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}
import AttributionCard from "./cards/AttributionCard";
import BudgetCard from "./cards/BudgetCard";
import OfficerCard from "./cards/OfficerCard";
import ComplaintCard from "./cards/ComplaintCard";
import TrackingCard from "./cards/TrackingCard";
import CrashCard from "./cards/CrashCard";
import CostCard from "./cards/CostCard";
import MonsoonCard from "./cards/MonsoonCard";
import DossierCard from "./cards/DossierCard";

export type Msg = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  card?: CardKind;
  imageUrl?: string;
  location?: LatLng;
  resolvedDisplay?: string;
  variant?: "default" | "error";
  /** resolved road data for the card; falls back to the sample stretch when absent */
  stretch?: ResolvedStretch;
  /** populated on a tracking card once a complaint was actually filed */
  filed?: FiledInfo;
  /** agent-style reasoning steps shown above the reply */
  reasoning?: ReasoningStep[];
  /** follow-up suggestion chips shown under the reply */
  suggestions?: string[];
};

export default function Message({
  m,
  locale,
  onFileComplaint,
  onSuggestion,
}: {
  m: Msg;
  locale: Locale;
  onFileComplaint?: (
    s: ResolvedStretch,
    draft: ComplaintDraft,
  ) => Promise<FiledInfo | null>;
  onSuggestion?: (text: string) => void;
}) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[85%] flex-col items-end gap-2">
          {m.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-line">
              <img
                src={m.imageUrl}
                alt="attachment"
                className="max-h-72 object-cover"
              />
              {(m.resolvedDisplay || m.location) && (
                <div className="border-t border-line bg-paper px-2 py-1.5">
                  {m.resolvedDisplay && (
                    <div className="flex items-center gap-1 text-[12px] text-ink">
                      📍 <span className="truncate">{m.resolvedDisplay}</span>
                    </div>
                  )}
                  {m.location && (
                    <div className="text-[10px] text-muted">
                      <span className="font-mono">
                        {formatLatLng(m.location)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {m.text && (
            <div className="rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-[14px] leading-snug text-paper">
              {m.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  const isTyping = !m.text && !m.card && !m.reasoning;

  return (
    <div className="flex gap-3">
      <img
        src="/icon-192.png"
        alt="RoadWatch"
        className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-line object-cover"
      />
      <div className="flex-1 space-y-3">
        {m.reasoning && m.reasoning.length > 0 && (
          <ReasoningTrace steps={m.reasoning} />
        )}
        {isTyping && (
          <div className="inline-flex items-center gap-1 py-2">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
          </div>
        )}
        {m.text && (
          <div
            className={
              m.variant === "error"
                ? "text-[14px] leading-relaxed text-warn"
                : "text-[14px] leading-relaxed text-ink"
            }
          >
            {renderInlineBold(m.text)}
          </div>
        )}
        {m.card === "attribution" && <AttributionCard locale={locale} stretch={m.stretch} />}
        {m.card === "budget" && <BudgetCard locale={locale} stretch={m.stretch} />}
        {m.card === "officer" && <OfficerCard locale={locale} stretch={m.stretch} />}
        {m.card === "complaint" && (
          <ComplaintCard locale={locale} stretch={m.stretch} onFile={onFileComplaint} />
        )}
        {m.card === "tracking" && <TrackingCard locale={locale} filed={m.filed} />}
        {m.card === "crash" && <CrashCard locale={locale} stretch={m.stretch} />}
        {m.card === "cost" && <CostCard locale={locale} stretch={m.stretch} />}
        {m.card === "monsoon" && <MonsoonCard locale={locale} stretch={m.stretch} />}
        {m.card === "dossier" && <DossierCard locale={locale} stretch={m.stretch} />}
        {m.suggestions && m.suggestions.length > 0 && onSuggestion && (
          <Suggestions items={m.suggestions} onPick={onSuggestion} />
        )}
      </div>
    </div>
  );
}
