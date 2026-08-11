// Formatos do poster exportavel. Story 9:16 e o default (10 artistas);
// Post 4:5 e a alternativa (5 artistas). Largura final sempre 1080px.

export type ShareFormat = "story" | "post";

export interface ShareFormatConfig {
  value: ShareFormat;
  label: string;
  /** Dimensoes logicas de captura (largura final 1080px). */
  width: number;
  height: number;
  /** Quantidade de artistas exibidos neste formato. */
  artistCount: number;
}

export const shareFormats: Record<ShareFormat, ShareFormatConfig> = {
  story: {
    value: "story",
    label: "Story 9:16",
    width: 1080,
    height: 1920,
    artistCount: 10,
  },
  post: {
    value: "post",
    label: "Post 4:5",
    width: 1080,
    height: 1350,
    artistCount: 5,
  },
};

export const shareFormatOptions: ShareFormatConfig[] = [
  shareFormats.story,
  shareFormats.post,
];

export const defaultShareFormat: ShareFormat = "story";
