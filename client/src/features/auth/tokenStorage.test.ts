import { describe, expect, it } from "vitest";
import {
  clearLegacyRefreshToken,
  clearTokens,
  getAccessToken,
  setAccessToken,
} from "./tokenStorage";

const ACCESS_TOKEN_KEY = "spotify_access_token";
const LEGACY_REFRESH_TOKEN_KEY = "spotify_refresh_token";

describe("getAccessToken", () => {
  it("devolve null quando nao ha token", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("devolve o token gravado", () => {
    setAccessToken("BQabc123");

    expect(getAccessToken()).toBe("BQabc123");
  });

  /*
   * As strings "undefined" e "null" ja foram gravadas por versoes antigas que
   * faziam `localStorage.setItem(key, String(token))`. Sem esta guarda o app
   * mandava `Authorization: Bearer undefined` para o Spotify e recebia 401 num
   * loop, em vez de simplesmente mandar o usuario para o login.
   */
  it.each(["undefined", "null", ""])(
    "trata o lixo de versoes antigas como ausencia de token (%s)",
    (value) => {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, value);

      expect(getAccessToken()).toBeNull();
    }
  );
});

describe("clearLegacyRefreshToken", () => {
  /*
   * REGRESSAO — refresh token fora do browser.
   *
   * Antes do endurecimento o refresh token vinha para o localStorage. Ele nao
   * expira sozinho, entao a copia deixada para tras era acesso permanente a
   * conta a espera de um XSS. A limpeza roda no bootstrap de toda sessao.
   */
  it("apaga o refresh token deixado por sessoes antigas", () => {
    window.localStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, "AQlegado");

    clearLegacyRefreshToken();

    expect(window.localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY)).toBeNull();
  });

  it("nao mexe no access token", () => {
    setAccessToken("BQabc123");

    clearLegacyRefreshToken();

    expect(getAccessToken()).toBe("BQabc123");
  });
});

describe("clearTokens", () => {
  it("apaga o access token e tambem o refresh token legado", () => {
    setAccessToken("BQabc123");
    window.localStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, "AQlegado");

    clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(window.localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY)).toBeNull();
  });

  it("nao apaga preferencias do usuario", () => {
    window.localStorage.setItem("sonarstats_theme", "light");
    setAccessToken("BQabc123");

    clearTokens();

    expect(window.localStorage.getItem("sonarstats_theme")).toBe("light");
  });
});
