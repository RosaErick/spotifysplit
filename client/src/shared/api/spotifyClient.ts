// Cliente HTTP unico para a Web API do Spotify.
// Concentra autenticacao, renovacao de token no 401 e erros tipados.

import {
  clearSession,
  getAccessToken,
  refreshAccessToken,
} from "../../features/auth/auth";
import { SpotifyApiError, SpotifyAuthError } from "./errors";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";

const buildRequest = (path: string, token: string | null, init?: RequestInit) =>
  fetch(`${SPOTIFY_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

type SpotifyFetchOptions = {
  optionalAuth?: boolean;
};

export async function spotifyFetch<T>(
  path: string,
  init?: RequestInit,
  options?: SpotifyFetchOptions
): Promise<T> {
  let response = await buildRequest(path, getAccessToken(), init);

  if (response.status === 401 && options?.optionalAuth) {
    throw new SpotifyApiError(response.status, response.statusText);
  }

  // Token expirado: tenta renovar uma vez e repete a requisicao.
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      clearSession();
      throw new SpotifyAuthError();
    }
    response = await buildRequest(path, newToken, init);
  }

  if (!response.ok) {
    throw new SpotifyApiError(response.status, response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
