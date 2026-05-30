"use client";

/** Follow-up suggestion chips shown under an assistant answer. */
export default function Suggestions({
  items,
  onPick,
}: {
  items: string[];
  onPick: (text: string) => void;
}) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {items.map((s) => (
        <button
          key={s}
          onClick={() => onPick(s)}
          className="rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] text-ink transition hover:border-ink/20 hover:bg-subtle"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
