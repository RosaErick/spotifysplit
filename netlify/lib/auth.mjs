import {
  buildSetCookie,
  generateRandomString,
  readCookie,
} from "./common.mjs";
import { readEnv } from "./env.mjs";
import {
  getSpotifyAuthorizationUrl,
  requestAccessToken,
  requestRefreshedToken,
} from "./spotifyAuth.mjs";

const stateKey = "spotify_auth_state";
const stateMaxAgeSeconds = 10 * 60;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const redirect = (location, setCookie) => {
  const headers = { Location: location };
  if (setCookie) headers["Set-Cookie"] = setCookie;

  return new Response(null, { status: 302, headers });
};

// Redireciona ao cliente passando dados no FRAGMENT (#) em vez de query (?):
// o fragment nao e enviado a servidores, nao entra em logs de acesso nem no
// header Referer. Evita vazamento de access/refresh token.
const redirectToClient = (env, params, setCookie) => {
  const base = env.clientUrl.replace(/\/+$/, "");

  return redirect(`${base}/#${new URLSearchParams(params).toString()}`, setCookie);
};

export const handleLogin = (request, env) => {
  const state = generateRandomString(16);

  return redirect(
    getSpotifyAuthorizationUrl(env, state),
    buildSetCookie(stateKey, state, {
      maxAge: stateMaxAgeSeconds,
      secure: env.redirectUri.startsWith("https"),
    })
  );
};

export const handleCallback = async (request, env) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = readCookie(request.headers.get("cookie"), stateKey);

  // O cookie de state vale so para esta troca: expira em qualquer desfecho.
  const clearState = buildSetCookie(stateKey, "", {
    maxAge: 0,
    secure: env.redirectUri.startsWith("https"),
  });

  // Anti-CSRF: o state devolvido pelo Spotify precisa bater com o cookie
  // setado no /api/login. Sem isso, a protecao de state do OAuth e inutil.
  if (!state || !storedState || state !== storedState) {
    return redirectToClient(env, { error: "state_mismatch" }, clearState);
  }

  if (!code) {
    return redirectToClient(env, { error: "missing_code" }, clearState);
  }

  try {
    const { access_token, refresh_token, expires_in } = await requestAccessToken(
      env,
      code
    );

    return redirectToClient(
      env,
      { access_token, refresh_token, expires_in },
      clearState
    );
  } catch (error) {
    return redirectToClient(env, { error: "invalid_token" }, clearState);
  }
};

// POST com o refresh token no corpo (nao na query) para nao vazar em logs/URL.
export const handleRefreshToken = async (request, env) => {
  let body = null;

  try {
    body = await request.json();
  } catch (error) {
    return json({ error: "missing_refresh_token" }, 400);
  }

  const refreshToken = body?.refresh_token;

  if (!refreshToken) {
    return json({ error: "missing_refresh_token" }, 400);
  }

  try {
    return json(await requestRefreshedToken(env, refreshToken));
  } catch (error) {
    return json({ error: "spotify_refresh_failed" }, 502);
  }
};

// Le a config e trata erro num lugar so, em vez de repetir try/catch nas tres
// functions. Variavel obrigatoria faltando vira 500 sem vazar detalhe; o log
// aparece no painel de functions da Netlify.
export const withEnv = (handler) => async (request) => {
  try {
    return await handler(request, readEnv(process.env));
  } catch (error) {
    console.error(error);

    return json({ error: "server_error" }, 500);
  }
};
