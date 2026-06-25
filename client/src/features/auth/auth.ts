// Regras de autenticacao do cliente: ler token, renovar e encerrar sessao.
// Sem efeitos de UI (navegacao/reload) aqui; isso fica nos hooks/componentes.

import { getApiUrl } from "../../config/env";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./tokenStorage";

export { getAccessToken } from "./tokenStorage";

export const isAuthenticated = (): boolean => getAccessToken() !== null;

export const clearSession = () => clearTokens();

// Le tokens da query string apos o callback OAuth, persiste e limpa a URL.
// Deve rodar uma vez no bootstrap, antes da arvore React montar.
export const bootstrapAuthFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken && !params.get("error")) return;

  if (accessToken) {
    setAccessToken(accessToken);
    if (refreshToken) setRefreshToken(refreshToken);
  }

  // Remove tokens e erros da URL sem recarregar a pagina.
  window.history.replaceState({}, document.title, window.location.pathname);
};

let inFlightRefresh: Promise<string | null> | null = null;

const requestRefresh = async (refreshToken: string): Promise<string | null> => {
  try {
    const response = await fetch(
      getApiUrl(`/refresh_token?refresh_token=${encodeURIComponent(refreshToken)}`)
    );

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
export const refreshAccessToken = (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(null);

  if (!inFlightRefresh) {
    inFlightRefresh = requestRefresh(refreshToken).finally(() => {
      inFlightRefresh = null;
    });
  }

  return inFlightRefresh;
};
