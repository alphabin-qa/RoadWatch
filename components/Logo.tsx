/**
 * RoadWatch mark - an eye whose pupil is the vanishing point of a road.
 * Transparent background; the "ink" inherits `currentColor` so it flips
 * between light and dark surfaces. The iris keeps the brand amber.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="none" className={className} aria-hidden>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M96 248 Q256 132 416 248" strokeWidth="30" />
        <path d="M96 248 Q256 360 416 248" strokeWidth="30" />
      </g>
      <path d="M234 300 L278 300 L362 412 L150 412 Z" fill="currentColor" />
      <line
        x1="256"
        y1="314"
        x2="256"
        y2="402"
        stroke="#F4A526"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="20 16"
      />
      <circle cx="256" cy="236" r="42" fill="#F4A526" />
      <circle cx="256" cy="236" r="54" fill="none" stroke="currentColor" strokeWidth="12" />
      <circle cx="273" cy="221" r="9" fill="#ffffff" opacity="0.92" />
    </svg>
  );
}
