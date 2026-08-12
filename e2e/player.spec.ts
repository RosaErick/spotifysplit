/*
 * REGRESSAO — o player nao voltava ao header.
 *
 * O mesmo bug ja tem teste de componente. Ele volta aqui porque a versao de
 * componente roda em jsdom, onde nao existe layout: se o dock sumisse da arvore
 * mas continuasse coberto ou fora da tela, so o browser de verdade contaria.
 */

import { expect, test } from "@playwright/test";
import { authenticate, skipTour, stubSpotifyApi, TRACK } from "./fixtures";

const dock = (page: import("@playwright/test").Page) =>
  page.getByRole("region", { name: "Tocando agora" });

test.beforeEach(async ({ page }) => {
  await authenticate(page);
  await skipTour(page);
});

test("mostra o dock quando ha musica tocando", async ({ page }) => {
  await stubSpotifyApi(page);

  await page.goto("/");

  await expect(dock(page)).toBeVisible();
  await expect(dock(page).getByText(TRACK.name)).toBeVisible();
});

test("nao mostra o dock com a reproducao parada", async ({ page }) => {
  await stubSpotifyApi(page, {
    overrides: {
      "/v1/me/player": { is_playing: false, item: TRACK },
      "/v1/me/player/queue": { currently_playing: null, queue: [] },
    },
  });

  await page.goto("/");
  // Espera o app montar antes de afirmar a ausencia, senao o teste passaria so
  // por ter chegado cedo demais. A ancora e o cabecalho, que existe em qualquer
  // largura — a barra de abas do mobile some por CSS no desktop e sai junto da
  // arvore de acessibilidade.
  await expect(page.getByRole("link", { name: "Voltar ao início" })).toBeVisible();

  await expect(dock(page)).toBeHidden();
});

// A ASSERCAO CENTRAL: o dock sai da tela na hora, com a musica ainda tocando.
test("dispensar o dock o tira da tela imediatamente", async ({ page }) => {
  await stubSpotifyApi(page);

  await page.goto("/");
  await expect(dock(page)).toBeVisible();

  await page.getByLabel("Recolher player").click();

  await expect(dock(page)).toBeHidden();
});

test("o controle do header reaparece quando o dock e dispensado", async ({
  page,
}) => {
  await stubSpotifyApi(page);
  const headerControl = page.getByRole("button", { name: "Tocando agora" });

  await page.goto("/");
  await expect(headerControl).toBeHidden();

  await page.getByLabel("Recolher player").click();

  await expect(headerControl).toBeVisible();
});

/*
 * A dispensa e de sessao, nao preferencia gravada: recarregar com a musica
 * ainda tocando traz o dock de volta. Persistir a escolha seria outro produto —
 * e outra decisao.
 */
test("o dock volta depois de recarregar a pagina", async ({ page }) => {
  await stubSpotifyApi(page);

  await page.goto("/");
  await page.getByLabel("Recolher player").click();
  await expect(dock(page)).toBeHidden();

  await page.reload();

  await expect(dock(page)).toBeVisible();
});
