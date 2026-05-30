"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Locale, t } from "@/lib/i18n";

/**
 * Live camera capture. Uses getUserMedia, which is supported on:
 *   Chrome / Firefox / Safari on Mac, Windows, Linux, Android, iOS
 * Requires HTTPS (or localhost).
 */
export default function CameraModal({
  open,
  onClose,
  onCapture,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  locale: Locale;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<"denied" | "none" | "unsupported" | null>(
    null,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setReady(false);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError("unsupported");
      return;
    }

    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current
            .play()
            .then(() => setReady(true))
            .catch(() => setReady(true));
        }
      })
      .catch((e: any) => {
        if (cancelled) return;
        const name = e?.name ?? "";
        if (
          name === "NotAllowedError" ||
          name === "SecurityError" ||
          name === "PermissionDeniedError"
        ) {
          setError("denied");
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          setError("none");
        } else {
          setError("unsupported");
        }
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    };
  }, [open]);

  function snap() {
    const video = videoRef.current;
    if (!video || !ready) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `roadwatch-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.9,
    );
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black">
      {/* Live feed - fills the whole viewport, centered, fully visible (no crop) */}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="max-w-xs text-center text-[14px] leading-relaxed text-white/80">
            {error === "denied" && t.camDenied[locale]}
            {error === "none" && t.camNone[locale]}
            {error === "unsupported" && t.camUnsupported[locale]}
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="close"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Shutter */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 bg-gradient-to-t from-black/60 to-transparent">
        <button
          onClick={snap}
          disabled={!ready || !!error}
          className="flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-white/40 transition active:scale-95 disabled:opacity-30"
          aria-label={t.capture[locale]}
        >
          <span className="block rounded-full bg-white" style={{ height: 52, width: 52 }} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
