import type { Metadata } from "next";
import { LEGAL, LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "İptal ve İade Politikası — Dump Creator",
  alternates: { canonical: "/iade" },
};

// Draft for legal review before launch; must match the refund settings in the Lemon Squeezy store.
export default function RefundPage() {
  return (
    <LegalPage
      title="İptal ve İade Politikası"
      updated={LEGAL.updated}
      sections={[
        {
          heading: "İptal",
          body: (
            <p>
              Aboneliğini Hesap sayfasındaki &quot;Aboneliği yönet&quot; bağlantısından istediğin zaman iptal edebilirsin. İptal
              sonrası mevcut dönemin sonuna kadar ücretli özellikler açık kalır, ardından Free plana geçersin.
            </p>
          ),
        },
        {
          heading: "İade",
          body: (
            <p>
              İlk ödemenden itibaren 14 gün içinde, ücretli özellikleri yoğun biçimde kullanmadıysan iade talep edebilirsin. Talebini
              {" "}
              {LEGAL.email} adresine, hesabının e-postasıyla gönder.
            </p>
          ),
        },
        {
          heading: "Dijital hizmet",
          body: (
            <p>
              Hizmet anında ifa edilen dijital bir içerik olduğundan, mevzuatın izin verdiği ölçüde cayma hakkı ilk kullanımla birlikte
              sona erebilir; bu durumda yukarıdaki iade politikası geçerlidir.
            </p>
          ),
        },
      ]}
    />
  );
}
