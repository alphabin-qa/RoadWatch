import type { ReactNode } from "react";
import Logo from "./Logo";

/**
 * Split auth layout:
 *  - Left  (35%): the Clerk sign-in / sign-up card
 *  - Right (65%): an image-forward brand panel - a grid of real road-defect
 *                 photography with a floating "who built this road" dashboard
 *                 and a couple of example prompt chips layered on top.
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
    <div className="grid min-h-dvh grid-cols-1 bg-canvas lg:grid-cols-[35fr_65fr]">
      {/* Left - auth */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center gap-2 text-ink">
          <Logo className="h-7 w-7" />
          <span className="text-[26px] font-semibold leading-none tracking-tight">
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

      {/* Right - image-forward brand panel */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        {/* full-bleed grid of real road-defect photography */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <img
            src="/defects/pothole-1.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
          <img
            src="/defects/mountain-road.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
          <img
            src="/defects/waterlogging.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
          <img
            src="/defects/pothole-2.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        {/* legibility scrim - darken the photos so the floating UI reads clearly */}
        <div className="absolute inset-0 bg-ink/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/50" />

        {/* layered product story */}
        <div className="relative flex h-full flex-col justify-center px-10 py-12 xl:px-16">
          <div className="mx-auto w-full max-w-[560px]">
            <h2 className="text-center text-[30px] font-semibold leading-[1.12] tracking-tight text-white xl:text-[34px]">
              Find out who built your road -{" "}
              <span className="text-amber-400">and hold them to it.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-[440px] text-center text-[14px] leading-relaxed text-white/70">
              Snap a pothole. RoadWatch traces the contractor, the budget, the
              warranty, and the officer responsible.
            </p>

            {/* floating "accountability dossier" dashboard card */}
            <div className="mt-9 overflow-hidden rounded-2xl border border-white/10 bg-paper shadow-[0_24px_70px_-20px_rgba(0,0,0,0.7)]">
              {/* card header */}
              <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-paper">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="leading-tight">
                  <div className="text-[13px] font-semibold text-ink">
                    Road accountability
                  </div>
                  <div className="text-[11px] text-muted">
                    Anand Vihar Road, Delhi · NH-24
                  </div>
                </div>
                <span className="ml-auto rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
                  Warranty active
                </span>
              </div>

              {/* contractor row */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ai/10 text-[14px] font-bold text-ai">
                  A
                </span>
                <div className="min-w-0 leading-tight">
                  <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
                    Built by
                  </div>
                  <div className="truncate text-[15px] font-semibold text-ink">
                    ABC Infrastructure Private Limited
                  </div>
                </div>
              </div>

              {/* detail grid */}
              <div className="grid grid-cols-3 divide-x divide-line border-t border-line">
                {[
                  { l: "Sanctioned", v: "₹4.2 cr" },
                  { l: "Last relaid", v: "Aug 2023" },
                  { l: "Warranty", v: "till 2027" },
                ].map((d) => (
                  <div key={d.l} className="px-4 py-3">
                    <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                      {d.l}
                    </div>
                    <div className="mt-0.5 text-[14px] font-semibold text-ink">
                      {d.v}
                    </div>
                  </div>
                ))}
              </div>

              {/* responsible officer */}
              <div className="flex items-center gap-2 border-t border-line bg-subtle px-4 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-[12px] text-muted">
                  Responsible:{" "}
                  <span className="font-medium text-ink">
                    Executive Engineer, PWD Division 12
                  </span>
                </span>
              </div>
            </div>

            {/* example prompt chips */}
            <div className="mx-auto mt-6 flex max-w-[520px] flex-col gap-2.5">
              <div className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">
                Just ask
              </div>
              {[
                "Can you tell me who built this road?",
                "Can you check my complaint status on Anand Vihar Road?",
              ].map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-left backdrop-blur-sm"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="shrink-0 text-amber-400"
                  >
                    <path
                      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[13px] text-white/90">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
