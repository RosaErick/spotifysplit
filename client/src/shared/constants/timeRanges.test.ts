import { describe, expect, it } from "vitest";
import {
  getTopTimeRangeOption,
  topTimeRangeOptions,
  topTimeRangeOptionsAscending,
} from "./timeRanges";

describe("topTimeRangeOptions", () => {
  it("cobre os tres periodos aceitos pelo Spotify", () => {
    expect(topTimeRangeOptions.map((option) => option.value)).toEqual([
      "long_term",
      "medium_term",
      "short_term",
    ]);
  });

  it("traz rotulo curto, rotulo de legenda e descricao em toda opcao", () => {
    topTimeRangeOptions.forEach((option) => {
      expect(option.label).toBeTruthy();
      expect(option.captionLabel).toBeTruthy();
      expect(option.description).toBeTruthy();
    });
  });
});

describe("topTimeRangeOptionsAscending", () => {
  it("vai do periodo mais curto para o mais longo", () => {
    expect(topTimeRangeOptionsAscending.map((option) => option.value)).toEqual([
      "short_term",
      "medium_term",
      "long_term",
    ]);
  });

  // `[...lista].reverse()` e nao `lista.reverse()`: o segundo inverteria a
  // lista original no import e trocaria a ordem dos seletores em todo o app.
  it("nao inverte a lista original", () => {
    expect(topTimeRangeOptions[0].value).toBe("long_term");
  });
});

describe("getTopTimeRangeOption", () => {
  it.each(["long_term", "medium_term", "short_term"] as const)(
    "encontra a opcao de %s",
    (value) => {
      expect(getTopTimeRangeOption(value).value).toBe(value);
    }
  );

  it("cai na primeira opcao quando o valor nao existe", () => {
    expect(getTopTimeRangeOption("all_time" as never)).toBe(
      topTimeRangeOptions[0]
    );
  });
});
