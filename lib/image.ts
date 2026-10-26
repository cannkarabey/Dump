import exifr from "exifr";
import { nanoid } from "nanoid";
import type { Asset } from "./types";

/** Long-side cap for imported photos; keeps memory sane and still covers 4K export of a single photo per page. */
const MAX_SIDE = 2400;

export class UnsupportedImageError extends Error {
  constructor(public fileName: string) {
    super(`Bu dosya açılamadı: ${fileName}`);
  }
}

async function readTakenAt(file: File): Promise<number | null> {
  try {
    const data = await exifr.parse(file, ["DateTimeOriginal"]);
    const date = data?.DateTimeOriginal;
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date.getTime() : null;
  } catch {
    return null;
  }
}

function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

/** Average color of a tiny downscale; palette extraction (S1.10) refines this. */
function averageColor(source: CanvasImageSource): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 16;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "#888888";
  ctx.drawImage(source, 0, 0, 16, 16);
  const { data } = ctx.getImageData(0, 0, 16, 16);
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  const n = data.length / 4;
  return toHex(r / n, g / n, b / n);
}

export async function fileToAsset(file: File): Promise<Asset> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // e.g. HEIC in Chrome.
    throw new UnsupportedImageError(file.name);
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  const dominant = averageColor(canvas);
  bitmap.close();

  const keepAlpha = file.type === "image/png" || file.type === "image/webp";
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new UnsupportedImageError(file.name))),
      keepAlpha ? "image/png" : "image/jpeg",
      0.9,
    ),
  );
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  await img.decode();

  return {
    id: nanoid(10),
    url,
    img,
    w,
    h,
    takenAt: await readTakenAt(file),
    dominant,
    fileName: file.name,
  };
}
