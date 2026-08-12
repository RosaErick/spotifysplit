/*
 * REGRESSAO — chaves legadas de localStorage (tema e acento).
 *
 * O rename para SonarStats trocou o prefixo `spotifysplit_*` por `sonarstats_*`.
 * Sem ler a chave antiga uma vez, todo mundo que ja usava o app abriria a
 * primeira versao renomeada com o tema e a cor de volta ao padrao — uma
 * preferencia silenciosamente descartada por um rename.
 *
 * A regra e assimetrica de proposito: le a chave legada, grava so na nova.
 * Continuar gravando na antiga eternizaria a migracao.
 */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ACCENT_OPTIONS, AppThemeProvider, useAppTheme } from "./AppThemeProvider";

const THEME_KEY = "sonarstats_theme";
const ACCENT_KEY = "sonarstats_accent";
const LEGACY_THEME_KEY = "spotifysplit_theme";
const LEGACY_ACCENT_KEY = "spotifysplit_accent";

// Sonda minima: expoe o estado do contexto no DOM sem arrastar a UI real.
const Probe = () => {
  const { theme, accent, toggleTheme, setAccent } = useAppTheme();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="accent">{accent}</span>
      <button onClick={toggleTheme}>alternar</button>
      <button onClick={() => setAccent("green")}>verde</button>
    </div>
  );
};

const renderProvider = () =>
  render(
    <AppThemeProvider>
      <Probe />
    </AppThemeProvider>
  );

const readTheme = () => screen.getByTestId("theme").textContent;
const readAccent = () => screen.getByTestId("accent").textContent;

describe("leitura das chaves atuais", () => {
  it("usa o tema gravado", () => {
    window.localStorage.setItem(THEME_KEY, "light");
    renderProvider();

    expect(readTheme()).toBe("light");
  });

  it("usa o acento gravado", () => {
    window.localStorage.setItem(ACCENT_KEY, "ruby");
    renderProvider();

    expect(readAccent()).toBe("ruby");
  });
});

describe("migracao das chaves legadas", () => {
  it("aproveita o tema gravado antes do rename", () => {
    window.localStorage.setItem(LEGACY_THEME_KEY, "light");
    renderProvider();

    expect(readTheme()).toBe("light");
  });

  it("aproveita o acento gravado antes do rename", () => {
    window.localStorage.setItem(LEGACY_ACCENT_KEY, "green");
    renderProvider();

    expect(readAccent()).toBe("green");
  });

  // A chave nova vence: quem ja escolheu depois do rename nao volta no tempo.
  it("da precedencia a chave nova sobre a legada", () => {
    window.localStorage.setItem(THEME_KEY, "dark");
    window.localStorage.setItem(LEGACY_THEME_KEY, "light");
    window.localStorage.setItem(ACCENT_KEY, "ruby");
    window.localStorage.setItem(LEGACY_ACCENT_KEY, "green");
    renderProvider();

    expect(readTheme()).toBe("dark");
    expect(readAccent()).toBe("ruby");
  });

  it("promove o valor legado para a chave nova ao montar", () => {
    window.localStorage.setItem(LEGACY_THEME_KEY, "light");
    window.localStorage.setItem(LEGACY_ACCENT_KEY, "green");
    renderProvider();

    expect(window.localStorage.getItem(THEME_KEY)).toBe("light");
    expect(window.localStorage.getItem(ACCENT_KEY)).toBe("green");
  });

  // Migracao com prazo: gravar na chave antiga a manteria viva para sempre.
  it("nunca grava na chave legada", () => {
    window.localStorage.setItem(LEGACY_THEME_KEY, "light");
    renderProvider();

    fireEvent.click(screen.getByText("alternar"));
    fireEvent.click(screen.getByText("verde"));

    expect(window.localStorage.getItem(LEGACY_THEME_KEY)).toBe("light");
    expect(window.localStorage.getItem(LEGACY_ACCENT_KEY)).toBeNull();
  });
});

describe("valores invalidos", () => {
  it("cai no acento padrao quando o valor gravado nao existe mais", () => {
    window.localStorage.setItem(ACCENT_KEY, "turquesa");
    renderProvider();

    expect(readAccent()).toBe("amber");
  });

  it("cai no acento padrao quando a chave legada tem lixo", () => {
    window.localStorage.setItem(LEGACY_ACCENT_KEY, "{}");
    renderProvider();

    expect(readAccent()).toBe("amber");
  });

  it("ignora tema fora de light/dark e consulta a preferencia do sistema", () => {
    window.localStorage.setItem(THEME_KEY, "sepia");
    renderProvider();

    // O stub de matchMedia do setup responde `matches: false`, ou seja, sistema
    // em tema claro.
    expect(readTheme()).toBe("light");
  });
});

describe("alteracoes do usuario", () => {
  it("persiste a troca de tema", () => {
    renderProvider();
    const initial = readTheme();

    fireEvent.click(screen.getByText("alternar"));

    expect(readTheme()).not.toBe(initial);
    expect(window.localStorage.getItem(THEME_KEY)).toBe(readTheme());
  });

  it("persiste a troca de acento", () => {
    renderProvider();

    fireEvent.click(screen.getByText("verde"));

    expect(readAccent()).toBe("green");
    expect(window.localStorage.getItem(ACCENT_KEY)).toBe("green");
  });
});

describe("useAppTheme", () => {
  it("acusa uso fora do provider em vez de devolver um contexto vazio", () => {
    /*
     * O erro aqui e esperado, mas o React em dev o re-emite como evento global
     * e o jsdom despeja o stack inteiro na saida. Sem as duas mordacas abaixo a
     * suite verde parece uma suite quebrada.
     */
    vi.spyOn(console, "error").mockImplementation(() => {});
    const swallow = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener("error", swallow);

    try {
      expect(() => render(<Probe />)).toThrow(
        "useAppTheme must be used within AppThemeProvider"
      );
    } finally {
      window.removeEventListener("error", swallow);
    }
  });
});

describe("ACCENT_OPTIONS", () => {
  it("nao tem valores repetidos", () => {
    const values = ACCENT_OPTIONS.map((option) => option.value);

    expect(new Set(values).size).toBe(values.length);
  });

  it("traz rotulo e amostra de cor para cada opcao", () => {
    ACCENT_OPTIONS.forEach((option) => {
      expect(option.label).toBeTruthy();
      expect(option.swatch).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
