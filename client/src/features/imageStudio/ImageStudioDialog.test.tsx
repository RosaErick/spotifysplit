/*
 * REGRESSAO — chave legada de localStorage (cor do estudio).
 *
 * Mesma historia do tema e do acento: o rename trocou `spotifysplit_poster_color`
 * por `sonarstats_studio_color`, e sem a leitura da chave antiga a cor escolhida
 * para as imagens exportadas voltava ao padrao.
 *
 * O teste monta o dialogo FECHADO de proposito. `getInitialColor` roda no
 * inicializador do estado e o efeito grava na chave nova logo em seguida — o
 * suficiente para provar a migracao, sem abrir o modal e disparar as buscas dos
 * paineis.
 */

import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ImageStudioDialog } from "./ImageStudioDialog";
import { defaultStudioColor } from "./studioTheme";

const STUDIO_COLOR_KEY = "sonarstats_studio_color";
const LEGACY_STUDIO_COLOR_KEY = "spotifysplit_poster_color";

const readStudioColor = () => window.localStorage.getItem(STUDIO_COLOR_KEY);

describe("cor do estudio", () => {
  it("mantem a cor gravada na chave atual", () => {
    window.localStorage.setItem(STUDIO_COLOR_KEY, "#1ED760");
    renderWithProviders(<ImageStudioDialog />);

    expect(readStudioColor()).toBe("#1ED760");
  });

  it("aproveita a cor gravada antes do rename", () => {
    window.localStorage.setItem(LEGACY_STUDIO_COLOR_KEY, "#4AA3FF");
    renderWithProviders(<ImageStudioDialog />);

    expect(readStudioColor()).toBe("#4AA3FF");
  });

  it("da precedencia a chave nova sobre a legada", () => {
    window.localStorage.setItem(STUDIO_COLOR_KEY, "#1ED760");
    window.localStorage.setItem(LEGACY_STUDIO_COLOR_KEY, "#4AA3FF");
    renderWithProviders(<ImageStudioDialog />);

    expect(readStudioColor()).toBe("#1ED760");
  });

  it("nunca grava na chave legada", () => {
    window.localStorage.setItem(LEGACY_STUDIO_COLOR_KEY, "#4AA3FF");
    renderWithProviders(<ImageStudioDialog />);

    expect(window.localStorage.getItem(LEGACY_STUDIO_COLOR_KEY)).toBe("#4AA3FF");
  });

  it("cai no padrao quando nao ha nada gravado", () => {
    renderWithProviders(<ImageStudioDialog />);

    expect(readStudioColor()).toBe(defaultStudioColor);
  });

  it("descarta valor corrompido em vez de propagar para o CSS", () => {
    window.localStorage.setItem(LEGACY_STUDIO_COLOR_KEY, "nao-e-cor");
    renderWithProviders(<ImageStudioDialog />);

    expect(readStudioColor()).toBe(defaultStudioColor);
  });
});

describe("gatilho do estudio", () => {
  it("comeca fechado, com o botao de abrir na tela", () => {
    renderWithProviders(<ImageStudioDialog />);

    expect(screen.getByRole("button", { name: /gerar imagem/i })).toBeDefined();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
