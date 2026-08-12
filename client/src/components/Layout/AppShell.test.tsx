/*
 * REGRESSAO — o player nao voltava ao header.
 *
 * O AppShell calculava `showPlayerDock = isPlaying && !isPlayerDockHidden`, usava
 * esse valor para o padding do body e para o icone do header... e passava ao
 * `PlayerDock` so o `state`. O dock, por sua vez, olhava unicamente
 * `state.isPlaying`. Resultado: clicar no X marcava o estado, o icone voltava ao
 * header, e a barra continuava na tela ate a musica parar.
 *
 * Hoje o dock e renderizado condicionalmente pelo AppShell. Reverter para o
 * `<PlayerDock state={...} />` incondicional faz "dispensar mantem o dock na
 * tela" falhar, que e o ponto deste arquivo.
 *
 * O `useNowPlaying` e o unico ponto trocado por dublê — ele fala com a API do
 * Spotify. O `PlayerDock` de verdade e quem renderiza, para o teste cobrir a
 * ligacao entre os dois e nao uma imitacao dela.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import type { NowPlayingState } from "../Player/MiniPlayer";

const nowPlaying = vi.hoisted(() => ({ current: null as NowPlayingState | null }));

vi.mock("../Player/MiniPlayer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../Player/MiniPlayer")>();

  return {
    ...actual,
    useNowPlaying: () => nowPlaying.current,
  };
});

const { AppShell } = await import("./AppShell");

const track = {
  id: "1",
  name: "Faixa de teste",
  duration_ms: 200_000,
  album: { images: [{ url: "https://example.test/capa.jpg" }] },
  artists: [{ name: "Artista de teste" }],
  external_urls: { spotify: "https://open.spotify.com/track/1" },
};

const playingState = (overrides: Partial<NowPlayingState> = {}): NowPlayingState =>
  ({
    isLoading: false,
    isError: false,
    isPlaying: true,
    item: track,
    progressMs: 60_000,
    refetch: vi.fn(),
    ...overrides,
  }) as unknown as NowPlayingState;

const dock = () => screen.queryByRole("region", { name: "Tocando agora" });

const renderShell = () =>
  renderWithProviders(
    <AppShell>
      <p>conteudo</p>
    </AppShell>
  );

beforeEach(() => {
  // O convite do tour monta um overlay sobre a home. Ele tem testes proprios;
  // aqui so atrapalharia a leitura das assercoes.
  window.localStorage.setItem(
    "sonarstats_tour",
    JSON.stringify({ v: 99, status: "dismissed", at: "" })
  );
  nowPlaying.current = playingState();
});

describe("dock do player", () => {
  it("aparece quando ha musica tocando", () => {
    renderShell();

    expect(dock()).not.toBeNull();
    expect(screen.getByText("Faixa de teste")).toBeDefined();
  });

  it("fica fora da tela quando nada esta tocando", () => {
    nowPlaying.current = playingState({ isPlaying: false });
    renderShell();

    expect(dock()).toBeNull();
  });

  // A ASSERCAO CENTRAL DA REGRESSAO.
  it("some da tela ao ser dispensado, mesmo com a musica continuando", () => {
    renderShell();
    expect(dock()).not.toBeNull();

    fireEvent.click(screen.getByLabelText("Recolher player"));

    expect(dock()).toBeNull();
  });

  it("libera o espaco reservado no corpo da pagina ao ser dispensado", () => {
    const { container } = renderShell();
    const shell = container.querySelector(".app-background") as HTMLElement;

    expect(shell.className).toContain("has-player-dock");

    fireEvent.click(screen.getByLabelText("Recolher player"));

    expect(shell.className).not.toContain("has-player-dock");
  });

  it("devolve o controle ao header quando o dock e dispensado", () => {
    // O botao do header e o dock compartilham o rotulo "Tocando agora"; o role
    // e o que separa os dois.
    const headerControl = () =>
      screen.queryByRole("button", { name: "Tocando agora" });

    renderShell();
    // Com o dock aberto o icone do header sai de cena: ele e o caminho de volta,
    // e nao faz sentido enquanto a barra esta la.
    expect(headerControl()).toBeNull();

    fireEvent.click(screen.getByLabelText("Recolher player"));

    expect(headerControl()).not.toBeNull();
  });
});

describe("ciclo de vida da dispensa", () => {
  /*
   * A dispensa vale ate a reproducao PARAR, nao ate a proxima faixa: a fila anda
   * sozinha, e reabrir o dock a cada troca de musica seria uma interrupcao a
   * cada tres minutos em cima da navegacao.
   */
  it("nao reabre o dock quando a faixa muda com a musica ainda tocando", () => {
    const { rerender } = renderShell();
    fireEvent.click(screen.getByLabelText("Recolher player"));
    expect(dock()).toBeNull();

    nowPlaying.current = playingState({
      item: { ...track, id: "2", name: "Proxima faixa" },
    } as Partial<NowPlayingState>);
    rerender(
      <AppShell>
        <p>conteudo</p>
      </AppShell>
    );

    expect(dock()).toBeNull();
  });

  // Voltar a tocar depois de parado, sim, e intencao do usuario: o dock volta.
  it("reabre o dock quando a reproducao para e recomeca", () => {
    const { rerender } = renderShell();
    fireEvent.click(screen.getByLabelText("Recolher player"));

    const rerenderShell = () =>
      rerender(
        <AppShell>
          <p>conteudo</p>
        </AppShell>
      );

    nowPlaying.current = playingState({ isPlaying: false });
    rerenderShell();
    expect(dock()).toBeNull();

    nowPlaying.current = playingState();
    rerenderShell();

    expect(dock()).not.toBeNull();
  });
});

describe("estrutura do shell", () => {
  it("renderiza o conteudo da pagina", () => {
    renderShell();

    expect(screen.getByText("conteudo")).toBeDefined();
  });

  it("mantem a navegacao principal do mobile", () => {
    renderShell();

    expect(
      screen.getByRole("navigation", { name: "Navegação principal" })
    ).toBeDefined();
  });

  it("usa o handler de logout recebido por prop", () => {
    const onLogout = vi.fn();
    renderWithProviders(
      <AppShell onLogout={onLogout}>
        <p>conteudo</p>
      </AppShell>
    );

    fireEvent.click(screen.getAllByRole("button", { name: /sair/i })[0]);

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
