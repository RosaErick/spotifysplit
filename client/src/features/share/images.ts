// Pre-carregamento de imagens para data URLs (mesma origem).
//
// Por que: o poster e capturado com html-to-image, que desenha num <canvas>.
// Imagens remotas (i.scdn.co) "tingem" (taint) o canvas e quebram a exportacao.
// O CDN do Spotify responde com `Access-Control-Allow-Origin: *`, entao podemos
// busca-las via fetch/CORS e converte-las em data URLs same-origin ANTES de
// renderizar o poster. Assim a captura nunca toca recurso cross-origin.
//
// Fallback: se o fetch falhar, tentamos <img crossOrigin="anonymous"> + canvas;
// se ainda assim falhar, retornamos null e o poster mostra as iniciais.

import { useEffect, useState } from "react";
import { SpotifyImage } from "../../shared/types/spotify";

/** Seleciona uma imagem de tamanho medio (boa para miniatura/avatar). */
export const pickImageUrl = (
  images: SpotifyImage[] | undefined
): string | undefined => {
  if (!images || images.length === 0) return undefined;
  // A API costuma ordenar do maior para o menor; pega a do meio quando possivel.
  const sorted = [...images].sort(
    (a, b) => (b.width ?? 0) - (a.width ?? 0)
  );
  const middle = sorted[Math.min(1, sorted.length - 1)];
  return middle?.url ?? sorted[0]?.url;
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const loadViaImageElement = (url: string): Promise<string | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

/** Carrega uma URL remota como data URL same-origin. Retorna null se falhar. */
export const loadImageAsDataUrl = async (
  url: string
): Promise<string | null> => {
  try {
    const response = await fetch(url, { mode: "cors", cache: "force-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch {
    return loadViaImageElement(url);
  }
};

/**
 * Pre-carrega um conjunto de URLs como data URLs.
 * `isLoading` cobre o estado enquanto a conversao acontece.
 */
export const useImageDataUrls = (urls: string[]) => {
  const [dataUrls, setDataUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Chave estavel para evitar refetch desnecessario quando a lista nao muda.
  const key = urls.join("|");

  useEffect(() => {
    let active = true;
    const unique = Array.from(new Set(urls.filter(Boolean)));

    if (unique.length === 0) {
      setDataUrls({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    Promise.all(
      unique.map(async (url) => [url, await loadImageAsDataUrl(url)] as const)
    ).then((entries) => {
      if (!active) return;
      const next: Record<string, string> = {};
      for (const [url, dataUrl] of entries) {
        if (dataUrl) next[url] = dataUrl;
      }
      setDataUrls(next);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { dataUrls, isLoading };
};
