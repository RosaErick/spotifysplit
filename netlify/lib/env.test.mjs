import { describe, expect, it } from "vitest";
import { readEnv } from "./env.mjs";

const validSource = {
  CLIENT_ID: "id",
  CLIENT_SECRET: "secret",
  REDIRECT_URI: "https://app.test/api/callback",
  CLIENT_URL: "https://app.test",
  SPOTIFY_SCOPES: "user-top-read user-read-private",
};

describe("readEnv", () => {
  it("mapeia as variaveis para a config do handler", () => {
    expect(readEnv(validSource)).toEqual({
      clientId: "id",
      clientSecret: "secret",
      redirectUri: "https://app.test/api/callback",
      clientUrl: "https://app.test",
      spotifyScopes: "user-top-read user-read-private",
    });
  });

  it("ignora variaveis que nao pertencem a config", () => {
    expect(readEnv({ ...validSource, OUTRA: "x" })).not.toHaveProperty("OUTRA");
  });

  it.each(Object.keys(validSource))("exige %s", (key) => {
    const source = { ...validSource };
    delete source[key];

    expect(() => readEnv(source)).toThrow(key);
  });

  it("rejeita string vazia, nao so ausencia", () => {
    expect(() => readEnv({ ...validSource, CLIENT_SECRET: "" })).toThrow(
      "CLIENT_SECRET"
    );
  });

  it("nao lanca no import, so na chamada", async () => {
    // Function serverless nao tem um start onde falhar cedo: efeito colateral
    // no import viraria cold start silencioso.
    await expect(import("./env.mjs")).resolves.toBeDefined();
  });
});
