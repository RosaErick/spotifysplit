import express from "express";
import "dotenv/config";
import { generateRandomString } from "./utils/common";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get("/", (req, res) => {
  res.send("health check");
});

app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  const stateKey = "spotify_auth_state";

  res.cookie(stateKey, state);

  const searchparams = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: "user-read-private user-read-email user-read-recently-played user-top-read user-follow-read user-follow-modify playlist-read-private playlist-read-collaborative playlist-modify-public",
    state: state,
  });

  const queryParams = searchparams.toString();

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get("/callback", (req, res) => {
  const code = req.query.code || null;

  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    params: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        const { access_token, refresh_token, expires_in } = response.data;

        const queryParams = new URLSearchParams({
          access_token,
          refresh_token,
          expires_in,
        });

        res.redirect(`http://localhost:5173/?${queryParams}`);
      } else {
        res.redirect(`http://localhost:5173/?error=invalid_token`);
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

app.get("/refresh_token", (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    params: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
