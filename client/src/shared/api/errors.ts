// Erros tipados das chamadas ao Spotify, para a UI reagir por status.

export class SpotifyApiError extends Error {
  readonly status: number;

  constructor(status: number, statusText?: string) {
    super(`Spotify request failed with status ${status}${statusText ? ` (${statusText})` : ""}`);
    this.name = "SpotifyApiError";
    this.status = status;
  }
}

// Lancado quando nao ha token valido nem refresh possivel.
export class SpotifyAuthError extends SpotifyApiError {
  constructor() {
    super(401, "unauthorized");
    this.name = "SpotifyAuthError";
  }
}

export const isAuthError = (error: unknown): boolean =>
  error instanceof SpotifyAuthError ||
  (error instanceof SpotifyApiError && error.status === 401);

/*
 * 403/404 numa rota que existe significam endpoint indisponivel para este app,
 * nao falha momentanea. O Spotify descontinuou varios em 27/11/2024 (entre eles
 * related-artists, recommendations e audio-features): so apps com quota
 * estendida aprovada antes dessa data seguem com acesso.
 *
 * A UI usa isto para nao oferecer "tentar novamente" no que nunca vai voltar.
 */
export const isFeatureGoneError = (error: unknown): boolean =>
  error instanceof SpotifyApiError &&
  (error.status === 403 || error.status === 404);
