"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

const ITEMS = [
  {
    q: "Fotoğraflarım nereye gidiyor?",
    a: "Hiçbir yere. Fotoğraflar tarayıcında, cihazında işlenir ve dışa aktarılır. Yalnızca AI asistanı kullandığında slaytlarının küçük önizlemeleri yorum için yapay zekâ modeline gönderilir; bunu ilk kullanımda ayrıca onaylarsın.",
  },
  {
    q: "TL ile ödeyebilir miyim?",
    a: "Fiyatlar USD. Türk kartıyla ödediğinde tutarı bankan o günün kuruyla TL'ye çevirir.",
  },
  {
    q: "Aboneliği istediğim zaman iptal edebilir miyim?",
    a: "Evet. İptal ettiğinde dönem sonuna kadar planın açık kalır, sonra Free'ye döner; dump'ların silinmez.",
  },
  {
    q: "AI asistan tam olarak ne yapar?",
    a: "Dump'ının kapağını, sıralamasını, renk uyumunu ve tekrar eden kareleri yorumlar; sıralama, şablon, arka plan ve caption önerir. Öneriler sen 'Uygula' demeden uygulanmaz.",
  },
  {
    q: "Telefonda çalışıyor mu?",
    a: "Tarayıcıda açılan her cihazda çalışır; geniş canvas düzenlemesi için bilgisayar daha rahat.",
  },
];

export function Faq() {
  return (
    <section id="sss" className="scroll-mt-20 px-4 pb-24 sm:pb-32">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-display text-[36px] leading-[1.05] font-semibold tracking-[-0.04em] sm:text-[44px]">
          Sık sorulanlar
        </h2>
        <Accordion.Root type="single" collapsible className="mt-10 flex flex-col gap-2">
          {ITEMS.map((item) => (
            <Accordion.Item key={item.q} value={item.q} className="rounded-2xl border border-black/5 bg-white">
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium">
                  {item.q}
                  <Plus size={18} className="shrink-0 transition group-data-[state=open]:rotate-45" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-5 pb-4 text-sm leading-relaxed text-muted">{item.a}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
