// Pure validation utilities for citizen-uploaded photos.
// Two stages so each is independently testable:
//   1) validateMeta(file)        - MIME, size, name extension
//   2) analyzePixels(pixels)     - luminance + variance checks on decoded data
// Runtime helpers in this file (decode + analyze in one go) live below.

import type { Locale } from "./i18n";

export type ValidationCode =
  | "ok"
  | "no_file"
  | "not_image"
  | "empty"
  | "too_large"
  | "too_small"
  | "too_dark"
  | "too_uniform";

/** 12 MB cap. Typical phone photos are 3–6 MB; this protects slow Indian uplinks. */
export const MAX_BYTES = 12 * 1024 * 1024;

/** Minimum side length in px. Below this the photo is unreadable. */
export const MIN_SIDE_PX = 32;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|heic|heif|gif)$/i;

/** Stage 1 - metadata only. No async. */
export function validateMeta(
  file: File | null | undefined,
): ValidationCode {
  if (!file) return "no_file";
  if (file.size === 0) return "empty";
  if (file.size > MAX_BYTES) return "too_large";

  // Some Android camera/share intents drop the MIME and rely on the file
  // extension. Trust the extension as a fallback only.
  const mimeOk = ALLOWED_MIME.has(file.type);
  const extOk = IMAGE_EXT_RE.test(file.name);

  // Explicitly block SVG even if the user renames it.
  if (file.type === "image/svg+xml") return "not_image";

  if (!mimeOk && !extOk) return "not_image";
  return "ok";
}

/** Stage 2 - decoded pixel analysis. */
export function analyzePixels(input: {
  width: number;
  height: number;
  data: Uint8ClampedArray | ArrayLike<number>;
}): ValidationCode {
  const { width, height, data } = input;
  if (width < MIN_SIDE_PX || height < MIN_SIDE_PX) return "too_small";

  // Sample stride for speed on large photos. For testing accuracy on small
  // synthetic arrays we walk every pixel when total < 16k pixels.
  const total = width * height;
  const stride = total <= 16_384 ? 1 : Math.ceil(total / 16_384);

  let sum = 0;
  let sumSq = 0;
  let n = 0;

  for (let i = 0; i < total; i += stride) {
    const idx = i * 4;
    const r = data[idx] ?? 0;
    const g = data[idx + 1] ?? 0;
    const b = data[idx + 2] ?? 0;
    // Rec. 709 luminance
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sum += lum;
    sumSq += lum * lum;
    n++;
  }

  const mean = sum / n;
  const variance = sumSq / n - mean * mean;

  // Order matters. All-black images satisfy both conditions; we want
  // the more specific "too_dark" message in that case.
  if (mean < 12 && variance < 25) return "too_dark";
  if (variance < 4) return "too_uniform";
  return "ok";
}

// ---------- Messages - minimal, contextual, three languages ----------

const MESSAGES: Record<
  ValidationCode,
  Record<Locale, string>
> = {
  ok: {
    en: "OK",
    hi: "ठीक है",
    ta: "சரி",
  },
  no_file: {
    en: "Please attach a photo first.",
    hi: "पहले एक फ़ोटो जोड़ें।",
    ta: "முதலில் ஒரு படத்தை இணைக்கவும்.",
  },
  not_image: {
    en: "That isn't an image. Send a JPG, PNG or HEIC.",
    hi: "यह छवि नहीं है। JPG, PNG या HEIC भेजें।",
    ta: "இது படம் இல்லை. JPG, PNG அல்லது HEIC அனுப்பவும்.",
  },
  empty: {
    en: "The file is empty. Pick a different photo.",
    hi: "फ़ाइल खाली है। दूसरी फ़ोटो चुनें।",
    ta: "கோப்பு காலியாக உள்ளது. வேறு படம் தேர்வுசெய்.",
  },
  too_large: {
    en: "Photo is too big. Try a smaller one (under 12 MB).",
    hi: "फ़ोटो बहुत बड़ी है। 12 MB से छोटी भेजें।",
    ta: "படம் மிகப் பெரியது. 12 MB-க்கு கீழ் அனுப்பவும்.",
  },
  too_small: {
    en: "Photo is too small to read. Send a clearer shot.",
    hi: "फ़ोटो बहुत छोटी है। साफ़ तस्वीर भेजें।",
    ta: "படம் மிகச் சிறியது. தெளிவான படம் அனுப்பு.",
  },
  too_dark: {
    en: "This photo looks completely black. Try again with some light.",
    hi: "फ़ोटो पूरी तरह काली है। थोड़ी रोशनी में दोबारा लें।",
    ta: "படம் முழுவதும் கருப்பாக உள்ளது. வெளிச்சத்தில் மீண்டும் எடுக்கவும்.",
  },
  too_uniform: {
    en: "Looks like a blank image. Send the actual road.",
    hi: "खाली तस्वीर लग रही है। असली सड़क की भेजें।",
    ta: "காலியான படம் போல் தெரிகிறது. சாலையை எடுத்து அனுப்பு.",
  },
};

export function validationMessage(
  code: ValidationCode,
  locale: Locale,
): string {
  const row = MESSAGES[code] ?? MESSAGES.no_file;
  return row[locale] ?? row.en;
}

// ---------- Runtime helper (browser-only) - decode then analyze ----------

/**
 * Validate an image fully (meta + decoded pixels). Intended for browser use.
 * Falls back to meta-only on environments without canvas (SSR / older browsers).
 */
export async function validateImage(
  file: File | null | undefined,
): Promise<ValidationCode> {
  const meta = validateMeta(file);
  if (meta !== "ok" || !file) return meta;
  if (typeof document === "undefined") return "ok";

  try {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const { width, height, data } = drawAndSample(img);
      return analyzePixels({ width, height, data });
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    // If the browser can't decode it (e.g. iOS HEIC on a non-iOS browser),
    // accept on meta alone - server / Gemini will catch it later.
    return "ok";
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawAndSample(img: HTMLImageElement): {
  width: number;
  height: number;
  data: Uint8ClampedArray;
} {
  // Downsample big photos for speed - 256px on the long side is plenty for stats.
  const longSide = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = longSide > 256 ? 256 / longSide : 1;
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas ctx");
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  return { width: w, height: h, data };
}
