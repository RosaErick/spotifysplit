import { handleAuthRequest } from "./routes/auth";

export default {
  async fetch(request, env) {
    try {
      const response = await handleAuthRequest(request, env);
      if (response) return response;
    } catch (error) {
      // Config invalida (variavel obrigatoria faltando) ou falha inesperada.
      // Nao devolve detalhe ao cliente; o log sai no `wrangler tail`.
      console.error(error);

      return new Response(JSON.stringify({ error: "server_error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // `run_worker_first` restringe o Worker a /api/*. Se outra rota chegar
    // aqui, serve o build do Vite com fallback de SPA.
    return env.ASSETS.fetch(request);
  },
};
