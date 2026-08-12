/*
 * REGRESSAO — prefixo /api.
 *
 * Cliente e API dividem a mesma origem no deploy da Netlify. O React Router ja
 * usa `/login`, entao uma function em `/login` roubaria a rota da SPA: quem
 * clicasse em "entrar" cairia num redirect do OAuth vindo do lugar errado, ou
 * pior, a tela de login do app deixaria de existir.
 *
 * Todo endpoint de auth vive sob `/api`, e o `client/.env.production` aponta
 * para la. Este arquivo le a configuracao real das functions — nao uma copia da
 * lista — para que uma function nova fora do prefixo tambem seja pega.
 */

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const functionsDir = fileURLToPath(new URL(".", import.meta.url));

const functionFiles = readdirSync(functionsDir)
  .filter((file) => file.endsWith(".mjs") && !file.endsWith(".test.mjs"))
  .sort();

const loadFunction = (file) => import(new URL(file, import.meta.url).href);

describe("descoberta das functions", () => {
  it("encontra as quatro functions de auth", () => {
    expect(functionFiles).toEqual([
      "callback.mjs",
      "login.mjs",
      "logout.mjs",
      "refresh-token.mjs",
    ]);
  });
});

describe("contrato de rotas", () => {
  it.each(functionFiles)("%s declara um path sob /api", async (file) => {
    const { config } = await loadFunction(file);

    expect(config?.path).toBeDefined();
    expect(config.path).toMatch(/^\/api\//);
  });

  it.each(functionFiles)("%s exporta um handler padrao", async (file) => {
    const module = await loadFunction(file);

    expect(typeof module.default).toBe("function");
  });

  it("mapeia cada endpoint no path e metodo esperados", async () => {
    const routes = await Promise.all(
      functionFiles.map(async (file) => {
        const { config } = await loadFunction(file);
        return [config.path, config.method];
      })
    );

    expect(Object.fromEntries(routes)).toEqual({
      "/api/login": "GET",
      "/api/callback": "GET",
      "/api/refresh_token": "POST",
      "/api/logout": "POST",
    });
  });

  // A colisao concreta que originou o bug.
  it("nao ocupa /login, que pertence ao React Router", async () => {
    const paths = await Promise.all(
      functionFiles.map(async (file) => (await loadFunction(file)).config.path)
    );

    expect(paths).not.toContain("/login");
    expect(paths).not.toContain("/callback");
  });
});

describe("configuracao do cliente em producao", () => {
  const readRepoFile = (relativePath) =>
    readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");

  /*
   * Rede de seguranca do build: se a variavel faltar no painel da Netlify, este
   * arquivo e quem mantem a base da API em /api. String vazia colidiria com a
   * rota /login da SPA — exatamente o bug.
   */
  it("client/.env.production aponta a base da API para /api", () => {
    expect(readRepoFile("client/.env.production")).toMatch(
      /^VITE_API_URL=\/api$/m
    );
  });

  // O redirect de SPA e `/*` -> `/index.html`. Ele nao pode capturar `/api/*`:
  // as functions declaram o proprio path, resolvido antes do redirect.
  it("o fallback de SPA nao intercepta /api", () => {
    const netlifyToml = readRepoFile("netlify.toml");

    expect(netlifyToml).toContain('from = "/*"');
    expect(netlifyToml).not.toMatch(/from = "\/api/);
  });
});
