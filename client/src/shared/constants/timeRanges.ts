import { SpotifyTopTimeRange } from "../types/spotify";

export interface TopTimeRangeOption {
  value: SpotifyTopTimeRange;
  /** Rotulo curto, para seletores. */
  label: string;
  /** Rotulo em frase, usado em legendas e imagens exportadas. */
  captionLabel: string;
  description: string;
}

export const topTimeRangeOptions: TopTimeRangeOption[] = [
  {
    value: "long_term",
    label: "Último ano",
    captionLabel: "Último ano",
    description: "Aproximadamente 1 ano de afinidade calculada pelo Spotify",
  },
  {
    value: "medium_term",
    label: "6 meses",
    captionLabel: "Últimos 6 meses",
    description: "Aproximadamente os últimos 6 meses",
  },
  {
    value: "short_term",
    label: "4 semanas",
    captionLabel: "Últimas 4 semanas",
    description: "Aproximadamente as últimas 4 semanas",
  },
];

/** Do periodo mais curto para o mais longo (ordem natural em seletores). */
export const topTimeRangeOptionsAscending: TopTimeRangeOption[] = [
  ...topTimeRangeOptions,
].reverse();

export const getTopTimeRangeOption = (
  value: SpotifyTopTimeRange
): TopTimeRangeOption =>
  topTimeRangeOptions.find((option) => option.value === value) ??
  topTimeRangeOptions[0];
