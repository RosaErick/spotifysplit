/*
 * Regressao do bug 8.
 *
 * Navegador embutido de app (Instagram, Facebook, TikTok...) tem cookie jar
 * proprio: nao existe sessao do Spotify dentro dele, entao o login sempre exige
 * digitar senha e alguns quebram o redirect do OAuth. O app nao conserta isso —
 * so avisa. O risco de regressao e a lista de assinaturas encolher sem querer,
 * ou a deteccao ficar larga demais e avisar quem nao precisa.
 */

import { afterEach, describe, expect, it } from "vitest";
import { isInAppBrowser } from "./inAppBrowser";

const originalNavigator = globalThis.navigator;

const setUserAgent = (userAgent: string) => {
  Object.defineProperty(globalThis, "navigator", {
    value: { userAgent },
    configurable: true,
    writable: true,
  });
};

afterEach(() => {
  Object.defineProperty(globalThis, "navigator", {
    value: originalNavigator,
    configurable: true,
    writable: true,
  });
});

describe("deteccao de navegador embutido", () => {
  it.each([
    ["Instagram no iOS", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Instagram 300.0.0.0"],
    ["Facebook no iOS", "Mozilla/5.0 (iPhone) [FBAN/FBIOS;FBAV/450.0.0.0]"],
    ["Facebook no Android", "Mozilla/5.0 (Linux; Android 14) [FBAV/450.0]"],
    ["TikTok", "Mozilla/5.0 (iPhone) BytedanceWebview/d8a21c"],
    ["LinkedIn", "Mozilla/5.0 (iPhone) LinkedInApp"],
  ])("avisa em %s", (_label, userAgent) => {
    setUserAgent(userAgent);
    expect(isInAppBrowser()).toBe(true);
  });

  it.each([
    ["Safari no iOS", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Version/17.0 Mobile/15E148 Safari/604.1"],
    ["Chrome no Android", "Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile Safari/537.36"],
    ["Firefox no desktop", "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0"],
    ["Chrome no desktop", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"],
  ])("nao avisa em %s", (_label, userAgent) => {
    setUserAgent(userAgent);
    expect(isInAppBrowser()).toBe(false);
  });

  it("nao quebra sem navigator (execucao fora do browser)", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => isInAppBrowser()).not.toThrow();
  });

  it("nao quebra com user agent vazio", () => {
    setUserAgent("");
    expect(isInAppBrowser()).toBe(false);
  });
});
