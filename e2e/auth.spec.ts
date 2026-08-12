/*
 * O fluxo de entrada no browser de verdade: guarda de rota, o prefixo /api e o
 * que sobra na URL e no storage depois do callback OAuth.
 *
 * Regressoes cobertas aqui: prefixo /api (bug do /login colidindo com o React
 * Router) e refresh token fora do browser.
 */

import { expect, test } from "@playwright/test";
import {
  ACCESS_TOKEN_KEY,
  authenticate,
  readStorage,
  skipTour,
  stubSpotifyApi,
} from "./fixtures";

test.describe("guarda de rotas", () => {
  test("manda visitante para o login", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("link", { name: /entrar com spotify/i })
    ).toBeVisible();
  });

  test("nao deixa rota privada vazar sem token", async ({ page }) => {
    await page.goto("/library");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("devolve quem ja tem sessao do login para a home", async ({ page }) => {
    await stubSpotifyApi(page);
    await authenticate(page);
    await skipTour(page);

    await page.goto("/login");

    await expect(page).toHaveURL(/\/$/);
  });

  test("mantem /sobre aberta a visitante", async ({ page }) => {
    await page.goto("/sobre");

    await expect(page).toHaveURL(/\/sobre$/);
  });
});

test.describe("prefixo /api", () => {
  /*
   * REGRESSAO. `/login` pertence ao React Router. Se a base da API voltar a ser
   * vazia, o botao aponta para a propria rota da SPA e o usuario roda em
   * circulo na tela de login, sem nunca chegar ao Spotify.
   */
  test("o botao de entrar aponta para /api/login, nao para a rota da SPA", async ({
    page,
  }) => {
    await page.goto("/login");

    const link = page.getByRole("link", { name: /entrar com spotify/i });
    await expect(link).toHaveAttribute("href", "/api/login");
  });

  test("clicar em entrar sai da SPA e chega ao backend", async ({ page }) => {
    // O `vite preview` nao tem backend: o stub prova que a navegacao saiu do
    // roteador do React e virou requisicao de verdade para /api/login.
    await page.route("**/api/login", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<h1>backend recebeu /api/login</h1>",
      })
    );

    await page.goto("/login");
    await page.getByRole("link", { name: /entrar com spotify/i }).click();

    await expect(page).toHaveURL(/\/api\/login$/);
    await expect(page.getByRole("heading")).toHaveText(
      "backend recebeu /api/login"
    );
  });
});

test.describe("retorno do callback OAuth", () => {
  const CALLBACK = "/#access_token=BQtoken-do-callback&expires_in=3600";

  test("persiste o access token e entra no app", async ({ page }) => {
    await stubSpotifyApi(page);
    await skipTour(page);

    await page.goto(CALLBACK);

    await expect(page).toHaveURL(/\/$/);
    expect(await readStorage(page)).toMatchObject({
      [ACCESS_TOKEN_KEY]: "BQtoken-do-callback",
    });
  });

  test("limpa o token da URL", async ({ page }) => {
    await stubSpotifyApi(page);
    await skipTour(page);

    await page.goto(CALLBACK);

    // Nem no fragment nem na query: a URL nao pode carregar credencial para o
    // historico do navegador.
    await expect(page).toHaveURL(`${new URL("/", page.url()).href}`);
    expect(page.url()).not.toContain("BQtoken-do-callback");
    expect(page.url()).not.toContain("access_token");
  });

  /*
   * REGRESSAO — refresh token fora do browser. O backend manda so o access
   * token; ainda assim, se um refresh token aparecer no fragment, o cliente nao
   * pode persisti-lo. Ele nao expira sozinho: no localStorage, um XSS viraria
   * acesso permanente a conta.
   */
  test("nao guarda refresh token nem quando ele chega na URL", async ({ page }) => {
    await stubSpotifyApi(page);
    await skipTour(page);

    await page.goto(
      "/#access_token=BQtoken-do-callback&refresh_token=AQnao-deveria-existir"
    );

    const storage = await readStorage(page);
    expect(JSON.stringify(storage)).not.toContain("AQnao-deveria-existir");
    expect(Object.keys(storage)).not.toContain("spotify_refresh_token");
  });

  test("apaga o refresh token deixado por sessoes antigas", async ({ page }) => {
    await stubSpotifyApi(page);
    await skipTour(page);
    await page.addInitScript(() =>
      window.localStorage.setItem("spotify_refresh_token", "AQlegado")
    );

    await page.goto(CALLBACK);

    const storage = await readStorage(page);
    expect(storage).not.toHaveProperty("spotify_refresh_token");
  });

  test("volta ao login quando o callback traz erro", async ({ page }) => {
    await page.goto("/#error=state_mismatch");

    await expect(page).toHaveURL(/\/login$/);
    const storage = await readStorage(page);
    expect(storage).not.toHaveProperty(ACCESS_TOKEN_KEY);
  });
});
