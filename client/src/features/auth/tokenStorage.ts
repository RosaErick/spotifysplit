// Acesso puro ao armazenamento local do access token do Spotify.
// Nenhuma funcao aqui dispara navegacao, reload ou requisicao.
//
// O refresh token NAO mora aqui: ele fica num cookie HttpOnly setado pelo
// backend, fora do alcance de JavaScript. Ele nao expira sozinho, entao no
// localStorage um XSS renderia acesso permanente a conta.

const ACCESS_TOKEN_KEY = "spotify_access_token";

// Chave usada por sessoes anteriores, quando o refresh token vinha para o
// browser. Mantida apenas para ser apagada.
const LEGACY_REFRESH_TOKEN_KEY = "spotify_refresh_token";

const isValid = (value: string | null): value is string =>
  Boolean(value) && value !== "undefined" && value !== "null";

export const getAccessToken = (): string | null => {
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  return isValid(token) ? token : null;
};

export const setAccessToken = (token: string) =>
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);

// Remove o refresh token deixado por sessoes antigas. Sem isso o valor
// continuaria no localStorage de quem ja usava o app.
export const clearLegacyRefreshToken = () =>
  window.localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);

export const clearTokens = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  clearLegacyRefreshToken();
};
