"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  hideClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hideClose?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            // Portal escapes .theme-dark, so the modal re-applies the app theme itself.
            "theme-dark fixed top-1/2 left-1/2 z-50 w-[min(92vw,880px)] -translate-x-1/2 -translate-y-1/2",
            "max-h-[90dvh] overflow-y-auto rounded-[28px] border border-border bg-card p-6 text-fg",
            "shadow-[0_32px_80px_-24px_#00000059] focus:outline-none",
            className,
          )}
        >
          <div className="mb-5 text-center">
            <Dialog.Title className="text-lg font-semibold tracking-tight">{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>
            ) : (
              <Dialog.Description className="sr-only">{title}</Dialog.Description>
            )}
          </div>
          {children}
          {!hideClose && (
            <Dialog.Close
              aria-label="Kapat"
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-muted hover:bg-hover hover:text-fg"
            >
              <X size={18} />
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
