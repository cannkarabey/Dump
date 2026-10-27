import { at, format } from "./i18n/appDictionary";

/**
 * Tools panel widgets (message bubbles, tags, cards, clocks, charts…). Each kind renders to a
 * self-contained SVG (system fonts only: an SVG drawn as an image can't load webfonts), placed as a
 * sticker whose `widget` data lets the properties panel edit and regenerate it.
 */

export interface WidgetOutput {
  svg: string;
  w: number;
  h: number;
}

type Props = Record<string, string>;
type Builder = (p: Props) => WidgetOutput;

const SANS = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Courier New', Courier, monospace";
/** Rasterization density: SVG images are drawn at their intrinsic size, so render them large. */
const RES = 3;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let ctx: CanvasRenderingContext2D | null = null;
function measure(text: string, size: number, weight = 400, family = SANS): number {
  if (typeof document === "undefined") return text.length * size * 0.55;
  ctx ??= document.createElement("canvas").getContext("2d");
  if (!ctx) return text.length * size * 0.55;
  ctx.font = `${weight} ${size}px ${family}`;
  return ctx.measureText(text).width;
}

function wrap(text: string, size: number, weight: number, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of (text || " ").split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (line && measure(next, size, weight) > maxW) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
  }
  return lines;
}

function txt(x: number, y: number, s: string, size: number, opts: { weight?: number; fill?: string; anchor?: string; family?: string; spacing?: number } = {}) {
  const { weight = 400, fill = "#000", anchor = "start", family = SANS, spacing } = opts;
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${spacing}"` : ""}>${esc(s)}</text>`;
}

function lines(x: number, y: number, ls: string[], size: number, lh: number, opts: Parameters<typeof txt>[4] = {}) {
  return ls.map((l, i) => txt(x, y + i * lh, l, size, opts)).join("");
}

function svg(w: number, h: number, body: string, defs = ""): WidgetOutput {
  const W = Math.ceil(w);
  const H = Math.ceil(h);
  return {
    w: W,
    h: H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W * RES}" height="${H * RES}" viewBox="0 0 ${W} ${H}">${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>`,
  };
}

export function svgToSrc(svgText: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

// ---------- shared shapes

const verified = (cx: number, cy: number, r: number) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#3897f0"/><path d="M${cx - r * 0.45} ${cy + r * 0.02} l${r * 0.32} ${r * 0.32} l${r * 0.6} -${r * 0.62}" stroke="#fff" stroke-width="${r * 0.28}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

const avatar = (cx: number, cy: number, r: number, id: string) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/><circle cx="${cx}" cy="${cy - r * 0.18}" r="${r * 0.36}" fill="#ffffffcc"/><path d="M${cx - r * 0.62} ${cy + r * 0.62} a${r * 0.62} ${r * 0.5} 0 0 1 ${r * 1.24} 0" fill="#ffffffcc"/>`;

const avatarGrad = (id: string) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb36b"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient>`;

const heart = (cx: number, cy: number, s: number, fill: string) =>
  `<path transform="translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 24})" d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.2 0 3.6 1.2 6 3.6 2.4-2.4 3.8-3.6 6-3.6 3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z" fill="${fill}"/>`;

// ---------- message bubbles

interface BubbleStyle {
  bg: string;
  fg: string;
  tail?: "left" | "right";
  gradient?: [string, string];
  pill?: boolean;
  meta?: { color: string; checks?: boolean };
  shadow?: boolean;
}

const FS = 34;
const LH = 42;

function bubble(style: BubbleStyle, p: Props, extra?: (box: { x: number; y: number; w: number; h: number }) => string, pad = { top: 0, right: 0 }): WidgetOutput {
  const ls = wrap(p.text, FS, 400, 520);
  const textW = Math.max(...ls.map((l) => measure(l, FS)));
  const metaW = style.meta ? measure("9:41", 22) + (style.meta.checks ? 34 : 0) + 14 : 0;
  const lastW = measure(ls[ls.length - 1], FS);
  // WhatsApp-style time sits after the last line, or on its own row when that line is full.
  const metaRow = style.meta && lastW + metaW > Math.max(textW, 1) + 2 && lastW + metaW > 520;
  const bw = Math.max(textW, style.meta && !metaRow ? lastW + metaW : 0) + 44;
  const bh = ls.length * LH + 26 + (metaRow ? 26 : 0);
  const tailSpace = style.tail ? 12 : 0;
  const x = (style.tail === "left" ? tailSpace : 0) + 2;
  const y = pad.top + 2;
  const r = style.pill && ls.length === 1 ? bh / 2 : 22;
  const fill = style.gradient ? "url(#bg)" : style.bg;
  let body = "";
  if (style.shadow) body += `<rect x="${x}" y="${y + 2}" width="${bw}" height="${bh}" rx="${r}" fill="#00000014"/>`;
  body += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${r}" fill="${fill}"/>`;
  if (style.tail === "right") {
    const tx = x + bw;
    body += `<path d="M${tx - 18} ${y + bh - 20} C${tx - 2} ${y + bh - 8} ${tx + 2} ${y + bh - 2} ${tx + 10} ${y + bh} C${tx - 4} ${y + bh + 2} ${tx - 16} ${y + bh - 2} ${tx - 26} ${y + bh - 8} Z" fill="${fill}"/>`;
  } else if (style.tail === "left") {
    const tx = x;
    body += `<path d="M${tx + 18} ${y + bh - 20} C${tx + 2} ${y + bh - 8} ${tx - 2} ${y + bh - 2} ${tx - 10} ${y + bh} C${tx + 4} ${y + bh + 2} ${tx + 16} ${y + bh - 2} ${tx + 26} ${y + bh - 8} Z" fill="${fill}"/>`;
  }
  body += lines(x + 22, y + 13 + FS * 0.86, ls, FS, LH, { fill: style.fg });
  if (style.meta) {
    const my = y + bh - 14;
    const mx = x + bw - 16;
    body += txt(mx - (style.meta.checks ? 32 : 0), my, "9:41", 22, { fill: style.meta.color, anchor: "end" });
    if (style.meta.checks) {
      body += `<path d="M${mx - 28} ${my - 8} l6 6 l12 -12 M${mx - 18} ${my - 2} l2 2 l12 -12" stroke="#53bdeb" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  }
  if (extra) body += extra({ x, y, w: bw, h: bh });
  const defs = style.gradient
    ? `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${style.gradient[0]}"/><stop offset="1" stop-color="${style.gradient[1]}"/></linearGradient>`
    : "";
  return svg(x + bw + tailSpace + 4 + pad.right, y + bh + 6, body, defs);
}

// ---------- cards

function card(width: number, height: number, body: string, defs = "", fill = "#ffffff"): WidgetOutput {
  return svg(width + 8, height + 10, `<rect x="4" y="6" width="${width}" height="${height}" rx="28" fill="#00000012"/><rect x="4" y="4" width="${width}" height="${height}" rx="28" fill="${fill}"/>${body}`, defs);
}

function notification(p: Props): WidgetOutput {
  const d = at().tools.defaults;
  const W = 640;
  const ls = wrap(p.text, 28, 400, W - 140);
  const H = 116 + ls.length * 36;
  const body =
    `<rect x="32" y="30" width="56" height="56" rx="14" fill="#34c759"/>` +
    `<path d="M60 44c-10 0-18 6-18 13.5 0 4.3 2.6 8.1 6.7 10.6L47 76l8.2-4.2c1.5.3 3.1.5 4.8.5 10 0 18-6 18-13.5S70 44 60 44z" fill="#fff"/>` +
    txt(108, 50, d.messages, 20, { fill: "#8e8e93", weight: 600, spacing: 0.5 }) +
    txt(W - 28, 50, d.now, 20, { fill: "#8e8e93", anchor: "end" }) +
    txt(108, 84, p.name, 28, { weight: 700 }) +
    lines(108, 120, ls, 28, 36, { fill: "#1d1d1f" });
  return card(W, H, body, "", "#f2f2f7");
}

function igComment(p: Props): WidgetOutput {
  const d = at().tools.defaults;
  const W = 640;
  const ls = wrap(p.text, 28, 400, W - 180);
  const H = 120 + ls.length * 36;
  const body =
    avatar(58, 62, 30, "av") +
    txt(104, 52, p.handle, 24, { weight: 700 }) +
    txt(110 + measure(p.handle, 24, 700), 52, "2d", 24, { fill: "#8e8e93" }) +
    lines(104, 90, ls, 28, 36, { fill: "#1d1d1f" }) +
    txt(104, 90 + ls.length * 36 + 4, `${d.reply}     ${d.seeTranslation}`, 22, { fill: "#8e8e93", weight: 600 }) +
    `<path transform="translate(${W - 46} 46) scale(1.2)" d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.2 0 3.6 1.2 6 3.6 2.4-2.4 3.8-3.6 6-3.6 3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z" fill="none" stroke="#8e8e93" stroke-width="2"/>`;
  return card(W, H, body, avatarGrad("av"));
}

function tiktokReply(p: Props): WidgetOutput {
  const d = at().tools.defaults;
  const ls = wrap(p.text, 32, 700, 520);
  const head = format(d.replyTo, { name: p.name });
  const W = Math.max(...ls.map((l) => measure(l, 32, 700)), measure(head, 22) + 46) + 64;
  const H = 76 + ls.length * 40;
  const body = avatar(46, 40, 14, "av") + txt(68, 48, head, 22, { fill: "#8e8e93" }) + lines(34, 92, ls, 32, 40, { weight: 700, fill: "#111" });
  return card(W, H, body, avatarGrad("av"));
}

function ytComment(p: Props): WidgetOutput {
  const d = at().tools.defaults;
  const W = 640;
  const ls = wrap(p.text, 28, 400, W - 140);
  const H = 120 + ls.length * 36;
  const ty = 90 + ls.length * 36 + 8;
  const body =
    avatar(58, 58, 26, "av") +
    txt(100, 48, `@${p.handle}`, 22, { weight: 600 }) +
    txt(108 + measure(`@${p.handle}`, 22, 600), 48, d.ago, 22, { fill: "#8e8e93" }) +
    lines(100, 86, ls, 28, 36, { fill: "#0f0f0f" }) +
    `<path transform="translate(100 ${ty - 22}) scale(1.05)" d="M2 10h4v11H2zM8 21h9.5a2 2 0 0 0 2-1.7l1.3-7A2 2 0 0 0 18.8 10H14V5.5A2.5 2.5 0 0 0 11.5 3L8 10z" fill="none" stroke="#0f0f0f" stroke-width="1.8" stroke-linejoin="round"/>` +
    txt(134, ty - 2, "12", 22, { fill: "#606060" }) +
    txt(196, ty - 2, d.reply, 22, { weight: 600 });
  return card(W, H, body, avatarGrad("av"));
}

function tag(dark: boolean, text: string, icon: "verified" | "pin", mono = false): WidgetOutput {
  const fs = mono ? 36 : 34;
  const family = mono ? MONO : SANS;
  const tw = measure(text, fs, 700, family);
  const iconW = icon === "verified" ? 40 : 44;
  const W = tw + iconW + 56;
  const H = 76;
  const fill = dark ? "#262626e6" : "#ffffff";
  let body = `<rect x="2" y="4" width="${W}" height="${H}" rx="${mono ? 6 : 18}" fill="#00000018"/><rect x="2" y="2" width="${W}" height="${H}" rx="${mono ? 6 : 18}" fill="${fill}"/>`;
  if (icon === "pin") {
    body += `<path transform="translate(26 18) scale(1.6)" d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="#3897f0"/>`;
    body += txt(26 + iconW, 52, text, fs, { weight: 700, fill: dark ? "#fff" : "#111" });
  } else {
    body += txt(28, 52, text, fs, { weight: 700, fill: dark ? "#fff" : "#111", family });
    body += verified(28 + tw + 26, 40, 14);
  }
  return svg(W + 6, H + 8, body);
}

function mineTag(p: Props): WidgetOutput {
  const fs = 40;
  const tw = measure(p.name, fs, 700, MONO);
  const W = tw + 48;
  return svg(W + 4, 72, `<rect x="2" y="2" width="${W}" height="66" fill="#00000073"/>` + txt(2 + W / 2, 49, p.name, fs, { weight: 700, fill: "#fff", anchor: "middle", family: MONO }));
}

function follow(p: Props): WidgetOutput {
  const d = at().tools.defaults;
  const W = 640;
  const H = 128;
  const nameW = measure(p.name, 30, 700);
  const btnW = measure(d.follow, 26, 700) + 56;
  const body =
    avatar(68, 68, 38, "av") +
    txt(124, 60, p.name, 30, { weight: 700 }) +
    verified(124 + nameW + 20, 50, 12) +
    txt(124, 96, `@${p.handle}`, 24, { fill: "#8e8e93" }) +
    `<rect x="${W - btnW - 24}" y="44" width="${btnW}" height="50" rx="25" fill="#3897f0"/>` +
    txt(W - 24 - btnW / 2, 78, d.follow, 26, { weight: 700, fill: "#fff", anchor: "middle" });
  return card(W, H, body, avatarGrad("av"));
}

function review(p: Props): WidgetOutput {
  const W = 640;
  const title = wrap(p.title, 30, 700, W - 72);
  const text = wrap(p.text, 26, 400, W - 72);
  const H = 150 + title.length * 38 + text.length * 34;
  const rating = Math.max(0, Math.min(5, Math.round(Number(p.rating) || 0)));
  const star = (x: number, on: boolean) =>
    `<path transform="translate(${x} 96) scale(1.15)" d="M12 2l3 6.3 6.9.9-5 4.8 1.2 6.9L12 17.6 5.9 20.9 7.1 14 2 9.2l6.9-.9z" fill="${on ? "#ffcc00" : "#e5e5ea"}"/>`;
  const body =
    avatar(56, 54, 22, "av") +
    txt(90, 62, p.name, 24, { weight: 600 }) +
    Array.from({ length: 5 }, (_, i) => star(34 + i * 32, i < rating)).join("") +
    lines(36, 160, title, 30, 38, { weight: 700 }) +
    lines(36, 160 + title.length * 38 + 4, text, 26, 34, { fill: "#6e6e73" });
  return card(W, H, body, avatarGrad("av"));
}

// ---------- clocks

function splitTime(time: string) {
  const [hh = "9", mm = "41"] = time.split(":");
  return { hh: hh.trim(), mm: mm.trim().slice(0, 2).padStart(2, "0") };
}

function flipTile(x: number, w: number, h: number, ch: string, bg: string, fg: string, fs: number) {
  return (
    `<rect x="${x}" y="4" width="${w}" height="${h}" rx="${w * 0.12}" fill="${bg}"/>` +
    txt(x + w / 2, 4 + h / 2 + fs * 0.36, ch, fs, { weight: 700, fill: fg, anchor: "middle" }) +
    `<rect x="${x}" y="${4 + h / 2 - 1.5}" width="${w}" height="3" fill="#00000026"/>`
  );
}

function flipRetro(p: Props): WidgetOutput {
  const { hh, mm } = splitTime(p.time);
  const digits = (hh + mm).split("");
  const tw = 92;
  const th = 126;
  let x = 4;
  let body = `<rect x="${x}" y="70" width="58" height="60" rx="8" fill="#e5e5ea"/>` + txt(x + 29, 108, "PM", 20, { weight: 600, fill: "#8e8e93", anchor: "middle" });
  x += 70;
  digits.forEach((dg, i) => {
    body += flipTile(x, tw, th, dg, "#f2f2f7", "#1d1d1f", 96);
    x += tw + (i === hh.length - 1 ? 22 : 8);
  });
  return svg(x, th + 10, body);
}

function flipClassic(p: Props): WidgetOutput {
  const { hh, mm } = splitTime(p.time);
  const tw = 230;
  const th = 230;
  const body =
    flipTile(4, tw, th, hh.padStart(2, "0"), "#111", "#fff", 170) +
    txt(22, 40, "AM", 22, { weight: 700, fill: "#fff" }) +
    flipTile(4 + tw + 14, tw, th, mm, "#111", "#fff", 170);
  return svg(tw * 2 + 22, th + 10, body);
}

function storyPill(glass: boolean): Builder {
  return (p) => {
    const fs = 64;
    const tw = measure(p.time, fs, 700);
    const aw = measure("AM", 30, 700);
    const W = tw + aw + 76;
    const H = 104;
    const body =
      `<rect x="2" y="2" width="${W}" height="${H}" rx="${glass ? 26 : 22}" fill="${glass ? "#3a3a3cd9" : "#ffffff"}"/>` +
      txt(34, 76, p.time, fs, { weight: 700, fill: glass ? "#fff" : "#111" }) +
      txt(42 + tw, 76, "AM", 30, { weight: 700, fill: glass ? "#fff" : "#111" });
    return svg(W + 4, H + 4, body);
  };
}

function storyText(p: Props): WidgetOutput {
  const fs = 150;
  const tw = measure(p.time, fs, 800);
  const lw = measure(p.label, 28, 600) + 64;
  const W = Math.max(tw + 70, lw) + 8;
  const tx = (W - tw - 70) / 2;
  const body =
    txt(tx, 140, p.time, fs, { weight: 800, fill: "#111" }) +
    txt(tx + 8 + tw, 70, "AM", 34, { weight: 800, fill: "#111" }) +
    `<rect x="${(W - lw) / 2}" y="164" width="${lw}" height="52" rx="26" fill="#111"/>` +
    txt(W / 2, 199, p.label, 28, { weight: 600, fill: "#fff", anchor: "middle" });
  return svg(W, 224, body);
}

function analog(p: Props): WidgetOutput {
  const { hh, mm } = splitTime(p.time);
  const h = Number(hh) % 12;
  const m = Number(mm) || 0;
  const R = 150;
  const c = R + 6;
  const hand = (angle: number, len: number, width: number, color: string) => {
    const a = ((angle - 90) * Math.PI) / 180;
    return `<line x1="${c}" y1="${c}" x2="${c + Math.cos(a) * len}" y2="${c + Math.sin(a) * len}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  };
  let body = `<circle cx="${c}" cy="${c + 3}" r="${R}" fill="#00000014"/><circle cx="${c}" cy="${c}" r="${R}" fill="#fff" stroke="#e5e5ea" stroke-width="3"/>`;
  for (let i = 1; i <= 12; i++) {
    const a = ((i * 30 - 90) * Math.PI) / 180;
    body += txt(c + Math.cos(a) * (R - 32), c + Math.sin(a) * (R - 32) + 12, String(i), 32, { weight: 600, anchor: "middle" });
  }
  body += hand(h * 30 + m / 2, R * 0.5, 10, "#111") + hand(m * 6, R * 0.75, 6, "#111") + hand(m * 6 + 140, R * 0.82, 2.5, "#ff3b30");
  body += `<circle cx="${c}" cy="${c}" r="9" fill="#ff3b30"/>`;
  return svg(c * 2, c * 2 + 4, body);
}

function lockScreen(p: Props): WidgetOutput {
  const fs = 210;
  const tw = measure(p.time, fs, 300);
  const lw = measure(p.label, 34, 600);
  const W = Math.max(tw, lw) + 16;
  const body =
    txt(W / 2, 44, p.label, 34, { weight: 600, fill: "#1d1d1f", anchor: "middle" }) +
    txt(W / 2, 230, p.time, fs, { weight: 300, fill: "#1d1d1f", anchor: "middle", spacing: -4 });
  return svg(W, 260, body);
}

// ---------- charts & folder

function parseValues(raw: string): number[] {
  const v = raw
    .split(/[,\s;]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n >= 0)
    .slice(0, 16);
  return v.length ? v : [1];
}

function bars(p: Props): WidgetOutput {
  const v = parseValues(p.values);
  const max = Math.max(...v, 1);
  const W = 600;
  const H = 360;
  const gap = 14;
  const bw = (W - 64 - gap * (v.length - 1)) / v.length;
  const body = v
    .map((n, i) => {
      const bh = Math.max(6, (n / max) * (H - 80));
      return `<rect x="${32 + i * (bw + gap)}" y="${H - 32 - bh}" width="${bw}" height="${bh}" rx="${Math.min(10, bw / 3)}" fill="#2f80ed"/>`;
    })
    .join("");
  return card(W, H, body);
}

function lineChart(p: Props): WidgetOutput {
  const v = parseValues(p.values);
  const max = Math.max(...v, 1);
  const W = 600;
  const H = 360;
  const pts = v.map((n, i) => [40 + (v.length === 1 ? (W - 80) / 2 : (i * (W - 80)) / (v.length - 1)), H - 40 - (n / max) * (H - 100)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const area = `${d} L${pts[pts.length - 1][0]} ${H - 40} L${pts[0][0]} ${H - 40} Z`;
  const body =
    `<path d="${area}" fill="#2f80ed22"/>` +
    `<path d="${d}" stroke="#2f80ed" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>` +
    pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#fff" stroke="#2f80ed" stroke-width="4"/>`).join("");
  return card(W, H, body);
}

function folder(p: Props): WidgetOutput {
  const W = 320;
  const lw = measure(p.label, 30, 600);
  const total = Math.max(W, lw + 20);
  const x = (total - W) / 2;
  const body =
    `<path d="M${x + 10} 40 a14 14 0 0 1 14 -14 h86 l22 22 h164 a14 14 0 0 1 14 14 v160 a14 14 0 0 1 -14 14 h-272 a14 14 0 0 1 -14 -14z" fill="#3d8fe0"/>` +
    `<rect x="${x + 22}" y="70" width="${W - 44}" height="120" rx="8" fill="#fff" opacity="0.9" transform="rotate(-3 ${x + W / 2} 130)"/>` +
    `<path d="M${x + 4} 92 a14 14 0 0 1 14 -14 h${W - 36} a14 14 0 0 1 14 14 v124 a14 14 0 0 1 -14 14 h-${W - 36} a14 14 0 0 1 -14 -14z" fill="#6cb4f5"/>` +
    txt(total / 2, 282, p.label, 30, { weight: 600, fill: "#1d1d1f", anchor: "middle" });
  return svg(total, 300, body);
}

// ---------- registry

type Field = "text" | "name" | "handle" | "place" | "time" | "label" | "title" | "rating" | "values";

interface KindDef {
  build: Builder;
  fields: Field[];
  /** Initial width as a fraction of the page width. */
  scale: number;
  /** Per-kind default overrides (dictionary keys under tools.defaults). */
  defaults?: Partial<Record<Field, keyof ReturnType<typeof at>["tools"]["defaults"]>>;
}

const BUBBLE = 0.5;

export const WIDGET_KINDS: Record<string, KindDef> = {
  "msg-sent": { build: (p) => bubble({ bg: "#1e8bff", fg: "#fff", tail: "right" }, p), fields: ["text"], scale: BUBBLE },
  "msg-received": { build: (p) => bubble({ bg: "#e9e9eb", fg: "#000", tail: "left" }, p), fields: ["text"], scale: BUBBLE },
  "sms-green": { build: (p) => bubble({ bg: "#34c759", fg: "#fff", tail: "right" }, p), fields: ["text"], scale: BUBBLE },
  "wa-sent": { build: (p) => bubble({ bg: "#d9fdd3", fg: "#111", meta: { color: "#667781", checks: true }, shadow: true }, p), fields: ["text"], scale: BUBBLE },
  "wa-received": { build: (p) => bubble({ bg: "#ffffff", fg: "#111", meta: { color: "#667781" }, shadow: true }, p), fields: ["text"], scale: BUBBLE },
  tapback: {
    build: (p) =>
      bubble(
        { bg: "#e9e9eb", fg: "#000" },
        p,
        (b) => `<circle cx="${b.x + b.w - 4}" cy="${b.y - 4}" r="26" fill="#e9e9eb" stroke="#fff" stroke-width="4"/>${heart(b.x + b.w - 4, b.y - 3, 26, "#ff2d55")}`,
        { top: 30, right: 26 },
      ),
    fields: ["text"],
    scale: BUBBLE,
  },
  "ig-dm-sent": { build: (p) => bubble({ bg: "#7b3cff", fg: "#fff", gradient: ["#5b51f5", "#a33cf0"], pill: true }, p), fields: ["text"], scale: BUBBLE },
  "ig-dm-received": { build: (p) => bubble({ bg: "#efefef", fg: "#000", pill: true }, p), fields: ["text"], scale: BUBBLE },
  notification: { build: notification, fields: ["name", "text"], scale: 0.8 },
  "ig-comment": { build: igComment, fields: ["handle", "text"], scale: 0.8 },
  "tiktok-reply": { build: tiktokReply, fields: ["name", "text"], scale: 0.6 },
  "yt-comment": { build: ytComment, fields: ["handle", "text"], scale: 0.8 },
  instatag: { build: (p) => tag(true, `@${p.handle}`, "verified"), fields: ["handle"], scale: 0.4 },
  "instatag-light": { build: (p) => tag(false, `@${p.handle}`, "verified"), fields: ["handle"], scale: 0.4 },
  location: { build: (p) => tag(false, p.place, "pin"), fields: ["place"], scale: 0.4 },
  "location-dark": { build: (p) => tag(true, p.place, "pin"), fields: ["place"], scale: 0.4 },
  minetag: { build: mineTag, fields: ["name"], scale: 0.4 },
  follow: { build: follow, fields: ["name", "handle"], scale: 0.75 },
  review: { build: review, fields: ["name", "rating", "title", "text"], scale: 0.75, defaults: { text: "reviewText", title: "reviewTitle" } },
  "flip-retro": { build: flipRetro, fields: ["time"], scale: 0.6 },
  "flip-classic": { build: flipClassic, fields: ["time"], scale: 0.6 },
  "story-pill": { build: storyPill(false), fields: ["time"], scale: 0.4 },
  "story-glass": { build: storyPill(true), fields: ["time"], scale: 0.4 },
  "story-text": { build: storyText, fields: ["time", "label"], scale: 0.55 },
  "story-analog": { build: analog, fields: ["time"], scale: 0.4 },
  "lock-screen": { build: lockScreen, fields: ["time", "label"], scale: 0.7, defaults: { label: "dateLine" } },
  bars: { build: bars, fields: ["values"], scale: 0.7 },
  line: { build: lineChart, fields: ["values"], scale: 0.7 },
  folder: { build: folder, fields: ["label"], scale: 0.35, defaults: { label: "folder" } },
};

/** Tools grid: each tool opens a list of grouped variants. */
export const TOOLS: { id: string; preview: string; groups: { id: string; kinds: string[] }[] }[] = [
  {
    id: "textlab",
    preview: "msg-sent",
    groups: [
      { id: "message", kinds: ["msg-sent", "msg-received", "sms-green", "wa-sent", "wa-received", "tapback", "ig-dm-sent", "ig-dm-received", "notification"] },
      { id: "social", kinds: ["ig-comment", "tiktok-reply", "yt-comment"] },
    ],
  },
  { id: "instatag", preview: "instatag", groups: [{ id: "tag", kinds: ["instatag", "instatag-light"] }] },
  { id: "location", preview: "location", groups: [{ id: "tag", kinds: ["location", "location-dark"] }] },
  { id: "minetag", preview: "minetag", groups: [{ id: "tag", kinds: ["minetag"] }] },
  { id: "poplab", preview: "follow", groups: [{ id: "card", kinds: ["follow"] }] },
  { id: "reviewlab", preview: "review", groups: [{ id: "card", kinds: ["review"] }] },
  {
    id: "clock",
    preview: "flip-retro",
    groups: [
      { id: "flip", kinds: ["flip-retro", "flip-classic"] },
      { id: "story", kinds: ["story-pill", "story-glass", "story-text", "story-analog"] },
      { id: "phone", kinds: ["lock-screen"] },
    ],
  },
  { id: "charts", preview: "bars", groups: [{ id: "chart", kinds: ["bars", "line"] }] },
  { id: "folderlab", preview: "folder", groups: [{ id: "folder", kinds: ["folder"] }] },
];

export function widgetFields(kind: string): Field[] {
  return WIDGET_KINDS[kind]?.fields ?? [];
}

/** Default props in the current app language. */
export function defaultProps(kind: string): Props {
  const d = at().tools.defaults;
  const def = WIDGET_KINDS[kind];
  const base: Record<Field, string> = {
    text: d.text,
    name: d.name,
    handle: d.handle,
    place: d.place,
    time: d.time,
    label: d.label,
    title: d.reviewTitle,
    rating: "5",
    values: d.values,
  };
  return Object.fromEntries(
    def.fields.map((f) => {
      const key = def.defaults?.[f];
      return [f, key ? String(d[key]) : base[f]];
    }),
  );
}

export function buildWidget(kind: string, props: Props): WidgetOutput {
  return WIDGET_KINDS[kind].build(props);
}

export function widgetScale(kind: string): number {
  return WIDGET_KINDS[kind]?.scale ?? 0.5;
}
