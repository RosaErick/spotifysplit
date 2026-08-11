// Contrato dos paineis do estudio. Tudo aqui e estado que vale para o estudio
// inteiro e vive no ImageStudioDialog; o que e especifico de um formato (grade,
// story/post, rotulos) fica dentro do proprio painel.

import { SpotifyTopTimeRange } from "../../shared/types/spotify";
import { ImageFileFormat } from "./fileFormats";

export interface StudioPanelProps {
  timeRange: SpotifyTopTimeRange;
  onTimeRangeChange: (value: SpotifyTopTimeRange) => void;
  accentColor: string;
  onAccentColorChange: (hex: string) => void;
  fileFormat: ImageFileFormat;
  onFileFormatChange: (format: ImageFileFormat) => void;
}
