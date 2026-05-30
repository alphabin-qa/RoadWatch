// Inline SVG illustrations - no external image deps.

export function HeroRoad({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      className={className}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7f7f8" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="400" height="140" fill="url(#sky)" />
      <rect y="140" width="400" height="80" fill="#f2f2f4" />
      {/* road */}
      <path d="M140 220 L200 110 L260 220 Z" fill="#0d0d0d" opacity="0.9" />
      {/* dashed centerline */}
      <g stroke="#ffffff" strokeWidth="2" strokeDasharray="8 10">
        <line x1="200" y1="115" x2="200" y2="220" />
      </g>
      {/* horizon hills */}
      <path
        d="M0 140 Q80 110 160 135 T320 130 T400 140 L400 140 L0 140 Z"
        fill="#ececf1"
      />
      {/* sun */}
      <circle cx="310" cy="70" r="18" fill="#ececf1" />
    </svg>
  );
}

export function IconBadge({
  children,
  tone = "ink",
}: {
  children: React.ReactNode;
  tone?: "ink" | "accent" | "muted";
}) {
  const bg =
    tone === "ink" ? "bg-ink text-paper" : tone === "accent" ? "bg-accent text-paper" : "bg-subtle text-ink";
  return (
    <div className={`flex h-7 w-7 items-center justify-center rounded-md ${bg}`}>
      {children}
    </div>
  );
}

export function MapThumb({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <rect width="120" height="80" fill="#f7f7f8" />
      <path
        d="M0 55 Q30 40 55 50 T100 45 L120 48"
        stroke="#0d0d0d"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M20 80 L35 20 L55 80"
        stroke="#ececf1"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="55" cy="50" r="3" fill="#10a37f" />
    </svg>
  );
}

export function Heatmap({ className = "" }: { className?: string }) {
  const cells = Array.from({ length: 96 }).map((_, i) => {
    // deterministic pseudo-noise for heatmap feel
    const v = Math.abs(Math.sin(i * 12.9898) * 10) % 1;
    return v;
  });
  return (
    <svg viewBox="0 0 240 120" className={className} aria-hidden>
      <rect width="240" height="120" fill="#ffffff" />
      {cells.map((v, i) => {
        const x = (i % 12) * 20;
        const y = Math.floor(i / 12) * 15;
        const opacity = v < 0.2 ? 0.06 : v < 0.5 ? 0.18 : v < 0.8 ? 0.4 : 0.75;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width="18"
            height="13"
            fill="#0d0d0d"
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}

/* tiny icons used in cards */
export const Icons = {
  Road: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M7 3 L4 21 M17 3 L20 21 M12 3 L12 7 M12 11 L12 15 M12 19 L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Rupee: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M7 5h10M7 9h10M9 5c5 0 5 8 0 8H7l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l8 3v5c0 5-4 9-8 10-4-1-8-5-8-10V6l8-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  Warning: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 L22 20 H2 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M12 10v4M12 17v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Cloud: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M7 17h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A4 4 0 0 0 7 17z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  Leaf: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 19c0-8 6-14 15-14-1 9-6 14-14 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M5 19 L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Mic: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M5 11c0 4 3 7 7 7s7-3 7-7M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Camera: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="13.5" r="3.5" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 7l2-3h4l2 3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};
