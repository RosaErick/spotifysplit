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
    },
  },
});
