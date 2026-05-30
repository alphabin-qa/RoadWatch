import { describe, it, expect } from "vitest";
import {
  validateMeta,
  analyzePixels,
  validationMessage,
  ValidationCode,
  MAX_BYTES,
} from "./imageValidation";

// helpers
function pixelArray(
  w: number,
  h: number,
  fill: [number, number, number] | ((i: number) => [number, number, number]),
): Uint8ClampedArray {
  const arr = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const [r, g, b] = typeof fill === "function" ? fill(i) : fill;
    arr[i * 4] = r;
    arr[i * 4 + 1] = g;
    arr[i * 4 + 2] = b;
    arr[i * 4 + 3] = 255;
  }
  return arr;
}

function fakeFile(opts: {
  size?: number;
  type?: string;
  name?: string;
}): File {
  const bytes = new Uint8Array(opts.size ?? 4);
  return new File([bytes], opts.name ?? "a.jpg", {
    type: opts.type ?? "image/jpeg",
  });
}

describe("validateMeta", () => {
  it("flags a missing file as no_file", () => {
    expect(validateMeta(null)).toBe<ValidationCode>("no_file");
    expect(validateMeta(undefined)).toBe<ValidationCode>("no_file");
  });

  it("flags a 0-byte file as empty", () => {
    expect(validateMeta(fakeFile({ size: 0 }))).toBe("empty");
  });

  it("rejects a PDF as not_image", () => {
    expect(
      validateMeta(fakeFile({ type: "application/pdf", name: "a.pdf" })),
    ).toBe("not_image");
  });

  it("rejects a video as not_image", () => {
    expect(
      validateMeta(fakeFile({ type: "video/mp4", name: "a.mp4" })),
    ).toBe("not_image");
  });

  it("rejects SVG (XSS surface) as not_image", () => {
    expect(
      validateMeta(fakeFile({ type: "image/svg+xml", name: "a.svg" })),
    ).toBe("not_image");
  });

  it("accepts a JPEG by mime", () => {
    expect(validateMeta(fakeFile({ type: "image/jpeg" }))).toBe("ok");
  });

  it("accepts a PNG", () => {
    expect(
      validateMeta(fakeFile({ type: "image/png", name: "a.png" })),
    ).toBe("ok");
  });

  it("accepts iPhone HEIC", () => {
    expect(
      validateMeta(fakeFile({ type: "image/heic", name: "IMG_001.HEIC" })),
    ).toBe("ok");
  });

  it("accepts WebP from modern Android browsers", () => {
    expect(
      validateMeta(fakeFile({ type: "image/webp", name: "a.webp" })),
    ).toBe("ok");
  });

  // Indian-context edge case: some Android camera apps and WhatsApp shares
  // produce files with empty MIME but a valid extension.
  it("accepts a file with empty MIME but image extension (Android edge case)", () => {
    expect(validateMeta(fakeFile({ type: "", name: "PHOTO_001.jpg" }))).toBe(
      "ok",
    );
  });

  it("rejects a file with empty MIME and non-image extension", () => {
    expect(
      validateMeta(fakeFile({ type: "", name: "doc.txt" })),
    ).toBe("not_image");
  });

  it("flags an over-sized file as too_large", () => {
    expect(validateMeta(fakeFile({ size: MAX_BYTES + 1 }))).toBe("too_large");
  });

  it("accepts a file exactly at the size cap", () => {
    expect(validateMeta(fakeFile({ size: MAX_BYTES }))).toBe("ok");
  });
});

describe("analyzePixels", () => {
  it("flags too small dimensions", () => {
    expect(
      analyzePixels({
        width: 16,
        height: 16,
        data: pixelArray(16, 16, [120, 120, 120]),
      }),
    ).toBe("too_small");
  });

  it("flags an all-black image as too_dark", () => {
    expect(
      analyzePixels({
        width: 64,
        height: 64,
        data: pixelArray(64, 64, [0, 0, 0]),
      }),
    ).toBe("too_dark");
  });

  it("flags an almost-black image (lens cap on, sensor noise) as too_dark", () => {
    const data = pixelArray(64, 64, (i) =>
      i % 13 === 0 ? [3, 3, 3] : [1, 1, 1],
    );
    expect(analyzePixels({ width: 64, height: 64, data })).toBe("too_dark");
  });

  it("flags an all-white image as too_uniform", () => {
    expect(
      analyzePixels({
        width: 64,
        height: 64,
        data: pixelArray(64, 64, [255, 255, 255]),
      }),
    ).toBe("too_uniform");
  });

  it("flags a flat-grey image as too_uniform", () => {
    expect(
      analyzePixels({
        width: 64,
        height: 64,
        data: pixelArray(64, 64, [128, 128, 128]),
      }),
    ).toBe("too_uniform");
  });

  // Indian-context edge case: a real night photo of a pothole. Most pixels
  // are near-black asphalt, but streetlight reflections create bright specks.
  it("ACCEPTS a dim night photo with bright streetlight specks", () => {
    const data = pixelArray(128, 128, (i) =>
      i % 11 === 0 ? [220, 200, 100] : [10, 10, 10],
    );
    expect(analyzePixels({ width: 128, height: 128, data })).toBe("ok");
  });

  it("ACCEPTS a daylight road photo (varied colors)", () => {
    const data = pixelArray(128, 128, (i) => [
      80 + (i % 100),
      90 + (i % 80),
      100 + (i % 60),
    ]);
    expect(analyzePixels({ width: 128, height: 128, data })).toBe("ok");
  });

  it("ACCEPTS a low-resolution WhatsApp-compressed image (still > 32px)", () => {
    const data = pixelArray(64, 48, (i) => [60 + (i % 90), 70, 80 + (i % 50)]);
    expect(analyzePixels({ width: 64, height: 48, data })).toBe("ok");
  });
});

describe("validationMessage", () => {
  // Every code must have a message in every supported locale, otherwise
  // a Hindi user sees an English fallback (the user's specific complaint).
  const codes: ValidationCode[] = [
    "no_file",
    "not_image",
    "empty",
    "too_large",
    "too_small",
    "too_dark",
    "too_uniform",
  ];

  it.each(codes)("has an English message for %s", (c) => {
    expect(validationMessage(c, "en")).toMatch(/\S/);
  });

  it.each(codes)("has a Hindi message for %s", (c) => {
    const msg = validationMessage(c, "hi");
    expect(msg).toMatch(/\S/);
    // Hindi message must contain at least one Devanagari codepoint.
    expect(msg).toMatch(/[\u0900-\u097F]/);
  });

  it.each(codes)("has a Tamil message for %s", (c) => {
    const msg = validationMessage(c, "ta");
    expect(msg).toMatch(/\S/);
    // Tamil message must contain at least one Tamil codepoint.
    expect(msg).toMatch(/[\u0B80-\u0BFF]/);
  });

  it("messages stay short - under 90 chars across all codes/locales", () => {
    for (const c of codes) {
      for (const l of ["en", "hi", "ta"] as const) {
        expect(
          validationMessage(c, l).length,
          `${c}/${l} too long`,
        ).toBeLessThanOrEqual(90);
      }
    }
  });

  it("each code's English message mentions something specific to that code", () => {
    // Spot-check the user's exact requirement: black file says it's black, etc.
    expect(validationMessage("too_dark", "en").toLowerCase()).toContain(
      "black",
    );
    expect(validationMessage("too_uniform", "en").toLowerCase()).toContain(
      "blank",
    );
    expect(validationMessage("not_image", "en").toLowerCase()).toMatch(
      /jpg|png|image/,
    );
    expect(validationMessage("too_large", "en").toLowerCase()).toMatch(
      /large|big|small|smaller/,
    );
    expect(validationMessage("empty", "en").toLowerCase()).toContain("empty");
    expect(validationMessage("too_small", "en").toLowerCase()).toMatch(
      /small|clear/,
    );
    expect(validationMessage("no_file", "en").toLowerCase()).toMatch(
      /photo|image|attach/,
    );
  });
});
