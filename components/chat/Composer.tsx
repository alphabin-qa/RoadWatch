"use client";

import { useEffect, useRef, useState } from "react";
import { Locale, t } from "@/lib/i18n";
import { Icons } from "@/components/Illustration";
import CameraModal from "@/components/CameraModal";

export default function Composer({
  locale,
  onSend,
  onAttach,
  prefill,
}: {
  locale: Locale;
  onSend: (text: string) => void;
  onAttach: (file: File) => void;
  /** Paste text into the editor (e.g. when a starter chip is clicked). */
  prefill?: { text: string; nonce: number };
}) {
  const [value, setValue] = useState("");
  const [camOpen, setCamOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close the attach menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(e: PointerEvent) {
      if (!menuWrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // When a starter chip is clicked, drop its text into the editor and focus it
  // (cursor at the end) so the user can edit or just hit send.
  useEffect(() => {
    if (!prefill || !prefill.text) return;
    setValue(prefill.text);
    const el = textareaRef.current;
    if (el) {
      el.focus();
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = el.value.length;
      });
    }
  }, [prefill?.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setValue("");
  }

  function openCamera() {
    setMenuOpen(false);
    // On mobile, the native camera input is faster + better UX than our modal.
    // Detect a touch device with a coarse pointer; otherwise use the modal.
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) {
      cameraInputRef.current?.click();
    } else {
      setCamOpen(true);
    }
  }

  function openUpload() {
    setMenuOpen(false);
    photoInputRef.current?.click();
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    // Reset so picking the same file twice in a row still triggers onChange.
    e.target.value = "";
    if (!f) return;
    onAttach(f);
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="flex items-end gap-2 rounded-[26px] border border-line bg-paper px-2 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        {/* Photo → menu (capture screenshot / upload a photo) */}
        <div ref={menuWrapRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-subtle hover:text-ink ${
              menuOpen ? "bg-subtle text-ink" : "text-muted"
            }`}
            aria-label={t.attachImage[locale]}
            title={t.attachImage[locale]}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Icons.Camera />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute bottom-full left-0 z-20 mb-2 w-[min(15rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-paper p-1 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={openCamera}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] text-ink transition hover:bg-subtle"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-ink">
                  <Icons.Camera />
                </span>
                <span className="min-w-0 truncate">{t.captureScreenshot[locale]}</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={openUpload}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] text-ink transition hover:bg-subtle"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-ink">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                    <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
                    <path d="M4 17l5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="min-w-0 truncate">{t.uploadPhoto[locale]}</span>
              </button>
            </div>
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={t.placeholder[locale]}
          className="max-h-40 flex-1 resize-none bg-transparent px-1 py-2 text-[14px] outline-none focus:outline-none focus-visible:outline-none placeholder:text-muted"
        />

        <button
          type="submit"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition hover:opacity-90 disabled:opacity-30"
          disabled={!value.trim()}
          aria-label={t.send[locale]}
        >
          <Icons.Arrow />
        </button>

        {/* Hidden native camera input (mobile) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleInput}
        />

        {/* Hidden photo-library input (upload a photo) */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInput}
        />
      </form>

      <CameraModal
        open={camOpen}
        onClose={() => setCamOpen(false)}
        onCapture={onAttach}
        locale={locale}
      />
    </>
  );
}
