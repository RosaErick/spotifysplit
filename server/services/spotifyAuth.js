import axios from "axios";
import { env } from "../config/env";

const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
const TOKEN_URL = `${SPOTIFY_ACCOUNTS_URL}/api/token`;

const getAuthorizationHeader = () =>
  `Basic ${Buffer.from(`${env.clientId}:${env.clientSecret}`).toString("base64")}`;

export const getSpotifyAuthorizationUrl = (state) => {
  const searchParams = new URLSearchParams({
    client_id: env.clientId,
    response_type: "code",
    redirect_uri: env.redirectUri,
    scope: env.spotifyScopes,
    state,
  });

  return `${SPOTIFY_ACCOUNTS_URL}/authorize?${searchParams.toString()}`;
};

export const requestAccessToken = async (code) => {
  const response = await axios({
    method: "post",
    url: TOKEN_URL,
    params: {
      code,
      redirect_uri: env.redirectUri,
      grant_type: "authorization_code",
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: getAuthorizationHeader(),
    },
  });

  return response.data;
};

export const requestRefreshedToken = async (refreshToken) => {
  const response = await axios({
    method: "post",
    url: TOKEN_URL,
    params: {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: getAuthorizationHeader(),
    },
  });

  return response.data;
};
