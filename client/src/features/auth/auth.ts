// Regras de autenticacao do cliente: ler token, renovar e encerrar sessao.
// Sem efeitos de UI (navegacao/reload) aqui; isso fica nos hooks/componentes.

import { getApiUrl } from "../../config/env";
import {
  clearLegacyRefreshToken,
  clearTokens,
  getAccessToken,
  setAccessToken,
} from "./tokenStorage";

export { getAccessToken } from "./tokenStorage";

export const isAuthenticated = (): boolean => getAccessToken() !== null;

// O refresh token vive num cookie HttpOnly, entao so o backend consegue
// apaga-lo. A chamada nao bloqueia a UI; `keepalive` garante o envio mesmo se
// uma navegacao acontecer logo em seguida.
export const clearSession = () => {
  clearTokens();

  void fetch(getApiUrl("/logout"), {
    method: "POST",
    credentials: "include",
    keepalive: true,
  }).catch(() => undefined);
};

// Le o access token do FRAGMENT (#) apos o callback OAuth, persiste e limpa a
// URL. O backend devolve no fragment (nao na query) para nao vazar em
// logs/Referer. Deve rodar uma vez no bootstrap, antes da arvore React montar.
export const bootstrapAuthFromUrl = () => {
  // Migracao: sessoes criadas antes do cookie HttpOnly guardavam o refresh
  // token no localStorage.
  clearLegacyRefreshToken();

  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");

  if (!accessToken && !params.get("error")) return;

  if (accessToken) {
    setAccessToken(accessToken);
  }

  // Remove token e erros da URL sem recarregar a pagina.
  window.history.replaceState({}, document.title, window.location.pathname);
};

let inFlightRefresh: Promise<string | null> | null = null;

const requestRefresh = async (): Promise<string | null> => {
  try {
    // Sem corpo: o refresh token vai no cookie HttpOnly. `credentials:
    // include` e necessario no dev local, onde cliente e API ficam em portas
    // diferentes; em producao os dois estao na mesma origem.
    const response = await fetch(getApiUrl("/refresh_token"), {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data: { access_token?: string } = await response.json();
    if (!data.access_token) {
      clearTokens();
      return null;
    }

    setAccessToken(data.access_token);
    return data.access_token;
  } catch {
    return null;
  }
};

// Renova o access token. Concorrentes compartilham a mesma requisicao em voo.
// Nao da para checar antes se existe refresh token: quem sabe disso e o
// servidor, dono do cookie.
export const refreshAccessToken = (): Promise<string | null> => {
  if (!inFlightRefresh) {
    inFlightRefresh = requestRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }

  return inFlightRefresh;
};
