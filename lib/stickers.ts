/** Original sticker set in public/stickers; aspect = width / height of the SVG. Names: app dictionary. */
export const STICKERS: { id: string; aspect: number }[] = [
  { id: "star", aspect: 1 },
  { id: "sparkle", aspect: 1 },
  { id: "heart", aspect: 1 },
  { id: "smiley", aspect: 1 },
  { id: "sun", aspect: 1 },
  { id: "flower", aspect: 1 },
  { id: "cloud", aspect: 200 / 170 },
  { id: "bolt", aspect: 1 },
  { id: "moon", aspect: 1 },
  { id: "burst", aspect: 1 },
  { id: "arrow", aspect: 200 / 180 },
  { id: "scribble", aspect: 1 },
  { id: "tape", aspect: 246 / 80 },
  { id: "pin", aspect: 1 },
  { id: "note", aspect: 1 },
  { id: "check", aspect: 1 },
  { id: "camera", aspect: 220 / 190 },
];

export const stickerSrc = (id: string) => `/stickers/${id}.svg`;
