import { describe, expect, it } from "vitest";
import { buildSetCookie, generateRandomString, readCookie } from "./common.mjs";

describe("generateRandomString", () => {
  it("respeita o comprimento pedido", () => {
    expect(generateRandomString(16)).toHaveLength(16);
    expect(generateRandomString(1)).toHaveLength(1);
    expect(generateRandomString(32)).toHaveLength(32);
  });

  it("devolve apenas hexadecimal", () => {
    expect(generateRandomString(16)).toMatch(/^[0-9a-f]+$/);
  });

  /*
   * O valor e o `state` anti-CSRF do OAuth: previsivel, a protecao de state
   * deixa de existir. Nao da para provar aleatoriedade num teste, mas repeticao
   * numa amostra deste tamanho denuncia uma fonte quebrada (por exemplo, uma
   * troca de CSPRNG por Math.random com semente fixa).
   */
  it("nao repete valores numa amostra grande", () => {
    const samples = new Set(
      Array.from({ length: 500 }, () => generateRandomString(16))
    );

    expect(samples.size).toBe(500);
  });
});

describe("readCookie", () => {
  it("le o cookie pedido de um header com varios", () => {
    const header = "foo=1; spotify_auth_state=abc123; bar=2";

    expect(readCookie(header, "spotify_auth_state")).toBe("abc123");
  });

  it("devolve null quando o header esta ausente ou vazio", () => {
    expect(readCookie(null, "qualquer")).toBeNull();
    expect(readCookie("", "qualquer")).toBeNull();
  });

  it("devolve null quando o cookie nao existe", () => {
    expect(readCookie("foo=1; bar=2", "baz")).toBeNull();
  });

  it("decodifica o valor", () => {
    expect(readCookie("token=a%20b%2Fc", "token")).toBe("a b/c");
  });

  // O refresh token do Spotify e base64url e pode conter "=" de padding.
  it("preserva sinais de igual dentro do valor", () => {
    expect(readCookie("token=abc==", "token")).toBe("abc==");
  });

  it("nao casa por prefixo do nome", () => {
    expect(readCookie("spotify_refresh_token_x=1", "spotify_refresh_token")).toBeNull();
  });
});

describe("buildSetCookie", () => {
  const parse = (cookie) => cookie.split("; ");

  it("marca HttpOnly e SameSite=Lax", () => {
    const attributes = parse(buildSetCookie("t", "v", { maxAge: 60 }));

    expect(attributes).toContain("HttpOnly");
    expect(attributes).toContain("SameSite=Lax");
  });

  it("usa Path=/ por padrao", () => {
    expect(parse(buildSetCookie("t", "v", { maxAge: 60 }))).toContain("Path=/");
  });

  it("aceita um path customizado", () => {
    expect(
      parse(buildSetCookie("t", "v", { maxAge: 60, path: "/api" }))
    ).toContain("Path=/api");
  });

  it("emite Max-Age em segundos", () => {
    expect(parse(buildSetCookie("t", "v", { maxAge: 3600 }))).toContain(
      "Max-Age=3600"
    );
  });

  it("so acrescenta Secure quando pedido", () => {
    expect(parse(buildSetCookie("t", "v", { maxAge: 60, secure: true }))).toContain(
      "Secure"
    );
    expect(
      parse(buildSetCookie("t", "v", { maxAge: 60, secure: false }))
    ).not.toContain("Secure");
  });

  it("codifica o valor", () => {
    expect(buildSetCookie("t", "a b/c", { maxAge: 60 })).toContain("t=a%20b%2Fc");
  });

  it("faz a volta completa com readCookie", () => {
    const value = "AQC-x/y=z";
    const [pair] = parse(buildSetCookie("token", value, { maxAge: 60 }));

    expect(readCookie(pair, "token")).toBe(value);
  });
});
