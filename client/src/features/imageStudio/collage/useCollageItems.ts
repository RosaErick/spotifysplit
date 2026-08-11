// Normaliza os stats do Spotify na lista generica que o mosaico consome.
//
// Artistas vem direto de /me/top/artists. Albuns nao tem endpoint proprio de
// "top": derivamos das top faixas, deduplicando por album e preservando a ordem
// de afinidade (o primeiro album a aparecer e o mais ouvido).
//
// O hook entrega as variantes de imagem cruas; quem renderiza escolhe a
// resolucao, porque so a view sabe o tamanho da celula.

import { useMemo } from "react";
import { useTopArtists, useTopTracks } from "../../../shared/api/queries";
import { SpotifyImage, SpotifyTopTimeRange } from "../../../shared/types/spotify";
import { CollageSource, MAX_COLLAGE_ITEMS } from "./collageOptions";

export interface CollageItem {
  id: string;
  title: string;
  /** Linha secundaria opcional (artistas do album). */
  subtitle?: string;
  images?: SpotifyImage[];
}

// Buscamos o maximo de faixas permitido pela API porque varias podem compartilhar
// o mesmo album — 50 faixas costumam render itens suficientes para 6 x 6.
const TRACKS_PAGE_SIZE = 50;

export const useCollageItems = (
  source: CollageSource,
  timeRange: SpotifyTopTimeRange
) => {
  const artistsQuery = useTopArtists(timeRange, MAX_COLLAGE_ITEMS, {
    enabled: source === "artists",
  });
  const tracksQuery = useTopTracks(timeRange, TRACKS_PAGE_SIZE, {
    enabled: source === "albums",
  });

  const query = source === "artists" ? artistsQuery : tracksQuery;

  const items = useMemo<CollageItem[]>(() => {
    if (source === "artists") {
      return (artistsQuery.data?.items ?? []).map((artist) => ({
        id: artist.id,
        title: artist.name,
        images: artist.images,
      }));
    }

    const seen = new Set<string>();
    const albums: CollageItem[] = [];

    for (const track of tracksQuery.data?.items ?? []) {
      const album = track.album;
      if (!album?.id || seen.has(album.id)) continue;
      seen.add(album.id);
      albums.push({
        id: album.id,
        title: album.name,
        subtitle: album.artists?.map((artist) => artist.name).join(", "),
        images: album.images,
      });
      if (albums.length === MAX_COLLAGE_ITEMS) break;
    }

    return albums;
  }, [source, artistsQuery.data, tracksQuery.data]);

  return {
    items,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
