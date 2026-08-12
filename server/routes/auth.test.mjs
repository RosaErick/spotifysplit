/*
 * REGRESSAO — prefixo /api no Express do dev local.
 *
 * O dev local precisa falar o MESMO contrato do deploy same-origin. Se o
 * Express expuser `/login` na raiz, o dev funciona e a producao quebra (ou
 * vice-versa), porque em producao a raiz pertence a SPA e o React Router ja usa
 * `/login`.
 *
 * O app sobe de verdade num socket efemero e as rotas sao exercitadas por HTTP:
 * introspeccao do router interno do Express provaria menos e quebraria com
 * qualquer upgrade de versao.
 *
 * `server/` e codigo com `import`/`export` rodado via sucrase em producao; aqui
 * o Vitest transforma na hora, entao nao ha runtime extra no teste.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const CLIENT_URL = "http://127.0.0.1:5173";

let server;
let baseUrl;

beforeAll(async () => {
  // O modulo de config le process.env no import e lanca se faltar algo.
  process.env.CLIENT_ID = "test-client-id";
  process.env.CLIENT_SECRET = "test-client-secret";
  process.env.REDIRECT_URI = "http://127.0.0.1:3000/api/callback";
  process.env.CLIENT_URL = CLIENT_URL;
  process.env.SPOTIFY_SCOPES = "user-top-read";

  const { default: app } = await import("../app.js");

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(
  () => new Promise((resolve) => (server ? server.close(resolve) : resolve()))
);

// `redirect: manual` para inspecionar o 302 em vez de segui-lo ate o Spotify.
const get = (path) => fetch(`${baseUrl}${path}`, { redirect: "manual" });
const post = (path) =>
  fetch(`${baseUrl}${path}`, { method: "POST", redirect: "manual" });

describe("montagem das rotas", () => {
  it("expoe o login sob /api", async () => {
    const response = await get("/api/login");

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain(
      "accounts.spotify.com/authorize"
    );
  });

  // A colisao concreta: /login pertence ao React Router.
  it("nao expoe /login na raiz", async () => {
    expect((await get("/login")).status).toBe(404);
  });

  it("nao expoe /callback na raiz", async () => {
    expect((await get("/callback")).status).toBe(404);
  });

  it("nao expoe /refresh_token na raiz", async () => {
    expect((await post("/refresh_token")).status).toBe(404);
  });

  it("nao expoe /logout na raiz", async () => {
    expect((await post("/logout")).status).toBe(404);
  });

  it("mantem o health check na raiz", async () => {
    const response = await get("/");

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("health check");
  });
});

describe("contrato dos endpoints sob /api", () => {
  it("/api/refresh_token responde 401 sem cookie", async () => {
    const response = await post("/api/refresh_token");

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "missing_refresh_token" });
  });

  it("/api/logout derruba o cookie no path /api", async () => {
    const response = await post("/api/logout");
    const cookie = response.headers.getSetCookie().join(";");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(cookie).toContain("spotify_refresh_token=");
    expect(cookie).toContain("Path=/api");
  });

  it("/api/login grava o state num cookie HttpOnly", async () => {
    const response = await get("/api/login");
    const cookie = response.headers
      .getSetCookie()
      .find((value) => value.startsWith("spotify_auth_state="));
    const state = new URL(response.headers.get("location")).searchParams.get(
      "state"
    );

    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain(`spotify_auth_state=${state}`);
  });

  it("/api/callback recusa state que nao bate com o cookie", async () => {
    const response = await get("/api/callback?code=abc&state=atacante");

    expect(response.headers.get("location")).toBe(
      `${CLIENT_URL}/#error=state_mismatch`
    );
  });

  it("/api/callback devolve o erro no fragment, nunca na query", async () => {
    const location = new URL(
      (await get("/api/callback?code=abc&state=x")).headers.get("location")
    );

    expect(location.search).toBe("");
    expect(location.hash).toBe("#error=state_mismatch");
  });
});

describe("CORS", () => {
  it("libera apenas o CLIENT_URL configurado", async () => {
    const response = await get("/api/login");

    expect(response.headers.get("access-control-allow-origin")).toBe(CLIENT_URL);
    expect(response.headers.get("access-control-allow-origin")).not.toBe("*");
  });

  // Sem credentials o cookie HttpOnly nao viaja no dev local, onde cliente e
  // API estao em portas diferentes.
  it("permite credenciais", async () => {
    const response = await get("/api/login");

    expect(response.headers.get("access-control-allow-credentials")).toBe("true");
  });

  it("responde ao preflight", async () => {
    const response = await fetch(`${baseUrl}/api/refresh_token`, {
      method: "OPTIONS",
    });

    expect(response.status).toBe(204);
  });
});
