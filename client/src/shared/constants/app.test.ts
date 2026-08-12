/*
 * REGRESSAO — dominio morto nas imagens exportadas.
 *
 * `APP_DOMAIN` e composto de `APP_BRAND + APP_DOMAIN_SUFFIX` porque o rodape das
 * imagens estiliza as duas metades de forma diferente. O preco dessa composicao
 * foi um bug real: o app saiu do Render, a marca virou SonarStats, e o rodape
 * das imagens exportadas continuou estampando um `.onrender.com` que ja nao
 * respondia — impresso em PNG e espalhado por ai.
 *
 * Este arquivo prende o valor COMPOSTO ao dominio de producao real. Trocar
 * marca ou sufixo sem trocar o deploy quebra aqui, e nao no story de alguem.
 */

import { describe, expect, it } from "vitest";
import {
  APP_BRAND,
  APP_DOMAIN,
  APP_DOMAIN_SUFFIX,
  APP_NAME,
  APP_URL,
} from "./app";

const PRODUCTION_DOMAIN = "sonarstats.netlify.app";

describe("identidade publica do app", () => {
  it("compoe exatamente o dominio de producao", () => {
    expect(APP_DOMAIN).toBe(PRODUCTION_DOMAIN);
  });

  it("expoe a URL de producao em https", () => {
    expect(APP_URL).toBe(`https://${PRODUCTION_DOMAIN}`);
  });

  // O host morto que causou o bug. Ficar explicito no teste deixa claro para
  // quem ler depois o que exatamente nao pode voltar.
  it("nao aponta mais para o Render", () => {
    expect(APP_DOMAIN).not.toContain("onrender.com");
    expect(APP_URL).not.toContain("onrender.com");
  });

  it("nao aponta para o nome antigo do app", () => {
    expect(APP_URL).not.toContain("spotifysplit");
    expect(APP_BRAND).not.toContain("spotifysplit");
  });

  it("mantem marca e sufixo separados e coerentes com o composto", () => {
    expect(`${APP_BRAND}${APP_DOMAIN_SUFFIX}`).toBe(APP_DOMAIN);
    expect(APP_DOMAIN_SUFFIX.startsWith(".")).toBe(true);
  });

  it("usa o nome de exibicao atual", () => {
    expect(APP_NAME).toBe("SonarStats");
  });

  // A URL vai para clipboard, x.com/intent e wa.me: uma barra sobrando ou um
  // protocolo faltando estraga o link compartilhado.
  it("e uma URL absoluta valida e sem barra final", () => {
    expect(() => new URL(APP_URL)).not.toThrow();
    expect(new URL(APP_URL).hostname).toBe(PRODUCTION_DOMAIN);
    expect(APP_URL.endsWith("/")).toBe(false);
  });
});
