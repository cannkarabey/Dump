import type { Metadata } from "next";
import { LEGAL, LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Kullanım Koşulları — Dump Creator",
  alternates: { canonical: "/kosullar" },
};

// Draft for legal review before launch.
export default function TermsPage() {
  return (
    <LegalPage
      title="Kullanım Koşulları"
      updated={LEGAL.updated}
      sections={[
        {
          heading: "Hizmet",
          body: (
            <p>
              Dump Creator, sosyal medya için photo dump, carousel ve story görselleri hazırlamanı sağlayan tarayıcı tabanlı bir
              editördür. Hizmeti {LEGAL.company} sunar.
            </p>
          ),
        },
        {
          heading: "İçeriğin senin",
          body: (
            <p>
              Yüklediğin fotoğrafların ve oluşturduğun görsellerin tüm hakları sende kalır. Yüklediğin içerik için gerekli haklara
              sahip olduğunu ve başkalarının haklarını ihlal etmediğini kabul edersin.
            </p>
          ),
        },
        {
          heading: "AI Asistan",
          body: (
            <p>
              Asistanın yorum ve önerileri yapay zekâ tarafından üretilir ve hatalı olabilir. Öneriler sen onaylamadan uygulanmaz;
              sonuçtan sen sorumlusun.
            </p>
          ),
        },
        {
          heading: "Planlar ve ödeme",
          body: (
            <>
              <p>
                Ücretli planlar aylık ya da yıllık yenilenen aboneliklerdir. Fiyatlar USD&apos;dir; ödeme anında kartının bankası
                tutarı kendi kuruyla çevirebilir. Ödemeler satıcı kaydı olarak Lemon Squeezy üzerinden alınır.
              </p>
              <p>
                Aboneliğini istediğin zaman iptal edebilirsin; iptal ettiğinde dönem sonuna kadar planın açık kalır. Kullanım
                hakları (ör. AI kullanım sayıları) plan sayfasında belirtildiği gibidir.
              </p>
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
        {
          heading: "Sorumluluk",
          body: (
            <p>
              Hizmet &quot;olduğu gibi&quot; sunulur. Cihazında saklanan dump&apos;ların yedeğinden sen sorumlusun; tarayıcı
              verilerinin silinmesiyle kaybolabilirler.
            </p>
          ),
        },
        {
          heading: "İletişim",
          body: <p>Sorular için: {LEGAL.email}</p>,
        },
      ]}
    />
  );
}
