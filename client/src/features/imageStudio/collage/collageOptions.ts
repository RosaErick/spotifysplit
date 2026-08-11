// Opcoes e regras do mosaico (grade de fotos de artistas / capas de album).
//
// O tamanho da grade e sempre quadrado (N x N). O maximo real depende de quantos
// itens os stats do usuario devolvem: sem 36 artistas no periodo, 6 x 6 nao e
// oferecido. `maxGridSizeFor` centraliza essa regra.

export type CollageSource = "artists" | "albums";

export interface CollageSourceOption {
  value: CollageSource;
  /** Rotulo do seletor. */
  label: string;
  /** Eyebrow impressa na legenda da imagem exportada. */
  captionLabel: string;
  /** Usado em mensagens de estado vazio e no nome do arquivo. */
  noun: string;
}

export const collageSourceOptions: CollageSourceOption[] = [
  {
    value: "artists",
    label: "Artistas",
    captionLabel: "Top artistas",
    noun: "artistas",
  },
  {
    value: "albums",
    label: "Álbuns",
    captionLabel: "Top álbuns",
    noun: "álbuns",
  },
];

export const getCollageSourceOption = (
  value: CollageSource
): CollageSourceOption =>
  collageSourceOptions.find((option) => option.value === value) ??
  collageSourceOptions[0];

export const MIN_GRID_SIZE = 2;
export const MAX_GRID_SIZE = 6;
export const DEFAULT_GRID_SIZE = 4;

/** Largura logica do PNG exportado (mosaico sempre quadrado + legenda). */
export const EXPORT_WIDTH = 1080;

/** Quantos itens a maior grade possivel consome. */
export const MAX_COLLAGE_ITEMS = MAX_GRID_SIZE * MAX_GRID_SIZE;

export const gridSizeOptions: number[] = Array.from(
  { length: MAX_GRID_SIZE - MIN_GRID_SIZE + 1 },
  (_, index) => MIN_GRID_SIZE + index
);

/** Maior grade quadrada que os itens disponiveis conseguem preencher por inteiro. */
export const maxGridSizeFor = (itemCount: number): number => {
  const fitting = Math.floor(Math.sqrt(Math.max(itemCount, 0)));
  return Math.min(MAX_GRID_SIZE, Math.max(MIN_GRID_SIZE, fitting));
};

export const clampGridSize = (size: number, itemCount: number): number =>
  Math.min(Math.max(size, MIN_GRID_SIZE), maxGridSizeFor(itemCount));
