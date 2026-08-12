/*
 * REGRESSAO — refresh token fora do browser (lado cliente).
 *
 * O contrato: o `/api/callback` devolve SO o access token, no fragment (#), e o
 * refresh token viaja num cookie HttpOnly restrito a /api. O cliente nao pode
 * enviar, ler nem persistir refresh token em lugar nenhum.
 *
 * O que estes testes prendem:
 *  - `bootstrapAuthFromUrl` le do fragment e nunca da query string;
 *  - o token some da URL depois de lido (nada em log, historico ou Referer);
 *  - `/api/refresh_token` e chamado SEM corpo e COM credentials: include;
 *  - nenhum refresh token acaba no localStorage, venha de onde vier.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ACCESS_TOKEN_KEY = "spotify_access_token";
const LEGACY_REFRESH_TOKEN_KEY = "spotify_refresh_token";

// O modulo guarda a promise de refresh em voo num escopo de modulo: sem reset
// entre testes, um teste herdaria a chamada do anterior.
const importAuth = async () => {
  vi.resetModules();
  return import("./auth");
};

const setUrl = (url: string) =>
  window.history.replaceState({}, "", url);

beforeEach(() => {
  setUrl("/");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isAuthenticated", () => {
  it("segue o access token do storage", async () => {
    const { isAuthenticated } = await importAuth();
    expect(isAuthenticated()).toBe(false);

    window.localStorage.setItem(ACCESS_TOKEN_KEY, "BQabc");
    expect(isAuthenticated()).toBe(true);
  });
});

describe("bootstrapAuthFromUrl", () => {
  it("le o access token do fragment e persiste", async () => {
    setUrl("/#access_token=BQabc&expires_in=3600");

    const { bootstrapAuthFromUrl, getAccessToken } = await importAuth();
    bootstrapAuthFromUrl();

    expect(getAccessToken()).toBe("BQabc");
  });

  it("limpa o token da URL depois de ler", async () => {
    setUrl("/#access_token=BQabc&expires_in=3600");

    const { bootstrapAuthFromUrl } = await importAuth();
    bootstrapAuthFromUrl();

    expect(window.location.hash).toBe("");
    expect(window.location.href).not.toContain("BQabc");
  });

  // O backend manda no fragment de proposito: query string entra em log de
  // acesso e no header Referer. Aceitar `?access_token=` aqui seria aceitar o
  // vazamento que o desenho evita.
  it("ignora access token vindo da query string", async () => {
    setUrl("/?access_token=BQvazado");

    const { bootstrapAuthFromUrl, getAccessToken } = await importAuth();
    bootstrapAuthFromUrl();

    expect(getAccessToken()).toBeNull();
  });

  it("limpa a URL quando o callback devolve erro, sem gravar token", async () => {
    setUrl("/#error=state_mismatch");

    const { bootstrapAuthFromUrl, getAccessToken } = await importAuth();
    bootstrapAuthFromUrl();

    expect(getAccessToken()).toBeNull();
    expect(window.location.hash).toBe("");
  });

  it("nao mexe na URL quando nao ha nada a ler", async () => {
    setUrl("/artists/42#secao");

    const { bootstrapAuthFromUrl } = await importAuth();
    bootstrapAuthFromUrl();

    expect(window.location.hash).toBe("#secao");
  });

  it("apaga o refresh token deixado no storage por sessoes antigas", async () => {
    window.localStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, "AQlegado");
    setUrl("/#access_token=BQabc");

    const { bootstrapAuthFromUrl } = await importAuth();
    bootstrapAuthFromUrl();

    expect(window.localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY)).toBeNull();
  });

  it("nunca grava um refresh token vindo do fragment", async () => {
    // Mesmo que o backend regrida e volte a mandar o refresh token na URL, o
    // cliente nao pode persisti-lo.
    setUrl("/#access_token=BQabc&refresh_token=AQnaodeveria");

    const { bootstrapAuthFromUrl } = await importAuth();
    bootstrapAuthFromUrl();

    expect(JSON.stringify(window.localStorage)).not.toContain("AQnaodeveria");
  });
});

describe("refreshAccessToken", () => {
  const mockFetch = (response: unknown) => {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  const okResponse = (body: unknown) => ({
    ok: true,
    json: async () => body,
  });

  it("chama /refresh_token por POST, sem corpo e com credentials", async () => {
    const fetchMock = mockFetch(okResponse({ access_token: "BQnovo" }));

    const { refreshAccessToken } = await importAuth();
    await refreshAccessToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];

    expect(url).toContain("/refresh_token");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    // Sem corpo: quem guarda o refresh token e o cookie HttpOnly, nao o cliente.
    expect(init.body).toBeUndefined();
  });

  it("nunca envia um refresh token na requisicao", async () => {
    window.localStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, "AQlegado");
    const fetchMock = mockFetch(okResponse({ access_token: "BQnovo" }));

    const { refreshAccessToken } = await importAuth();
    await refreshAccessToken();

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain("refresh_token=");
    expect(JSON.stringify(init)).not.toContain("AQlegado");
  });

  it("persiste o access token renovado", async () => {
    mockFetch(okResponse({ access_token: "BQnovo", expires_in: 3600 }));

    const { refreshAccessToken, getAccessToken } = await importAuth();
    const token = await refreshAccessToken();

    expect(token).toBe("BQnovo");
    expect(getAccessToken()).toBe("BQnovo");
  });

  it("nao persiste refresh token nem que a resposta traga um", async () => {
    mockFetch(
      okResponse({ access_token: "BQnovo", refresh_token: "AQnaodeveria" })
    );

    const { refreshAccessToken } = await importAuth();
    await refreshAccessToken();

    expect(JSON.stringify(window.localStorage)).not.toContain("AQnaodeveria");
  });

  it("derruba a sessao quando a resposta nao e ok", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, "BQvelho");
    mockFetch({ ok: false, status: 401, json: async () => ({}) });

    const { refreshAccessToken, getAccessToken } = await importAuth();

    expect(await refreshAccessToken()).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it("derruba a sessao quando a resposta vem sem access token", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, "BQvelho");
    mockFetch(okResponse({ expires_in: 3600 }));

    const { refreshAccessToken, getAccessToken } = await importAuth();

    expect(await refreshAccessToken()).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it("devolve null quando a rede falha", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);

    const { refreshAccessToken } = await importAuth();

    await expect(refreshAccessToken()).resolves.toBeNull();
  });

  /*
   * Varias queries estourando 401 ao mesmo tempo e o caso normal, nao a
   * excecao: a home dispara meia duzia de chamadas juntas. Sem a promise
   * compartilhada seriam N chamadas concorrentes de refresh, e o Spotify pode
   * invalidar o refresh token ao ve-lo usado em paralelo.
   */
  it("compartilha uma unica requisicao entre chamadas concorrentes", async () => {
    const fetchMock = mockFetch(okResponse({ access_token: "BQnovo" }));

    const { refreshAccessToken } = await importAuth();
    const results = await Promise.all([
      refreshAccessToken(),
      refreshAccessToken(),
      refreshAccessToken(),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results).toEqual(["BQnovo", "BQnovo", "BQnovo"]);
  });

  it("permite uma nova requisicao depois que a anterior termina", async () => {
    const fetchMock = mockFetch(okResponse({ access_token: "BQnovo" }));

    const { refreshAccessToken } = await importAuth();
    await refreshAccessToken();
    await refreshAccessToken();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("clearSession", () => {
  it("limpa o storage e pede ao backend para derrubar o cookie", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    window.localStorage.setItem(ACCESS_TOKEN_KEY, "BQabc");

    const { clearSession, getAccessToken } = await importAuth();
    clearSession();

    expect(getAccessToken()).toBeNull();

    // O cookie e HttpOnly: so o backend consegue apaga-lo.
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/logout");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(init.keepalive).toBe(true);
  });

  it("nao lanca quando a chamada de logout falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { clearSession, getAccessToken } = await importAuth();

    expect(() => clearSession()).not.toThrow();
    expect(getAccessToken()).toBeNull();
  });
});
