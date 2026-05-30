import { Status, statusLabel, statusTone } from "@/lib/sampleData";

const toneClass: Record<string, string> = {
  neutral: "bg-subtle text-muted border-line",
  info: "bg-[#eff6ff] text-[#1d4ed8] border-[#dbeafe]",
  accent: "bg-[#ecfdf5] text-[#047857] border-[#d1fae5]",
  amber: "bg-[#fffbeb] text-[#b45309] border-[#fde68a]",
  success: "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]",
  danger: "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]",
};

export default function StatusBadge({
  status,
  size = "sm",
}: {
  status: Status;
  size?: "sm" | "xs";
}) {
  const tone = statusTone(status);
  const px = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${toneClass[tone]} ${px}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "accent"
            ? "bg-[#10a37f]"
            : tone === "amber"
              ? "bg-[#d97706]"
              : tone === "success"
                ? "bg-[#059669]"
                : tone === "danger"
                  ? "bg-[#dc2626]"
                  : tone === "info"
                    ? "bg-[#2563eb]"
                    : "bg-muted"
        }`}
      />
      {statusLabel(status)}
    </span>
  );
}
