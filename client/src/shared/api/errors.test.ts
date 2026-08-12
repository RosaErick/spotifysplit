import { describe, expect, it } from "vitest";
import {
  isAuthError,
  isFeatureGoneError,
  SpotifyApiError,
  SpotifyAuthError,
} from "./errors";

describe("SpotifyApiError", () => {
  it("guarda o status e descreve o erro na mensagem", () => {
    const error = new SpotifyApiError(429, "Too Many Requests");

    expect(error.status).toBe(429);
    expect(error.name).toBe("SpotifyApiError");
    expect(error.message).toContain("429");
    expect(error.message).toContain("Too Many Requests");
  });

  it("dispensa o statusText quando ele nao vem", () => {
    expect(new SpotifyApiError(500).message).toBe(
      "Spotify request failed with status 500"
    );
  });

  it("continua sendo um Error", () => {
    expect(new SpotifyApiError(500)).toBeInstanceOf(Error);
  });
});

describe("SpotifyAuthError", () => {
  it("e um 401 com nome proprio", () => {
    const error = new SpotifyAuthError();

    expect(error.status).toBe(401);
    expect(error.name).toBe("SpotifyAuthError");
    expect(error).toBeInstanceOf(SpotifyApiError);
  });

  // A mensagem e o que aparece no log: sem o motivo, um 401 de token expirado
  // fica indistinguivel de um 401 de escopo faltando.
  it("diz na mensagem que o motivo e autenticacao", () => {
    expect(new SpotifyAuthError().message).toContain("unauthorized");
  });
});

describe("isAuthError", () => {
  it("reconhece o erro dedicado de autenticacao", () => {
    expect(isAuthError(new SpotifyAuthError())).toBe(true);
  });

  it("reconhece qualquer 401 da API", () => {
    expect(isAuthError(new SpotifyApiError(401))).toBe(true);
  });

  it("ignora outros status", () => {
    expect(isAuthError(new SpotifyApiError(403))).toBe(false);
    expect(isAuthError(new SpotifyApiError(500))).toBe(false);
  });

  it("ignora valores que nao sao erro da API", () => {
    expect(isAuthError(new Error("qualquer"))).toBe(false);
    expect(isAuthError(null)).toBe(false);
    expect(isAuthError(undefined)).toBe(false);
    expect(isAuthError({ status: 401 })).toBe(false);
  });
});

/*
 * REGRESSAO — endpoint descontinuado.
 *
 * O Spotify descontinuou related-artists (entre outros) em 27/11/2024: para
 * apps sem quota estendida aprovada antes disso, a rota responde 403/404 para
 * sempre. Tratar isso como falha momentanea colocava na tela um erro com
 * "tentar novamente" que nunca ia funcionar.
 *
 * Se `isFeatureGoneError` voltar a ignorar 403 ou 404, a UI volta a oferecer o
 * retry inutil — e estes testes falham.
 */
describe("isFeatureGoneError (regressao: endpoint descontinuado)", () => {
  it("reconhece 403 como recurso indisponivel para o app", () => {
    expect(isFeatureGoneError(new SpotifyApiError(403))).toBe(true);
  });

  it("reconhece 404 como recurso indisponivel para o app", () => {
    expect(isFeatureGoneError(new SpotifyApiError(404))).toBe(true);
  });

  // 401 tem tratamento proprio (renovar token), 5xx e falha momentanea de
  // verdade: nos dois casos o retry faz sentido e a secao deve continuar.
  it("nao confunde com erro de autenticacao nem com falha momentanea", () => {
    expect(isFeatureGoneError(new SpotifyApiError(401))).toBe(false);
    expect(isFeatureGoneError(new SpotifyAuthError())).toBe(false);
    expect(isFeatureGoneError(new SpotifyApiError(429))).toBe(false);
    expect(isFeatureGoneError(new SpotifyApiError(500))).toBe(false);
    expect(isFeatureGoneError(new SpotifyApiError(502))).toBe(false);
  });

  it("ignora valores que nao sao erro da API", () => {
    expect(isFeatureGoneError(new Error("403"))).toBe(false);
    expect(isFeatureGoneError(null)).toBe(false);
    expect(isFeatureGoneError(undefined)).toBe(false);
    expect(isFeatureGoneError({ status: 403 })).toBe(false);
  });
});
