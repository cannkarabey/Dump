"use client";

import type { Dict } from "@/lib/i18n/dictionary";
import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { Reveal, RevealItem } from "./Reveal";

export function Faq({ t }: { t: Dict["faq"] }) {
  return (
    <section id="faq" className="scroll-mt-20 px-4 pb-24 sm:pb-32">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center display-2">{t.title}</h2>
        <Accordion.Root type="single" collapsible>
          <Reveal className="mt-10 flex flex-col gap-2">
            {t.items.map((item) => (
              <RevealItem key={item.q}>
                <Accordion.Item value={item.q} className="lift-card rounded-2xl border border-black/5 bg-white">
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium">
                      {item.q}
                      <Plus
                        size={18}
                        aria-hidden
                        className="shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-45"
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="faq-content px-5 pb-4 text-sm leading-relaxed text-muted">
                    {item.a}
                  </Accordion.Content>
                </Accordion.Item>
              </RevealItem>
            ))}
          </Reveal>
        </Accordion.Root>
      </div>
    </section>
  );
}
