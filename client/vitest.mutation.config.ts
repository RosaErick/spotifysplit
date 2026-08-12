import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/*
 * Config exclusiva do mutation testing.
 *
 * A config principal declara dois projetos, e o de backend tem raiz no repo. O
 * Stryker roda dentro de um sandbox — uma copia de `client/` em
 * `.stryker-tmp/` —, onde `..` deixa de ser a raiz do repo e o projeto backend
 * simplesmente nao acha teste nenhum. Um projeto unico, com raiz derivada de
 * `import.meta.url`, acompanha o sandbox sem ajuste.
 *
 * Alem disso o runner do Stryker so aceita `configFile`: nao ha como filtrar um
 * projeto pela config principal.
 */

export default defineConfig({
  test: {
    root: fileURLToPath(new URL(".", import.meta.url)),
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
