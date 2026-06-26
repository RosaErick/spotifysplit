// Tema de cor do poster compartilhavel. A partir de UMA cor de acento (hex
// escolhido no color picker) derivamos uma paleta coesa — fundo escuro, superficie,
// texto e variantes do acento — aplicada como CSS custom properties no root do
// poster (ShareCardPoster). Assim qualquer cor gera um poster harmonioso.
import { CSSProperties } from "react";

export interface PosterColorPreset {
  label: string;
  value: string;
}

// Atalhos rapidos. O picker permite qualquer cor; estes sao so conveniencia.
export const posterColorPresets: PosterColorPreset[] = [
  { label: "Âmbar", value: "#F4B860" },
  { label: "Verde", value: "#1ED760" },
  { label: "Vermelho", value: "#F2555F" },
  { label: "Azul", value: "#4AA3FF" },
  { label: "Roxo", value: "#B58CFF" },
  { label: "Rosa", value: "#FF7AB8" },
];

export const defaultPosterColor = "#F4B860";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalizeHex = (hex: string): string => {
  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }
  return /^[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : "f4b860";
};

interface Hsl {
  h: number;
  s: number;
  l: number;
}

const hexToHsl = (hex: string): Hsl => {
  const value = normalizeHex(hex);
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
};

// Deriva os tokens do poster a partir do acento. Fundo e texto usam o MESMO matiz
// com lightness fixo (fundo sempre escuro, texto sempre claro), garantindo
// legibilidade qualquer que seja a cor; o acento em si e usado como escolhido.
export const buildPosterTheme = (hex: string): CSSProperties => {
  const accent = `#${normalizeHex(hex)}`;
  const { h, s } = hexToHsl(hex);
  const tint = (sat: number, light: number) =>
    `hsl(${h} ${Math.round(clamp(sat, 0, 100))}% ${light}%)`;
  const bgSat = clamp(s * 0.55, 30, 60);

  return {
    "--p-bg": `radial-gradient(120% 80% at 18% 0%, ${tint(bgSat, 15)} 0%, transparent 55%), radial-gradient(120% 90% at 100% 100%, ${tint(bgSat, 9)} 0%, transparent 60%), linear-gradient(160deg, ${tint(bgSat, 10)} 0%, ${tint(bgSat, 7)} 55%, ${tint(bgSat, 5)} 100%)`,
    "--p-surface": tint(clamp(s * 0.5, 28, 55), 12),
    "--p-text": tint(clamp(s * 0.3, 12, 30), 91),
    "--p-name": tint(clamp(s * 0.35, 14, 32), 96),
    "--p-accent": accent,
    "--p-accent-strong": tint(clamp(s, 45, 95), 38),
    "--p-accent-soft": tint(clamp(s * 0.85, 30, 80), 82),
    "--p-eyebrow": tint(clamp(s, 45, 95), 62),
  } as CSSProperties;
};
