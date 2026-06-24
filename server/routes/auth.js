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

router.get("/login", (req, res) => {
  const state = generateRandomString(16);

  res.cookie(stateKey, state);
  res.redirect(getSpotifyAuthorizationUrl(state));
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    const queryParams = new URLSearchParams({ error: "missing_code" });
    return res.redirect(`${env.clientUrl}?${queryParams.toString()}`);
  }

  try {
    const { access_token, refresh_token, expires_in } = await requestAccessToken(code);
    const queryParams = new URLSearchParams({
      access_token,
      refresh_token,
      expires_in,
    });

    return res.redirect(`${env.clientUrl}?${queryParams.toString()}`);
  } catch (error) {
    const queryParams = new URLSearchParams({ error: "invalid_token" });
    return res.redirect(`${env.clientUrl}?${queryParams.toString()}`);
  }
});

router.get("/refresh_token", async (req, res) => {
  const refreshToken = req.query.refresh_token;

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
