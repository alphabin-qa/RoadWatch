// 3 SVG variations — inline, no assets. Deterministic per `variant`.

export default function PotholePhoto({
  variant = 1,
  className = "",
  label,
}: {
  variant?: 1 | 2 | 3 | number;
  className?: string;
  label?: string;
}) {
  const v = ((variant - 1) % 3) + 1;
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-line bg-subtle ${className}`}
    >
      <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden>
        {/* sky */}
        <defs>
          <linearGradient id={`sky-${v}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2f2f4" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <radialGradient id={`hole-${v}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#2b2b2b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0d0d0d" stopOpacity="0.95" />
          </radialGradient>
        </defs>
        <rect width="160" height="60" fill={`url(#sky-${v})`} />
        {/* road */}
        <path d="M40 120 L80 50 L120 120 Z" fill="#1a1a1a" />
        <g stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 6">
          <line x1="80" y1="55" x2="80" y2="120" />
        </g>
        {/* road edge */}
        <path d="M0 120 L40 120 L80 50 L120 120 L160 120" fill="none" stroke="#0d0d0d" strokeWidth="0.5" />

        {/* Variant-specific pothole(s) */}
        {v === 1 && (
          <g>
            <ellipse cx="82" cy="92" rx="16" ry="6" fill={`url(#hole-${v})`} />
            <ellipse cx="82" cy="91" rx="12" ry="3" fill="#000" opacity="0.7" />
          </g>
        )}
        {v === 2 && (
          <g>
            <ellipse cx="70" cy="85" rx="8" ry="3" fill={`url(#hole-${v})`} />
            <ellipse cx="95" cy="100" rx="14" ry="5" fill={`url(#hole-${v})`} />
            <ellipse cx="95" cy="99" rx="10" ry="2.5" fill="#000" opacity="0.75" />
          </g>
        )}
        {v === 3 && (
          <g>
            <path
              d="M62 110 Q80 90 100 108 Q92 118 76 116 Z"
              fill={`url(#hole-${v})`}
            />
            <path d="M70 95 L92 100 M72 102 L88 106" stroke="#0a0a0a" strokeWidth="0.5" />
          </g>
        )}

        {/* horizon buildings / trees silhouettes */}
        <g fill="#ececf1">
          <rect x="8" y="38" width="14" height="22" />
          <rect x="26" y="30" width="10" height="30" />
          <rect x="126" y="34" width="12" height="26" />
          <rect x="142" y="40" width="10" height="20" />
        </g>
      </svg>
      {label && (
        <div className="absolute bottom-1 left-1 rounded bg-ink/80 px-1.5 py-0.5 text-[9px] font-medium text-paper">
          {label}
        </div>
      )}
    </div>
  );
}
