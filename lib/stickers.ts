/** Original sticker set in public/stickers; aspect = width / height of the SVG. */
export const STICKERS: { id: string; label: string; aspect: number }[] = [
  { id: "star", label: "Yıldız", aspect: 1 },
  { id: "sparkle", label: "Pırıltı", aspect: 1 },
  { id: "heart", label: "Kalp", aspect: 1 },
  { id: "smiley", label: "Gülen yüz", aspect: 1 },
  { id: "sun", label: "Güneş", aspect: 1 },
  { id: "flower", label: "Çiçek", aspect: 1 },
  { id: "cloud", label: "Bulut", aspect: 200 / 170 },
  { id: "bolt", label: "Şimşek", aspect: 1 },
  { id: "moon", label: "Ay", aspect: 1 },
  { id: "burst", label: "Wow", aspect: 1 },
  { id: "arrow", label: "Ok", aspect: 200 / 180 },
  { id: "scribble", label: "Karalama", aspect: 1 },
  { id: "tape", label: "Bant", aspect: 246 / 80 },
  { id: "pin", label: "Konum", aspect: 1 },
  { id: "note", label: "Nota", aspect: 1 },
  { id: "check", label: "Onay", aspect: 1 },
  { id: "camera", label: "Kamera", aspect: 220 / 190 },
];

export const stickerSrc = (id: string) => `/stickers/${id}.svg`;
