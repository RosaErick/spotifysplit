const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
const TOKEN_URL = `${SPOTIFY_ACCOUNTS_URL}/api/token`;

// `btoa` em vez de `Buffer`: client id e secret sao ASCII, e assim o arquivo
// fica identico ao da alternativa em Workers.
const getAuthorizationHeader = (env) =>
  `Basic ${btoa(`${env.clientId}:${env.clientSecret}`)}`;

export const getSpotifyAuthorizationUrl = (env, state) => {
  const searchParams = new URLSearchParams({
    client_id: env.clientId,
    response_type: "code",
    redirect_uri: env.redirectUri,
    scope: env.spotifyScopes,
    state,
  });

  return `${SPOTIFY_ACCOUNTS_URL}/authorize?${searchParams.toString()}`;
};

// Os parametros vao no corpo form-urlencoded. A versao com axios mandava na
// query string; o Spotify aceita as duas, mas o corpo e o formato documentado
// do endpoint de token no OAuth 2.
const requestToken = async (env, params) => {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: getAuthorizationHeader(env),
    },
    body: new URLSearchParams(params).toString(),
  });

  // `fetch` nao lanca em status de erro como o axios: a checagem e explicita.
  if (!response.ok) {
    throw new Error(`Spotify token request failed with status ${response.status}`);
  }

  return response.json();
};

export const requestAccessToken = (env, code) =>
  requestToken(env, {
    code,
    redirect_uri: env.redirectUri,
    grant_type: "authorization_code",
  });

export const requestRefreshedToken = (env, refreshToken) =>
  requestToken(env, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
