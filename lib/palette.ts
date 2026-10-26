type RGB = [number, number, number];

const toHex = ([r, g, b]: RGB) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

function lightness([r, g, b]: RGB) {
  return (Math.max(r, g, b) + Math.min(r, g, b)) / 510;
}

/** Colorfulness: 0 for greys, up to 1 for pure hues. */
export function chroma(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
}

/** Mixes `hex` toward white by `amount` (0–1). */
export function tint(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  return toHex(rgb.map((v) => v + (255 - v) * amount) as RGB);
}

/**
 * The k most common, visually distinct colors of an image.
 * Pixels are bucketed at 4 bits per channel; each bucket reports its average color.
 */
export function extractPalette(img: CanvasImageSource, k = 5): string[] {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    bucket.n++;
    bucket.r += data[i];
    bucket.g += data[i + 1];
    bucket.b += data[i + 2];
    buckets.set(key, bucket);
  }

  const candidates = [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .map((b): RGB => [b.r / b.n, b.g / b.n, b.b / b.n])
    .filter((c) => {
      const l = lightness(c);
      return l > 0.06 && l < 0.95;
    });

  const picked: RGB[] = [];
  for (const c of candidates) {
    const distinct = picked.every((p) => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) > 48);
    if (distinct) picked.push(c);
    if (picked.length === k) break;
  }
  return picked.map(toHex);
}
