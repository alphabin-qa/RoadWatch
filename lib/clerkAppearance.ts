import type { Appearance } from "@clerk/types";

/**
 * Shared appearance for Clerk <SignIn /> and <SignUp />.
 *
 * The auth card lives inside a fixed `max-w-[400px]` column (see AuthShell),
 * so every interactive element must be `w-full` + `box-border` — otherwise
 * Clerk's default intrinsic widths overflow the column and the right edge of
 * the email input / buttons gets clipped.
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#0a0a0a",
    colorText: "#0a0a0a",
    colorTextSecondary: "#6b6357",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0a0a0a",
    borderRadius: "0.625rem",
    fontFamily: "inherit",
  },
  elements: {
    // Layout — keep the card transparent and edge-to-edge inside our column.
    rootBox: "w-full",
    cardBox: "w-full max-w-full shadow-none",
    card: "w-full max-w-full shadow-none border-none bg-transparent p-0 gap-5",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",

    // Make every field-level element fill the column without overflowing.
    main: "w-full gap-4",
    form: "w-full gap-4",
    formField: "w-full",
    formFieldRow: "w-full",
    formFieldInput:
      "w-full box-border h-11 rounded-lg border border-line bg-white px-3.5 text-[14px] text-ink placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-ink/10 transition",
    formButtonPrimary:
      "w-full box-border h-11 rounded-lg bg-ink text-white text-[14px] font-medium normal-case shadow-none hover:bg-ink/90 transition",

    // Social / OAuth buttons.
    socialButtons: "w-full gap-2",
    socialButtonsBlockButton:
      "w-full box-border h-11 rounded-lg border border-line bg-white text-[14px] font-medium text-ink hover:bg-subtle transition",
    socialButtonsBlockButtonText: "text-[14px] font-medium",

    dividerRow: "w-full my-1",
    dividerLine: "bg-line",
    dividerText: "text-[12px] text-muted",

    formFieldLabel: "text-[13px] font-medium text-ink",
    identityPreview: "w-full box-border rounded-lg border border-line bg-white",
    otpCodeFieldInput: "border border-line rounded-lg text-ink",

    footer: "bg-transparent",
    footerAction: "justify-center",
    footerActionText: "text-[13px] text-muted",
    footerActionLink: "text-[13px] font-medium text-ink hover:text-ink/80",
  },
};
