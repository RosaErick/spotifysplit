# Spotifysplit

A personal web app that shows your Spotify listening stats — the ones the
official app doesn't surface. Built for practice, not for profit.

**Live:** https://spotfysplit.netlify.app

You log in with your own Spotify account. The app reads your data and never
writes to it.

## Features

- **Log in with Spotify** — OAuth 2.0 Authorization Code flow. The login happens
  on Spotify's side; the app never sees your password.
- **Top artists and top tracks** — ranked, across three time ranges (last 4
  weeks, last 6 months, last year).
- **Recently played** — your latest listening history.
- **Library** — saved tracks, saved albums and the artists you follow.
- **Playlists** — your playlists and their full track lists.
- **Search** — artists, tracks and albums.
- **Detail pages** — for any artist, track or album, including related artists.
- **Now playing** — a dock showing the current track, with a link back to
  Spotify.
- **Image studio** — turn your stats into a shareable image:
  - a **poster** with your ranked top artists or tracks, in 9:16 (story) or 4:5
    (post);
  - a **mosaic**, a square grid (2×2 up to 6×6) of artist photos or album
    covers.

  Both let you pick the time range and an accent color, and export as PNG or
  JPG. Sharing uses the browser's native share sheet when it supports files;
  otherwise the image downloads and the caption is copied for you.
- **Themes** — light and dark, plus a configurable accent color (amber, green or
  red) that applies across the whole app.

## Stack

**Frontend:** Vite, React, TypeScript, Radix Themes, TailwindCSS, React Query,
React Router, Framer Motion.

**Auth backend:** three serverless functions handling the OAuth exchange
(`/api/login`, `/api/callback`, `/api/refresh_token`) plus `/api/logout`. They
exist only because the Spotify client secret can't ship to the browser —
everything else talks to the Spotify Web API directly from the client.

Deployed on **Netlify**, with the frontend and the functions on the same origin.
A complete **Cloudflare Workers** alternative lives on the `main_cloudfare`
branch and can be deployed at any time.

For local development an **Express** server mirrors the same `/api` routes.

## Running locally

You'll need Node.js 20+ and an app registered in the
[Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

**1. Register the local redirect URI** in your Spotify app settings:

```
http://127.0.0.1:3000/api/callback
```

**2. Create `.env` in the project root** (see `.env.example`):

```env
PORT=3000
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://127.0.0.1:3000/api/callback
CLIENT_URL=http://127.0.0.1:5173
SPOTIFY_SCOPES=user-read-private user-read-email user-read-recently-played user-top-read user-follow-read user-follow-modify user-library-read user-read-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative playlist-modify-public
```

**3. Create `client/.env`** (see `client/.env.example`):

```env
VITE_API_URL=http://127.0.0.1:3000/api
```

**4. Install and run:**

```bash
npm install
npm install --prefix client
npm run dev
```

The frontend runs on `http://127.0.0.1:5173` and the auth server on
`http://127.0.0.1:3000`.

### Use `127.0.0.1`, not `localhost`

Spotify only accepts explicit loopback in redirect URIs, and browsers treat
`localhost` and `127.0.0.1` as different hosts — a cookie set on one isn't sent
to the other. Since the OAuth `state` check relies on a cookie, mixing the two
breaks login with `state_mismatch` and silently returns you to the login screen.

Use `127.0.0.1` everywhere: in both `.env` files and in the browser address bar.

## Limitations

This is a learning project, and it's honest about what the Web API can and can't
give:

- **Development Mode.** A Spotify app starts in Development Mode, where only
  accounts you explicitly add in the dashboard can log in (up to 25). Lifting
  that requires a quota extension request from Spotify.
- **Genres belong to artists, not tracks.** Spotify classifies genres per
  artist, using broad scene labels, so they can look odd next to a specific
  song. The app shows them as-is rather than inventing a mapping.
- **No "top albums" endpoint.** Album mosaics are derived from your top tracks,
  deduplicated by album.
- **Playback data is a snapshot.** "Now playing" polls periodically; it isn't a
  live stream.
