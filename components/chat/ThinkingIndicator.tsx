"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/lib/i18n";

// AI-style "working" phrases, cycled while the assistant composes a reply.
const PHRASES: Record<Locale, string[]> = {
  en: [
    "Analysing your request…",
    "Cross-checking municipal records…",
    "Tracing the contractor…",
    "Compiling the dossier…",
    "Verifying the details…",
  ],
  hi: [
    "आपके अनुरोध का विश्लेषण कर रहे हैं…",
    "नगरपालिका रिकॉर्ड जाँच रहे हैं…",
    "ठेकेदार का पता लगा रहे हैं…",
    "डोज़ियर तैयार कर रहे हैं…",
    "विवरण सत्यापित कर रहे हैं…",
  ],
  ta: [
    "உங்கள் கோரிக்கையை பகுப்பாய்வு செய்கிறோம்…",
    "நகராட்சி பதிவுகளை சரிபார்க்கிறோம்…",
    "ஒப்பந்ததாரரைக் கண்டறிகிறோம்…",
    "தொகுப்பைத் தயாரிக்கிறோம்…",
    "விவரங்களைச் சரிபார்க்கிறோம்…",
  ],
};

/** Spinner + rotating status text shown while the assistant "thinks". */
export default function ThinkingIndicator({ locale }: { locale: Locale }) {
  const phrases = PHRASES[locale];
  const [i, setI] = useState(0);

  useEffect(() => {
    // Start on a random phrase so repeated questions don't read identically.
    setI(Math.floor(Math.random() * phrases.length));
    const id = setInterval(() => setI((n) => n + 1), 850);
    return () => clearInterval(id);
  }, [phrases.length]);

  return (
    <div className="inline-flex items-center gap-2 py-2 text-[13px] text-muted">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-ink" />
      <span>{phrases[i % phrases.length]}</span>
    </div>
  );
}
