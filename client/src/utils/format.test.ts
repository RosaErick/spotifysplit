import { describe, expect, it } from "vitest";
import {
  formatDuration,
  formatGenresLabel,
  formatNumber,
  topGenres,
} from "./format";

describe("formatNumber", () => {
  it("usa o agrupamento de milhar do pt-BR", () => {
    // O separador do pt-BR e ponto. A comparacao usa o proprio Intl para nao
    // depender do caractere exato de espaco que o ICU emite.
    expect(formatNumber(1234567)).toBe(
      new Intl.NumberFormat("pt-BR").format(1234567)
    );
    expect(formatNumber(1234567)).toContain(".");
  });

  it("trata ausencia de valor como zero", () => {
    expect(formatNumber()).toBe("0");
    expect(formatNumber(undefined)).toBe("0");
  });

  it("nao confunde zero com ausencia", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatDuration", () => {
  it("formata minutos e segundos com dois digitos", () => {
    expect(formatDuration(215_000)).toBe("3:35");
    expect(formatDuration(65_000)).toBe("1:05");
  });

  it("trunca os milissegundos em vez de arredondar", () => {
    expect(formatDuration(59_999)).toBe("0:59");
  });

  it("passa da casa dos 60 minutos sem virar hora", () => {
    expect(formatDuration(3_600_000)).toBe("60:00");
  });

  it("trata ausencia de valor como zero", () => {
    expect(formatDuration()).toBe("0:00");
    expect(formatDuration(0)).toBe("0:00");
  });
});

describe("topGenres", () => {
  /*
   * Regressao do bug de generos divergentes: o mesmo artista chega com a lista
   * em ordem diferente do endpoint de top artists e do endpoint /artists/{id}.
   * Sem a ordenacao estavel, fatiar os 2 primeiros mostrava generos diferentes
   * na home e na pagina do artista.
   */
  it("devolve o mesmo resultado para a mesma lista em ordens diferentes", () => {
    const fromTopArtists = ["rock", "indie", "mpb"];
    const fromArtistEndpoint = ["mpb", "rock", "indie"];

    expect(topGenres(fromTopArtists)).toEqual(topGenres(fromArtistEndpoint));
  });

  it("ordena alfabeticamente antes de fatiar", () => {
    expect(topGenres(["rock", "indie", "mpb"])).toEqual(["indie", "mpb"]);
  });

  it("nao muta a lista recebida", () => {
    const genres = ["rock", "indie", "mpb"];
    topGenres(genres);

    expect(genres).toEqual(["rock", "indie", "mpb"]);
  });

  it("respeita a quantidade pedida", () => {
    expect(topGenres(["rock", "indie", "mpb"], 3)).toEqual([
      "indie",
      "mpb",
      "rock",
    ]);
    expect(topGenres(["rock", "indie", "mpb"], 1)).toEqual(["indie"]);
  });

  it("aceita lista ausente ou vazia", () => {
    expect(topGenres(undefined)).toEqual([]);
    expect(topGenres([])).toEqual([]);
  });
});

describe("formatGenresLabel", () => {
  it("junta os generos com virgula", () => {
    expect(formatGenresLabel(["rock", "indie"])).toBe("indie, rock");
  });

  it("usa o fallback padrao quando nao ha genero", () => {
    expect(formatGenresLabel([])).toBe("Sem gênero informado");
    expect(formatGenresLabel(undefined)).toBe("Sem gênero informado");
  });

  it("usa o fallback customizado quando informado", () => {
    expect(formatGenresLabel([], "Não informado")).toBe("Não informado");
  });
});
