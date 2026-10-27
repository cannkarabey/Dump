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

const FLUENT = "https://cdn.jsdelivr.net/npm/@lobehub/fluent-emoji-3d@1.1.0/assets";

/** Microsoft Fluent 3D emoji (MIT), served by jsDelivr with CORS so exports stay untainted. */
export const emojiSrc = (code: string) => `${FLUENT}/${code}.webp`;

export interface StickerPack {
  id: string;
  pro: boolean;
  items: { src: string; aspect: number }[];
}

const emoji = (codes: string) => codes.split(" ").map((c) => ({ src: emojiSrc(c), aspect: 1 }));

/** Names and search tags live in the app dictionary (stickers.packs / stickers.tags). */
export const STICKER_PACKS: StickerPack[] = [
  { id: "doodles", pro: false, items: STICKERS.map((s) => ({ src: stickerSrc(s.id), aspect: s.aspect })) },
  {
    id: "hearts",
    pro: false,
    items: emoji("2764-fe0f 1f496 1f497 1f493 1f49c 1f499 1f49a 1f49b 1f9e1 1f5a4 1f90d 1f498 1f49d 2728 1f31f 2b50 1f4ab 1f525 1f4af 1f48b"),
  },
  {
    id: "faces",
    pro: false,
    items: emoji("1f60d 1f970 1f60e 1f923 1f602 1f62d 1f97a 1f914 1f929 1f607 1f92a 1f60a 1f644 1fae0 1f480 1f47b 1f47d 1f916 1f618"),
  },
  {
    id: "food",
    pro: false,
    items: emoji("2615 1f9cb 1f950 1f369 1f370 1f9c1 1f355 1f354 1f35f 1f366 1f353 1f351 1f352 1f951 1f37f 1f379 1f377 1f942 1f9c7 1f968"),
  },
  {
    id: "nature",
    pro: false,
    items: emoji("1f338 1f337 1f339 1f33b 1f33c 1f33a 1f490 1f340 1f344 1f335 1f334 1f341 1f342 1f308 2600-fe0f 1f319 2601-fe0f 1f30a 1f33f 1f331"),
  },
  {
    id: "animals",
    pro: false,
    items: emoji("1f431 1f436 1f430 1f43b 1f43c 1f98a 1f438 1f425 1f98b 1f41d 1f422 1f42c 1f984 1f427 1f428 1f40c 1f41e 1f99c"),
  },
  {
    id: "office",
    pro: false,
    items: emoji("1f4ce 1f4cc 1f4dd 270f-fe0f 1f58d-fe0f 1f4d3 1f4da 1f4d0 2702-fe0f 1f5c2-fe0f 1f4c5 1f4ec 1f4e8 1f48c 1f516 1f4cf"),
  },
  {
    id: "travel",
    pro: true,
    items: emoji("2708-fe0f 1f30d 1f5fa-fe0f 1f3d6-fe0f 1f3d4-fe0f 1f3dd-fe0f 1f9f3 1f4f8 1f4f7 1f697 1f6b2 26fa 1f3a1 1f5fc 1f4cd 1f3ab 1f6f8 1f680"),
  },
  {
    id: "party",
    pro: true,
    items: emoji("1f389 1f38a 1f388 1f381 1f382 1f973 1f37e 1f3b5 1f3b6 1f3a4 1f3a7 1faa9 1f451 1f48e 1f386 1f3b8"),
  },
  {
    id: "retro",
    pro: true,
    items: emoji("1f4fc 1f4fb 1f4fa 1f4be 1f4bf 1f4c0 1f579-fe0f 1f3ae 1f4df 260e-fe0f 1f4e0 1f4f9 1f39e-fe0f 1f4fd-fe0f 1f4bd 23f0 1f4f1 1f4bb"),
  },
];
