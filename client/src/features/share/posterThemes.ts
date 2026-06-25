// Temas de cor do poster compartilhavel. Cada tema define o fundo escuro e os
// tokens de acento aplicados como CSS custom properties no root do poster
// (ShareCardPoster). Espelha as cores do AccentPicker do app (amber/green/ruby),
// mas com paleta propria pensada para o poster exportado.
import { CSSProperties } from "react";

export type ShareAccent = "amber" | "green" | "ruby";

export interface ShareAccentTheme {
  value: ShareAccent;
  label: string;
  /** Cor do swatch mostrado no seletor do modal. */
  swatch: string;
  /** Variaveis CSS injetadas no root do poster. */
  vars: CSSProperties;
}

export const shareAccentThemes: ShareAccentTheme[] = [
  {
    value: "amber",
    label: "Âmbar",
    swatch: "#f4b860",
    vars: {
      "--p-bg":
        "radial-gradient(120% 80% at 18% 0%, #3a2414 0%, rgba(58,36,20,0) 55%), radial-gradient(120% 90% at 100% 100%, #2a1a0e 0%, rgba(42,26,14,0) 60%), linear-gradient(160deg, #211710 0%, #1b120b 55%, #170f09 100%)",
      "--p-surface": "#2c1c10",
      "--p-text": "#f5e9d8",
      "--p-name": "#fbf3e6",
      "--p-accent": "#f4b860",
      "--p-accent-strong": "#c8761f",
      "--p-accent-soft": "#f6deb0",
      "--p-eyebrow": "#eaa94b",
    } as CSSProperties,
  },
  {
    value: "green",
    label: "Verde",
    swatch: "#1ed760",
    vars: {
      "--p-bg":
        "radial-gradient(120% 80% at 18% 0%, #103324 0%, rgba(16,51,36,0) 55%), radial-gradient(120% 90% at 100% 100%, #0b2417 0%, rgba(11,36,23,0) 60%), linear-gradient(160deg, #0f1f17 0%, #0b1710 55%, #09120c 100%)",
      "--p-surface": "#11271b",
      "--p-text": "#e8f5ec",
      "--p-name": "#f1faf3",
      "--p-accent": "#1ed760",
      "--p-accent-strong": "#159b46",
      "--p-accent-soft": "#b9f3cd",
      "--p-eyebrow": "#3fcf6e",
    } as CSSProperties,
  },
  {
    value: "ruby",
    label: "Vermelho",
    swatch: "#f2555f",
    vars: {
      "--p-bg":
        "radial-gradient(120% 80% at 18% 0%, #3a141c 0%, rgba(58,20,28,0) 55%), radial-gradient(120% 90% at 100% 100%, #2a0e14 0%, rgba(42,14,20,0) 60%), linear-gradient(160deg, #211015 0%, #1a0c10 55%, #15090c 100%)",
      "--p-surface": "#2c1218",
      "--p-text": "#f5e7e9",
      "--p-name": "#fbeef0",
      "--p-accent": "#f2555f",
      "--p-accent-strong": "#b02a37",
      "--p-accent-soft": "#f7c9cd",
      "--p-eyebrow": "#ef6b73",
    } as CSSProperties,
  },
];

export const defaultShareAccent: ShareAccent = "amber";

export const getShareAccentTheme = (value: ShareAccent): ShareAccentTheme =>
  shareAccentThemes.find((theme) => theme.value === value) ??
  shareAccentThemes[0];
