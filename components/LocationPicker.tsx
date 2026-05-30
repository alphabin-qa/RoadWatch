"use client";

import { useEffect, useRef, useState } from "react";
import type { LatLng } from "@/lib/exifLocation";
import { formatLatLng } from "@/lib/exifLocation";
import { Locale, t } from "@/lib/i18n";

const DEFAULT_CENTER: LatLng = { lat: 13.0413, lng: 80.2418 }; // Chennai
const DEFAULT_ZOOM = 14;

/**
 * Small inline map that asks the user to tap where the photo was taken.
 * Always shown after a photo, but skippable.
 */
export default function LocationPicker({
  photoUrl,
  initial,
  onConfirm,
  onSkip,
  onCancel,
  locale,
}: {
  photoUrl: string;
  initial: LatLng | null;
  onConfirm: (loc: LatLng) => void;
  onSkip: () => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [pos, setPos] = useState<LatLng | null>(initial);
  const [askedGeo, setAskedGeo] = useState(false);

  // Mount map once.
  useEffect(() => {
    let disposed = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !mapEl.current) return;

      // Fix default marker icons (Leaflet's bundled paths break in Next.js).
      const icon = L.icon({
        iconUrl:
          "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 32'><path d='M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z' fill='%230a0a0a'/><circle cx='12' cy='12' r='5' fill='%23ffffff'/></svg>`,
          ),
        iconSize: [24, 32],
        iconAnchor: [12, 32],
      });

      const center = pos ?? DEFAULT_CENTER;
      const map = L.map(mapEl.current, {
        center: [center.lat, center.lng],
        zoom: pos ? 16 : DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      if (pos) {
        markerRef.current = L.marker([pos.lat, pos.lng], {
          icon,
          draggable: true,
        }).addTo(map);
        markerRef.current.on("dragend", () => {
          const ll = markerRef.current.getLatLng();
          setPos({ lat: ll.lat, lng: ll.lng });
        });
      }

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        const next = { lat, lng };
        setPos(next);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], {
            icon,
            draggable: true,
          }).addTo(map);
          markerRef.current.on("dragend", () => {
            const ll = markerRef.current.getLatLng();
            setPos({ lat: ll.lat, lng: ll.lng });
          });
        }
      });

      // Force a resize tick once mounted (parent may animate in).
      setTimeout(() => map.invalidateSize(), 80);
    })();
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If `pos` becomes set later (e.g. live geolocation resolved), recenter.
  useEffect(() => {
    if (!mapRef.current || !pos) return;
    mapRef.current.setView([pos.lat, pos.lng], 16);
  }, [pos]);

  async function useMyLocation() {
    setAskedGeo(true);
    if (
      typeof navigator === "undefined" ||
      !navigator.geolocation
    )
      return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3 border-b border-line p-2">
        <img
          src={photoUrl}
          alt="attachment"
          className="h-12 w-16 rounded-md border border-line object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-ink">
            {t.whereIsThis[locale]}
          </div>
          <div className="text-[11px] text-muted">
            {pos ? formatLatLng(pos) : t.optionalSkip[locale]}
          </div>
        </div>
        <button
          onClick={onCancel}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-ink"
          aria-label="remove"
          title={t.removePhoto[locale]}
        >
          ✕
        </button>
      </div>

      {/* Map */}
      <div
        ref={mapEl}
        className="h-44 w-full"
        style={{ touchAction: "manipulation" }}
      />

      <div className="flex items-center gap-2 p-2">
        <button
          onClick={useMyLocation}
          disabled={askedGeo}
          className="rounded-full border border-line px-2.5 py-1 text-[12px] text-ink transition hover:bg-subtle disabled:opacity-40"
        >
          📍 {t.useMyLocation[locale]}
        </button>
        <div className="flex-1" />
        <button
          onClick={onSkip}
          className="rounded-full border border-line px-3 py-1 text-[12px] text-muted hover:text-ink"
        >
          {t.skip[locale]}
        </button>
        <button
          onClick={() => pos && onConfirm(pos)}
          disabled={!pos}
          className="rounded-full bg-ink px-3 py-1 text-[12px] text-paper transition hover:opacity-90 disabled:opacity-30"
        >
          {t.confirmLocation[locale]}
        </button>
      </div>
    </div>
  );
}
