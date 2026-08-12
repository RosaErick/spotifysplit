import { readEnv } from "../config/env";
import {
  getSpotifyAuthorizationUrl,
  requestAccessToken,
  requestRefreshedToken,
} from "../services/spotifyAuth";
import {
  buildSetCookie,
  generateRandomString,
  readCookie,
} from "../utils/common";

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

const handleLogin = (env) => {
  const state = generateRandomString(16);

  return redirect(
    getSpotifyAuthorizationUrl(env, state),
    buildSetCookie(stateKey, state, {
      maxAge: stateMaxAgeSeconds,
      secure: env.redirectUri.startsWith("https"),
    })
  );
};

const handleCallback = async (request, env) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = readCookie(request.headers.get("Cookie"), stateKey);

  // O cookie de state vale so para esta troca: expira em qualquer desfecho.
  const clearState = buildSetCookie(stateKey, "", {
    maxAge: 0,
    secure: env.redirectUri.startsWith("https"),
  });

  // Anti-CSRF: o state devolvido pelo Spotify precisa bater com o cookie
  // setado no /login. Sem isso, a protecao de state do OAuth e inutil.
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
const handleRefreshToken = async (request, env) => {
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

// Prefixo /api porque cliente e API dividem a mesma origem: o React Router ja
// usa /login, entao a rota do OAuth nao pode morar na raiz.
// Retorna `null` quando a requisicao nao e da API, deixando o Worker cair nos
// assets estaticos.
export const handleAuthRequest = async (request, env) => {
  const { pathname } = new URL(request.url);

  if (!pathname.startsWith("/api/")) return null;

  const config = readEnv(env);

  if (pathname === "/api/login" && request.method === "GET") {
    return handleLogin(config);
  }

  if (pathname === "/api/callback" && request.method === "GET") {
    return handleCallback(request, config);
  }

  if (pathname === "/api/refresh_token" && request.method === "POST") {
    return handleRefreshToken(request, config);
  }

  return json({ error: "not_found" }, 404);
};
