// Rotulos e ordem dos periodos usados no card compartilhavel.
// Reusa o tipo SpotifyTopTimeRange para manter consistencia com a API.
import { SpotifyTopTimeRange } from "../../shared/types/spotify";

export interface SharePeriodOption {
  value: SpotifyTopTimeRange;
  /** Rotulo curto usado no seletor do modal. */
  label: string;
  /** Rotulo exibido como badge dentro do poster exportado. */
  posterLabel: string;
}

export const sharePeriodOptions: SharePeriodOption[] = [
  { value: "short_term", label: "4 semanas", posterLabel: "Últimas 4 semanas" },
  { value: "medium_term", label: "6 meses", posterLabel: "Últimos 6 meses" },
  { value: "long_term", label: "Último ano", posterLabel: "Último ano" },
];

export const defaultSharePeriod: SpotifyTopTimeRange = "long_term";

export const getSharePeriodOption = (
  value: SpotifyTopTimeRange
): SharePeriodOption =>
  sharePeriodOptions.find((option) => option.value === value) ??
  sharePeriodOptions[sharePeriodOptions.length - 1];
