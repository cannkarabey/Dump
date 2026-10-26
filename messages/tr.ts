/** Turkish marketing copy (source of truth). en.ts must have the same shape. */
export const tr = {
  meta: {
    title: "Dump Creator — Ayın fotoğrafları, tek tıkla dump",
    description:
      "Instagram carousel, TikTok slideshow ve story için tarayıcıda photo dump oluştur. AI asistanı dump'ını yorumlasın, sıralamayı ve caption'ı önersin.",
    ogDescription: "Ayın fotoğrafları, tek tıkla dump. Kaydırınca akan carousel'ler, AI asistan, 4K export.",
    locale: "tr_TR",
  },
  nav: {
    label: "Ana menü",
    home: "Dump Creator ana sayfa",
    links: { features: "Özellikler", assistant: "AI Asistan", pricing: "Fiyatlar", faq: "SSS" },
    cta: "Dump'la",
    language: "Dil",
    switchTo: "English",
  },
  hero: {
    badge: "Yeni: dump'ını yorumlayan AI asistan",
    line1: "Ayın fotoğrafları,",
    line2: "tek tıkla dump.",
    sub: "Instagram carousel, TikTok slideshow ve story'ler için kaydırınca akan dump'lar hazırla. AI asistanın yorumlasın, sen paylaş.",
    primary: "Dump'lamaya başla",
    secondary: "Nasıl çalışır?",
    note: "Ücretsiz · kayıt gerekmez · fotoğrafların cihazında kalır",
  },
  mock: {
    title: "EKİM '26 dump",
    month: "EKİM '26",
    monthDump: "Ayın Dump'ı",
    export: "Dışa aktar",
    templates: "Şablonlar",
    assistant: "Asistan",
    advice: "Kapak güçlü! 2. sayfadaki iki fotoğraf çok benzer, birini 3. sayfaya taşıyalım mı?",
    apply: "Uygula",
    scores: ["Hook", "Akış", "Renk"],
  },
  define: {
    pos: "fiil",
    definition: "Bir yığın fotoğrafı, takipçilerinin kaydırmayı bırakıp baktığı bir içeriğe dönüştürmek.",
    tagline: "Daha çok paylaş. Daha az düşün.",
  },
  story: {
    handle: "ekim.dump",
    month: "EKİM '26",
    progress: "Adım {n} / {total}",
    steps: [
      { title: ["Tek canvas.", "Bütün carousel."], text: "Dump'ını tek parça tasarla; her slayt ayrı görsel olarak iner, kaydırınca kesintisiz akar." },
      { title: ["Fotoğrafların.", "Senin tarzın."], text: "Polaroid, film şeridi, panorama… Şablon gibi durmayan şablonlarla fotoğrafların öne çıksın." },
      { title: ["Ayın dump'ı.", "Tek tıkla."], text: "Çekim tarihine göre sıralar, ay kapağını ve renk paletini çıkarır, retro tarih damgası basar." },
    ],
  },
  agent: {
    badge: "AI Asistan",
    title: ["Dump'ına ikinci", "bir göz."],
    body: "Asistan slaytlarına bakar; zayıf kapağı, birbirine benzeyen kareleri ve kopuk renk akışını söyler. Önerisini beğenirsen tek tıkla uygulanır.",
    scores: ["Hook", "Akış", "Renk uyumu", "Çeşitlilik"],
    user: "Bu ayki dump'ımı yorumlar mısın?",
    reply:
      "Kapak biraz sönük kalıyor; en canlı fotoğrafın 3. sırada. Onu kapağa alıp benzer iki kareyi ayırırsak kaydırma ritmi düzelir.",
    cardTitle: "Sıralamayı düzelt",
    cardSub: "4 fotoğraf · kapak değişir",
    apply: "Uygula",
    applied: "Uygulandı ✓",
    caption: 'Caption önerisi: "ekim böyle geçti ☕🍂" · #photodump #ekimdump',
  },
  marquee: { label: "Şablonlardan örnekler" },
  features: {
    title: ["Daha çok paylaş.", "Daha az uğraş."],
    demoAsk: "Yorumla",
    demoTip: "Kapağa en canlı fotoğrafı al.",
    items: [
      { title: "Kesintisiz carousel", text: "Tek geniş canvas; fotoğraflar sayfa sınırlarını aşar, Instagram'da kaydırınca akar." },
      { title: "Ayın dump'ı", text: "EXIF tarihine göre sıralama, ay kapağı, renk paleti ve retro tarih damgası — tek tıkla." },
      { title: "AI asistan", text: "Kapağı, sıralamayı ve renk uyumunu yorumlar; Türkçe caption ve hashtag önerir." },
      { title: "Şablon gibi durmayan şablonlar", text: "Polaroid, film şeridi, panorama ve ay kapağı; fotoğrafları kutulara sürükle bırak." },
      { title: "4K'ya kadar export", text: "PNG ya da JPG, sayfa sayfa ya da tek ZIP. Studio'da uzun kenar 3840px." },
      { title: "Kayıt yok, kurulum yok", text: "Tarayıcıda açılır; fotoğrafların sunucuya yüklenmeden cihazında işlenir." },
    ],
  },
  pricing: {
    title: "Planını seç",
    sub: "Her şey ücretsiz denenebilir. Fiyatlar USD; ödeme anında kartının bankası TL'ye çevirir.",
    period: "Faturalandırma dönemi",
    monthly: "Aylık",
    yearly: "Yıllık −30%",
    popular: "En popüler",
    perMonth: "/ay",
    forever: "sonsuza kadar",
    billedYearly: "yıllık ${n} faturalanır",
    billedMonthly: "aylık faturalanır",
    blurbs: {
      free: "Dump'lamaya başlamak için.",
      creator: "Her ay düzenli paylaşanlar için.",
      studio: "İçerik üreticileri ve markalar için.",
    },
    ai: {
      creator: "AI asistan: 300 mesaj + 30 derin yorum / ay",
      studio: "AI asistan: 1000 mesaj + 100 derin yorum / ay",
    },
    startFree: "Ücretsiz başla",
    tryTier: "{tier}'ı dene",
  },
  faq: {
    title: "Sık sorulanlar",
    items: [
      {
        q: "Fotoğraflarım nereye gidiyor?",
        a: "Hiçbir yere. Fotoğraflar tarayıcında, cihazında işlenir ve dışa aktarılır. Yalnızca AI asistanı kullandığında slaytlarının küçük önizlemeleri yorum için yapay zekâ modeline gönderilir; bunu ilk kullanımda ayrıca onaylarsın.",
      },
      { q: "TL ile ödeyebilir miyim?", a: "Fiyatlar USD. Türk kartıyla ödediğinde tutarı bankan o günün kuruyla TL'ye çevirir." },
      {
        q: "Aboneliği istediğim zaman iptal edebilir miyim?",
        a: "Evet. İptal ettiğinde dönem sonuna kadar planın açık kalır, sonra Free'ye döner; dump'ların silinmez.",
      },
      {
        q: "AI asistan tam olarak ne yapar?",
        a: "Dump'ının kapağını, sıralamasını, renk uyumunu ve tekrar eden kareleri yorumlar; sıralama, şablon, arka plan ve caption önerir. Öneriler sen 'Uygula' demeden uygulanmaz.",
      },
      { q: "Telefonda çalışıyor mu?", a: "Tarayıcıda açılan her cihazda çalışır; geniş canvas düzenlemesi için bilgisayar daha rahat." },
    ],
  },
  final: {
    title: ["Bir sonraki postun", "burada başlıyor."],
    sub: "Bir şablon seç, fotoğraflarını bırak, bugün paylaş.",
    cta: "Dump'lamaya başla",
    note: "Ücretsiz · telefonda da çalışır",
  },
  footer: {
    tagline: "Aylık photo dump, Instagram carousel ve TikTok slideshow'larını tarayıcında hazırla.",
    product: "Ürün",
    explore: "Keşfet",
    legal: "Yasal",
    editor: "Editör",
    privacy: "Gizlilik ve KVKK",
    terms: "Kullanım koşulları",
    refund: "İptal ve iade",
    rights: "© 2026 Dump Creator. Tüm hakları saklıdır.",
  },
  photoDumpMaker: {
    title: "Photo Dump Maker — Ücretsiz Instagram photo dump oluşturucu | Dump Creator",
    description:
      "Ücretsiz photo dump maker: fotoğraflarını sürükle bırak, polaroid ve film şablonlarıyla Instagram carousel ya da TikTok slideshow hazırla, 4K'ya kadar indir.",
    line1: "Photo dump maker,",
    line2: "kurulumsuz ve ücretsiz.",
    sub: "Fotoğraflarını bırak, şablonunu seç, Instagram'a hazır carousel'i saniyeler içinde indir. Kaydırınca akan dump'lar, retro tarih damgaları, AI yorumları.",
  },
  legal: {
    updated: "Son güncelleme",
    translationNote: "",
  },
};

export type Dict = typeof tr;
