import { Router } from "express";
import { env } from "../config/env";
import { generateRandomString } from "../utils/common";
import {
  getSpotifyAuthorizationUrl,
  requestAccessToken,
  requestRefreshedToken,
} from "../services/spotifyAuth";

const router = Router();

const stateKey = "spotify_auth_state";
const refreshTokenKey = "spotify_refresh_token";

const stateMaxAgeMs = 10 * 60 * 1000;

// O refresh token do Spotify nao expira sozinho: vale ate ser revogado. Limitar
// o cookie a 30 dias da a sessao um prazo de validade real.
const refreshTokenMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

// O cookie fica restrito a /api: nao acompanha requisicao de asset estatico.
const refreshTokenPath = "/api";

const isHttps = env.redirectUri.startsWith("https");

// Le um cookie do header cru (sem depender de cookie-parser).
const readCookie = (req, name) => {
  const header = req.headers.cookie;
  if (!header) return null;

  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }

  return null;
};

const setRefreshTokenCookie = (res, value, maxAge) =>
  res.cookie(refreshTokenKey, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: refreshTokenPath,
    maxAge,
  });

const clearRefreshTokenCookie = (res) =>
  res.clearCookie(refreshTokenKey, { path: refreshTokenPath });

// Redireciona ao cliente passando dados no FRAGMENT (#) em vez de query (?):
// o fragment nao e enviado a servidores, nao entra em logs de acesso nem no
// header Referer.
const redirectToClient = (res, params) => {
  const base = env.clientUrl.replace(/\/+$/, "");
  return res.redirect(`${base}/#${new URLSearchParams(params).toString()}`);
};

router.get("/login", (req, res) => {
  const state = generateRandomString(16);

  res.cookie(stateKey, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    maxAge: stateMaxAgeMs,
  });
  res.redirect(getSpotifyAuthorizationUrl(state));
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const storedState = readCookie(req, stateKey);

  res.clearCookie(stateKey);

  // Anti-CSRF: o state devolvido pelo Spotify precisa bater com o cookie
  // setado no /api/login. Sem isso, a protecao de state do OAuth e inutil.
  if (!state || !storedState || state !== storedState) {
    return redirectToClient(res, { error: "state_mismatch" });
  }

  if (!code) {
    return redirectToClient(res, { error: "missing_code" });
  }

  try {
    const { access_token, refresh_token, expires_in } = await requestAccessToken(
      code
    );

    // O refresh token nao vai para o browser: ele nao expira sozinho, entao no
    // localStorage um XSS renderia acesso permanente. Fica num cookie HttpOnly.
    if (refresh_token) {
      setRefreshTokenCookie(res, refresh_token, refreshTokenMaxAgeMs);
    }

    return redirectToClient(res, { access_token, expires_in });
  } catch (error) {
    return redirectToClient(res, { error: "invalid_token" });
  }
});

// Sem corpo na requisicao: o refresh token vem do cookie HttpOnly.
router.post("/refresh_token", async (req, res) => {
  const refreshToken = readCookie(req, refreshTokenKey);

  if (!refreshToken) {
    return res.status(401).json({ error: "missing_refresh_token" });
  }

  try {
    const data = await requestRefreshedToken(refreshToken);

    // O Spotify pode devolver um refresh token novo na renovacao. Quando
    // devolve, o cookie e atualizado — e o valor nunca chega ao browser.
    if (data.refresh_token) {
      setRefreshTokenCookie(res, data.refresh_token, refreshTokenMaxAgeMs);
    }

    return res.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    // Token revogado ou invalido: derruba o cookie para nao ficar tentando
    // renovar em loop a cada 401.
    clearRefreshTokenCookie(res);
    return res.status(502).json({ error: "spotify_refresh_failed" });
  }
});

// Logout precisa de endpoint porque o cookie e HttpOnly: o cliente nao
// consegue apaga-lo sozinho.
router.post("/logout", (req, res) => {
  clearRefreshTokenCookie(res);
  return res.json({ ok: true });
});

export default router;
