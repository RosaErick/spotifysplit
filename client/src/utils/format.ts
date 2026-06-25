export const formatNumber = (value?: number) =>
  new Intl.NumberFormat("pt-BR").format(value || 0);

export const formatDuration = (durationMs?: number) => {
  const totalSeconds = Math.floor((durationMs || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Generos sao um campo do artista (vindo do Spotify). O mesmo artista pode vir
// com a lista em ordem diferente entre o endpoint de "top artists" e o de
// "/artists/{id}", o que fazia a tela inicial e a pagina do artista mostrarem
// generos diferentes ao fatiar os 2 primeiros. Ordenamos de forma estavel antes
// de fatiar para que todas as telas exibam sempre os mesmos generos.
export const topGenres = (genres: string[] | undefined, count = 2): string[] =>
  [...(genres ?? [])]
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .slice(0, count);

export const formatGenresLabel = (
  genres: string[] | undefined,
  fallback = "Sem gênero informado"
) => {
  const list = topGenres(genres);
  return list.length ? list.join(", ") : fallback;
};
