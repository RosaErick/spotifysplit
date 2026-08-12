/*
 * REGRESSOES de persistencia: chaves legadas do localStorage e o convite do
 * tour.
 *
 * Sao bugs que so aparecem na SEGUNDA visita — exatamente o que teste de
 * componente com storage limpo a cada caso nao pega de graca. Aqui a segunda
 * visita e um reload de verdade, com o mesmo storage.
 */

import { expect, test } from "@playwright/test";
import {
  authenticate,
  readStorage,
  seedStorage,
  skipTour,
  stubSpotifyApi,
} from "./fixtures";

const THEME_KEY = "sonarstats_theme";
const ACCENT_KEY = "sonarstats_accent";
const LEGACY_THEME_KEY = "spotifysplit_theme";
const LEGACY_ACCENT_KEY = "spotifysplit_accent";
const TOUR_KEY = "sonarstats_tour";

test.describe("chaves legadas do localStorage", () => {
  test.beforeEach(async ({ page }) => {
    await stubSpotifyApi(page);
    await authenticate(page);
    await skipTour(page);
  });

  /*
   * O rename para SonarStats trocou o prefixo `spotifysplit_*`. Sem ler a chave
   * antiga, quem ja usava o app abria a versao renomeada com tema e cor
   * zerados.
   */
  test("aproveita tema e acento gravados antes do rename", async ({ page }) => {
    await seedStorage(page, {
      [LEGACY_THEME_KEY]: "light",
      [LEGACY_ACCENT_KEY]: "green",
    });

    await page.goto("/");
    await expect(page.locator(".radix-themes").first()).toHaveClass(/light/);

    // E promove para a chave nova, sem tocar na antiga.
    const storage = await readStorage(page);
    expect(storage[THEME_KEY]).toBe("light");
    expect(storage[ACCENT_KEY]).toBe("green");
    expect(storage[LEGACY_THEME_KEY]).toBe("light");
  });

  test("a chave nova tem precedencia sobre a legada", async ({ page }) => {
    await seedStorage(page, {
      [THEME_KEY]: "dark",
      [LEGACY_THEME_KEY]: "light",
    });

    await page.goto("/");

    await expect(page.locator(".radix-themes").first()).toHaveClass(/dark/);
  });

  /*
   * Sem `seedStorage` aqui de proposito: `addInitScript` roda a CADA navegacao,
   * inclusive no reload, e reescreveria a chave logo antes da assercao — o
   * teste falharia acusando o app de nao persistir. O estado inicial vem da
   * preferencia do sistema, que o Playwright emula.
   */
  test("a troca de tema sobrevive ao reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });

    await page.goto("/");
    await expect(page.locator(".radix-themes").first()).toHaveClass(/dark/);

    await page.getByLabel("Ativar tema claro").click();
    await expect(page.locator(".radix-themes").first()).toHaveClass(/light/);

    await page.reload();

    // Continua claro mesmo com o sistema em escuro: a escolha explicita vence.
    await expect(page.locator(".radix-themes").first()).toHaveClass(/light/);
    expect((await readStorage(page))[THEME_KEY]).toBe("light");
  });
});

test.describe("convite do tour", () => {
  test.beforeEach(async ({ page }) => {
    await stubSpotifyApi(page);
    await authenticate(page);
  });

  test("aparece para quem nunca viu", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Primeira vez aqui?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ver o guia" })).toBeVisible();
  });

  /*
   * REGRESSAO. "Agora nao" e permanente: quem dispensou nao pode ser
   * reconvidado. Reaparecer a cada visita e exatamente o comportamento que o
   * requisito proibe.
   */
  test("dispensar silencia o convite nas proximas visitas", async ({ page }) => {
    await page.goto("/");

    const dismiss = page.getByRole("button", { name: /agora não|agora nao/i });
    await expect(dismiss).toBeVisible();
    await dismiss.click();

    expect(JSON.parse((await readStorage(page))[TOUR_KEY])).toMatchObject({
      status: "dismissed",
    });

    await page.reload();

    await expect(dismiss).toBeHidden();
  });

  test("nao convida quem ja concluiu a versao atual", async ({ page }) => {
    await seedStorage(page, {
      [TOUR_KEY]: JSON.stringify({ v: 99, status: "done", at: "" }),
    });

    await page.goto("/");

    await expect(
      page.getByRole("button", { name: /agora não|agora nao/i })
    ).toBeHidden();
  });

  test("trata registro corrompido como quem nunca viu", async ({ page }) => {
    await seedStorage(page, { [TOUR_KEY]: "isto nao e json" });

    await page.goto("/");

    await expect(
      page.getByRole("button", { name: /agora não|agora nao/i })
    ).toBeVisible();
  });
});
