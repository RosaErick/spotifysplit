// Acesso puro ao armazenamento local de tokens do Spotify.
// Nenhuma funcao aqui dispara navegacao, reload ou requisicao.

const ACCESS_TOKEN_KEY = "spotify_access_token";
const REFRESH_TOKEN_KEY = "spotify_refresh_token";

const isValid = (value: string | null): value is string =>
  Boolean(value) && value !== "undefined" && value !== "null";

export const getAccessToken = (): string | null => {
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  return isValid(token) ? token : null;
};

export const getRefreshToken = (): string | null => {
  const token = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  return isValid(token) ? token : null;
};

export const setAccessToken = (token: string) =>
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);

export const setRefreshToken = (token: string) =>
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);

export const clearTokens = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};
