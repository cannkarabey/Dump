/** Konva Image `crop` that mimics CSS `object-fit: cover`. */
export function coverCrop(imgW: number, imgH: number, boxW: number, boxH: number) {
  const scale = Math.max(boxW / imgW, boxH / imgH);
  const width = boxW / scale;
  const height = boxH / scale;
  return { x: (imgW - width) / 2, y: (imgH - height) / 2, width, height };
}

/** Fits a w×h box inside maxW×maxH, preserving aspect ratio. */
export function fitInside(w: number, h: number, maxW: number, maxH: number) {
  const scale = Math.min(maxW / w, maxH / h);
  return { width: w * scale, height: h * scale };
}
