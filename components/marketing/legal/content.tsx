import type { Locale } from "@/lib/i18n/config";
import { LEGAL } from "../LegalPage";

/**
 * Legal copy per language. Drafts for legal review before launch: bracketed values in LEGAL
 * and the processor list must be confirmed. Turkish is the binding text.
 */
type Section = { heading: string; body: React.ReactNode };
type LegalDoc = { title: string; description: string; sections: Section[] };

export function privacy(lang: Locale): LegalDoc {
  if (lang === "en") {
    return {
      title: "Privacy Notice",
      description: "How Dump Creator handles your data under Turkish data protection law (KVKK).",
      sections: [
        { heading: "Data controller", body: <p>Under Turkish Law No. 6698 on the Protection of Personal Data (KVKK), the data controller is {LEGAL.company}, {LEGAL.address} (&quot;Dump Creator&quot;). Questions: {LEGAL.email}.</p> },
        {
          heading: "Your photos",
          body: (
            <>
              <p>Photos you add in the editor are processed in your browser, on your device, and stored in your browser&apos;s local storage (IndexedDB). They are not uploaded to our servers.</p>
              <p>Only when you use the <strong>AI Assistant</strong>, and after you agree the first time, small previews of your dump&apos;s pages (at most 384 pixels) and a text summary are sent to Google LLC&apos;s Gemini API to generate a review. We don&apos;t store these previews on our servers.</p>
            </>
          ),
        },
        {
          heading: "What we process and why",
          body: (
            <ul>
              <li>Account details (name, email, profile photo when you sign in with Google): to create and manage your account.</li>
              <li>Subscription and payment status (plan, status, renewal date): to provide the plan you bought.</li>
              <li>AI usage counters (an anonymous cookie id or your user id): to apply usage limits.</li>
              <li>Cookieless, aggregate site statistics: to improve the site. We don&apos;t build personal profiles.</li>
            </ul>
          ),
        },
        { heading: "Legal grounds", body: <p>We process data under KVKK Art. 5/2-c (performance of a contract), Art. 5/2-f (legitimate interest) and, for AI Assistant previews, Art. 5/1 (explicit consent). You can withdraw consent at any time by not using the assistant.</p> },
        {
          heading: "Recipients (including abroad)",
          body: (
            <ul>
              <li>Google LLC (Gemini API) — AI Assistant previews and summaries.</li>
              <li>Supabase Inc. — account and subscription records.</li>
              <li>Lemon Squeezy (Stripe) — payments and invoicing; we never see your card details.</li>
              <li>Upstash Inc. — AI usage counters.</li>
              <li>Hosting provider — [to be added once chosen].</li>
            </ul>
          ),
        },
        { heading: "Retention", body: <p>Account and subscription records are kept while your account is open and for as long as legal obligations require. You can delete dumps stored on your device by clearing browser data or from the My dumps page.</p> },
        { heading: "Your rights", body: <p>Under KVKK Art. 11 you can ask whether your data is processed, request correction or deletion, object, and claim compensation for damages. Send requests to {LEGAL.email}.</p> },
      ],
    };
  }
  return {
    title: "Gizlilik ve KVKK Aydınlatma Metni",
    description: "Dump Creator'ın kişisel verileri KVKK kapsamında nasıl işlediği.",
    sections: [
      { heading: "Veri sorumlusu", body: <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu {LEGAL.company}, {LEGAL.address} (&quot;Dump Creator&quot;) adresinde faaliyet gösterir. Sorularını {LEGAL.email} adresine iletebilirsin.</p> },
      {
        heading: "Fotoğrafların",
        body: (
          <>
            <p>Editörde yüklediğin fotoğraflar tarayıcında, cihazında işlenir ve cihazındaki tarayıcı depolamasında (IndexedDB) saklanır. Sunucularımıza yüklenmez.</p>
            <p>Yalnızca <strong>AI Asistan</strong>&apos;ı kullandığında ve ilk kullanımda onay verdikten sonra, dump&apos;ının sayfalarının küçük önizlemeleri (en fazla 384 piksel) ve metin özeti yorum üretilmesi için Google LLC&apos;nin Gemini API hizmetine gönderilir. Bu önizlemeleri kendi sunucularımızda saklamayız.</p>
          </>
        ),
      },
      {
        heading: "İşlenen veriler ve amaçları",
        body: (
          <ul>
            <li>Hesap bilgileri (Google ile girişte ad, e-posta, profil fotoğrafı): hesabını oluşturmak ve yönetmek.</li>
            <li>Abonelik ve ödeme durumu (plan, durum, yenileme tarihi): satın aldığın planı sağlamak.</li>
            <li>AI kullanım sayaçları (anonim çerez kimliği ya da kullanıcı kimliği): kullanım haklarını uygulamak.</li>
            <li>Çerezsiz, toplu site istatistikleri: siteyi geliştirmek. Kişisel profil oluşturmayız.</li>
          </ul>
        ),
      },
      { heading: "Hukuki sebepler", body: <p>Veriler KVKK md. 5/2-c (sözleşmenin kurulması ve ifası), md. 5/2-f (meşru menfaat) ve AI Asistan önizlemeleri için md. 5/1 (açık rıza) kapsamında işlenir. Açık rızanı istediğin zaman asistanı kullanmayı bırakarak geri alabilirsin.</p> },
      {
        heading: "Aktarılan taraflar (yurt dışı dahil)",
        body: (
          <ul>
            <li>Google LLC (Gemini API) — AI Asistan önizlemeleri ve özetleri.</li>
            <li>Supabase Inc. — hesap ve abonelik kayıtları.</li>
            <li>Lemon Squeezy (Stripe) — ödeme ve faturalandırma; kart bilgilerini biz görmeyiz.</li>
            <li>Upstash Inc. — AI kullanım sayaçları.</li>
            <li>Barındırma sağlayıcısı — [seçildiğinde eklenecek].</li>
          </ul>
        ),
      },
      { heading: "Saklama süresi", body: <p>Hesap ve abonelik kayıtları hesabın açık olduğu sürece ve yasal yükümlülükler gereği gereken süre boyunca saklanır. Cihazındaki dump&apos;ları tarayıcı verilerini silerek ya da Dump&apos;larım sayfasından silebilirsin.</p> },
      { heading: "Hakların", body: <p>KVKK md. 11 kapsamında verilerinin işlenip işlenmediğini öğrenme, düzeltilmesini ya da silinmesini isteme, itiraz etme ve zarar hâlinde tazminat talep etme hakların vardır. Başvurularını {LEGAL.email} adresine iletebilirsin.</p> },
    ],
  };
}

export function terms(lang: Locale): LegalDoc {
  if (lang === "en") {
    return {
      title: "Terms of Use",
      description: "The terms for using Dump Creator.",
      sections: [
        { heading: "The service", body: <p>Dump Creator is a browser-based editor for making photo dumps, carousels and stories for social media. The service is provided by {LEGAL.company}.</p> },
        { heading: "Your content is yours", body: <p>You keep all rights to the photos you add and the images you create. You confirm you have the rights needed for content you upload and that it doesn&apos;t infringe anyone else&apos;s rights.</p> },
        { heading: "AI Assistant", body: <p>The assistant&apos;s reviews and suggestions are generated by AI and may be wrong. Suggestions aren&apos;t applied until you approve them; you&apos;re responsible for the result.</p> },
        {
          heading: "Plans and payment",
          body: (
            <>
              <p>Paid plans are subscriptions that renew monthly or yearly. Prices are in USD; your bank may convert at its own rate at checkout. Payments are taken by Lemon Squeezy as merchant of record.</p>
              <p>You can cancel anytime; your plan stays active until the end of the period. Usage allowances (e.g. AI usage counts) are as stated on the pricing page.</p>
            </>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <ul>
              <li>Don&apos;t use it to create unlawful or hateful content or content that violates others&apos; privacy.</li>
              <li>Don&apos;t automate or abuse the service to get around usage limits.</li>
            </ul>
          ),
        },
        { heading: "Liability", body: <p>The service is provided &quot;as is&quot;. You&apos;re responsible for backing up dumps stored on your device; they can be lost if browser data is cleared.</p> },
        { heading: "Contact", body: <p>Questions: {LEGAL.email}</p> },
      ],
    };
  }
  return {
    title: "Kullanım Koşulları",
    description: "Dump Creator'ı kullanma koşulları.",
    sections: [
      { heading: "Hizmet", body: <p>Dump Creator, sosyal medya için photo dump, carousel ve story görselleri hazırlamanı sağlayan tarayıcı tabanlı bir editördür. Hizmeti {LEGAL.company} sunar.</p> },
      { heading: "İçeriğin senin", body: <p>Yüklediğin fotoğrafların ve oluşturduğun görsellerin tüm hakları sende kalır. Yüklediğin içerik için gerekli haklara sahip olduğunu ve başkalarının haklarını ihlal etmediğini kabul edersin.</p> },
      { heading: "AI Asistan", body: <p>Asistanın yorum ve önerileri yapay zekâ tarafından üretilir ve hatalı olabilir. Öneriler sen onaylamadan uygulanmaz; sonuçtan sen sorumlusun.</p> },
      {
        heading: "Planlar ve ödeme",
        body: (
          <>
            <p>Ücretli planlar aylık ya da yıllık yenilenen aboneliklerdir. Fiyatlar USD&apos;dir; ödeme anında kartının bankası tutarı kendi kuruyla çevirebilir. Ödemeler satıcı kaydı olarak Lemon Squeezy üzerinden alınır.</p>
            <p>Aboneliğini istediğin zaman iptal edebilirsin; iptal ettiğinde dönem sonuna kadar planın açık kalır. Kullanım hakları (ör. AI kullanım sayıları) plan sayfasında belirtildiği gibidir.</p>
          </>
        ),
      },
      {
        heading: "Kabul edilebilir kullanım",
        body: (
          <ul>
            <li>Hukuka aykırı, nefret içeren ya da başkalarının mahremiyetini ihlal eden içerik oluşturmak için kullanmamalısın.</li>
            <li>Kullanım limitlerini aşmak için hizmeti otomatikleştirmemeli ya da kötüye kullanmamalısın.</li>
          </ul>
        ),
      },
      { heading: "Sorumluluk", body: <p>Hizmet &quot;olduğu gibi&quot; sunulur. Cihazında saklanan dump&apos;ların yedeğinden sen sorumlusun; tarayıcı verilerinin silinmesiyle kaybolabilirler.</p> },
      { heading: "İletişim", body: <p>Sorular için: {LEGAL.email}</p> },
    ],
  };
}

export function refund(lang: Locale): LegalDoc {
  if (lang === "en") {
    return {
      title: "Cancellation & Refund Policy",
      description: "How to cancel your subscription and request a refund.",
      sections: [
        { heading: "Cancelling", body: <p>Cancel anytime from the &quot;Manage subscription&quot; link on your Account page. Paid features stay on until the end of the current period, then you move to the Free plan.</p> },
        { heading: "Refunds", body: <p>Within 14 days of your first payment, you can request a refund if you haven&apos;t used paid features heavily. Email {LEGAL.email} from your account&apos;s address.</p> },
        { heading: "Digital service", body: <p>Because the service is digital content delivered immediately, the right of withdrawal may end with first use to the extent the law allows; the refund policy above then applies.</p> },
      ],
    };
  }
  return {
    title: "İptal ve İade Politikası",
    description: "Aboneliğini nasıl iptal edeceğin ve iade talebi.",
    sections: [
      { heading: "İptal", body: <p>Aboneliğini Hesap sayfasındaki &quot;Aboneliği yönet&quot; bağlantısından istediğin zaman iptal edebilirsin. İptal sonrası mevcut dönemin sonuna kadar ücretli özellikler açık kalır, ardından Free plana geçersin.</p> },
      { heading: "İade", body: <p>İlk ödemenden itibaren 14 gün içinde, ücretli özellikleri yoğun biçimde kullanmadıysan iade talep edebilirsin. Talebini {LEGAL.email} adresine, hesabının e-postasıyla gönder.</p> },
      { heading: "Dijital hizmet", body: <p>Hizmet anında ifa edilen dijital bir içerik olduğundan, mevzuatın izin verdiği ölçüde cayma hakkı ilk kullanımla birlikte sona erebilir; bu durumda yukarıdaki iade politikası geçerlidir.</p> },
    ],
  };
}
