"use client";

import { useEffect, useRef, useState } from "react";
import { Locale, t } from "@/lib/i18n";
import { Icons } from "@/components/Illustration";
import CameraModal from "@/components/CameraModal";

export default function Composer({
  locale,
  onSend,
  prefill,
}: {
  locale: Locale;
  /** Send the composed message: the typed text and/or a staged image. */
  onSend: (text: string, image?: File) => void;
  /** Paste text into the editor (e.g. when a starter chip is clicked). */
  prefill?: { text: string; nonce: number };
}) {
  const [value, setValue] = useState("");
  const [camOpen, setCamOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // A picked/captured photo waits here until the user actually hits send.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
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

  // Revoke the preview object URL when it is replaced or on unmount.
  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

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

  // Stage a photo in the composer instead of sending it right away.
  function stageFile(f: File) {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(f);
    setPendingUrl(URL.createObjectURL(f));
    textareaRef.current?.focus();
  }

  function clearPending() {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(null);
    setPendingUrl(null);
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const v = value.trim();
    if (!v && !pendingFile) return;
    onSend(v, pendingFile ?? undefined);
    setValue("");
    // The message bubble reuses the file; just drop our refs (don't revoke,
    // the preview URL is no longer shown here anyway).
    setPendingFile(null);
    setPendingUrl(null);
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
    stageFile(f);
  }

  const canSend = Boolean(value.trim() || pendingFile);

  return (
    <>
      <form
        onSubmit={submit}
        className="flex flex-col gap-2 rounded-[26px] border border-line bg-paper px-2 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        {/* Staged photo preview - sits inside the composer until sent */}
        {pendingUrl && (
          <div className="flex items-center gap-2 px-1 pt-1">
            <div className="relative">
              <img
                src={pendingUrl}
                alt={t.attachImage[locale]}
                className="h-16 w-16 rounded-xl border border-line object-cover"
              />
              <button
                type="button"
                onClick={clearPending}
                aria-label={t.removeImage[locale]}
                title={t.removeImage[locale]}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-paper text-muted shadow-sm transition hover:text-ink"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <span className="text-[12px] text-muted">{t.photoReady[locale]}</span>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Photo menu (capture screenshot / upload a photo) */}
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
            placeholder={pendingFile ? t.addNote[locale] : t.placeholder[locale]}
            className="max-h-40 flex-1 resize-none bg-transparent px-1 py-2 text-[14px] outline-none focus:outline-none focus-visible:outline-none placeholder:text-muted"
          />

          <button
            type="submit"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition hover:opacity-90 disabled:opacity-30"
            disabled={!canSend}
            aria-label={t.send[locale]}
          >
            <Icons.Arrow />
          </button>
        </div>

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
        onCapture={stageFile}
        locale={locale}
      />
    </>
  );
}
