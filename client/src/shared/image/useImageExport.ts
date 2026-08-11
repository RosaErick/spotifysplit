// Geracao de PNG a partir de um node do DOM (poster, colagem, etc).
//
// Usa html-to-image (toBlob) e aguarda `document.fonts.ready` para que Fraunces /
// Hanken / JetBrains Mono entrem na imagem. As imagens dentro do node devem ser
// data URLs same-origin (ver `remoteImages.ts`), senao o canvas fica "tingido".

import { useCallback, useState } from "react";
import { toCanvas } from "html-to-image";

export type ImageExportStatus = "idle" | "working" | "success" | "error";

export interface ImageExportRequest {
  /** Nome do arquivo baixado (com extensao). */
  fileName: string;
  /** Cor de fundo aplicada em areas transparentes do node. */
  backgroundColor?: string;
  /**
   * Largura final da imagem. Quando informada, a captura e reescalada a partir
   * da largura real do node — permite exportar em alta resolucao um preview que
   * na tela e menor (o SVG intermediario preserva a nitidez do texto).
   */
  targetWidth?: number;
  /** `image/png` (default) ou `image/jpeg`. */
  mimeType?: string;
  /** Compressao 0..1, so vale para formatos com perda (JPEG). */
  quality?: number;
}

export interface ShareRequest extends ImageExportRequest {
  /** Texto sugerido na folha de compartilhamento nativa. */
  shareText: string;
}

const waitForFonts = async () => {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignora: seguimos com as fontes que ja estiverem disponiveis.
    }
  }
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Não foi possível gerar a imagem.")),
      mimeType,
      quality
    );
  });

const captureBlob = async (
  node: HTMLElement,
  { backgroundColor, targetWidth, mimeType = "image/png", quality }: ImageExportRequest
): Promise<Blob> => {
  await waitForFonts();

  const width = node.offsetWidth;
  const height = node.offsetHeight;
  // O node vira um SVG antes de ir para o canvas; ampliar via canvasWidth/Height
  // mantem texto e layout vetoriais (nitidos) e garante dimensoes exatas.
  const scale = targetWidth && width ? targetWidth / width : 1;

  // Passamos pelo canvas (em vez de `toBlob`) para escolher o formato do
  // arquivo: JPEG precisa do fundo opaco que `backgroundColor` ja garante.
  const canvas = await toCanvas(node, {
    pixelRatio: 1,
    cacheBust: true,
    backgroundColor,
    width,
    height,
    canvasWidth: Math.round(width * scale),
    canvasHeight: Math.round(height * scale),
  });

  return canvasToBlob(canvas, mimeType, quality);
};

const triggerDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Pequeno atraso garante que o download iniciou antes de revogar.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Web Share com arquivos so e oferecido quando o navegador realmente suporta. */
export const canShareFiles = (): boolean => {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    const probe = new File([new Blob()], "probe.png", { type: "image/png" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
};

export const useImageExport = () => {
  const [status, setStatus] = useState<ImageExportStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const fail = useCallback((err: unknown) => {
    setStatus("error");
    setError(err instanceof Error ? err.message : "Falha ao gerar a imagem.");
  }, []);

  const download = useCallback(
    async (node: HTMLElement | null, request: ImageExportRequest) => {
      if (!node) return;
      setStatus("working");
      setError(null);
      try {
        triggerDownload(await captureBlob(node, request), request.fileName);
        setStatus("success");
      } catch (err) {
        fail(err);
      }
    },
    [fail]
  );

  const share = useCallback(
    async (node: HTMLElement | null, request: ShareRequest) => {
      if (!node) return;
      setStatus("working");
      setError(null);
      try {
        const blob = await captureBlob(node, request);
        const file = new File([blob], request.fileName, { type: blob.type });

        if (canShareFiles()) {
          try {
            await navigator.share({
              files: [file],
              title: "Spotifysplit",
              text: request.shareText,
            });
            setStatus("success");
            return;
          } catch (shareErr) {
            // Usuario cancelou a folha de compartilhamento: nao e erro.
            if (shareErr instanceof Error && shareErr.name === "AbortError") {
              setStatus("idle");
              return;
            }
            // Outro erro de share: cai para o download.
          }
        }

        triggerDownload(blob, request.fileName);
        setStatus("success");
      } catch (err) {
        fail(err);
      }
    },
    [fail]
  );

  return { status, error, download, share, reset };
};
