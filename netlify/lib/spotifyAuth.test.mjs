import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSpotifyAuthorizationUrl,
  requestAccessToken,
  requestRefreshedToken,
} from "./spotifyAuth.mjs";

const env = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  redirectUri: "https://app.test/api/callback",
  clientUrl: "https://app.test",
  spotifyScopes: "user-top-read user-read-private",
};

const stubFetch = (payload, { ok = true, status = 200 } = {}) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => payload,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getSpotifyAuthorizationUrl", () => {
  it("monta a URL de autorizacao com todos os parametros", () => {
    const url = new URL(getSpotifyAuthorizationUrl(env, "state123"));

    expect(url.origin + url.pathname).toBe(
      "https://accounts.spotify.com/authorize"
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: env.clientId,
      response_type: "code",
      redirect_uri: env.redirectUri,
      scope: env.spotifyScopes,
      state: "state123",
    });
  });

  it("codifica os escopos separados por espaco", () => {
    const url = getSpotifyAuthorizationUrl(env, "s");

    expect(url).toContain("scope=user-top-read+user-read-private");
  });
});

describe("requestAccessToken", () => {
  it("posta no endpoint de token com Basic auth", async () => {
    const fetchMock = stubFetch({ access_token: "BQ" });

    await requestAccessToken(env, "auth-code");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://accounts.spotify.com/api/token");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe(
      `Basic ${btoa(`${env.clientId}:${env.clientSecret}`)}`
    );
  });

  /*
   * Os parametros vao no CORPO form-urlencoded. A versao antiga com axios
   * mandava na query string: o Spotify aceita as duas, mas na query o codigo de
   * autorizacao entra em log de acesso.
   */
  it("manda os parametros no corpo form-urlencoded, nao na query", async () => {
    const fetchMock = stubFetch({ access_token: "BQ" });

    await requestAccessToken(env, "auth-code");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).not.toContain("?");
    expect(init.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded"
    );
    expect(Object.fromEntries(new URLSearchParams(init.body))).toEqual({
      code: "auth-code",
      redirect_uri: env.redirectUri,
      grant_type: "authorization_code",
    });
  });

  it("devolve o payload do Spotify", async () => {
    stubFetch({ access_token: "BQ", refresh_token: "AQ", expires_in: 3600 });

    await expect(requestAccessToken(env, "code")).resolves.toEqual({
      access_token: "BQ",
      refresh_token: "AQ",
      expires_in: 3600,
    });
  });

  // `fetch` nao lanca em status de erro como o axios fazia: sem a checagem
  // explicita, um 400 viraria um token `undefined` seguindo adiante.
  it("lanca em status de erro", async () => {
    stubFetch({ error: "invalid_grant" }, { ok: false, status: 400 });

    await expect(requestAccessToken(env, "code")).rejects.toThrow("400");
  });
});

describe("requestRefreshedToken", () => {
  it("usa o grant de refresh", async () => {
    const fetchMock = stubFetch({ access_token: "BQnovo" });

    await requestRefreshedToken(env, "AQrefresh");

    const [, init] = fetchMock.mock.calls[0];
    expect(Object.fromEntries(new URLSearchParams(init.body))).toEqual({
      grant_type: "refresh_token",
      refresh_token: "AQrefresh",
    });
  });

  it("lanca em status de erro", async () => {
    stubFetch({ error: "invalid_grant" }, { ok: false, status: 400 });

    await expect(requestRefreshedToken(env, "AQ")).rejects.toThrow("400");
  });
});
