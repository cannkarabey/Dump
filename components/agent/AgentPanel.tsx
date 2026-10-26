"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, ShieldCheck, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAssets } from "@/lib/store/assets";
import { useUi } from "@/lib/store/ui";
import { applyToolCall } from "@/lib/agent/applyToolCall";
import { buildUserParts, createAgentTransport, errorMessage, quotaListeners } from "@/lib/agent/client";
import type { AgentToolName, AgentUIMessage } from "@/lib/agent/tools";
import { cn } from "@/lib/cn";
import { SuggestionCard } from "./SuggestionCard";
import { VibeScoreCard } from "./VibeScoreCard";

const CONSENT_KEY = "dc-ai-consent";

const CHIPS: { label: string; text: string; images?: boolean; deep?: boolean }[] = [
  { label: "Yorumla", text: "Bu dump'ı yorumlar mısın? En önemli 2-3 iyileştirmeyi öner.", images: true },
  { label: "Derin yorum", text: "Dump'ımı detaylıca incele: kapak, sıralama, renk akışı ve tekrar eden kareler.", images: true, deep: true },
  { label: "Sıralamayı düzelt", text: "Fotoğrafların sırasını daha iyi bir akış için düzenler misin?", images: true },
  { label: "Caption yaz", text: "Bu dump için Türkçe caption ve hashtag öner." },
  { label: "Daha minimal", text: "Dump'ı daha sade ve minimal göstermek için ne değiştirmeliyim?", images: true },
];

type ToolPart = Extract<AgentUIMessage["parts"][number], { type: `tool-${string}` }>;

function isToolPart(part: AgentUIMessage["parts"][number]): part is ToolPart {
  return part.type.startsWith("tool-");
}

export function AgentPanel() {
  const [consented, setConsented] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(CONSENT_KEY) === "1";
    } catch {
      return false;
    }
  });
  if (!consented) {
    return (
      <ConsentCard
        onAccept={() => {
          try {
            window.localStorage.setItem(CONSENT_KEY, "1");
          } catch {
            // Private mode: consent lasts for this session only.
          }
          setConsented(true);
        }}
      />
    );
  }
  return <Chat />;
}

function Chat() {
  const [transport] = useState(createAgentTransport);
  const { messages, sendMessage, addToolOutput, status, error, stop, clearError } = useChat<AgentUIMessage>({ transport });
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const hasPhotos = useAssets((s) => s.order.length > 0);
  const listRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    quotaListeners.add(setRemaining);
    return () => void quotaListeners.delete(setRemaining);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const pendingParts = () =>
    messages.at(-1)?.role === "assistant" ? messages.at(-1)!.parts.filter(isToolPart).filter((p) => p.state === "input-available") : [];

  const resolve = (part: ToolPart, output: { applied: boolean; message?: string }) => {
    const tool = part.type.slice("tool-".length) as AgentToolName;
    // Tools have no execute/outputSchema, so the SDK types their output as unknown.
    void addToolOutput({ tool, toolCallId: part.toolCallId, output } as Parameters<typeof addToolOutput>[0]);
  };

  const send = (text: string, opts: { images?: boolean; deep?: boolean } = {}) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    // Every tool call needs a result before the next turn; unanswered suggestions count as skipped.
    pendingParts().forEach((p) => resolve(p, { applied: false }));
    clearError();
    void sendMessage({ parts: buildUserParts(trimmed, Boolean(opts.images && hasPhotos)) }, { body: { deep: Boolean(opts.deep) } });
    setInput("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <VibeScoreCard disabled={!hasPhotos || busy} />

      <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1" aria-live="polite">
        {!messages.length && (
          <div className="m-auto flex max-w-60 flex-col items-center gap-2 py-6 text-center">
            <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent">
              <Sparkles size={20} />
            </span>
            <p className="text-sm font-semibold">Dump&apos;ına ikinci bir göz</p>
            <p className="text-xs text-muted">
              {hasPhotos ? "Aşağıdan bir kısayol seç ya da sorunu yaz." : "Önce birkaç fotoğraf ekle; asistan slaytlarına bakarak yorum yapar."}
            </p>
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <UserBubble key={m.id} message={m} />
          ) : (
            <div key={m.id} className="flex flex-col gap-2">
              {m.parts.map((part, i) => {
                if (part.type === "text" && part.text.trim()) {
                  return (
                    <p key={i} className="max-w-[92%] self-start rounded-2xl bg-hover px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap">
                      {part.text}
                    </p>
                  );
                }
                if (isToolPart(part)) {
                  const name = part.type.slice("tool-".length) as AgentToolName;
                  const state = part.state === "input-streaming" ? "streaming" : part.state === "input-available" ? "pending" : "done";
                  return (
                    <SuggestionCard
                      key={part.toolCallId}
                      name={name}
                      input={part.input as Record<string, unknown> | undefined}
                      state={state}
                      output={"output" in part ? (part.output as unknown as { applied?: boolean; message?: string }) : undefined}
                      onApply={() => resolve(part, applyToolCall(name, part.input))}
                      onDismiss={() => resolve(part, { applied: false })}
                    />
                  );
                }
                return null;
              })}
            </div>
          ),
        )}

        {status === "submitted" && (
          <div className="flex gap-1 self-start rounded-2xl bg-hover px-3 py-3" aria-label="Asistan düşünüyor">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-[#ff453a]/30 bg-[#ff453a]/10 p-3 text-xs leading-snug">
            {errorMessage(error)}
            {(error as { code?: string }).code === "quota" && (
              <button type="button" onClick={() => useUi.getState().openPaywall()} className="ml-1 font-medium text-accent underline">
                Planlar
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CHIPS.map((c) => (
          <button
            key={c.label}
            type="button"
            disabled={busy || (c.images && !hasPhotos)}
            onClick={() => send(c.text, c)}
            className={cn(
              "h-7 rounded-full px-3 text-xs font-medium transition disabled:opacity-40",
              c.deep ? "bg-accent-soft text-accent hover:bg-accent hover:text-white" : "bg-hover text-fg/80 hover:bg-active",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 rounded-2xl bg-hover p-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Asistana sor…"
          aria-label="Asistana mesaj"
          className="max-h-28 min-h-8 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm outline-none placeholder:text-muted"
        />
        {busy ? (
          <Button type="button" size="sm" variant="secondary" onClick={() => void stop()} aria-label="Durdur">
            <Square size={13} />
          </Button>
        ) : (
          <Button type="submit" size="sm" variant="accent" disabled={!input.trim()} aria-label="Gönder">
            <ArrowUp size={15} />
          </Button>
        )}
      </form>
      {remaining !== null && <p className="-mt-1 text-center text-[11px] text-muted">Bu dönem kalan hak: {remaining}</p>}
    </div>
  );
}

function UserBubble({ message }: { message: AgentUIMessage }) {
  // The first text part is what the user typed; the rest is editor context (summary, page images).
  const first = message.parts.find((p) => p.type === "text");
  const images = message.parts.filter((p) => p.type === "file").length;
  return (
    <div className="flex max-w-[85%] flex-col items-end gap-1 self-end">
      <p className="rounded-2xl bg-accent px-3 py-2 text-[13px] leading-relaxed text-white">{first?.type === "text" ? first.text : ""}</p>
      {images > 0 && <span className="text-[10px] text-muted">{images} sayfa görseli eklendi</span>}
    </div>
  );
}

function ConsentCard({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="m-auto flex max-w-64 flex-col items-center gap-3 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
        <ShieldCheck size={22} />
      </span>
      <p className="text-sm font-semibold">AI Asistan</p>
      <p className="text-xs leading-relaxed text-muted">
        Asistan, yorum yapmak için slaytlarının küçük önizlemelerini ve dump özetini Google Gemini&apos;ye gönderir. Önizlemeler bizim sunucumuzda saklanmaz. Fotoğrafların sen asistanı kullanmadıkça cihazından çıkmaz.
      </p>
      <Button variant="accent" size="sm" onClick={onAccept}>
        Anladım, devam et
      </Button>
    </div>
  );
}
