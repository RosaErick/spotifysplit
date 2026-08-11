// Formatos de arquivo oferecidos no download.
//
// PNG e o default (sem perda, bom para as capas). JPEG existe porque alguns
// apps e formularios ainda recusam PNG ou geram arquivo grande demais — como o
// fundo das imagens e sempre opaco, a ausencia de canal alfa nao muda o
// resultado visual.

export type ImageFileFormat = "png" | "jpeg";

export interface ImageFileFormatConfig {
  value: ImageFileFormat;
  label: string;
  extension: string;
  mimeType: string;
  /** So se aplica a formatos com perda. */
  quality?: number;
}

export const imageFileFormats: Record<ImageFileFormat, ImageFileFormatConfig> = {
  png: {
    value: "png",
    label: "PNG",
    extension: "png",
    mimeType: "image/png",
  },
  jpeg: {
    value: "jpeg",
    label: "JPG",
    extension: "jpg",
    mimeType: "image/jpeg",
    quality: 0.92,
  },
};

export const imageFileFormatOptions: ImageFileFormatConfig[] = [
  imageFileFormats.png,
  imageFileFormats.jpeg,
];

export const defaultImageFileFormat: ImageFileFormat = "png";
