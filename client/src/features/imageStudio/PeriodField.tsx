// Seletor de periodo do estudio. O periodo e o unico controle que os dois
// formatos compartilham, entao o estado vive no dialogo e sobrevive a troca de
// aba: quem escolheu "4 semanas" no poster ve o mosaico no mesmo recorte.

import { SegmentedControl } from "@radix-ui/themes";
import { topTimeRangeOptionsAscending } from "../../shared/constants/timeRanges";
import { SpotifyTopTimeRange } from "../../shared/types/spotify";
import { StudioField } from "./StudioLayout";

interface PeriodFieldProps {
  value: SpotifyTopTimeRange;
  onChange: (value: SpotifyTopTimeRange) => void;
}

export const PeriodField = ({ value, onChange }: PeriodFieldProps) => (
  <StudioField label="Período">
    <SegmentedControl.Root
      size="1"
      value={value}
      onValueChange={(next) => onChange(next as SpotifyTopTimeRange)}
    >
      {topTimeRangeOptionsAscending.map((option) => (
        <SegmentedControl.Item key={option.value} value={option.value}>
          {option.label}
        </SegmentedControl.Item>
      ))}
    </SegmentedControl.Root>
  </StudioField>
);
