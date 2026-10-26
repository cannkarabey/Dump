/** Fills "{name}" placeholders: format("Try {tier}", { tier: "Studio" }). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}
