# Dump Creator — Ürün, UI Analizi & Uygulama Planı (v2)

> v2 değişiklikleri: dump.cam referans alındı (canlı site + ekran görüntüleri analiz edildi), fiyatlar USD'ye çekildi ($5 / $10), tanıtım sitesi + editör platformu ayrımı eklendi, şablon kaynakları araştırıldı, **AI Asistan** ana farklılaştırıcı olarak tasarlandı.
> v3: AI Asistan Claude yerine **Google Gemini API (AI Studio)** üzerine taşındı; API anahtarı kurulumu, maliyet ve kota hesabı eklendi.

---

## 0. Özet

| Karar | Seçim |
|---|---|
| Ürün | Tarayıcıda çalışan photo dump / carousel / story editörü + sağ panelde **AI Asistan** |
| Referans | dump.cam (yapı ve UX kalıpları; marka, metin, görsel ve şablonlar **kopyalanmaz**) |
| Yapı | `/` tanıtım sitesi (açık tema) → "Start dumping" → `/app` editör (koyu tema) |
| Stack | Next.js 15 App Router + Tailwind + Zustand + **react-konva** + Google Gemini API (Vercel AI SDK ile) |
| Fiyat | Free / **Creator $5/ay** / **Studio $10/ay** (ödeme anında kartın bankası TL'ye çevirir) |
| Ödeme | Lemon Squeezy veya Paddle (Merchant of Record) — MVP'de mock tier toggle |
| Süre | 4 saat tüm kapsam için gerçekçi değil → **2 × 4 saatlik sprint**, görev görev implementation plan bölüm 7'de |

---

## 1. dump.cam Tanıtım Sitesi — Teknik Frontend Analizi

*Kaynak: dump.cam ana sayfası tarayıcıda açılıp DOM, CSS değişkenleri, yüklenen script'ler ve hesaplanmış stiller incelendi (26.10.2026).*

### 1.1 Teknoloji yığını (tespit edilen)
| Katman | Tespit | Kanıt |
|---|---|---|
| Framework | **Next.js (App Router) + Turbopack** build | `/_next/static/chunks/turbopack-*.js`, `__next` script'leri |
| Stil | **Tailwind CSS** (arbitrary value yoğun) + CSS değişkenli tema | `rounded-t-[56px]`, `h-[220vh]`, `max-w-[calc(100vw-24px)]` sınıfları; `:root` token'ları; `lightningcss` (Tailwind v4 işareti) |
| Smooth scroll | **Lenis** | `window.lenis`, `<html class="lenis">` |
| Animasyon | Saf **CSS keyframes** (JS animasyon kütüphanesi yok) | `lt-dump-in`, `lt-dump-word`, `textlab-pop-in` animasyonları |
| Editör canvas | **Fabric.js** | Bundle'da `fabric` |
| Ödeme | **Stripe** | Bundle'da `stripe` |
| Analytics | **Umami** (self-host, Railway) | `umami-...railway.app/script.js` |
| Affiliate | **PromoteKit** | `cdn.promotekit.com/pk.js` |
| Fontlar | `next/font`: **Inter** (UI), Sunghyun Sans Black (logo/başlık vurgusu), Reel Shrikhand, Pixelify Sans, Poppins, Playfair Display, Nunito (editör font seçenekleri) | `<html>` üzerindeki font variable sınıfları |
| Görseller | WebP, boyut varyantlı (`-xs.webp`, `-sm.webp`), `preload` ile hero görselleri | `<link rel=preload>` |
| SEO | `og:*`, `twitter:*`, `ai-summary` meta, `robots=index`, `/photo-dump-maker` gibi SEO landing sayfaları, `/blog` | meta etiketleri, footer linkleri |

### 1.2 Tasarım token'ları
```css
/* Açık tema (landing) */
--background: #f5f5f7;   --foreground: #1d1d1f;   --card: #fff;
--muted: #86868b;        --border: #00000014;
--accent: #ff5a1f;       --accent-strong: #e84a0e;  --accent-soft: #ff5a1f14;
--state-success: #34c759; --state-warning: #ff9f0a; --state-danger: #ff453a; --state-info: #0a84ff;
--shadow-card: 0 1px 2px #0000000d;
--shadow-popover: 0 16px 40px -16px #00000038, 0 0 0 1px #0000000f;
--shadow-modal: 0 32px 80px -24px #00000059;
--landing-cover-radius: clamp(28px, 4vw, 52px);
/* Koyu (uygulama): body #101010, metin #fafafa, panel ≈ #1c1c1e/80% */
```
- Renk dili Apple HIG'den alınmış (#1d1d1f, #86868b, #34c759, #0a84ff). Tek vurgu rengi: **turuncu #ff5a1f**.
- **Bizim için:** Aynı *yapıyı* kur ama kendi vurgu rengini seç (ör. elektrik mor `#7c5cff` veya limon `#d4ff3a`) ki marka karışmasın.

### 1.3 Tipografi
| Öğe | Değer |
|---|---|
| H1 | 42px (mobil) → büyük ekranda büyür, weight 600, letter-spacing **-0.05em**, line-height 1.02 |
| H2 | 40–46px, weight **660** (variable font), letter-spacing -0.04em, line-height 1.02–1.04 |
| H3 (feature) | 32px / 700 / -0.028em; kart başlıkları 24px / 600 |
| Gövde | 18px → 21px (sm), weight 500, line-height 1.4, tracking -0.01em |
| Desen | İki satırlık başlıklar, ikinci satır vurgu: *"The editor built / **for your posts**"* (ikinci satır turuncu) |

### 1.4 Bileşen kalıpları
- **Yüzen cam navbar:** `sticky top-0`, içte `h-12 mt-3 rounded-full`, `backdrop-filter: saturate(1.8) blur(18px)`, yarı saydam beyaz zemin. İçerik: logo · Features · Pricing · Blog · "Sign in" (Google ikonlu).
- **Butonlar:** Hepsi pill (`border-radius: 9999px`). Birincil CTA: koyu zemin `#171717`, `padding: 16px 36px`. İkincil: şeffaf, "Browse templates".
- **Kartlar:** Beyaz, `border: 1px #0000000f`, `shadow: 0 1px 2px … , 0 8px 28px …`; öne çıkan kart koyu `#0b0b0f`.
- **Segmented control:** Fiyatlandırmada Monthly / Yearly (-34%) — beyaz thumb, gri track.

### 1.5 Sayfa yapısı (yukarıdan aşağı)
1. **Hero** — İki satırlık başlık + alt metin + tek CTA "Start dumping" (`/?new=1`). Altında editörün gerçek ekran görüntüsü, tarayıcı çerçevesi içinde.
2. **Sözlük tanımı bölümü** — *"dump /dʌmp/ VERB — To turn a pile of photos into content…"*: kelimeler `lt-dump-word` animasyonuyla tek tek kayarak beliriyor (clip-path / translateY reveal).
3. **Sticky scroll anlatımı** — `section h-[220vh]` içinde `sticky top-0 h-screen` sahne; scroll ilerledikçe üç mesaj değişiyor:
   "One canvas. The whole carousel." → "Your photos. Your vibe." → "Start on your phone. Finish on your laptop."
   İçinde iPhone mockup'ında kaydırılan bir carousel (`1/5`, "seoul.dump").
4. **Üst üste binen kart bölümü** — `rounded-t-[56px] -mt-[100vh] z-20`: bir önceki sticky bölümün üstüne kayarak gelen yuvarlak köşeli "sayfa" efekti.
5. **"Ready to dump on every feed?"** — platform boyutları + iki CTA.
6. **Creator & Studio özellik ızgarası** — 9 kart, her biri canlı mini demo içeriyor: video timeline, stil (Ink Bleed/Pixel Art/Halftone), arka plan silme, cihaz mockup'ları, liquid glass, filtreler, özel font, Magic Resize, araç paketi.
7. **Pricing** — Monthly/Yearly toggle, 3 kart (Free €0 / Creator €9.99 "Most popular" / Studio €19.99), "Key features" açılır listeleri.
8. **Son CTA** — "Your next post starts here." + "Free · works on your phone too".
9. **Footer** — Tools / Explore / Company / Help kolonları, "Contact … replies within 24h" kartı, `-mt-16` ile üstteki bölümün altına giren yuvarlak köşe.

### 1.6 Bizim landing için uygulanacaklar
| dump.cam'deki teknik | Bizdeki karşılığı |
|---|---|
| Lenis smooth scroll | `lenis` paketi, `app/(marketing)/layout.tsx` içinde provider |
| Kelime kelime reveal | CSS keyframe + `animation-delay: calc(var(--i) * 60ms)`; `IntersectionObserver` ile tetik |
| Sticky scroll sahnesi | `h-[220vh]` dış kap + `sticky top-0 h-screen` iç sahne; ilerleme `scrollYProgress` (Lenis `scroll` event'i → CSS var `--p`) |
| Üst üste binen yuvarlak bölümler | `rounded-t-[56px] -mt-[100vh] relative z-20` |
| Cam navbar | `backdrop-blur-[18px] backdrop-saturate-[1.8] bg-white/70 rounded-full` |
| Canlı mini demo kartları | Kendi editör bileşenlerimizden statik/otomatik oynayan küçük demolar (hafif tutmak için çoğu WebM/MP4 loop) |
| SEO landing sayfaları | `/photo-dump-maker`, `/instagram-carousel-maker`, `/aylik-dump` (TR) — aynı şablonla farklı metin |

**Bizim landing bölüm planı:**
Hero ("Ayın fotoğrafları, / **tek tıkla dump.**") → AI Asistan demo bölümü (sticky: asistanın dump'ı yorumladığı chat animasyonu) → "Tek canvas, bütün carousel" → Şablon şeridi → Özellik ızgarası (6 kart) → Pricing ($0 / $5 / $10) → SSS → Son CTA → Footer.

---

## 2. dump.cam Editör Platformu — UI Analizi (ekran görüntülerinden)

### 2.1 Dashboard (`/app`)
- **Sol ikon rail (~110px):** Create (turuncu yuvarlak +) · My dumps · Templates · Ideas · Plan (taç) · Affiliates · Account — altta Report · bildirim zili · avatar.
- **My dumps boş durumu:** Ortada kart, logo illüstrasyonu, "No **dumps** yet", açıklama, turuncu "Start your first dump" pill butonu (glow gölgeli).

### 2.2 Templates galerisi
- Başlık: "**dump** templates." (vurgu + nokta ile biten başlık — marka dili).
- Sekmeler: Discover / Saved / My templates (segmented). Sağ üstte "Publish" (topluluk şablonu yayınlama).
- Büyük arama kutusu, filtre chip'leri: All · Story · Portrait · Square · Multipost · sıralama "Recent ▾".
- Grid: ilk hücre "Blank dump", ardından şablon kartları (oran korunarak, ~4 kolon).
- **Detay modalı:** solda büyük önizleme; sağda başlık, "Story 9:16 · 5 photos", yazar avatarı + adı, "Use this template" (turuncu), kaydet ve beğen ikon butonları; altta "More templates" yatay şerit.

### 2.3 Yeni dump akışı (2 adımlı modal)
1. **"New dump — What are you making?"** iki büyük kart: *Single post* (tek canvas, istenen boyut) / *Multipost* (carousel, her foto kendi sayfası).
2. **"Pick a size"**: sekmeler Popular / Instagram / TikTok / YouTube / X / More; preset kartları (Instagram Post 1080×1440, Square 1080×1080, Story 1080×1920, Pinterest Pin 1000×1500, Moodboard 1600×2000, **Infinite canvas** "No edges, exports what you place"); altta Custom W×H + swap ikonu + "Create dump".
   *Not: Instagram 2025'te 3:4 (1080×1440) portre formatına geçti; preset'ler buna göre.*

### 2.4 Editör düzeni
```
┌────────────────────────────────────────────────────────────────────────────┐
│ logo  Untitled ▾  ☁  Resize👑 │ ↶ ↷ │ − 45% ▾ + │ ⧉ 🗑 Align ▾ │ Animate👑  (avatar) [Export] │
├──────┬───────────────┬──────────────────────────────────────┬──────────────┤
│ rail │ flyout panel  │                                      │ Canvas       │
│Upload│  "Upload"     │          ┌──────────────┐            │  IG Post ›   │
│Templ.│  [+ Add photos│          │   artboard   │            │ Pages 1/10   │
│Pinter│   or videos]  │          │   (beyaz)    │            │  1 IG Post ⧉ │
│Stick.│               │          │              │            │  + Add page  │
│Text  │               │          └──────────────┘            │ Background   │
│Tools │               │            [+ Add canvas]            │  ○●○○▦🎨     │
│Filter│───────────────│                                      │ ──────────── │
│Draw  │ Layers ▾      │                                      │ Nothing      │
│Magic👑│ No layers yet │                                      │ selected     │
│Style👑│               │                                      │              │
│Layers│               │                                      │              │
│Settin│               │                                      │              │
└──────┴───────────────┴──────────────────────────────────────┴──────────────┘
```
- Premium özellikler **gizlenmiyor**, küçük turuncu taç ile işaretleniyor → tıklayınca paywall. (Dönüşüm için iyi bir kalıp.)
- Sağ panel bağlama göre değişiyor: hiçbir şey seçili değilse Canvas/Pages/Background, nesne seçilince boyut/rotasyon/opaklık/blur.
- Paneller koyu zemin üstünde ~16px köşe yuvarlaklı "yüzen" kartlar.

### 2.5 Bizim editörde farklılaşma
- **Sağ panel iki sekmeli:** `Özellikler | ✨ Asistan`. Asistan sekmesi varsayılan olarak ilk açılışta açık; dump.cam'de olmayan ana özellik.
- Sol rail sadeleştirilir (MVP): Upload · Templates · Text · Stickers · Filters · Layers. (Pinterest, Draw, Magic, Style sonraki sürümlere.)
- "Multipost" yerine **Seamless Carousel** modu: tek geniş canvas, sayfa sınırları kesik çizgiyle gösterilir; export'ta sayfalara bölünür (dump.cam'in "One canvas. The whole carousel." özelliğinin karşılığı).

---

## 3. AI Asistan — Ana Farklılaştırıcı (Google Gemini / AI Studio)

> v3: Asistan **Google Gemini API** üzerine kuruluyor (anahtar Google AI Studio'dan alınır). Fiyatlar ve model adları Google'ın resmi pricing sayfasından alındı (26.10.2026).

### 3.1 Yapılabilir mi? Evet.
Gemini API görsel girdi (vision), function calling (araç çağırma) ve streaming destekliyor. Asistan hem **yorum/tavsiye** verir hem de **editörde değişiklik yapan araçları** çağırabilir. Kullanıcı her değişikliği "Uygula" butonuyla onaylar.

### 3.2 Asistanın yetenekleri
| Yetenek | Örnek | Teknik |
|---|---|---|
| **Dump yorumu (critique)** | "İlk slayt zayıf, kaydırtacak bir hook yok. 4. fotoğrafı kapağa al." | Slayt önizlemeleri + proje JSON'u → vision |
| **Sıralama önerisi** | Renk akışı, gündüz → gece, yakın → uzak çekim ritmi | `reorder_photos` aracı |
| **Tekrar / kalite uyarısı** | "3 kahve fotoğrafı neredeyse aynı, birini çıkar." / bulanık foto | vision |
| **Şablon ve arka plan önerisi** | "Tonlar sıcak; krem arka plan + polaroid şablonu" | `apply_template`, `set_background` |
| **Caption & hashtag (TR/EN)** | 3 caption seçeneği + 10 hashtag | `suggest_caption` aracı |
| **Vibe skoru** | Hook / Akış / Renk uyumu / Çeşitlilik: 1–10 | JSON çıktısı (responseSchema) |
| **Sohbet** | "Daha minimal yap", "Ekim dump'ı başlığı ekle" | araç çağrıları |

### 3.3 Model seçimi ve maliyet
| Model ID | Input (metin/görsel) | Output | Kullanım |
|---|---|---|---|
| `gemini-3.1-flash-lite` | $0.25 / 1M | $1.50 / 1M | **Varsayılan**: sohbet, hızlı chip'ler, caption |
| `gemini-3.8-flash` | $0.75 / 1M (31.12.2026'ya kadar tanıtım fiyatı) → $1.50 (01.01.2027'den itibaren) | $3.75 → $7.50 | **"Derin yorum"**: tüm dump'ın görsel analizi |
| `gemini-2.5-flash-lite` | $0.10 / 1M | $0.40 / 1M | En ucuz yedek; eski nesil, kaliteyi test et |

- **Görsel token maliyeti:** Her iki kenarı ≤ 384px olan görsel **258 token**. Daha büyükler 768×768 karolara bölünür, karo başına 258 token. → Slayt önizlemelerini **en uzun kenar 384px** olacak şekilde render edersek her slayt sabit 258 token olur.
- **Bir "Derin yorum" çağrısı:** 10 slayt × 258 ≈ 2.6K + JSON ve sistem talimatı ≈ 3K → **~6K input**, ~800 output token.
  - `gemini-3.8-flash`: ≈ **$0.0075** (tanıtım fiyatı), 2027'den itibaren ≈ **$0.015**
  - `gemini-3.1-flash-lite`: ≈ **$0.003**
  - Not: Gemini 3 modellerinde "thinking" token'ları output olarak faturalanır. Gerçek rakamı ilk entegrasyonda `usageMetadata` ile ölç.
- **Context caching:** Sistem talimatı + araç tanımları sabit tutulursa tekrar eden kısım 10× ucuza okunur (3.8 Flash'ta $0.075/1M). Ancak caching'in de saatlik depolama ücreti var ($0.50–1.00/saat). MVP'de kullanma; trafik oluşunca değerlendir.

### 3.4 Kota (maliyetin aboneliği aşmaması için)
En kötü senaryo hesabı. Varsayımlar: kullanıcı kotasının tamamını kullanıyor, 2027 fiyatları geçerli, sohbet mesajı ≈ 6K input + 400 output (≈ $0.002), derin yorum ≈ $0.015.

| Paket | Sohbet / hızlı (Flash-Lite) | Derin yorum (3.8 Flash) | En kötü AI maliyeti / ay | Gelir |
|---|---|---|---|---|
| Free | 5 mesaj/gün | 3/hafta | ≈ $0.50 | $0 |
| Creator | 300 mesaj/ay | 30/ay | ≈ $1.10 | $5 |
| Studio | 1000 mesaj/ay | 100/ay | ≈ $3.60 | $10 |

- Kota **sunucuda** tutulur (Supabase `ai_usage` tablosu veya MVP'de Upstash Redis). Tarayıcıdaki kota güvenilir değildir.
- Free kullanıcılar için kayıt (Google girişi) zorunlu olmalı; aksi halde IP değiştirerek kota sınırsızlaşır.

### 3.5 Google AI Studio & API anahtarı — adım adım kurulum
**A. Anahtarı oluşturma**
1. https://aistudio.google.com/apikey adresine Google hesabınla gir, kullanım şartlarını kabul et. Yeni kullanıcılara otomatik bir Google Cloud projesi ve anahtar oluşturulur.
2. "Create API key" ile anahtar oluştur (projeyi seç). Anahtarı kopyala; **kimseyle paylaşma, ekran görüntüsünde gösterme.**
3. Anahtar ayarlarında **"Restrict to Gemini API only"** seçeneğini aç. Google, kısıtlanmamış anahtarları reddetmeye başladı.

**B. Projeye bağlama (yerelde)**
1. Proje kökünde `.env.local` dosyası oluştur:
   ```bash
   GEMINI_API_KEY=buraya_anahtar
   ```
2. `.gitignore` dosyasında `.env*.local` satırı olduğundan emin ol (create-next-app bunu varsayılan ekler). **Anahtar asla Git'e girmemeli.**
3. Değişken adına **`NEXT_PUBLIC_` öneki koyma.** O önek değişkeni tarayıcıya gönderir ve anahtar herkes tarafından görülür. Anahtar yalnızca `app/api/agent/route.ts` içinde (sunucuda) okunur.

**C. Yayında (Vercel)**
1. Vercel → Project → Settings → Environment Variables → `GEMINI_API_KEY` ekle (Production + Preview).
2. Yeniden deploy et.

**D. Faturalandırma & güvenlik**
1. **Ücretsiz katman (free tier):** Kart gerekmez, geliştirme için yeterli. **Ancak free tier'da gönderdiğin içerik Google tarafından ürün geliştirmek için kullanılabiliyor.** Kullanıcı fotoğrafları gönderileceği için **yayında free tier kullanma.**
2. **Ücretli katman (Tier 1):** AI Studio'da projeye faturalandırma hesabı bağla (Google Cloud Billing). Bu andan itibaren tüm kullanım ücretlenir ve içerik ürün geliştirmede kullanılmaz. Tier 1 harcama limiti $250. $100 harcama ve 3 gün sonra Tier 2'ye (limit $2.000) otomatik geçilir.
3. Google Cloud Console → Billing → **Budgets & alerts**: aylık bütçe (ör. $20) ve %50/%90/%100 e-posta uyarıları kur.
4. Anahtar sızarsa: yeni anahtar oluştur → Vercel'de güncelle → deploy → eski anahtarı sil.
5. Rate limit'leri AI Studio'daki proje panelinden takip et. Limit aşılınca API `429` döner; kullanıcıya "Asistan şu an yoğun, birkaç saniye sonra tekrar dene" mesajı göster.

### 3.6 Kod mimarisi
**SDK seçimi:**
| Seçenek | Artı | Eksi |
|---|---|---|
| **Vercel AI SDK** (`ai` + `@ai-sdk/google` + `@ai-sdk/react`) — **önerilen** | `useChat` hook'u streaming, mesaj durumu ve tarayıcı tarafı araç çağrılarını hazır veriyor; Next.js ile en az kod. İleride model sağlayıcısını değiştirmek tek satır. | Ek bir soyutlama katmanı; Gemini'ye özel yeni özellikler biraz gecikmeli gelebilir |
| **Google Gen AI SDK** (`@google/genai`) | Resmi SDK, her Gemini özelliğine anında erişim | Streaming'i tarayıcıya aktarma, araç döngüsü ve chat state'ini kendin yazarsın (≈ 1 saat ek iş) |

*Not: Eski `@google/generative-ai` paketi deprecated, kullanılmamalı.*

**Akış:**
```
[Tarayıcı — AgentPanel]
  useChat({ api: '/api/agent' })
   ├─ kullanıcı mesajı + slayt önizlemeleri (384px JPEG, base64) + proje JSON özeti
   │
   ▼
[Sunucu — app/api/agent/route.ts]
   ├─ oturum + kota kontrolü (Supabase / Upstash)
   ├─ createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })
   ├─ streamText({ model: google('gemini-3.1-flash-lite' | 'gemini-3.8-flash'),
   │               system: SYSTEM_TR, messages, tools })   ← araçların execute'u YOK
   └─ stream yanıtı tarayıcıya döner
   │
   ▼
[Tarayıcı]
   ├─ metin parçaları akarak yazılır
   ├─ araç çağrısı gelince → SuggestionCard (önizleme + Uygula / Yoksay)
   │    Uygula → applyToolCall() → Zustand store (undo'ya girer)
   └─ sonuç modele geri gönderilir (AI SDK'da araç çıktısı ekleme fonksiyonu)
```
- **Araçlar tarayıcıda çalışır:** Sunucuda tanımlanır ama `execute` fonksiyonu verilmez. Böylece çağrı tarayıcıya iletilir ve editör uygular. Fotoğraflar sunucuda saklanmaz.
- **Araç seti (ilk sürüm):** `reorder_photos(order[])`, `apply_template(templateId)`, `set_background(color)`, `add_text(pageIndex, text, style)`, `remove_photo(photoId)`, `set_cover(photoId)`, `suggest_caption(captions[], hashtags[])`. Parametreler Zod şemasıyla tanımlanır ve uygulanmadan önce tarayıcıda tekrar doğrulanır.
- **Vibe skoru:** Ayrı bir istek olarak, JSON şemalı çıktı (`generateObject` / Gemini `responseSchema`) ile `{hook, flow, color, variety, summary}` döner.
- **Görsel gönderimi:** Sayfalar en uzun kenar 384px, JPEG kalite ≈0.7 ile render edilir (her biri ≈ 20–40 KB). İstek sınırı (20 MB) çok uzakta.
- **Sistem talimatı (özet):** "Sen Türk sosyal medya kullanıcılarına yardım eden bir photo dump küratörüsün. Kısa, samimi, somut konuş. Önerilerini mümkünse araç çağrısıyla yap. Kullanıcı onaylamadan hiçbir şeyi değiştirdiğini söyleme."
- **Doğrulanacak:** AI SDK ve Google'ın SDK'sındaki fonksiyon adları sürümler arasında değişebiliyor (ör. tarayıcı tarafı araç çıktısını ekleyen fonksiyon). Geliştirmeye başlarken kurulu sürümün dokümanına bakılacak.

### 3.7 Gizlilik & KVKK
- "Fotoğrafların sunucuya yüklenmez" mesajı editör için doğru, asistan için değil. Asistan ilk açıldığında tek satırlık onay iste: *"Asistan, yorum yapmak için slaytlarının küçük önizlemelerini Google Gemini'ye gönderir. Önizlemeler bizim sunucumuzda saklanmaz."*
- Yayında **ücretli katman** zorunlu (bkz. 3.5-D). Gizlilik politikasına "AI işleme: Google LLC, Gemini API" maddesi eklenir.

### 3.8 Asistan paneli UI
- Üstte "Vibe skoru" kartı (4 metrik, küçük bar'lar) + "Derin yorum" butonu (kalan hak sayısıyla: "Derin yorum · 27 kaldı").
- Altında öneri kartları: ikon + başlık + açıklama + mini önizleme + **Uygula** / Yoksay.
- En altta sohbet girişi; hızlı chip'ler: "Yorumla", "Sıralamayı düzelt", "Caption yaz", "Daha minimal".
- Streaming sırasında yazı akışı + "düşünüyor" iskelet animasyonu. Hata/429'da nazik mesaj ve tekrar dene butonu.

---

## 4. Şablon Kaynakları — Araştırma Sonucu

**Hazır, indirilebilir bir "photo dump template" dataseti bulunamadı.** dump.cam şablonları kullanıcılar tarafından yayınlanıyor (ör. "Mavix" yazarlı şablon) ve telif onlara ait; **kazımak (scrape) etmek hem ToS hem telif açısından yapılmamalı.**

| Kaynak | Ne verir | Lisans / not | Kullanım önerisi |
|---|---|---|---|
| **Kendi şablonlarımız (JSON)** | Tam kontrol, dump'a özel | Bize ait | **Ana yol.** MVP'de 12–20 şablonu kendi editörümüzde tasarla → `doc.toJSON()` → `/public/templates/*.json` + önizleme PNG |
| **Crello dataset** (CyberAgent, Hugging Face) | 10K–100K tasarım şablonunun eleman konumları/boyutları (normalize) | CDLA-Permissive-2.0 (sürüme göre kontrol et); görseller düşük çözünürlük | Layout geometrisi çıkarmak (grid/kolaj yerleşim fikirleri) ve ileride AI layout önerisi için eğitim/few-shot verisi. Doğrudan şablon olarak değil. |
| **OpenCOLE** (Crello türevi) | Crello + açıklama metinleri | Apache 2.0 | Asistanın "bu vibe'a uygun yerleşim" önerisi için açıklamalı örnekler |
| **Polotno** | Ticari editör SDK'sı + şablon kütüphanesi (JSON) | Ücretli | Kendi editörünü yazmak istemezsen alternatif; MVP için gereksiz maliyet |
| **Unsplash / Pexels API** | Şablon önizlemelerinde kullanılacak örnek fotoğraflar | Ücretsiz, atıf gerekli | Şablon kartı görselleri ve demo içerik |
| **Sticker'lar** | Fluent Emoji (MIT), Twemoji (CC-BY 4.0), OpenMoji (CC BY-SA 4.0) | Atıf koşullarına uy | Sticker paneli |
| **Fontlar** | Google Fonts | OFL | Editör font listesi (Türkçe karakter desteği olanlar: Inter, Poppins, Playfair, Nunito, Space Grotesk…) |

**Şablon JSON şeması (öneri):**
```jsonc
{
  "id": "polaroid-month-01",
  "title": "Polaroid Ay Özeti",
  "format": { "w": 1080, "h": 1440, "pages": 5, "mode": "seamless" },
  "tier": "free",                       // free | creator | studio
  "tags": ["polaroid", "warm", "monthly"],
  "background": "#f3ece2",
  "elements": [
    { "type": "photoSlot", "x": 0.08, "y": 0.10, "w": 0.40, "h": 0.30, "rot": -4, "frame": "polaroid" },
    { "type": "text", "x": 0.1, "y": 0.8, "text": "{{month}} dump", "font": "Playfair Display", "size": 0.06 },
    { "type": "sticker", "src": "/stickers/star.svg", "x": 0.7, "y": 0.2, "w": 0.1 }
  ]
}
```
Koordinatlar 0–1 normalize → her boyuta (4:5, 3:4, 9:16) yeniden ölçeklenebilir. `{{month}}` gibi değişkenler "1 Tık Ay Dump'ı" özelliğiyle otomatik dolar.

**Uzun vade:** dump.cam'deki gibi **topluluk şablonları** (Publish butonu, Discover/Saved/My templates) — kullanıcı içeriği büyüme motoru olur.

---

## 5. Ürün: Özellikler & Paketler (güncel)

### 5.1 Temel özellikler
1. **Editör:** Çoklu yükleme, sürükle-bırak, serbest yerleşim (taşı/döndür/ölçekle), katmanlar, undo/redo.
2. **Şablon motoru:** JSON şablonlar, photo slot'lara otomatik doldurma, Seamless Carousel modu.
3. **Export:** PNG/JPG, tek sayfa veya ZIP, çözünürlük tier'a göre.
4. **"1 Tık Ay Dump'ı"** (v1'deki USP): EXIF tarihine göre sıralama, `EKİM '26` kapak, retro tarih damgası, renk paleti.
5. **AI Asistan** (ana farklılaştırıcı, bölüm 3).

### 5.2 Paketler (USD)
| | **Free — $0** | **Creator — $5/ay** | **Studio — $10/ay** |
|---|---|---|---|
| Dump başına fotoğraf | 6 | 20 | Sınırsız |
| Sayfa | 4 | 10 | 20 |
| Şablonlar | Free etiketli (≈ %30) | Tümü | Tümü + erken erişim |
| Export | 1080px, küçük filigran | 2K, filigransız, ZIP | 4K, filigransız, ZIP + çoklu boyut (Post+Story aynı anda) |
| AI Asistan | 5 mesaj/gün + 3 derin yorum/hafta | 300 mesaj + 30 derin yorum/ay | 1000 mesaj + 100 derin yorum/ay + otomatik uygula |
| 1 Tık Ay Dump'ı | Kapak ✓, damga ✗ | ✓ | ✓ |
| Marka kiti / özel font | ✗ | ✗ | ✓ |
| Kayıtlı dump (bulut) | 3 | 50 | Sınırsız |

- Yıllık plan: %30 indirim ($42 / $84 yıllık).
- dump.cam'in yarı fiyatı (€9.99 / €19.99) + onlarda olmayan AI Asistan → net konumlandırma.

### 5.3 Ödeme altyapısı
- **Stripe Türkiye'deki şirketlere doğrudan hesap açmıyor** (kendi destek listesinden doğrula). USD fiyatlama için en pratik yol bir **Merchant of Record**:
  - **Lemon Squeezy** veya **Paddle**: vergiyi ve faturayı onlar keser; müşteri USD öder, kartın bankası TL'ye çevirir. Sana payout (Türkiye'ye payout koşullarını ve komisyonu başvurmadan önce kontrol et).
- Akış: Checkout link → webhook → Supabase `subscriptions` tablosu → uygulama açılışta tier'ı sunucudan okur.
- MVP: Navbar'da geliştirici "tier toggle" + paywall modalı.

---

## 6. Teknik Mimari

| Katman | Seçim | Gerekçe |
|---|---|---|
| Framework | **Next.js 15 App Router** | Landing için SEO/SSR + AI için server route (API anahtarı gizli) — v1'deki Vite tercihi bu iki ihtiyaç yüzünden değişti |
| Stil | Tailwind CSS v4 + CSS değişken token'ları | dump.cam ile aynı yaklaşım, açık/koyu tema kolay |
| UI parçaları | Radix primitives (Dialog, Tabs, DropdownMenu, Slider) + lucide-react | Erişilebilir modal/sekme hızlıca |
| Smooth scroll | lenis | Landing |
| Canvas | **react-konva** | Belge JSON'u Zustand'da durur, canvas ondan türetilir → AI araçları sadece JSON'u değiştirir. Transformer (taşı/döndür/ölçekle) hazır. (dump.cam Fabric.js kullanıyor; Fabric imperatif olduğu için React state + AI komutlarıyla senkron tutmak daha zahmetli.) |
| State | Zustand + `zundo` (undo/redo) | Komut tabanlı değişiklikler |
| Export | Konva `stage.toBlob({ pixelRatio })` + JSZip | Seamless modda sayfa başına `x` offset'iyle kırpma |
| EXIF / renk | exifr + küçük canvas histogramı | USP |
| AI | Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/react`) + Gemini (`gemini-3.1-flash-lite`, `gemini-3.8-flash`) | Bölüm 3 |
| Auth & veri | Supabase (Google girişi, `dumps`, `subscriptions`, `ai_usage` tabloları) | Sprint 2 |
| Analytics | Umami veya Plausible | Çerezsiz, KVKK dostu |
| Deploy | Vercel | Next.js ile sıfır ayar |

### Klasör yapısı
```
dump-creator/
├─ app/
│  ├─ (marketing)/
│  │  ├─ layout.tsx            # açık tema, Lenis, cam navbar, footer
│  │  ├─ page.tsx              # landing
│  │  └─ pricing/page.tsx
│  ├─ app/
│  │  ├─ layout.tsx            # koyu tema, sol rail
│  │  ├─ page.tsx              # My dumps
│  │  ├─ templates/page.tsx    # galeri + detay modalı
│  │  └─ editor/[id]/page.tsx  # editör
│  └─ api/
│     ├─ agent/route.ts        # Gemini stream + tools (anahtar: GEMINI_API_KEY)
│     └─ webhooks/billing/route.ts
├─ components/
│  ├─ marketing/  (Hero, WordReveal, StickyStory, FeatureGrid, PricingTable, Footer)
│  ├─ editor/     (TopBar, LeftRail, FlyoutPanel, CanvasStage, PagesPanel, PropertiesPanel, ExportDialog, NewDumpModal, SizePicker)
│  ├─ agent/      (AgentPanel, VibeScore, SuggestionCard, ChatInput)
│  └─ ui/         (Button, Pill, Segmented, Modal, Crown)
├─ lib/
│  ├─ store/      (doc.ts, ui.ts, tier.ts)
│  ├─ templates/  (schema.ts, applyTemplate.ts)
│  ├─ agent/      (tools.ts, systemPrompt.ts, renderThumbs.ts, applyToolCall.ts)
│  ├─ export.ts  exif.ts  palette.ts  tiers.ts
├─ public/templates/*.json  public/stickers/
└─ PLAN.md
```

---

## 7. Uygulama Planı (Implementation Plan) — 2 × 4 Saat

> Bu bölüm projeyi **sırasıyla inşa etmek** için yazıldı. Her görev; kimliği (S1.3 gibi), süresi, oluşturulacak/değişecek dosyaları, teknik detayı ve **bitti kriterini** içerir. Her saatin sonunda `npm run build` hatasız geçmeli ve bir commit atılmalı.
> Sprint 1 sonunda: yayında, tek başına çalışan editör. Sprint 2 sonunda: landing + şablon galerisi + AI Asistan + giriş/ödeme.

### 7.0 Hazırlık (sprint dışı, ~15 dk)
| Hesap / araç | Ne için | Ne zaman lazım |
|---|---|---|
| Node.js 20+ ve npm | Proje | S1 başı |
| GitHub hesabı + boş repo `dump-creator` | Kod + Vercel bağlantısı | S1 başı |
| Vercel hesabı (GitHub ile giriş) | Deploy | S1 sonu |
| Google AI Studio anahtarı (bölüm 3.5) | AI Asistan | S2 Saat 3 |
| Upstash Redis (ücretsiz plan) | AI kotası | S2 Saat 3 |
| Supabase projesi | Giriş + abonelik tablosu | S2 Saat 4 |
| Lemon Squeezy (veya Paddle) mağaza başvurusu | Ödeme | **Hemen başvur** — onay günler sürebilir; onaylanmazsa S2'de mock tier ile yayına çıkılır |

**Ortam değişkenleri (`.env.local`, hiçbiri `NEXT_PUBLIC_` değil — Supabase'in public olanları hariç):**
```bash
GEMINI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # sadece webhook route'unda
LEMONSQUEEZY_WEBHOOK_SECRET=
NEXT_PUBLIC_LS_CHECKOUT_CREATOR=  # checkout URL'leri (gizli değil)
NEXT_PUBLIC_LS_CHECKOUT_STUDIO=
```

### 7.1 Temel veri modeli (her şeyin dayandığı sözleşme)
Bu tipler S1.4'te `lib/types.ts` olarak yazılır; editör, şablonlar, export ve AI araçları **sadece bu modeli** okur/yazar.

```ts
// lib/types.ts
export type Tier = 'free' | 'creator' | 'studio';
export type DumpMode = 'single' | 'carousel';   // carousel = tek geniş canvas, sayfalara bölünür (seamless)

export interface DumpFormat {
  w: number;            // tek sayfa genişliği (px), ör. 1080
  h: number;            // ör. 1440
  pages: number;        // single'da 1
  mode: DumpMode;
}

interface BaseEl {
  id: string;           // nanoid()
  x: number; y: number; // stage koordinatı; sayfa i'nin sol kenarı = i * format.w
  width: number; height: number;
  rotation: number;     // derece
  opacity: number;      // 0–1
  locked?: boolean;
}
export interface ImageEl  extends BaseEl { type: 'image';  assetId: string; radius?: number; frame?: 'none' | 'polaroid' | 'film'; stamp?: boolean; }
export interface SlotEl   extends BaseEl { type: 'slot';   assetId?: string; radius?: number; frame?: 'none' | 'polaroid' | 'film'; }
export interface TextEl   extends BaseEl { type: 'text';   text: string; fontFamily: string; fontSize: number; fill: string; align: 'left'|'center'|'right'; bubble?: boolean; }
export interface StickerEl extends BaseEl { type: 'sticker'; src: string; }
export type El = ImageEl | SlotEl | TextEl | StickerEl;

export interface DumpDoc {
  id: string;
  title: string;
  format: DumpFormat;
  background: string;   // '#rrggbb' | 'transparent'
  elements: El[];       // dizideki sıra = z-index (sonraki üstte)
  updatedAt: number;
}

// Doc'a girmeyen, geri alınamaz ağır veri:
export interface Asset {
  id: string;
  url: string;          // objectURL (küçültülmüş blob)
  img: HTMLImageElement;
  w: number; h: number;
  takenAt: number | null;   // EXIF DateTimeOriginal (ms) ya da null
  dominant: string;         // '#rrggbb'
  fileName: string;
}
```
**Kurallar:**
- Sayfa sınırları sadece görsel; bir eleman iki sayfaya taşabilir (seamless'in özü).
- `assets` ayrı store'da tutulur, undo geçmişine girmez (blob'lar ağır).
- Tüm koordinatlar **tam boyut** (1080 tabanlı) piksel; ekrandaki zoom sadece Stage `scale`'idir.

---

### Sprint 1 — Editör Çekirdeği (4 saat)

#### Saat 1 — Kurulum, tasarım sistemi, editör iskeleti

**S1.1 · Proje kurulumu (0:00–0:15)**
- Klasör adında boşluk/büyük harf olduğu için (`Dump Creator`) npm paket adı geçersiz olur → proje alt klasörde oluşturulur:
  ```bash
  npx create-next-app@latest dump-creator --ts --tailwind --eslint --app --import-alias "@/*" --use-npm --no-src-dir
  ```
  ```bash
  cd dump-creator && npm i zustand zundo konva react-konva jszip file-saver exifr nanoid lucide-react clsx tailwind-merge @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-dropdown-menu @radix-ui/react-slider @radix-ui/react-tooltip @radix-ui/react-accordion
  ```
  ```bash
  npm i -D @types/file-saver
  ```
- `PLAN.md`'yi `dump-creator/` içine kopyala; `git init`, ilk commit, GitHub'a push.
- `next.config.ts`: Konva'nın Node tarafında `canvas` paketini aramaması için:
  ```ts
  webpack: (config) => { config.externals = [...(config.externals ?? []), { canvas: 'canvas' }]; return config; }
  ```
  (Turbopack kullanılıyorsa gerek kalmayabilir; asıl çözüm S1.6'daki `ssr: false` dinamik import.)
- **Bitti:** `npm run dev` → varsayılan sayfa açılıyor.

**S1.2 · Tasarım token'ları & fontlar (0:15–0:30)**
- `app/globals.css`:
  ```css
  @import "tailwindcss";
  @theme {
    --color-accent: #7c5cff;          /* kendi vurgu rengimiz (dump.cam turuncusu değil) */
    --color-accent-strong: #6a48f5;
    --radius-panel: 16px;
    --font-sans: var(--font-inter);
  }
  :root { --bg: #f5f5f7; --fg: #1d1d1f; --muted: #86868b; --card: #fff; --border: #00000014; }
  .theme-dark { --bg: #101010; --fg: #fafafa; --muted: #8e8e93; --card: #1c1c1e; --border: #ffffff14; }
  ```
- `app/fonts.ts`: `next/font/google` ile **`subsets: ['latin', 'latin-ext']`** (ğ, ş, İ, ı için şart): Inter (UI), Playfair_Display, Space_Grotesk, Caveat, Pixelify_Sans, VT323 (tarih damgası). Her biri `variable` ile CSS değişkeni olarak `<html>`'e eklenir.
- `lib/cn.ts`: `clsx` + `tailwind-merge`.
- `components/ui/`: `Button` (primary / secondary / ghost; sm / md / lg; hepsi `rounded-full`), `IconButton`, `Segmented`, `Modal` (Radix Dialog sarmalayıcı), `Tooltip`, `Crown` (premium rozeti), `Swatch`.
- **Bitti:** Geçici `/dev/ui` sayfasında tüm bileşenler açık + koyu temada görünüyor.

**S1.3 · Editör iskeleti + tier sistemi (0:30–1:00)**
- Rotalar: `app/app/layout.tsx` (`<div className="theme-dark">`), `app/app/editor/[id]/page.tsx` → `<EditorRoot id={params.id} />` (client component).
- Grid düzeni (`EditorRoot`):
  ```
  grid h-dvh grid-cols-[72px_320px_1fr_340px] grid-rows-[56px_1fr]
  TopBar: col-span-4 | LeftRail | FlyoutPanel | CanvasArea | RightPanel
  ```
- Bileşenler (bu adımda içleri boş/placeholder):
  - `TopBar`: logo, başlık (inline input), undo/redo, zoom (− % +), Export butonu, dev-only tier toggle.
  - `LeftRail`: Upload · Templates · Text · Stickers · Layers ikonları → `ui.activePanel`.
  - `FlyoutPanel`: `activePanel`'e göre panel render eder.
  - `RightPanel`: Radix Tabs → `Özellikler | ✨ Asistan` (Asistan Sprint 2'de dolacak).
- `lib/store/ui.ts` (zustand): `activePanel`, `rightTab`, `zoom`, `selection: string[]`, `modals: { newDump, export, paywall: { open, feature? } }`.
- `lib/tiers.ts`:
  ```ts
  export const TIER_LIMITS = {
    free:    { maxPhotos: 6,        maxPages: 4,  exportLongSide: 1440, watermark: true,  zip: false, templates: 'free', stamp: false, brandKit: false },
    creator: { maxPhotos: 20,       maxPages: 10, exportLongSide: 2560, watermark: false, zip: true,  templates: 'all',  stamp: true,  brandKit: false },
    studio:  { maxPhotos: Infinity, maxPages: 20, exportLongSide: 3840, watermark: false, zip: true,  templates: 'all',  stamp: true,  brandKit: true  },
  } as const;
  ```
- `lib/store/tier.ts`: `tier` (Sprint 1'de localStorage'a persist; Sprint 2'de sunucudan gelir) + `can(feature)` yardımcı fonksiyonu.
- **Bitti:** `/app/editor/new` açılıyor; rail ikonları paneli değiştiriyor; tier toggle TopBar'daki rozeti değiştiriyor.
- **Commit:** `feat: project setup, design tokens, editor shell`

#### Saat 2 — Belge modeli, yükleme, canvas

**S1.4 · Doc store + undo/redo (1:00–1:20)**
- `lib/types.ts` (bölüm 7.1).
- `lib/store/doc.ts`: `create(temporal((set, get) => ({...}), { limit: 100, partialize: s => ({ doc: s.doc }) }))`
  Aksiyonlar: `newDoc(format)`, `setFormat(f)`, `setBackground(c)`, `addElements(els)`, `updateElement(id, patch)`, `updateElements(patches)`, `removeElements(ids)`, `duplicate(ids)`, `bringForward/sendBackward(id)`, `addPage()`, `removePage(i)` (sayfa i'deki elemanları siler, sağdakileri `-w` kaydırır), `replaceDoc(doc)`.
- Sürükleme sırasında her piksel geçmişe yazılmasın: drag/transform **bitince** tek `updateElement` çağrılır.
- `lib/store/assets.ts`: `assets: Record<string, Asset>`, `addFiles(files: File[]): Promise<Asset[]>`:
  1. `exifr.parse(file, ['DateTimeOriginal'])` (hata → `null`).
  2. `createImageBitmap(file)` → en uzun kenar ≤ 2400px olacak şekilde canvas'a çiz → `toBlob('image/jpeg', 0.9)` → `URL.createObjectURL`.
  3. `HTMLImageElement` yükle (`await img.decode()`).
  4. `dominant` = 32×32'ye küçültüp ortalama/histogram (S1.10'da `palette.ts`'e taşınır; burada basit ortalama yeterli).
- **Bitti:** Konsoldan `useDoc.getState().addElements(...)` → undo/redo çalışıyor.

**S1.5 · Yükleme paneli (1:20–1:35)**
- `components/editor/panels/UploadPanel.tsx`: dropzone (`onDragOver/onDrop`), `<input type="file" multiple accept="image/*">`, `window` üzerinde `paste` dinleyicisi (`e.clipboardData.files`).
- Limit: `mevcutFoto + yeni > TIER_LIMITS[tier].maxPhotos` → fazlası alınmaz, paywall açılır (`feature: 'maxPhotos'`).
- Yükleme sonrası yerleşim (`lib/placement.ts → placeNewImages(assets)`): Boş slot varsa sırayla doldur; yoksa aktif sayfanın ortasına, sayfa genişliğinin %60'ı kadar, her yenisi +24px kaydırılarak.
- Panelde küçük resim ızgarası (sürüklenebilir: `draggable` + `dataTransfer.setData('asset-id', id)`).
- **Bitti:** 3 foto bırak → canvas'ta 3 görüntü elemanı (S1.6 ile birlikte görünür).

**S1.6 · Canvas (react-konva) (1:35–1:55)**
- `components/editor/canvas/CanvasArea.tsx`: `const CanvasStage = dynamic(() => import('./CanvasStage'), { ssr: false })`. Kapsayıcının boyutu `ResizeObserver` ile alınır.
- `CanvasStage.tsx` katmanları:
  1. `Layer name="bg"`: her sayfa için `Rect` (background rengi; `transparent` ise dama deseni sadece ekranda).
  2. `Layer name="content"`: `doc.elements.map` → `ImageNode` / `SlotNode` / `TextNode` / `StickerNode`.
  3. `Layer name="ui"`: sayfa ayırıcı kesik çizgiler, sayfa numaraları, `Transformer`. **Export sırasında gizlenir.**
- Stage `scale = zoom`, `x/y` = pan. İlk açılışta `fitToScreen()` (tüm sayfalar görünecek şekilde).
- `lib/geometry.ts → coverCrop(imgW, imgH, boxW, boxH)`: `object-fit: cover` mantığıyla Konva `Image` `crop` değeri.
- Etkileşim:
  - Tık → seç; Shift+tık → çoklu; boşluğa tık → seçimi temizle.
  - `onDragEnd` → `updateElement(id, {x, y})`.
  - `onTransformEnd` → `width = node.width() * node.scaleX()`, `height = ...`, `node.scale({x:1, y:1})`, `rotation` → tek `updateElement`.
  - Ctrl/⌘ + tekerlek → işaretçinin etrafında zoom; boşluk + sürükle → pan.
- `hooks/useHotkeys.ts`: `Delete/Backspace` sil, `⌘Z / ⇧⌘Z` undo/redo (`useDoc.temporal.getState()`), `⌘D` çoğalt, oklar 1px (Shift ile 10px).
- **Bitti:** Fotoğraflar taşınıyor, döndürülüyor, ölçekleniyor; undo geri alıyor; zoom çalışıyor.

**S1.7 · Yeni dump modalı + boyut seçici (1:55–2:00 → gerekirse 2:05'e taşar)**
- `lib/presets.ts`: `{ id, label, group: 'popular'|'instagram'|'tiktok'|'youtube'|'x', w, h }[]` → IG Post 1080×1440, IG Kare 1080×1080, IG 4:5 1080×1350, Story/Reels 1080×1920, TikTok 1080×1920, Pinterest 1000×1500, YouTube kapak 1280×720, X post 1600×900.
- `NewDumpModal`: Adım 1 "Tek post / Carousel" kartları → Adım 2 preset sekmeleri + Custom (W×H, swap butonu) + sayfa sayısı (carousel'de 2–`maxPages`) → `newDoc(format)` → `router.replace('/app/editor/' + doc.id)`.
- `/app/editor/new` açılınca modal otomatik açılır.
- **Commit:** `feat: doc store, upload, konva canvas, new dump flow`

#### Saat 3 — Şablonlar, carousel, "1 Tık Ay Dump'ı", kilitler

**S1.8 · Şablon motoru (2:00–2:25)**
- `lib/templates/schema.ts`:
  ```ts
  export interface Template {
    id: string; title: string; tier: 'free' | 'creator';
    aspect: '3:4' | '4:5' | '1:1' | '9:16';
    pages: number; mode: DumpMode; background: string; tags: string[]; preview: string;
    elements: Array<Omit<El, 'id' | 'x' | 'y' | 'width' | 'height'> & { page: number; nx: number; ny: number; nw: number; nh: number }>;
  }
  ```
  `nx/ny/nw/nh` sayfaya göre 0–1 normalize. Metinlerde `{{month}}`, `{{year}}` değişkenleri.
- `lib/templates/applyTemplate.ts → applyTemplate(t, format, assets): El[]`: her eleman için `x = page * w + nx * w`, `y = ny * h`, ... ; `fontSize` da `h` ile ölçeklenir; slot'lar `assets` sırasıyla doldurulur. Şablonun sayfa sayısı `format.pages`'ten fazlaysa tier limitine kadar kırpılır.
- `public/templates/index.json` (manifest) + 6 şablon: `grid-2x2`, `big-plus-two`, `polaroid-scatter`, `filmstrip-3`, `panorama-3` (sayfa sınırlarını aşan fotoğraflar), `cover-month` (ay kapağı).
- `TemplatesPanel` (editör içi): küçük önizlemeler, Creator şablonlarında `Crown`; tıklayınca mevcut fotoğraflarla uygula (onay: "Mevcut düzen değişecek").
- `SlotNode`: `assetId` yoksa kesik çerçeve + "Fotoğraf ekle" yazısı; Upload panelinden bir küçük resim slot'un üstüne bırakılınca `stage.setPointersPositions(e)` → `stage.getIntersection(pointer)` → slot'a `assetId` yazılır.
- **Bitti:** 6 foto yükle → "polaroid-scatter" seç → fotoğraflar çerçevelere yerleşiyor.

**S1.9 · Sayfalar paneli & carousel modu (2:25–2:35)**
- `RightPanel > Özellikler` seçim yokken: **Canvas** kartı (boyut + "Yeniden boyutlandır"), **Sayfalar** listesi (ekle / çoğalt / sil; `maxPages` sınırı), **Arka plan** swatch'ları + renk seçici + şeffaf.
- Seçim varken: konum/boyut/döndürme/opaklık sayısal alanları, katman sırası, kilit; resim için köşe yuvarlaklığı, çerçeve, tarih damgası anahtarı; metin için font/boyut/renk/hizalama.
- Carousel modunda "ui" katmanında sayfa sınırları kesik çizgi + üstte `1/5` etiketleri.
- **Bitti:** 3 sayfalı carousel'de bir foto iki sayfaya taşacak şekilde konabiliyor.

**S1.10 · "1 Tık Ay Dump'ı" (2:35–2:55)**
- `lib/palette.ts → extractPalette(img, k = 5): string[]`: 64×64'e çiz, her pikseli 4-bit/kanal kuantize et, histogramın en sık 5 rengi (çok koyu/çok açık olanlar elenir).
- `lib/monthDump.ts → runMonthDump()`:
  1. Fotoğrafları `takenAt`'e göre sırala (yoksa yükleme sırası).
  2. Ay/yıl = fotoğrafların çoğunluğunun ayı. Türkçe etiket: `new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(d).toLocaleUpperCase('tr-TR')` + ` '26` → `EKİM '26`.
  3. Kapak fotoğrafı = paleti en doygun olan.
  4. `cover-month` + uygun içerik şablonu ile sayfa sayısı = `1 + ceil(kalan / slotPerPage)` (tier limitiyle kırp).
  5. Kapağa palet çipleri (5 küçük `Rect`), arka plan = kapak dominant renginin açık tonu.
  6. Creator+ ise tüm `ImageEl.stamp = true`.
  7. Hepsi **tek** `replaceDoc` çağrısı → tek undo adımı.
- Tarih damgası render'ı (`ImageNode` içinde `Group`): sağ alt köşede `Text` — font VT323, renk `#ff9a1f`, `shadowColor` aynı renk, `shadowBlur: 8`, metin `'26 10 14` formatı.
- TopBar'a "✨ Ayın Dump'ı" butonu.
- **Bitti:** 12 EXIF'li foto → tek tık → kapak + kronolojik sayfalar + damgalar; ⌘Z hepsini geri alıyor.

**S1.11 · Tier kilitleri & paywall (2:55–3:00)**
- `components/editor/Locked.tsx`: `<Locked feature="stamp">{children}</Locked>` → izin yoksa children'ı devre dışı + `Crown` gösterir, tıklayınca `PaywallModal`.
- `PaywallModal`: özellik adı + 3 paket kartı (Free / Creator $5 / Studio $10). Sprint 1'de butonlar dev toggle'ı çağırır; Sprint 2'de checkout'a gider.
- **Commit:** `feat: templates, carousel pages, month dump, tier gating`

#### Saat 4 — Export, metin/sticker, cila, deploy

**S1.12 · Export motoru (3:00–3:25)**
- `lib/export.ts`:
  ```ts
  export async function exportPages(stage: Konva.Stage, doc: DumpDoc, opts: {
    mime: 'image/png' | 'image/jpeg'; longSide: number; pages: number[]; watermark: boolean;
    onProgress?: (done: number, total: number) => void;
  }): Promise<Blob[]>
  ```
  1. Mevcut `scale`/`position`'ı sakla → `stage.scale({x:1,y:1})`, `stage.position({x:0,y:0})`; `ui` katmanını ve Transformer'ı gizle.
  2. Filigran gerekiyorsa her sayfaya geçici `Konva.Text` ekle (sağ alt, %50 opaklık).
  3. `pixelRatio = opts.longSide / Math.max(doc.format.w, doc.format.h)` — **Safari'nin ~16.7M piksel canvas sınırı** yüzünden "4K" = uzun kenar 3840 (1080×1440 için 2880×3840 ≈ 11M px, güvenli).
  4. Her sayfa için `await stage.toBlob({ x: i * w, y: 0, width: w, height: h, pixelRatio, mimeType: opts.mime, quality: 0.92 })`, aralarda `onProgress`.
  5. `finally`: geçici düğümleri sil, katmanları ve scale/position'ı geri yükle.
- `downloadZip(blobs, title)`: JSZip → `dump-01.png`, `dump-02.png` … → `generateAsync({ type: 'blob' })` → `saveAs`.
- `ExportDialog`: format (PNG/JPG), kalite (HD / 2K👑 / 4K👑), sayfalar (tümü / seçili), "ZIP olarak indir"👑, ilerleme çubuğu, bitince toast.
- **Bitti:** 5 sayfalık carousel → ZIP → 5 dosya doğru sırada, sayfa sınırlarından kusursuz kesilmiş (seamless geçiş Instagram'da kaydırınca akıyor).

**S1.13 · Metin, sticker, arka plan, boş durumlar (3:25–3:45)**
- `TextPanel`: hazır stiller (Başlık — Playfair 96px, Alt yazı — Inter 40px, Etiket balonu — beyaz yuvarlak arka planlı, El yazısı — Caveat). Tıklayınca aktif sayfanın ortasına ekler.
- Metin düzenleme: `TextNode` çift tık → Konva'nın standart yöntemi: node'un ekran konumuna mutlak konumlu `<textarea>` yerleştir, Enter/blur'da `updateElement`.
- `StickersPanel`: `public/stickers/` altında ~24 SVG (Fluent Emoji, MIT — lisans dosyası `public/stickers/LICENSE`'a). Tıkla → ekle.
- Boş durum: hiç foto yokken canvas ortasında "Fotoğraflarını buraya bırak" + Upload butonu; tüm canvas alanı drop hedefi.
- **Bitti:** Metin ekleniyor, düzenleniyor, fontu değişiyor; sticker ekleniyor.

**S1.14 · Test & deploy (3:45–4:00)**
- Test matrisi (manuel):
  | Senaryo | Beklenen |
  |---|---|
  | 1 / 6 / 20 foto (Free'de 7. foto) | 7. foto reddedilir, paywall açılır |
  | Dikey + yatay karışık, EXIF'siz PNG/ekran görüntüsü | Yerleşim bozulmuyor, `takenAt = null` sırası korunuyor |
  | HEIC (iPhone) | Safari açar; Chrome açamazsa anlaşılır hata mesajı (dönüştürme sonraki sürüme) |
  | Safari + Chrome, 4K export, 10 sayfa | Hata yok, dosyalar 2880×3840 |
  | Undo/redo 20 adım, ay dump'ı → ⌘Z | Tek adımda geri alınıyor |
- `npm run build` → GitHub'a push → Vercel'de "Import Project" → otomatik deploy.
- **Commit:** `feat: export engine, text & stickers, polish` → tag `v0.1.0`

**Sprint 1 — Tanım gereği bitti:** Yayındaki URL'de kullanıcı foto yükleyip şablon/ay dump'ı ile carousel oluşturup PNG/ZIP indirebiliyor; tier kısıtları (mock) çalışıyor.

---

### Sprint 2 — Landing, Dashboard, Şablon Galerisi, AI Asistan, Giriş & Ödeme (4 saat)

#### Saat 1 — Tanıtım sitesi (landing)

**S2.1 · Marketing layout (0:00–0:10)**
- `npm i lenis`
- `app/(marketing)/layout.tsx`: açık tema, `LenisProvider` (client: `new Lenis({ lerp: 0.1 })` + `requestAnimationFrame` döngüsü, unmount'ta `destroy()`), `GlassNav`, `Footer`.
- `GlassNav`: `sticky top-0 z-50` dış kap; içte `mx-auto mt-3 h-12 max-w-[calc(100vw-24px)] rounded-full bg-white/70 backdrop-blur-[18px] backdrop-saturate-[1.8]` → logo · Özellikler · Fiyatlar · Şablonlar · "Giriş yap".
- `metadata`: title, description, `openGraph` (1200×630 görsel `public/og.png`), `twitter`.

**S2.2 · Bölümler (0:10–0:55)** — `app/(marketing)/page.tsx` sırayla:
1. `Hero`: iki satırlı başlık ("Ayın fotoğrafları, / **tek tıkla dump.**" — ikinci satır accent), alt metin, CTA "Dump'lamaya başla" → `/app/editor/new`; altında editörün ekran görüntüsü tarayıcı çerçevesi içinde (`next/image`, `priority`).
2. `WordReveal`: cümle kelimelere bölünür; her kelime `<span class="inline-block overflow-hidden"><span style="--i:n" class="reveal">…</span></span>`; CSS `@keyframes rise { from { transform: translateY(110%) } }`, `animation-delay: calc(var(--i) * 60ms)`; `IntersectionObserver` görünür olunca `.is-in` sınıfı ekler.
3. `StickyStory`: dış `section h-[220vh]`, iç `sticky top-0 h-screen`; ilerleme `p = clamp(-rect.top / (rect.height - innerHeight), 0, 1)` (Lenis `scroll` event'inde hesaplanır) → `style={{'--p': p}}`; 3 mesaj `p < .33 / .66 / 1`'e göre opaklıkla değişir; telefon mockup'ında carousel `translateX(calc(var(--p) * -200%))`.
4. `AgentShowcase` (bizim farkımız): sticky sahnede asistanın bir dump'ı yorumladığı sahte chat — mesajlar `p`'ye göre sırayla belirir, "Uygula" basılınca yandaki carousel'in sırası değişir.
5. `FeatureGrid`: 6 kart (Tek canvas carousel · Ay dump'ı · AI Asistan · Şablonlar · 4K export · Telefonda da çalışır), her biri küçük loop video (`<video autoPlay muted loop playsInline>` WebM).
6. Üst üste binme efekti: sonraki bölüm `relative z-20 -mt-[100vh] rounded-t-[56px] bg-white`.
7. `PricingTable`: `Segmented` Aylık / Yıllık (-%30) → $0 / $5 / $10 ya da $0 / $42 / $84; kartlarda özellik listesi `TIER_LIMITS`'ten üretilir (tek kaynak).
8. `FAQ` (Radix Accordion): Fotoğraflarım nereye gidiyor? · TL ile ödeyebilir miyim? · İptal · AI Asistan ne yapar?
9. `FinalCTA` + `Footer`.
- `prefers-reduced-motion` → animasyonlar ve Lenis kapalı.

**S2.3 · SEO dosyaları (0:55–1:00)**
- `app/sitemap.ts`, `app/robots.ts`, `app/(marketing)/photo-dump-maker/page.tsx` (aynı bileşenler, farklı başlık/metin).
- **Bitti:** Lighthouse mobil: Performance ≥ 85, SEO ≥ 95. **Commit:** `feat: marketing landing`

#### Saat 2 — Dashboard, kayıt, şablon galerisi

**S2.4 · Yerel kayıt (IndexedDB) (1:00–1:20)**
- `npm i idb-keyval`
- `lib/persist.ts`:
  - `saveDump(doc, assets)`: `set('dump:'+id, doc)`, her asset blob'u `set('asset:'+assetId, blob)`, küçük resim `set('thumb:'+id, dataURL)` (Stage'den `pixelRatio` ≈ 0.25, ilk sayfa).
  - `loadDump(id)`: doc + blob'lar → `addFiles` benzeri yeniden `Asset` oluşturma.
  - `listDumps()`: `keys()` içinden `dump:` önekliler.
- Editörde otomatik kayıt: `useDoc.subscribe` → 1 sn debounce → `saveDump`. TopBar'da bulut ikonu "Kaydedildi / Kaydediliyor…".
- **Bitti:** Sayfayı yenile → dump aynen geri geliyor.

**S2.5 · Dashboard (1:20–1:35)**
- `app/app/layout.tsx`: sol rail (Oluştur · Dump'larım · Şablonlar · Plan · Hesap). Editör sayfası rail'i gizler (kendi düzeni var).
- `app/app/page.tsx` → "Dump'larım": küçük resim kartları (başlık, tarih, sayfa sayısı, sil/çoğalt menüsü); boş durum "Henüz dump yok" + CTA.

**S2.6 · Şablon galerisi (1:35–2:00)**
- Şablon üretimi için dev-only araç: editörde "Şablon olarak dışa aktar" butonu → mevcut doc'u normalize edip `Template` JSON'u indirir. Bu araçla toplam **16 şablon** üretilip `public/templates/`'e konur (preview PNG'ler Unsplash/Pexels fotoğraflarıyla, atıf `public/templates/CREDITS.md`).
- `app/app/templates/page.tsx`: arama (başlık + tag), filtre chip'leri (Tümü · Story · Portre · Kare · Carousel), sıralama; grid'in ilk hücresi "Boş dump".
- `TemplateDetailModal`: büyük önizleme, "Story 9:16 · 5 foto", `Crown` (Creator ise), "Bu şablonu kullan" → `/app/editor/new?template=<id>` → editör şablonu boş slot'larla açar; altta "Benzer şablonlar" (aynı tag).
- **Commit:** `feat: persistence, dashboard, template gallery`

#### Saat 3 — AI Asistan (Gemini)

**S2.7 · Sunucu tarafı (2:00–2:15)**
- `npm i ai @ai-sdk/google @ai-sdk/react zod @upstash/ratelimit @upstash/redis`
- `lib/agent/tools.ts` — **execute'suz** araç tanımları (tarayıcıda uygulanacak):
  ```ts
  import { tool } from 'ai';
  import { z } from 'zod';
  export const agentTools = {
    reorder_photos:  tool({ description: 'Fotoğraf sırasını değiştir', inputSchema: z.object({ order: z.array(z.string()).describe('assetId listesi, yeni sırayla'), reason: z.string() }) }),
    set_cover:       tool({ description: 'Kapak fotoğrafını seç', inputSchema: z.object({ assetId: z.string(), reason: z.string() }) }),
    apply_template:  tool({ description: 'Şablon uygula', inputSchema: z.object({ templateId: z.string(), reason: z.string() }) }),
    set_background:  tool({ description: 'Arka plan rengi', inputSchema: z.object({ color: z.string().regex(/^#[0-9a-f]{6}$/i), reason: z.string() }) }),
    add_text:        tool({ description: 'Sayfaya metin ekle', inputSchema: z.object({ page: z.number().int().min(0), text: z.string().max(80), style: z.enum(['title','caption','bubble','handwritten']) }) }),
    remove_photo:    tool({ description: 'Fotoğrafı çıkarmayı öner', inputSchema: z.object({ assetId: z.string(), reason: z.string() }) }),
    suggest_caption: tool({ description: 'Caption ve hashtag öner', inputSchema: z.object({ captions: z.array(z.string()).length(3), hashtags: z.array(z.string()).max(12) }) }),
  };
  ```
- `lib/agent/systemPrompt.ts` (TR, sabit metin — her istekte aynı kalmalı): rol, ton, kurallar ("önerini araçla yap", "kullanıcı onaylamadan değiştirdim deme", "sadece verilen assetId/templateId değerlerini kullan"), mevcut şablon listesi (id + kısa açıklama).
- `app/api/agent/route.ts`:
  ```ts
  import { streamText, convertToModelMessages } from 'ai';
  import { createGoogleGenerativeAI } from '@ai-sdk/google';
  const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
  export const maxDuration = 30;
  export async function POST(req: Request) {
    const { messages, deep } = await req.json();
    const gate = await checkQuota(req, deep ? 'deep' : 'chat');      // S2.10
    if (!gate.ok) return Response.json({ error: 'quota', resetAt: gate.reset }, { status: 429 });
    const result = streamText({
      model: google(deep ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite'),
      system: SYSTEM_TR,
      messages: convertToModelMessages(messages),
      tools: agentTools,
    });
    return result.toUIMessageStreamResponse();
  }
  ```
  *AI SDK fonksiyon adları (`convertToModelMessages`, `toUIMessageStreamResponse`, `inputSchema`) kurulu sürümün dokümanıyla doğrulanacak.*
- **Bitti:** `curl` ile basit bir mesaj gönderildiğinde stream dönüyor.

**S2.8 · Bağlam hazırlama (2:15–2:30)**
- `lib/agent/renderThumbs.ts → renderThumbs(stage, doc): Promise<string[]>`: `exportPages` mantığıyla her sayfa `longSide: 384`, JPEG 0.7 → data URL (her biri ≈ 258 token).
- `lib/agent/docSummary.ts → summarize(doc, assets)`: modele gidecek kompakt JSON — format, sayfa sayısı, sayfa başına fotoğraflar (`assetId`, kısa ad `foto-3`, çekim tarihi, dominant renk, yön), metinler, mevcut şablon. Ham koordinatlar gönderilmez (token tasarrufu).
- Gönderim: kullanıcı mesajına `files` olarak sayfa görselleri + metin olarak özet JSON eklenir. Görseller sadece "Yorumla"/"Derin yorum" isteklerinde ve doc değiştiyse gönderilir; normal sohbette sadece özet.

**S2.9 · Asistan paneli (2:30–2:50)**
- `components/agent/AgentPanel.tsx`:
  ```ts
  const { messages, sendMessage, addToolOutput, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/agent' }),
  });
  ```
  - Mesaj parçaları (`message.parts`) render edilir: `text` → balon; `tool-<ad>` parçası `input-available` durumundaysa → `SuggestionCard`.
  - `SuggestionCard`: başlık (araç adına göre TR etiket), `reason`, mini önizleme (ör. yeni sıralama küçük resimleri), **Uygula** / **Yoksay**.
    - Uygula → `applyToolCall(name, input)` → doc store (tek undo adımı) → `addToolOutput({ tool, toolCallId, output: { applied: true } })`.
    - Yoksay → `addToolOutput({ ..., output: { applied: false } })`.
  - Hızlı chip'ler: "Yorumla" (deep=false + görseller), "Derin yorum · N kaldı" (deep=true), "Sıralamayı düzelt", "Caption yaz", "Daha minimal".
  - `status === 'streaming'` → iskelet animasyonu; `error` 429 ise "Bugünkü hakkın doldu" + Plan butonu.
  - İlk açılışta KVKK onay kartı (bölüm 3.7); onay `localStorage` + (Sprint 2 sonunda) profil.
- `lib/agent/applyToolCall.ts`: her araç için Zod ile **tekrar doğrula** → bilinmeyen `assetId`/`templateId` varsa uygulama, kullanıcıya "Bu öneri geçersiz" göster.
- `VibeScore`: `app/api/agent/score/route.ts` → `generateObject` (ya da sürüme göre `generateText` + `output` şeması) ile `{ hook, flow, color, variety: 1–10, summary }`; panelin üstünde 4 bar.

**S2.10 · Kota (2:50–3:00)**
- `lib/agent/quota.ts`: `@upstash/ratelimit` ile iki limiter — `chat` ve `deep`; anahtar = kullanıcı id (girişliyse) yoksa imzalı anonim cookie + IP.
  - Free: `chat` 5/gün, `deep` 3/7gün · Creator: 300/30gün, 30/30gün · Studio: 1000/30gün, 100/30gün.
  - Tier bilgisi sunucuda okunur (S2.12'den önce: herkes Free).
- **Commit:** `feat: gemini assistant with tool suggestions and quotas`

#### Saat 4 — Giriş, ödeme, yayın

**S2.11 · Supabase giriş (3:00–3:20)**
- `npm i @supabase/supabase-js @supabase/ssr`
- Supabase Dashboard → Authentication → Providers → Google (Google Cloud'da OAuth client oluştur, redirect URL'yi ekle).
- `lib/supabase/client.ts`, `lib/supabase/server.ts` (`createServerClient` + `cookies()`), `middleware.ts` (oturum yenileme), `app/auth/callback/route.ts`.
- Tablolar (SQL editor):
  ```sql
  create table subscriptions (
    user_id uuid primary key references auth.users on delete cascade,
    tier text not null default 'free' check (tier in ('free','creator','studio')),
    status text,                       -- active | cancelled | expired | past_due
    ls_subscription_id text unique,
    renews_at timestamptz,
    updated_at timestamptz default now()
  );
  alter table subscriptions enable row level security;
  create policy "own row" on subscriptions for select using (auth.uid() = user_id);
  ```
- `app/api/me/route.ts` → `{ user, tier }`; `tier` store artık buradan beslenir (dev toggle sadece development'ta).
- Asistan ve 2K/4K export girişi zorunlu kılar (Free kullanıcı da Google ile girer).

**S2.12 · Ödeme (Lemon Squeezy) (3:20–3:40)**
- Lemon Squeezy'de ürün: "Dump Creator" → varyantlar Creator aylık $5 / yıllık $42, Studio aylık $10 / yıllık $84.
- Checkout: `PaywallModal` / `PricingTable` butonu → `${CHECKOUT_URL}?checkout[email]=${email}&checkout[custom][user_id]=${userId}` (overlay için `lemon.js` opsiyonel).
- `app/api/webhooks/billing/route.ts`:
  1. Ham gövdeyi oku (`await req.text()`), `X-Signature` başlığını `HMAC-SHA256(rawBody, LEMONSQUEEZY_WEBHOOK_SECRET)` ile karşılaştır (`crypto.timingSafeEqual`). Uyuşmazsa 401.
  2. `meta.event_name`: `subscription_created | subscription_updated | subscription_cancelled | subscription_expired | subscription_resumed`.
  3. `meta.custom_data.user_id` + `data.attributes.variant_id` → tier eşlemesi; `status`, `renews_at` → `subscriptions` tablosuna **service role** ile upsert.
- Hesap sayfası: plan, yenilenme tarihi, "Aboneliği yönet" (Lemon Squeezy müşteri portalı linki).
- **Plan B:** Mağaza onayı gelmediyse checkout butonları "Yakında" + bekleme listesi e-postası; tier herkes için Free.

**S2.13 · Yasal & yayın (3:40–4:00)**
- `app/(marketing)/gizlilik/page.tsx` (KVKK aydınlatma: hangi veri, AI işleme — Google LLC Gemini API, ödeme — Lemon Squeezy, analitik — Umami çerezsiz), `kosullar/page.tsx`, iade politikası.
- Umami script'i (`next/script`, `strategy="afterInteractive"`).
- Vercel → Environment Variables (7.0 listesi) → Production deploy.
- Yayın kontrol listesi:
  - [ ] Google Cloud'da Gemini projesi **faturalandırma açık** + bütçe uyarısı ($20)
  - [ ] Lemon Squeezy webhook URL'si production domain'e ayarlı, test satın alması (test mode) tier'ı güncelledi
  - [ ] Supabase Google OAuth redirect URL'leri production domain'i içeriyor
  - [ ] `.env.local` repoda yok (`git ls-files | grep env` boş)
  - [ ] OG görseli paylaşım önizlemesinde doğru
- **Commit:** `feat: auth, billing, legal pages` → tag `v0.2.0`

**Sprint 2 — Tanım gereği bitti:** Ziyaretçi landing'den editöre geçiyor, Google ile giriyor, AI Asistan'dan öneri alıp "Uygula" ile dump'ını değiştiriyor, Creator/Studio satın alınca kilitler açılıyor.

---

### 7.2 Görev bağımlılıkları
```
S1.1 → S1.2 → S1.3 → S1.4 → S1.5 ─┐
                         └→ S1.6 ─┼→ S1.8 → S1.9 → S1.10 → S1.12 → S1.14
                         S1.7 ────┘          S1.11 ┘   S1.13 ┘
S1.12 (exportPages) ──→ S2.8 (renderThumbs) ve S2.4 (küçük resim)
S1.8 (şablon şeması) ─→ S2.6 (galeri) ve S2.7 (apply_template aracı)
S2.11 (giriş) ────────→ S2.10 (kullanıcı bazlı kota) ve S2.12 (ödeme)
S2.1–S2.3 (landing) başka hiçbir şeye bağlı değil → paralel yapılabilir
```

### 7.3 Zaman kayarsa kesilecekler (sırasıyla)
1. S2.2 `AgentShowcase` ve feature videoları → statik görseller
2. S2.9 `VibeScore` → sadece metin yorumu
3. S1.13 sticker paneli → yalnızca emoji metni
4. S2.12 ödeme → Plan B (bekleme listesi)
5. S2.4 IndexedDB → sadece oturum içi (yenileyince kaybolur, uyarı göster)

### 7.4 Sprint sonrası backlog
- HEIC → JPEG dönüştürme (`heic2any`), video dump (MP4, `ffmpeg.wasm` veya WebCodecs)
- Topluluk şablonları (Yayınla / Kaydedilenler / Benim şablonlarım) — Supabase Storage
- Bulut senkronu (dump'lar cihazlar arası), marka kiti, özel font yükleme
- Magic Resize (Post → Story otomatik yeniden yerleşim; AI Asistan ile)
- Türkçe/İngilizce dil seçimi (`next-intl`)

---

## 8. Riskler & Dikkat Edilecekler
- **Marka/telif:** dump.cam'in logosu, metinleri, görselleri, şablonları ve isim benzerliği kullanılmamalı. Sadece genel UX kalıpları (cam navbar, sticky scroll, pill butonlar) serbestçe kullanılabilir.
- **AI maliyeti:** Kota sunucuda; önizlemeler 384px (258 token); Google Cloud bütçe uyarısı açık. İlk haftada gerçek kullanım `usageMetadata` loglarıyla izlenmeli. `gemini-3.8-flash` fiyatı 01.01.2027'de iki katına çıkıyor, kota tablosu bu fiyatla hesaplandı.
- **Gemini free tier:** İçerik Google tarafından ürün geliştirmede kullanılabilir → sadece geliştirmede, kendi test fotoğraflarınla kullan; yayında faturalandırma açık olmalı.
- **Client-side limitler:** Foto/sayfa limitleri tarayıcıda aşılabilir; gelir getiren özellikler (4K export, AI) sunucu tarafında doğrulanmalı.
- **Safari:** Canvas boyut limiti (≈16.7M piksel) — 20 sayfalık seamless 4K export'u sayfa sayfa render et.
- **KVKK:** Asistan için açık onay, gizlilik politikasında AI işleme maddesi.

---

## 9. Claude Code'a Başlangıç Komutu
> "PLAN.md bölüm 7'deki implementation plan'ı sırayla uygula. Saat 1 ile başla (S1.1 → S1.3): `dump-creator` alt klasöründe Next.js projesini kur, paketleri yükle, tasarım token'larını, UI bileşenlerini ve `/app/editor/[id]` iskeletini oluştur. Her görevin 'Bitti' kriterini doğrula, saat sonunda `npm run build` çalıştır ve plandaki commit mesajıyla commit at. Sonra dur ve bana özet ver."

---

### Kaynaklar
- dump.cam ana sayfası ve /templates — tarayıcıda doğrudan incelendi
- [Crello dataset (Hugging Face)](https://huggingface.co/datasets/cyberagent/crello/blob/d9bbb4739d24eac118cc9c8349700642771c8758/README.md) · [OpenCOLE](https://huggingface.co/datasets/cyberagent/opencole/raw/main/README.md) · [DesignAsCode](https://huggingface.co/datasets/Tony1109/DesignAsCode-training-data/blob/main/README.md)
- [Polotno templates library](https://polotno.com/docs/templates-library) · [Polotno template API](https://polotno.com/sdk/product/features/create-manage-templates-via-api)
- [Panoslice](https://apps.appfollow.io/ios/panoslice-carousel-splitter/1592547810?country=us) · [FlowGrid](https://apps.apple.com/th/app/flowgrid-seamless-carousel/id6758648018) · [Sparkal](https://mwm.ai/apps/sparkal-carousel-collage/6772778160)
- [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) · [API key](https://ai.google.dev/gemini-api/docs/api-key) · [Image understanding](https://ai.google.dev/gemini-api/docs/image-understanding) · [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) · [Function calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Billing: free vs paid tier](https://ai.google.dev/gemini-api/docs/billing) · [@google/genai README](https://cdn.jsdelivr.net/npm/@google/genai@1.50.1/README.md) · [AI SDK chatbot tool usage](https://app.unpkg.com/ai@7.0.40/files/docs/04-ai-sdk-ui/03-chatbot-tool-usage.mdx)
