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
const refreshTokenKey = "spotify_refresh_token";

const stateMaxAgeSeconds = 10 * 60;

// O refresh token do Spotify nao expira sozinho: vale ate ser revogado. Limitar
// o cookie a 30 dias da a sessao um prazo de validade real, ao custo de pedir
// login de novo para quem some por um mes.
const refreshTokenMaxAgeSeconds = 30 * 24 * 60 * 60;

// O cookie fica restrito a /api: nao acompanha requisicao de asset estatico.
const refreshTokenPath = "/api";

const isSecure = (env) => env.redirectUri.startsWith("https");

const withCookies = (headers, cookies) => {
  // `append` em vez de objeto literal: um Response pode carregar mais de um
  // Set-Cookie, e um objeto so guardaria o ultimo.
  cookies.forEach((cookie) => headers.append("Set-Cookie", cookie));

  return headers;
};

const json = (data, status = 200, cookies = []) =>
  new Response(JSON.stringify(data), {
    status,
    headers: withCookies(
      new Headers({ "Content-Type": "application/json" }),
      cookies
    ),
  });

const redirect = (location, cookies = []) =>
  new Response(null, {
    status: 302,
    headers: withCookies(new Headers({ Location: location }), cookies),
  });

// Redireciona ao cliente passando dados no FRAGMENT (#) em vez de query (?):
// o fragment nao e enviado a servidores, nao entra em logs de acesso nem no
// header Referer.
const redirectToClient = (env, params, cookies) => {
  const base = env.clientUrl.replace(/\/+$/, "");

  return redirect(`${base}/#${new URLSearchParams(params).toString()}`, cookies);
};

const buildStateCookie = (env, value, maxAge) =>
  buildSetCookie(stateKey, value, { maxAge, secure: isSecure(env) });

const buildRefreshTokenCookie = (env, value, maxAge) =>
  buildSetCookie(refreshTokenKey, value, {
    maxAge,
    secure: isSecure(env),
    path: refreshTokenPath,
  });

const handleLogin = (env) => {
  const state = generateRandomString(16);

  return redirect(getSpotifyAuthorizationUrl(env, state), [
    buildStateCookie(env, state, stateMaxAgeSeconds),
  ]);
};

const handleCallback = async (request, env) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = readCookie(request.headers.get("Cookie"), stateKey);

  // O cookie de state vale so para esta troca: expira em qualquer desfecho.
  const clearState = buildStateCookie(env, "", 0);

  // Anti-CSRF: o state devolvido pelo Spotify precisa bater com o cookie
  // setado no /api/login. Sem isso, a protecao de state do OAuth e inutil.
  if (!state || !storedState || state !== storedState) {
    return redirectToClient(env, { error: "state_mismatch" }, [clearState]);
  }

  if (!code) {
    return redirectToClient(env, { error: "missing_code" }, [clearState]);
  }

  try {
    const { access_token, refresh_token, expires_in } = await requestAccessToken(
      env,
      code
    );

    // O refresh token nao vai para o browser: ele nao expira sozinho, entao no
    // localStorage um XSS renderia acesso permanente. Fica num cookie HttpOnly,
    // fora do alcance de JavaScript. Para o cliente vai so o access token, que
    // dura cerca de uma hora.
    const cookies = [clearState];

    if (refresh_token) {
      cookies.push(
        buildRefreshTokenCookie(env, refresh_token, refreshTokenMaxAgeSeconds)
      );
    }

    return redirectToClient(env, { access_token, expires_in }, cookies);
  } catch (error) {
    return redirectToClient(env, { error: "invalid_token" }, [clearState]);
  }
};

// Sem corpo na requisicao: o refresh token vem do cookie HttpOnly.
const handleRefreshToken = async (request, env) => {
  const refreshToken = readCookie(
    request.headers.get("Cookie"),
    refreshTokenKey
  );

  if (!refreshToken) {
    return json({ error: "missing_refresh_token" }, 401);
  }

  try {
    const data = await requestRefreshedToken(env, refreshToken);

    // O Spotify pode devolver um refresh token novo na renovacao. Quando
    // devolve, o cookie e atualizado — e o valor nunca chega ao browser.
    const cookies = data.refresh_token
      ? [
          buildRefreshTokenCookie(
            env,
            data.refresh_token,
            refreshTokenMaxAgeSeconds
          ),
        ]
      : [];

    return json(
      { access_token: data.access_token, expires_in: data.expires_in },
      200,
      cookies
    );
  } catch (error) {
    // Token revogado ou invalido: derruba o cookie para nao ficar tentando
    // renovar em loop a cada 401.
    return json({ error: "spotify_refresh_failed" }, 502, [
      buildRefreshTokenCookie(env, "", 0),
    ]);
  }
};

// Logout precisa de endpoint porque o cookie e HttpOnly: o cliente nao
// consegue apaga-lo sozinho.
const handleLogout = (env) =>
  json({ ok: true }, 200, [buildRefreshTokenCookie(env, "", 0)]);

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

  if (pathname === "/api/logout" && request.method === "POST") {
    return handleLogout(config);
  }

  return json({ error: "not_found" }, 404);
};
