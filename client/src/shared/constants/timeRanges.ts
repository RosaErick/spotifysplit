import { SpotifyTopTimeRange } from "../types/spotify";

export const topTimeRangeOptions: Array<{
  value: SpotifyTopTimeRange;
  label: string;
  description: string;
}> = [
  {
    value: "long_term",
    label: "Último ano",
    description: "Aproximadamente 1 ano de afinidade calculada pelo Spotify",
  },
  {
    value: "medium_term",
    label: "6 meses",
    description: "Aproximadamente os últimos 6 meses",
  },
  {
    value: "short_term",
    label: "4 semanas",
    description: "Aproximadamente as últimas 4 semanas",
  },
];
