import type { Metadata } from "next";
import { LEGAL, LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK Aydınlatma Metni — Dump Creator",
  alternates: { canonical: "/gizlilik" },
};

// Draft for legal review before launch: bracketed values and processor list must be confirmed.
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Gizlilik ve KVKK Aydınlatma Metni"
      updated={LEGAL.updated}
      sections={[
        {
          heading: "Veri sorumlusu",
          body: (
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu {LEGAL.company}, {LEGAL.address}
              (&quot;Dump Creator&quot;) adresinde faaliyet gösterir. Sorularını {LEGAL.email} adresine iletebilirsin.
            </p>
          ),
        },
        {
          heading: "Fotoğrafların",
          body: (
            <>
              <p>
                Editörde yüklediğin fotoğraflar tarayıcında, cihazında işlenir ve cihazındaki tarayıcı depolamasında (IndexedDB)
                saklanır. Sunucularımıza yüklenmez.
              </p>
              <p>
                Yalnızca <strong>AI Asistan</strong>&apos;ı kullandığında ve ilk kullanımda onay verdikten sonra, dump&apos;ının
                sayfalarının küçük önizlemeleri (en fazla 384 piksel) ve metin özeti yorum üretilmesi için Google LLC&apos;nin Gemini
                API hizmetine gönderilir. Bu önizlemeleri kendi sunucularımızda saklamayız.
              </p>
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
        {
          heading: "Hukuki sebepler",
          body: (
            <p>
              Veriler KVKK md. 5/2-c (sözleşmenin kurulması ve ifası), md. 5/2-f (meşru menfaat) ve AI Asistan önizlemeleri için
              md. 5/1 (açık rıza) kapsamında işlenir. Açık rızanı istediğin zaman asistanı kullanmayı bırakarak geri alabilirsin.
            </p>
          ),
        },
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
        {
          heading: "Saklama süresi",
          body: (
            <p>
              Hesap ve abonelik kayıtları hesabın açık olduğu sürece ve yasal yükümlülükler gereği gereken süre boyunca saklanır.
              Cihazındaki dump&apos;ları tarayıcı verilerini silerek ya da Dump&apos;larım sayfasından silebilirsin.
            </p>
          ),
        },
        {
          heading: "Hakların",
          body: (
            <p>
              KVKK md. 11 kapsamında verilerinin işlenip işlenmediğini öğrenme, düzeltilmesini ya da silinmesini isteme, itiraz etme
              ve zarar hâlinde tazminat talep etme hakların vardır. Başvurularını {LEGAL.email} adresine iletebilirsin.
            </p>
          ),
        },
      ]}
    />
  );
}
