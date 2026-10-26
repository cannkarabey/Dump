# Dump Creator

Tarayıcıda çalışan photo dump / Instagram carousel / TikTok slideshow editörü. Fotoğraflar cihazdan çıkmadan işlenir; canvas'ta düzenlenip PNG/JPG ya da ZIP olarak dışa aktarılır.

Ürün ve uygulama planı: [PLAN.md](PLAN.md).

## Geliştirme

```bash
npm install
npm run dev
```

Editör: http://localhost:3000/app/editor/new

Geliştirme modunda üst barda bir **dev tier** seçici var (Free / Creator / Studio); ödeme bağlanana kadar plan kısıtlarını denemek için.

```bash
npm run lint
npm run build
```

## Yapı

- `app/` — rotalar (`/app/editor/[id]` editör, `/dev/ui` bileşen galerisi)
- `components/editor/` — editör arayüzü; `canvas/` react-konva düğümleri, `panels/` sol paneller, `properties/` sağ panel
- `lib/store/` — Zustand store'ları (`doc` undo/redo'lu belge, `assets`, `ui`, `tier`)
- `lib/templates/` — normalize şablon şeması, `applyTemplate`, şablon JSON'ları
- `lib/export.ts` — sayfa sayfa PNG/JPG ve ZIP export
- `lib/monthDump.ts` — "Ayın Dump'ı" (EXIF sırası, kapak, palet, tarih damgası)
- `public/stickers/` — projeye özel çizilmiş SVG sticker'lar

## Yayına alma (Vercel)

1. https://vercel.com → **Add New → Project** → GitHub'dan `Dump` reposunu seç.
2. Framework otomatik olarak Next.js algılanır; ayar değiştirmeden **Deploy**.
3. Sonraki her `git push` otomatik deploy olur.

Sprint 1'de ortam değişkeni gerekmez. Sprint 2'de eklenecekler PLAN.md bölüm 7.0'da.
