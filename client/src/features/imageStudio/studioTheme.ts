// Tema de cor das imagens exportadas (poster e mosaico).
//
// A partir de UMA cor de acento (hex escolhido no color picker) derivamos uma
// paleta coesa — fundo, superficie, texto e variantes do acento — aplicada como
// CSS custom properties (`--s-*`) no root de cada node exportavel. Fundo e texto
// usam o mesmo matiz com lightness fixo, entao qualquer cor continua legivel.
//
// A captura precisa da cor de fundo como string (nao da variavel CSS), por isso
// `buildStudioTheme` devolve tambem `backgroundColor`.

import { CSSProperties } from "react";

export interface StudioColorPreset {
  label: string;
  value: string;
}

// Atalhos rapidos. O picker permite qualquer cor; estes sao so conveniencia.
export const studioColorPresets: StudioColorPreset[] = [
  { label: "Âmbar", value: "#F4B860" },
  { label: "Verde", value: "#1ED760" },
  { label: "Vermelho", value: "#F2555F" },
  { label: "Azul", value: "#4AA3FF" },
  { label: "Roxo", value: "#B58CFF" },
  { label: "Rosa", value: "#FF7AB8" },
];

export const defaultStudioColor = "#F4B860";

export interface StudioTheme {
  /** Custom properties `--s-*` para o root do node exportavel. */
  vars: CSSProperties;
  /** Fundo solido equivalente, usado na captura e em superficies chapadas. */
  backgroundColor: string;
}

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

export const isValidHex = (value: string): boolean =>
  /^#?[0-9a-fA-F]{6}$/.test(value.trim());

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

export const buildStudioTheme = (hex: string): StudioTheme => {
  const accent = `#${normalizeHex(hex)}`;
  const { h, s } = hexToHsl(hex);
  const tint = (sat: number, light: number) =>
    `hsl(${h} ${Math.round(clamp(sat, 0, 100))}% ${light}%)`;
  const bgSat = clamp(s * 0.55, 30, 60);
  const backgroundColor = tint(bgSat, 7);

  return {
    backgroundColor,
    vars: {
      "--s-bg": `radial-gradient(120% 80% at 18% 0%, ${tint(bgSat, 15)} 0%, transparent 55%), radial-gradient(120% 90% at 100% 100%, ${tint(bgSat, 9)} 0%, transparent 60%), linear-gradient(160deg, ${tint(bgSat, 10)} 0%, ${tint(bgSat, 7)} 55%, ${tint(bgSat, 5)} 100%)`,
      "--s-bg-solid": backgroundColor,
      "--s-surface": tint(clamp(s * 0.5, 28, 55), 12),
      "--s-text": tint(clamp(s * 0.3, 12, 30), 91),
      "--s-name": tint(clamp(s * 0.35, 14, 32), 96),
      "--s-accent": accent,
      "--s-accent-strong": tint(clamp(s, 45, 95), 38),
      "--s-accent-soft": tint(clamp(s * 0.85, 30, 80), 82),
      "--s-eyebrow": tint(clamp(s, 45, 95), 62),
    } as CSSProperties,
  };
};
