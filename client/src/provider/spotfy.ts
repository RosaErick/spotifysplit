import { LocalStorageValues } from "../interfaces/interfaces";

const LOCALSTORAGE_KEYS: any = {
  accessToken: "spotify_access_token",
  refreshToken: "spotify_refresh_token",
  expireTime: "spotify_expire_time",
  timestamp: "spotfy_token_timestamp",
};

const LOCALSTORAGE_VALEUS: LocalStorageValues = {
  accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
  expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
  timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};

export const logout = () => {
  for (const property in LOCALSTORAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
  }

  window.location.href = "/login";
};

const hasTokenExpired = () => {
  const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALEUS;

  if (!accessToken || !timestamp) {
    return true;
  }

  const milisecondsElapsed = Date.now() - Number(timestamp);
  return milisecondsElapsed / 1000 > Number(expireTime);
};

const refreshToken = async () => {
  try {
    if (
      !LOCALSTORAGE_VALEUS.refreshToken ||
      LOCALSTORAGE_VALEUS.refreshToken === "undefined" ||
      Number(Date.now) - Number(LOCALSTORAGE_VALEUS.timestamp) / 1000 < 1000
    ) {
      console.error("No refresh token");
      logout();
    }

    const { data } = await fetch(
      `api/refresh_token?refresh_token=${LOCALSTORAGE_VALEUS.refreshToken}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());

    window.localStorage.setItem(
      LOCALSTORAGE_KEYS.accessToken,
      data.access_token
    );
    window.localStorage.setItem(
      LOCALSTORAGE_KEYS.timestamp,
      String(Date.now())
    );

    window.location.reload();
  } catch (err) {
    console.error(err);
  }
};

export const getAcessToken = async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const queryParams: any = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get("access_token"),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get("refresh_token"),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get("expires_in"),
  };

  if (LOCALSTORAGE_VALEUS.accessToken && !hasTokenExpired()) {
    return LOCALSTORAGE_VALEUS.accessToken;
  }

  if (
    queryParams[LOCALSTORAGE_KEYS.accessToken] &&
    queryParams[LOCALSTORAGE_KEYS.expireTime]
  ) {
    for (const property in queryParams) {
      window.localStorage.setItem(property, queryParams[property]);
    }

    window.localStorage.setItem(
      LOCALSTORAGE_KEYS.timestamp,
      Date.now().toString()
    );

    return queryParams[LOCALSTORAGE_KEYS.accessToken];
  }

  if (LOCALSTORAGE_VALEUS.refreshToken) {
    await refreshToken();
    return LOCALSTORAGE_VALEUS.accessToken;
  }

  return null;
};

export const accessToken: any = async () => await getAcessToken();

const spotfyURI = "https://api.spotify.com/v1";
const headers = new Headers({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

export const getUserProfile = async () => {
  try {
    const response = await fetch(`${spotfyURI}/me`, {
      method: "GET",
      headers,
    });

    return response.json();
  } catch (err) {
    console.log(err);
    logout();
  }
};

export const getUserFollowedArtist = async () => {
  const response = await fetch(`${spotfyURI}/me/following?type=artist`, {
    method: "GET",
    headers,
  });

  return response.json();
};

export const getPlaylists = async () => {
  const response = await fetch(`${spotfyURI}/me/playlists`, {
    method: "GET",
    headers,
  });

  console.log("playlist", response);

  return response.json();
};

export const getTopArtists = async () => {
  const response = await fetch(`${spotfyURI}/me/top/artists`, {
    method: "GET",
    headers,
  });
  console.log("top", response);

  return response.json();
};

export const getOneArtist = async (artistId: string | undefined) => {
  const response = await fetch(`${spotfyURI}/artists/${artistId}`, {
    method: "GET",
    headers,
  });

  return response.json();
};

export const getRelatedArtists = async (artistId: string | undefined) => {
  const response = await fetch(
    `${spotfyURI}/artists/${artistId}/related-artists`,
    {
      method: "GET",
      headers,
    }
  );

  return response.json();
};

export const getOneTrack = async (trackId: string | undefined) => {
  const response = await fetch(`${spotfyURI}/tracks/${trackId}`, {
    method: "GET",
    headers,
  });

  return response.json();
};

export const getRecommendationsBasedOnTrack = async (
  trackId: string | undefined
) => {
  const response = await fetch(
    `${spotfyURI}/recommendations?seed_tracks=${trackId}&limit=5`,
    {
      method: "GET",
      headers,
    }
  );

  return response.json();
};

export const getTopAlbums = async () => {
  try {
    const topArtists = await getTopArtists();
    const artistIds = topArtists.items.map((artist: any) => artist.id);

    const albumsPromises = artistIds.map(async (artistId: any) => {
      const response = await fetch(
        `${spotfyURI}/artists/${artistId}/albums?limit=1`,
        {
          method: "GET",
          headers,
        }
      );
      const data = await response.json();
      return data.items;
    });

    const albumsResults = await Promise.all(albumsPromises);

    const albums = albumsResults.flat();
    return albums;
  } catch (error) {
    console.error("Error fetching top albums:", error);
    return [];
  }
};

export const getAlbumById = async (albumId: string | undefined) => {
  const response = await fetch(`${spotfyURI}/albums/${albumId}`, {
    method: "GET",
    headers,
  });

  return response.json();
};

export const getAlbumTracks = async (albumId: string | undefined) => {
  const response = await fetch(`${spotfyURI}/albums/${albumId}/tracks`, {
    method: "GET",
    headers,
  });

  return response.json();
};

export const getTopTracks = async () => {
  const response = await fetch(`${spotfyURI}/me/top/tracks`, {
    method: "GET",
    headers,
  });

  return response.json();
};

export const getRecentlyPlayedTracks = async () => {
  const response = await fetch(`${spotfyURI}/me/player/recently-played`, {
    method: "GET",
    headers,
  });

  return response.json();
};

export const getPlaylistTracks = async (playlistId: string) => {
  const response = await fetch(`${spotfyURI}/playlists/${playlistId}/tracks`, {
    method: "GET",
    headers,
  });

  return response.json();
};

export const getTotalUserInfo = async () => {
  const [userProfile, followedArtists, playlists, topArtists, topTracks] =
    await Promise.all([
      getUserProfile(),
      getUserFollowedArtist(),
      getPlaylists(),
      getTopArtists(),
      getTopTracks(),
    ]);

  console.log("userProfile", userProfile);
  console.log("followedArtists", followedArtists);
  console.log("playlists", playlists);
  console.log("topArtists", topArtists);
  console.log("topTracks", topTracks);

  return {
    userProfile,
    followedArtists,
    playlists,
    topArtists,
    topTracks,
  };
};
