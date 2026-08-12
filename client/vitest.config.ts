import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/*
 * Uma instalacao so de Vitest, em `client/`, cobrindo os dois lados do repo.
 *
 * O motivo de nao instalar na raiz: `@testing-library/react` precisa resolver o
 * MESMO React do app, e o React vive em `client/node_modules` (o cliente tem
 * package.json proprio). Instalar na raiz traria uma segunda copia do React e
 * os hooks quebrariam.
 *
 * O projeto `backend` aponta a raiz do repo porque as functions da Netlify e o
 * Express moram fora de `client/`. Eles nao importam nada de `client/`, entao
 * conviver em duas raizes diferentes nao gera conflito.
 */

const clientRoot = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  test: {
    /*
     * A raiz e o repo, nao `client/`: e a raiz comum aos dois projetos e a
     * unica em que os globos de cobertura conseguem alcancar `client/src` e
     * `netlify/` com o mesmo caminho.
     */
    root: repoRoot,

    projects: [
      {
        test: {
          name: "client",
          root: clientRoot,
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      {
        test: {
          name: "backend",
          root: repoRoot,
          environment: "node",
          include: ["netlify/**/*.test.mjs", "server/**/*.test.mjs"],
        },
      },
    ],

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",

      // Explicito: sem isto o v8 so reporta o que algum teste importou, e a
      // cobertura sai inflada por omissao.
      include: [
        "client/src/**/*.{ts,tsx}",
        "netlify/**/*.mjs",
        "server/**/*.js",
      ],
      exclude: [
        "**/*.test.{ts,tsx,mjs}",
        "client/src/test/**",
        "client/src/main.tsx",
        "client/src/vite-env.d.ts",
        "client/src/shared/types/**",
        "**/*.d.ts",
      ],

      /*
       * Limiares MEDIDOS, nao chutados: cada numero abaixo saiu de uma rodada
       * real, arredondado para baixo para dar folga a um refactor pequeno.
       *
       * O piso global e baixo de proposito e nao ha vergonha nisso: a maior
       * parte de `client/src` e tela (paginas, cards, paineis do estudio) ainda
       * sem teste. Um 80% inventado aqui deixaria o build vermelho no primeiro
       * commit e ensinaria a ignorar o numero.
       *
       * Onde a regra de negocio mora — e onde os bugs de regressao moravam — o
       * limiar e proprio e alto. E ali que uma queda significa alguma coisa.
       *
       * Medicao de referencia (12/08/2026): 37,46% stmts, 22,30% branches,
       * 24,81% funcs, 39,15% lines no global.
       */
      thresholds: {
        statements: 35,
        branches: 20,
        functions: 22,
        lines: 36,

        // Logica pura, 100% medido: aqui nao se aceita regressao.
        "client/src/utils/**": {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        "client/src/shared/api/errors.ts": {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        "client/src/shared/constants/**": {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        "client/src/features/tour/tourStorage.ts": {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        "client/src/features/auth/tokenStorage.ts": {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        "client/src/features/auth/auth.ts": {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },

        // Fluxo OAuth das functions: 100% medido, incluindo os caminhos de erro.
        "netlify/**": {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },

        /*
         * O Express e so dev local e nao tem deploy. Os testes cobrem a
         * montagem das rotas e os desfechos que nao dependem do Spotify; o
         * resto exigiria dublar a API inteira para um servidor que nunca vai a
         * producao. Medido: 68% stmts, 43% branches.
         */
        "server/**": {
          statements: 65,
          branches: 40,
          functions: 60,
          lines: 65,
        },
      },
    },
  },
});
