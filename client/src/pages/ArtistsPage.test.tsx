/*
 * REGRESSAO — endpoint descontinuado.
 *
 * O Spotify descontinuou related-artists em 27/11/2024: para apps sem quota
 * estendida aprovada antes disso, a rota responde 403/404 para sempre. A pagina
 * mostrava um erro com "tentar novamente" que nunca ia funcionar — o usuario
 * clicava, esperava, e recebia o mesmo erro.
 *
 * Hoje a secao inteira desaparece nesse caso, e SO nesse caso: um 500 continua
 * sendo falha momentanea e merece retry.
 *
 * O teste troca as chamadas de rede pelos hooks de dados. A regra sob teste e a
 * da pagina — o que ela decide mostrar a partir do erro —, e nao o transporte.
 */

import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/renderWithProviders";
import { SpotifyApiError } from "../shared/api/errors";

const queries = vi.hoisted(() => ({
  artist: { data: undefined, isLoading: false, isError: false } as any,
  topTracks: { data: undefined, isLoading: false, isError: false } as any,
  related: { data: undefined, isLoading: false, isError: false } as any,
}));

// `usePlaybackState` e `useQueue` entram porque a pagina vive dentro do
// AppShell, que monta o player. Sem dublê elas bateriam na API do Spotify de
// verdade durante o teste.
const idleQuery = { data: undefined, isLoading: false, isError: false, refetch: vi.fn() };

vi.mock("../shared/api/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../shared/api/queries")>();

  return {
    ...actual,
    useArtist: () => queries.artist,
    useArtistTopTracks: () => queries.topTracks,
    useRelatedArtists: () => queries.related,
    usePlaybackState: () => idleQuery,
    useQueue: () => idleQuery,
  };
});

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return { ...actual, useParams: () => ({ id: "artista-1" }) };
});

const { default: ArtistPage } = await import("./ArtistsPage");

const artist = {
  id: "artista-1",
  name: "Artista de teste",
  popularity: 70,
  followers: { total: 1234 },
  genres: ["mpb", "rock"],
  images: [{ url: "https://example.test/artista.jpg" }],
};

const setup = ({ relatedError }: { relatedError?: unknown } = {}) => {
  queries.artist = { data: artist, isLoading: false, isError: false };
  queries.topTracks = {
    data: { tracks: [] },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  };
  queries.related = relatedError
    ? {
        data: undefined,
        isLoading: false,
        isError: true,
        error: relatedError,
        refetch: vi.fn(),
      }
    : {
        data: { artists: [] },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      };

  return renderWithProviders(<ArtistPage />);
};

const relatedSection = () => screen.queryByText("Artistas relacionados");
const retryButton = () => screen.queryByRole("button", { name: /tentar novamente/i });

describe("secao de artistas relacionados", () => {
  it("aparece quando o endpoint responde", () => {
    setup();

    expect(relatedSection()).not.toBeNull();
  });

  // AS DUAS ASSERCOES CENTRAIS DA REGRESSAO.
  it.each([403, 404])(
    "desaparece por inteiro quando o endpoint responde %i",
    (status) => {
      setup({ relatedError: new SpotifyApiError(status) });

      expect(relatedSection()).toBeNull();
    }
  );

  it.each([403, 404])(
    "nao oferece retry inutil no status %i",
    (status) => {
      setup({ relatedError: new SpotifyApiError(status) });

      expect(retryButton()).toBeNull();
      expect(screen.queryByText(/relacionados indisponíveis/i)).toBeNull();
    }
  );

  /*
   * O outro lado da regra: falha momentanea NAO some da tela. Esconder a secao
   * em qualquer erro seria a correcao preguicosa — e esconderia dados que
   * voltam sozinhos no proximo clique.
   */
  it.each([429, 500, 502])(
    "continua na tela, com retry, quando o erro e momentaneo (%i)",
    (status) => {
      setup({ relatedError: new SpotifyApiError(status) });

      expect(relatedSection()).not.toBeNull();
      expect(retryButton()).not.toBeNull();
    }
  );

  it("mantem a secao quando o erro nao e da API do Spotify", () => {
    setup({ relatedError: new Error("falha de rede") });

    expect(relatedSection()).not.toBeNull();
  });
});

describe("resto da pagina", () => {
  it("continua mostrando o artista quando os relacionados somem", () => {
    setup({ relatedError: new SpotifyApiError(403) });

    expect(screen.getByRole("heading", { name: "Artista de teste" })).toBeDefined();
    expect(screen.getByText("Faixas essenciais")).toBeDefined();
  });

  it("mostra os stats do artista formatados", () => {
    setup();

    expect(screen.getByText("70")).toBeDefined();
    expect(screen.getByText(new Intl.NumberFormat("pt-BR").format(1234))).toBeDefined();
    // Generos ordenados de forma estavel antes de fatiar.
    expect(screen.getByText("mpb, rock")).toBeDefined();
  });

  it("mostra o estado de carregando enquanto o artista nao chega", () => {
    queries.artist = { data: undefined, isLoading: true, isError: false };
    queries.topTracks = { data: undefined, isLoading: false, isError: false };
    queries.related = { data: undefined, isLoading: false, isError: false };
    renderWithProviders(<ArtistPage />);

    expect(screen.getByText(/carregando artista/i)).toBeDefined();
  });

  it("mostra erro com retry quando o proprio artista falha", () => {
    queries.artist = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new SpotifyApiError(500),
      refetch: vi.fn(),
    };
    queries.topTracks = { data: undefined, isLoading: false, isError: false };
    queries.related = { data: undefined, isLoading: false, isError: false };
    renderWithProviders(<ArtistPage />);

    expect(retryButton()).not.toBeNull();
  });
});
