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
