import { Page } from "@playwright/test";

export const ACCESS_TOKEN_KEY = "spotify_access_token";
export const TOUR_KEY = "sonarstats_tour";

export const TRACK = {
  id: "faixa-1",
  name: "Faixa em reproducao",
  duration_ms: 210_000,
  album: { id: "album-1", name: "Album", images: [] },
  artists: [{ id: "artista-1", name: "Artista de teste" }],
  external_urls: { spotify: "https://open.spotify.com/track/faixa-1" },
};

/*
 * Respostas por caminho, com `{ items: [] }` de padrao.
 *
 * As telas devem aguentar lista vazia — e o que acontece com conta nova —,
 * entao o padrao vazio nao e preguica: e o caso de borda mais comum.
 */
const RESPONSES: Record<string, unknown> = {
  "/v1/me": {
    id: "usuario-1",
    display_name: "Usuario de Teste",
    images: [],
    followers: { total: 10 },
    product: "premium",
    external_urls: { spotify: "https://open.spotify.com/user/usuario-1" },
  },
  "/v1/me/player": { is_playing: true, item: TRACK, progress_ms: 60_000 },
  "/v1/me/player/queue": { currently_playing: TRACK, queue: [] },
  // Este endpoint aninha a lista em `artists`, e o card de perfil le
  // `followedArtists.artists.items` sem guarda.
  "/v1/me/following": { artists: { items: [], total: 0 } },
  "/v1/me/playlists": { items: [], total: 0 },
};

type SpotifyStubOptions = {
  /** Sobrescreve ou acrescenta respostas por caminho. */
  overrides?: Record<string, unknown>;
};

/**
 * Intercepta a Web API do Spotify. Sem isto o app dispara chamadas reais com um
 * token falso e a tela vira uma parede de erro.
 */
export const stubSpotifyApi = async (
  page: Page,
  { overrides = {} }: SpotifyStubOptions = {}
) => {
  const responses = { ...RESPONSES, ...overrides };

  await page.route("https://api.spotify.com/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const body = responses[path] ?? { items: [] };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
};

/** Deixa o app autenticado antes do primeiro script da pagina rodar. */
export const authenticate = async (page: Page, token = "BQtoken-de-teste") => {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [ACCESS_TOKEN_KEY, token]
  );
};

/** Marca o tour como dispensado para o convite nao cobrir a tela. */
export const skipTour = async (page: Page) => {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [TOUR_KEY, JSON.stringify({ v: 99, status: "dismissed", at: "" })]
  );
};

/*
 * CUIDADO: `addInitScript` roda a cada navegacao, reload incluso. Serve para
 * montar o estado ANTES da primeira visita; nao use em teste que recarrega a
 * pagina esperando ver o que o app gravou, porque a semente reescreve a chave
 * no meio do caminho.
 */
export const seedStorage = async (page: Page, entries: Record<string, string>) => {
  await page.addInitScript((items: Record<string, string>) => {
    Object.entries(items).forEach(([key, value]) =>
      window.localStorage.setItem(key, value)
    );
  }, entries);
};

export const readStorage = (page: Page) =>
  page.evaluate(() => ({ ...window.localStorage }));
