export function PlaceholderPanel({ text, task }: { text: string; task: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted">
      {text} <span className="opacity-60">({task})</span>
    </div>
  );
}
