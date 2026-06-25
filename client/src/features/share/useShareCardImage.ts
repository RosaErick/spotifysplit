// Geracao do PNG a partir do DOM do poster.
//
// Usa html-to-image (toBlob). Aguarda `document.fonts.ready` para que Fraunces /
// Hanken / JetBrains Mono entrem na imagem. O node capturado ja tem 1080px de
// largura logica, entao `pixelRatio: 1` ja entrega o PNG nitido pedido.

import { useCallback, useState } from "react";
import { toBlob } from "html-to-image";

export type ShareStatus = "idle" | "working" | "success" | "error";

const POSTER_BACKGROUND = "#1b120b";

const waitForFonts = async () => {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignora: seguimos com as fontes que ja estiverem disponiveis.
    }
  }
};

const captureBlob = async (node: HTMLElement): Promise<Blob> => {
  await waitForFonts();
  const blob = await toBlob(node, {
    pixelRatio: 1,
    cacheBust: true,
    backgroundColor: POSTER_BACKGROUND,
    width: node.offsetWidth,
    height: node.offsetHeight,
  });
  if (!blob) throw new Error("Não foi possível gerar a imagem.");
  return blob;
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

export const useShareCardImage = () => {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const download = useCallback(
    async (node: HTMLElement | null, fileName: string) => {
      if (!node) return;
      setStatus("working");
      setError(null);
      try {
        const blob = await captureBlob(node);
        triggerDownload(blob, fileName);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Falha ao gerar a imagem."
        );
      }
    },
    []
  );

  const share = useCallback(
    async (node: HTMLElement | null, fileName: string, shareText: string) => {
      if (!node) return;
      setStatus("working");
      setError(null);
      try {
        const blob = await captureBlob(node);
        const file = new File([blob], fileName, { type: "image/png" });

        if (canShareFiles()) {
          try {
            await navigator.share({
              files: [file],
              title: "SpotfySplit",
              text: shareText,
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

        triggerDownload(blob, fileName);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Falha ao gerar a imagem."
        );
      }
    },
    []
  );

  return { status, error, download, share, reset };
};
