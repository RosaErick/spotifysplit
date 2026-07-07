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

// Redireciona ao cliente passando dados no FRAGMENT (#) em vez de query (?):
// o fragment nao e enviado a servidores, nao entra em logs de acesso nem no
// header Referer. Evita vazamento de access/refresh token.
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
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(getSpotifyAuthorizationUrl(state));
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const storedState = readCookie(req, stateKey);

  res.clearCookie(stateKey);

  // Anti-CSRF: o state devolvido pelo Spotify precisa bater com o cookie
  // setado no /login. Sem isso, a protecao de state do OAuth e inutil.
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

    return redirectToClient(res, {
      access_token,
      refresh_token,
      expires_in,
    });
  } catch (error) {
    return redirectToClient(res, { error: "invalid_token" });
  }
});

// POST com o refresh token no corpo (nao na query) para nao vazar em logs/URL.
router.post("/refresh_token", async (req, res) => {
  const refreshToken = req.body?.refresh_token;

  if (!refreshToken) {
    return res.status(400).json({ error: "missing_refresh_token" });
  }

  try {
    const data = await requestRefreshedToken(refreshToken);
    return res.json(data);
  } catch (error) {
    return res.status(502).json({ error: "spotify_refresh_failed" });
  }
});

export default router;
