import { defineConfig, devices } from "@playwright/test";

/*
 * E2E contra o BUILD DE PRODUCAO, servido pelo `vite preview` — nao contra o
 * dev server.
 *
 * O motivo e o proprio contrato do prefixo /api: em dev o `client/.env` aponta
 * a API para `http://127.0.0.1:3000/api`, enquanto o build de producao usa o
 * `client/.env.production`, com a base relativa `/api` que divide origem com a
 * SPA. E o segundo caso que quebrou de verdade, entao e o segundo que o E2E
 * exercita.
 *
 * Nao ha backend nem Spotify na roda: cada spec intercepta o que precisa. E de
 * proposito — o objetivo aqui e o comportamento do app no browser, e um teste
 * que depende de conta real do Spotify vira um teste que ninguem roda.
 */

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "list" : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort --host 127.0.0.1`,
    cwd: "client",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // O build do cliente entra nesta janela: em maquina fria passa de um minuto.
    timeout: 180_000,
  },
});
