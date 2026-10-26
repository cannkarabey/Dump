"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { Download, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Segmented } from "@/components/ui/Segmented";
import { Modal } from "@/components/ui/Modal";
import { Tooltip, TooltipProvider } from "@/components/ui/Tooltip";
import { Crown } from "@/components/ui/Crown";
import { Swatch } from "@/components/ui/Swatch";

/** Dev-only gallery of UI primitives in both themes. */
export default function UiGallery() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <TooltipProvider>
      <div className="grid flex-1 md:grid-cols-2">
        <Showcase theme="" />
        <Showcase theme="theme-dark" />
      </div>
    </TooltipProvider>
  );
}

function Showcase({ theme }: { theme: string }) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState("#ffffff");

  return (
    <section className={`${theme} flex flex-col gap-6 bg-bg p-8 text-fg`}>
      <h2 className="text-xl font-semibold">{theme ? "Koyu" : "Açık"} tema</h2>
      <div className="flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="accent">
          <Download size={16} /> Accent
        </Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex items-center gap-3">
        <Tooltip content="Beğen">
          <IconButton label="Beğen">
            <Heart size={18} />
          </IconButton>
        </Tooltip>
        <IconButton label="Aktif" active>
          <Heart size={18} />
        </IconButton>
        <span className="flex items-center gap-1 text-sm">
          Studio <Crown />
        </span>
      </div>
      <Segmented
        aria-label="Dönem"
        value={period}
        onChange={setPeriod}
        options={[
          { value: "monthly", label: "Aylık" },
          { value: "yearly", label: "Yıllık −30%" },
        ]}
      />
      <div className="flex gap-2">
        {["#ffffff", "#000000", "#f3ece2", "#e5e7eb", "transparent"].map((c) => (
          <Swatch key={c} color={c} selected={c === color} onClick={() => setColor(c)} />
        ))}
      </div>
      <p className="font-serif text-2xl">Playfair: Ekim dump&apos;ı İğşü</p>
      <p className="font-hand text-2xl">Caveat: güzel bir ay oldu</p>
      <p className="font-stamp text-2xl text-[#ff9a1f]">VT323: &apos;26 10 14</p>
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Modal aç
        </Button>
        <Modal open={open} onOpenChange={setOpen} title="Yeni dump" description="Ne oluşturuyorsun?">
          <p className="text-sm text-muted">Modal içeriği.</p>
        </Modal>
      </div>
    </section>
  );
}
