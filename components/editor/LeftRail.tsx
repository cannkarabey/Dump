"use client";

import {
  Blend,
  Layers,
  LayoutTemplate,
  PenLine,
  Settings,
  Sticker,
  Type,
  Upload,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useUi, type LeftPanel } from "@/lib/store/ui";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/app";

export const RAIL_ITEMS: { id: LeftPanel; icon: LucideIcon }[] = [
  { id: "upload", icon: Upload },
  { id: "templates", icon: LayoutTemplate },
  { id: "stickers", icon: Sticker },
  { id: "text", icon: Type },
  { id: "tools", icon: Wrench },
  { id: "filters", icon: Blend },
  { id: "draw", icon: PenLine },
  { id: "layers", icon: Layers },
  { id: "settings", icon: Settings },
];

export function LeftRail() {
  const active = useUi((s) => s.activePanel);
  const setActive = useUi((s) => s.setActivePanel);
  const { t } = useT();

  return (
    <nav aria-label={t.editor.tools} className="flex min-h-0 flex-col gap-1 overflow-y-auto rounded-[var(--radius-panel)] bg-panel p-1.5">
      {RAIL_ITEMS.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setActive(id)}
          aria-current={active === id ? "page" : undefined}
          className={cn(
            "flex shrink-0 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition",
            active === id ? "bg-active text-fg" : "text-muted hover:bg-hover hover:text-fg",
          )}
        >
          <Icon size={20} strokeWidth={1.75} />
          {t.editor.panels[id]}
        </button>
      ))}
    </nav>
  );
}
