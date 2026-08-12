/*
 * REGRESSAO — persistencia do tour.
 *
 * Tres regras que ja custaram bug e que so aparecem na segunda visita, quando
 * ninguem mais esta olhando:
 *
 *  1. quem dispensou NUNCA mais e convidado, nem quando o tour ganha passos;
 *  2. quem concluiu volta a ser convidado quando TOUR_VERSION sobe;
 *  3. registro corrompido vale como "nunca viu" — nao como "ja viu".
 *
 * O terceiro ponto e o mais traicoeiro: uma leitura que lanca ou que devolve
 * lixo nao pode derrubar a home.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { readTourRecord, shouldOfferTour, writeTourRecord } from "./tourStorage";
import { TOUR_VERSION } from "./tourSteps";

const TOUR_KEY = "sonarstats_tour";

const storeRaw = (value: string) => window.localStorage.setItem(TOUR_KEY, value);

describe("readTourRecord", () => {
  it("devolve null quando nunca houve registro", () => {
    expect(readTourRecord()).toBeNull();
  });

  it("le um registro valido", () => {
    storeRaw(JSON.stringify({ v: 1, status: "done", at: "2026-01-01" }));

    expect(readTourRecord()).toEqual({
      v: 1,
      status: "done",
      at: "2026-01-01",
    });
  });

  it("trata JSON invalido como ausencia de registro", () => {
    storeRaw("{nao e json");

    expect(readTourRecord()).toBeNull();
  });

  it.each([
    ["status desconhecido", { v: 1, status: "talvez" }],
    ["versao como texto", { v: "1", status: "done" }],
    ["sem versao", { status: "done" }],
    ["sem status", { v: 1 }],
    ["objeto vazio", {}],
    ["nulo", null],
    ["lista", []],
    ["numero", 7],
    ["texto", "done"],
  ])("trata registro fora do formato como ausencia (%s)", (_label, value) => {
    storeRaw(JSON.stringify(value));

    expect(readTourRecord()).toBeNull();
  });

  /*
   * A guarda de SSR. Ela nunca dispara no browser, mas e o que impediria uma
   * pre-renderizacao de estourar em `window is not defined`. `stubGlobal` com
   * undefined reproduz o cenario dentro do jsdom.
   */
  it("devolve null quando nao ha window", () => {
    vi.stubGlobal("window", undefined);

    expect(readTourRecord()).toBeNull();

    vi.unstubAllGlobals();
  });

  it("nao lanca quando o localStorage lanca (Safari privado, storage cheio)", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => readTourRecord()).not.toThrow();
    expect(readTourRecord()).toBeNull();
  });
});

describe("writeTourRecord", () => {
  it("grava status e a versao corrente do tour", () => {
    writeTourRecord("done");

    const stored = JSON.parse(window.localStorage.getItem(TOUR_KEY) as string);
    expect(stored.status).toBe("done");
    expect(stored.v).toBe(TOUR_VERSION);
    expect(typeof stored.at).toBe("string");
  });

  it("grava numa chave so, no padrao sonarstats_*", () => {
    writeTourRecord("dismissed");

    expect(Object.keys(window.localStorage)).toEqual([TOUR_KEY]);
  });

  it("faz a volta completa com readTourRecord", () => {
    writeTourRecord("dismissed");

    expect(readTourRecord()).toMatchObject({
      status: "dismissed",
      v: TOUR_VERSION,
    });
  });

  it("nao lanca quando o localStorage lanca", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => writeTourRecord("done")).not.toThrow();
  });

  it("nao faz nada quando nao ha window", () => {
    vi.stubGlobal("window", undefined);

    expect(() => writeTourRecord("done")).not.toThrow();

    vi.unstubAllGlobals();
  });
});

describe("shouldOfferTour", () => {
  it("convida quem nunca viu o tour", () => {
    expect(shouldOfferTour(null)).toBe(true);
  });

  // Regra 1: "agora nao" e permanente. Reconvidar e exatamente o comportamento
  // que o requisito proibe.
  it("nunca reconvida quem dispensou, mesmo em versao antiga", () => {
    expect(
      shouldOfferTour({ v: TOUR_VERSION - 1, status: "dismissed", at: "" })
    ).toBe(false);
  });

  it("nunca reconvida quem dispensou, mesmo em versao futura do registro", () => {
    expect(
      shouldOfferTour({ v: TOUR_VERSION + 5, status: "dismissed", at: "" })
    ).toBe(false);
  });

  // Regra 2: quem concluiu volta a ser convidado quando entram passos novos.
  it("reconvida quem concluiu uma versao anterior", () => {
    expect(
      shouldOfferTour({ v: TOUR_VERSION - 1, status: "done", at: "" })
    ).toBe(true);
  });

  it("nao reconvida quem concluiu a versao atual", () => {
    expect(shouldOfferTour({ v: TOUR_VERSION, status: "done", at: "" })).toBe(
      false
    );
  });

  it("nao reconvida quem concluiu uma versao mais nova que a do codigo", () => {
    expect(
      shouldOfferTour({ v: TOUR_VERSION + 1, status: "done", at: "" })
    ).toBe(false);
  });
});

describe("integracao das tres regras", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("dispensar hoje silencia o convite para sempre", () => {
    writeTourRecord("dismissed");

    expect(shouldOfferTour(readTourRecord())).toBe(false);
  });

  it("concluir hoje silencia o convite ate a proxima versao", () => {
    writeTourRecord("done");
    expect(shouldOfferTour(readTourRecord())).toBe(false);

    // Simula o TOUR_VERSION subindo: o registro gravado fica para tras.
    storeRaw(
      JSON.stringify({ v: TOUR_VERSION - 1, status: "done", at: "2026-01-01" })
    );
    expect(shouldOfferTour(readTourRecord())).toBe(true);
  });

  it("registro corrompido volta a convidar em vez de quebrar", () => {
    storeRaw("lixo");

    expect(shouldOfferTour(readTourRecord())).toBe(true);
  });
});
