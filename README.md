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

## Entegrasyonlar

Hepsi isteğe bağlıdır; değişken eksikse ilgili özellik kendini kapatır ve uygulama yerel olarak çalışmaya devam eder. Tüm değişkenler: [.env.example](.env.example) → `.env.local`.

| Özellik | Değişkenler | Yokken |
|---|---|---|
| AI Asistan (Gemini) | `GEMINI_API_KEY` | Panel "henüz bağlı değil" der, rota 503 döner |
| AI kotası (Upstash) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Hafızada sayılır (sadece geliştirme için) |
| Hesaplar (Supabase) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Hesap sayfası "yakında"; asistan anonim Free |
| Abonelik yazma | `SUPABASE_SECRET_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET`, `LS_VARIANTS_*` | Webhook 503 döner |
| Ödeme (Lemon Squeezy) | `NEXT_PUBLIC_LS_CHECKOUT_*` | Paywall "yakında" der (geliştirmede sahte plan seçici) |
| Analitik (Umami) | `NEXT_PUBLIC_UMAMI_SRC`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Script yüklenmez |

### Hesaplar (Supabase)
1. Supabase'de proje aç → **SQL Editor**'da [supabase/migrations/0001_subscriptions.sql](supabase/migrations/0001_subscriptions.sql) dosyasını çalıştır.
2. **Authentication → Providers → Google**: Google Cloud'da OAuth istemcisi oluştur, Supabase'in verdiği callback adresini ekle.
3. **Authentication → URL Configuration**: Site URL ve izinli yönlendirmelere `http://localhost:3000/auth/callback` (ve canlı alan adını) ekle.
4. Project Settings → API'den URL, publishable key ve secret key'i `.env.local`'e yaz.

### Ödeme (Lemon Squeezy)
1. Mağaza → ürün "Dump Creator" → varyantlar: Creator aylık $5 / yıllık $42, Studio aylık $10 / yıllık $84.
2. Her varyantın "Share" checkout linkini `NEXT_PUBLIC_LS_CHECKOUT_*`'a, varyant kimliklerini `LS_VARIANTS_CREATOR` / `LS_VARIANTS_STUDIO`'ya yaz.
3. **Settings → Webhooks**: URL `https://<alan-adı>/api/webhooks/billing`, olaylar `subscription_*`, imza anahtarını `LEMONSQUEEZY_WEBHOOK_SECRET`'a yaz.
4. Test modunda bir satın alma yap → Hesap sayfasında planın güncellendiğini gör.

## Yayın kontrol listesi

Hosting henüz seçilmedi (Vercel / Netlify / Cloudflare); kod sağlayıcıdan bağımsız.

- [ ] Yasal sayfalardaki köşeli parantezli alanlar dolduruldu ([components/marketing/LegalPage.tsx](components/marketing/LegalPage.tsx)) ve metinler hukukçuya okutuldu
- [ ] Google Cloud'da Gemini projesinin **faturalandırması açık** (free tier'da içerik ürün geliştirmede kullanılabilir) + bütçe uyarısı
- [ ] Upstash bağlı (hafızadaki kota üretimde güvenilir değil)
- [ ] Supabase Google OAuth yönlendirmeleri canlı alan adını içeriyor
- [ ] Lemon Squeezy webhook URL'si canlı alan adında; test satın alması planı güncelledi
- [ ] `NEXT_PUBLIC_SITE_URL` ayarlı (sitemap ve canonical linkler)
- [ ] `.env.local` repoda değil (`git ls-files | grep env` sadece `.env.example` göstermeli)
