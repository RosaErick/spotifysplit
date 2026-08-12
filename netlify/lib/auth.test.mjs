/*
 * REGRESSAO — refresh token fora do browser (lado servidor).
 *
 * O contrato que estes testes prendem:
 *
 *  - o `/api/callback` devolve SO o access token, e no fragment (#), que nao
 *    viaja para servidor nenhum: nao entra em log de acesso nem em Referer;
 *  - o refresh token sai apenas em `Set-Cookie`, HttpOnly e com Path=/api;
 *  - o corpo do `/api/refresh_token` nunca carrega refresh token, nem quando o
 *    Spotify devolve um novo na renovacao.
 *
 * O motivo: o refresh token do Spotify nao expira sozinho. Uma copia no browser
 * transforma qualquer XSS em acesso permanente a conta.
 *
 * As functions sao Web-standard — `(Request, env) => Response` —, entao da para
 * exercitar o handler inteiro sem subir servidor: monta o Request, le o
 * Response.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  handleCallback,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  withEnv,
} from "./auth.mjs";

const env = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  redirectUri: "https://sonarstats.netlify.app/api/callback",
  clientUrl: "https://sonarstats.netlify.app",
  spotifyScopes: "user-top-read user-read-private",
};

const httpEnv = { ...env, redirectUri: "http://127.0.0.1:3000/api/callback" };

const REFRESH_TOKEN = "AQrefresh-super-secreto";

const request = (url, { cookie } = {}) =>
  new Request(url, { headers: cookie ? { cookie } : {} });

const setCookies = (response) => response.headers.getSetCookie();

const cookieNamed = (response, name) =>
  setCookies(response).find((cookie) => cookie.startsWith(`${name}=`));

const attributesOf = (cookie) => cookie.split("; ");

const stubSpotifyToken = (payload, { ok = true } = {}) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: async () => payload,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("handleLogin", () => {
  it("redireciona para a autorizacao do Spotify", () => {
    const response = handleLogin(request("https://app.test/api/login"), env);
    const location = new URL(response.headers.get("Location"));

    expect(response.status).toBe(302);
    expect(location.origin).toBe("https://accounts.spotify.com");
    expect(location.pathname).toBe("/authorize");
    expect(location.searchParams.get("client_id")).toBe(env.clientId);
    expect(location.searchParams.get("response_type")).toBe("code");
    expect(location.searchParams.get("redirect_uri")).toBe(env.redirectUri);
    expect(location.searchParams.get("scope")).toBe(env.spotifyScopes);
  });

  it("nunca expoe o client secret no redirect", () => {
    const response = handleLogin(request("https://app.test/api/login"), env);

    expect(response.headers.get("Location")).not.toContain(env.clientSecret);
  });

  it("grava o state num cookie HttpOnly e manda o mesmo valor ao Spotify", () => {
    const response = handleLogin(request("https://app.test/api/login"), env);
    const location = new URL(response.headers.get("Location"));
    const cookie = cookieNamed(response, "spotify_auth_state");

    expect(cookie).toBeDefined();
    expect(attributesOf(cookie)).toContain("HttpOnly");
    expect(cookie).toContain(`spotify_auth_state=${location.searchParams.get("state")}`);
  });

  it("marca o cookie de state como Secure em producao (https)", () => {
    const response = handleLogin(request("https://app.test/api/login"), env);

    expect(attributesOf(cookieNamed(response, "spotify_auth_state"))).toContain(
      "Secure"
    );
  });

  it("dispensa Secure no dev local (http), onde ele impediria o cookie", () => {
    const response = handleLogin(request("http://127.0.0.1:3000/api/login"), httpEnv);

    expect(
      attributesOf(cookieNamed(response, "spotify_auth_state"))
    ).not.toContain("Secure");
  });
});

describe("handleCallback", () => {
  const callbackUrl = (params) =>
    `https://app.test/api/callback?${new URLSearchParams(params).toString()}`;

  const validCallback = () =>
    handleCallback(
      request(callbackUrl({ code: "auth-code", state: "s123" }), {
        cookie: "spotify_auth_state=s123",
      }),
      env
    );

  beforeEach(() => {
    stubSpotifyToken({
      access_token: "BQaccess",
      refresh_token: REFRESH_TOKEN,
      expires_in: 3600,
    });
  });

  it("devolve o access token no fragment, nao na query", async () => {
    const response = await validCallback();
    const location = new URL(response.headers.get("Location"));

    expect(response.status).toBe(302);
    expect(location.search).toBe("");

    const fragment = new URLSearchParams(location.hash.replace(/^#/, ""));
    expect(fragment.get("access_token")).toBe("BQaccess");
    expect(fragment.get("expires_in")).toBe("3600");
  });

  // O CORACAO DO BUG 7: o refresh token nao pode aparecer em lugar nenhum da URL.
  it("nunca coloca o refresh token na URL de retorno", async () => {
    const response = await validCallback();
    const location = response.headers.get("Location");

    expect(location).not.toContain(REFRESH_TOKEN);
    expect(location).not.toContain("refresh_token");
  });

  it("entrega o refresh token apenas num cookie HttpOnly restrito a /api", async () => {
    const response = await validCallback();
    const cookie = cookieNamed(response, "spotify_refresh_token");

    expect(cookie).toContain(REFRESH_TOKEN);

    const attributes = attributesOf(cookie);
    expect(attributes).toContain("HttpOnly");
    expect(attributes).toContain("Path=/api");
    expect(attributes).toContain("SameSite=Lax");
    expect(attributes).toContain("Secure");
  });

  it("da prazo de validade ao cookie: 30 dias", async () => {
    const response = await validCallback();

    expect(attributesOf(cookieNamed(response, "spotify_refresh_token"))).toContain(
      `Max-Age=${30 * 24 * 60 * 60}`
    );
  });

  it("expira o cookie de state em qualquer desfecho", async () => {
    const response = await validCallback();

    expect(attributesOf(cookieNamed(response, "spotify_auth_state"))).toContain(
      "Max-Age=0"
    );
  });

  it("nao emite cookie de refresh quando o Spotify nao devolve um", async () => {
    stubSpotifyToken({ access_token: "BQaccess", expires_in: 3600 });

    const response = await validCallback();

    expect(cookieNamed(response, "spotify_refresh_token")).toBeUndefined();
  });

  describe("anti-CSRF pelo state", () => {
    it("recusa quando o state nao bate com o cookie", async () => {
      const response = await handleCallback(
        request(callbackUrl({ code: "auth-code", state: "atacante" }), {
          cookie: "spotify_auth_state=s123",
        }),
        env
      );

      expect(response.headers.get("Location")).toContain("error=state_mismatch");
      expect(cookieNamed(response, "spotify_refresh_token")).toBeUndefined();
    });

    it("recusa quando nao ha cookie de state", async () => {
      const response = await handleCallback(
        request(callbackUrl({ code: "auth-code", state: "s123" })),
        env
      );

      expect(response.headers.get("Location")).toContain("error=state_mismatch");
    });

    it("recusa quando o Spotify nao devolve state", async () => {
      const response = await handleCallback(
        request(callbackUrl({ code: "auth-code" }), {
          cookie: "spotify_auth_state=s123",
        }),
        env
      );

      expect(response.headers.get("Location")).toContain("error=state_mismatch");
    });

    it("nao troca codigo por token quando o state falha", async () => {
      const fetchMock = stubSpotifyToken({});

      await handleCallback(
        request(callbackUrl({ code: "auth-code", state: "atacante" }), {
          cookie: "spotify_auth_state=s123",
        }),
        env
      );

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  it("sinaliza codigo ausente", async () => {
    const response = await handleCallback(
      request(callbackUrl({ state: "s123" }), {
        cookie: "spotify_auth_state=s123",
      }),
      env
    );

    expect(response.headers.get("Location")).toContain("error=missing_code");
  });

  it("sinaliza falha na troca do codigo sem vazar detalhe", async () => {
    stubSpotifyToken({ error: "invalid_grant" }, { ok: false });

    const response = await validCallback();
    const location = response.headers.get("Location");

    expect(location).toContain("error=invalid_token");
    expect(location).not.toContain("invalid_grant");
  });

  it("nao duplica a barra ao montar a URL do cliente", async () => {
    const response = await handleCallback(
      request(callbackUrl({ code: "auth-code", state: "s123" }), {
        cookie: "spotify_auth_state=s123",
      }),
      { ...env, clientUrl: "https://sonarstats.netlify.app///" }
    );

    expect(response.headers.get("Location")).toMatch(
      /^https:\/\/sonarstats\.netlify\.app\/#/
    );
  });
});

describe("handleRefreshToken", () => {
  const withCookie = (value = REFRESH_TOKEN) =>
    request("https://app.test/api/refresh_token", {
      cookie: `spotify_refresh_token=${value}`,
    });

  it("le o refresh token do cookie e o envia ao Spotify no corpo", async () => {
    const fetchMock = stubSpotifyToken({
      access_token: "BQnovo",
      expires_in: 3600,
    });

    await handleRefreshToken(withCookie(), env);

    const [, init] = fetchMock.mock.calls[0];
    const body = new URLSearchParams(init.body);
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("refresh_token")).toBe(REFRESH_TOKEN);
  });

  // O CORACAO DO BUG 7: a resposta que o browser le nao pode conter o segredo.
  it("nunca devolve o refresh token no corpo da resposta", async () => {
    stubSpotifyToken({ access_token: "BQnovo", expires_in: 3600 });

    const response = await handleRefreshToken(withCookie(), env);
    const raw = await response.text();

    expect(raw).not.toContain(REFRESH_TOKEN);
    expect(raw).not.toContain("refresh_token");
    expect(JSON.parse(raw)).toEqual({
      access_token: "BQnovo",
      expires_in: 3600,
    });
  });

  it("nao vaza nem o refresh token novo que o Spotify devolve na renovacao", async () => {
    stubSpotifyToken({
      access_token: "BQnovo",
      refresh_token: "AQrotacionado",
      expires_in: 3600,
    });

    const response = await handleRefreshToken(withCookie(), env);
    const raw = await response.text();

    expect(raw).not.toContain("AQrotacionado");

    // Ele existe — mas so no cookie HttpOnly.
    const cookie = cookieNamed(response, "spotify_refresh_token");
    expect(cookie).toContain("AQrotacionado");
    expect(attributesOf(cookie)).toContain("HttpOnly");
    expect(attributesOf(cookie)).toContain("Path=/api");
  });

  it("nao reescreve o cookie quando o Spotify nao rotaciona o token", async () => {
    stubSpotifyToken({ access_token: "BQnovo", expires_in: 3600 });

    const response = await handleRefreshToken(withCookie(), env);

    expect(setCookies(response)).toEqual([]);
  });

  it("responde 401 quando nao ha cookie", async () => {
    const fetchMock = stubSpotifyToken({});
    const response = await handleRefreshToken(
      request("https://app.test/api/refresh_token"),
      env
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "missing_refresh_token" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  /*
   * Token revogado: sem derrubar o cookie, o cliente ficaria tentando renovar
   * em loop a cada 401 e nunca chegaria na tela de login.
   */
  it("derruba o cookie quando o Spotify recusa o refresh", async () => {
    stubSpotifyToken({ error: "invalid_grant" }, { ok: false });

    const response = await handleRefreshToken(withCookie(), env);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "spotify_refresh_failed" });
    expect(attributesOf(cookieNamed(response, "spotify_refresh_token"))).toContain(
      "Max-Age=0"
    );
  });

  it("responde JSON", async () => {
    stubSpotifyToken({ access_token: "BQnovo", expires_in: 3600 });

    const response = await handleRefreshToken(withCookie(), env);

    expect(response.headers.get("Content-Type")).toBe("application/json");
  });
});

describe("handleLogout", () => {
  it("derruba o cookie no mesmo path em que ele foi criado", async () => {
    const response = handleLogout(
      request("https://app.test/api/logout"),
      env
    );
    const cookie = cookieNamed(response, "spotify_refresh_token");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(attributesOf(cookie)).toContain("Max-Age=0");
    // Path diferente do original nao apaga cookie nenhum.
    expect(attributesOf(cookie)).toContain("Path=/api");
    expect(attributesOf(cookie)).toContain("HttpOnly");
  });
});

describe("withEnv", () => {
  const validEnv = {
    CLIENT_ID: "id",
    CLIENT_SECRET: "secret",
    REDIRECT_URI: "https://app.test/api/callback",
    CLIENT_URL: "https://app.test",
    SPOTIFY_SCOPES: "user-top-read",
  };

  const stubProcessEnv = (source) => {
    vi.stubGlobal("process", { ...process, env: source });
  };

  it("entrega a config lida ao handler", async () => {
    stubProcessEnv(validEnv);
    const handler = vi.fn().mockResolvedValue(new Response("ok"));

    await withEnv(handler)(request("https://app.test/api/login"));

    expect(handler.mock.calls[0][1]).toMatchObject({
      clientId: "id",
      clientSecret: "secret",
      clientUrl: "https://app.test",
    });
  });

  it("responde 500 sem vazar detalhe quando falta variavel de ambiente", async () => {
    stubProcessEnv({ ...validEnv, CLIENT_SECRET: undefined });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await withEnv(vi.fn())(request("https://app.test/api/login"));

    expect(response.status).toBe(500);
    const raw = await response.text();
    expect(raw).toBe(JSON.stringify({ error: "server_error" }));
    expect(raw).not.toContain("CLIENT_SECRET");
  });

  it("responde 500 quando o handler lanca", async () => {
    stubProcessEnv(validEnv);
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await withEnv(async () => {
      throw new Error("boom");
    })(request("https://app.test/api/login"));

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("boom");
  });
});
