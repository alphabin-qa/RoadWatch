import type { ReactNode } from "react";

/** Bare RoadWatch mark (no background box) — inherits color via currentColor. */
function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path
        d="M7 25 L16 7 L25 25"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="20.5" r="1.9" fill="currentColor" />
    </svg>
  );
}

/**
 * Supabase-style split auth layout:
 *  - Left  : the Clerk sign-in / sign-up card
 *  - Right : a branded product preview (defect images faded in the background)
 * The right pane is hidden on small screens so the form stays usable on mobile.
 */
export default function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-dvh grid-cols-1 bg-canvas lg:grid-cols-2">
      {/* Left — auth */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center gap-2 text-ink">
          <Mark className="h-7 w-7" />
          <span className="text-[18px] font-semibold tracking-tight">
            RoadWatch
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-[400px]">
            <h1 className="text-[26px] font-semibold tracking-tight text-ink">
              {title}
            </h1>
            <p className="mt-1.5 text-[14px] text-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted lg:text-left">
          Road accountability for every citizen.
        </p>
      </div>

      {/* Right — branded product preview */}
      <div className="relative hidden overflow-hidden bg-ink p-10 lg:flex lg:flex-col lg:justify-center">
        {/* defect collage faded in the background */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-25">
          <img src="/defects/pothole-1.jpg" alt="" className="h-full w-full object-cover" />
          <img src="/defects/waterlogging.jpg" alt="" className="h-full w-full object-cover" />
          <img src="/defects/guardrail-missing.jpg" alt="" className="h-full w-full object-cover" />
          <img src="/defects/bleeding-cracking.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/85" />

        {/* preview card */}
        <div className="relative mx-auto w-full max-w-[470px] rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm">
          {/* brand */}
          <div className="flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Mark className="h-5 w-5" />
            </span>
            <span className="text-[16px] font-semibold tracking-tight">RoadWatch</span>
          </div>

          {/* headline */}
          <h2 className="mt-6 text-[30px] font-semibold leading-[1.1] tracking-tight text-white">
            Hold every road to account.
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-white/65">
            Snap a pothole. RoadWatch traces who built the road, the budget
            spent, the warranty, and the officer responsible — then files your
            complaint in one tap.
          </p>

          {/* "From one photo, RoadWatch found" panel */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center gap-2 text-[12px] text-emerald-300/80">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="8.5" cy="9.5" r="1.4" fill="currentColor" />
                <path d="M4 17l5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              From one photo, RoadWatch found
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { k: "Road type", v: "State Highway (SH-41)", accent: false },
                { k: "Contractor", v: "Sterling Infra Pvt Ltd", accent: false },
                { k: "Amount sanctioned", v: "₹4.2 crore", accent: false },
                { k: "Warranty", v: "Active · till 2027", accent: true },
              ].map((f) => (
                <div key={f.k} className="rounded-xl bg-white/[0.04] px-3 py-2.5">
                  <div className="text-[11px] text-white/45">{f.k}</div>
                  <div
                    className={`mt-0.5 text-[13px] font-medium ${
                      f.accent ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {f.v}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[12px] text-amber-300/90">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M3 12l17-8-6 17-3-7-8-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
              Routed to Executive Engineer, PWD Division 12
            </div>
          </div>

          {/* step icons */}
          <div className="mt-6 grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Snap", icon: (
                <><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 7l1.5-2.5h5L16 7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></>
              ) },
              { label: "Trace", icon: (
                <><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" /><path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>
              ) },
              { label: "Verify", icon: (
                <><path d="M12 3l8 3v5c0 5-4 9-8 10-4-1-8-5-8-10V6l8-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>
              ) },
              { label: "Escalate", icon: (
                <path d="M3 12l17-8-6 17-3-7-8-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              ) },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{s.icon}</svg>
                </span>
                <span className="text-[12px] text-white/80">{s.label}</span>
              </div>
            ))}
          </div>

          {/* chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {["Contractor", "Budget", "Warranty", "Officer", "Escalation"].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-3 py-1 text-[12px] text-white/85"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* stats */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            {[
              { n: "12,400+", l: "potholes reported" },
              { n: "3,100", l: "complaints escalated" },
              { n: "47", l: "contractors flagged" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-[20px] font-semibold tracking-tight text-white">
                  {s.n}
                </div>
                <div className="text-[11px] leading-tight text-white/50">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
