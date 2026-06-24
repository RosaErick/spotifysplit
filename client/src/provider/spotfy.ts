import { getApiUrl } from "../config/env";

const EXPIRATION_TIME = 3600 * 1000; // 3600 seconds * 1000 = 1 hour in milliseconds

const setTokenTimestamp = () =>
  window.localStorage.setItem("spotify_token_timestamp", Date.now().toString());
const setLocalAccessToken = (token: string) => {
  setTokenTimestamp();
  window.localStorage.setItem("spotify_access_token", token);
};
const setLocalRefreshToken = (token: string) =>
  window.localStorage.setItem("spotify_refresh_token", token);
const getTokenTimestamp = () =>
  window.localStorage.getItem("spotify_token_timestamp");
const getLocalAccessToken = () =>
  window.localStorage.getItem("spotify_access_token");
const getLocalRefreshToken = () =>
  window.localStorage.getItem("spotify_refresh_token");

const refreshAccessToken = async () => {
  const refreshToken = getLocalRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(
      getApiUrl(
        `/refresh_token?refresh_token=${encodeURIComponent(
          refreshToken
        )}`
      )
    );

    if (!response.ok) {
      logout();
      return null;
    }

    const data = await response.json();
    const { access_token } = data;

    if (!access_token) {
      logout();
      return null;
    }

    setLocalAccessToken(access_token);
    window.location.reload();
    return access_token;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getAccessToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const access_token = urlParams.get("access_token");
  const refresh_token = urlParams.get("refresh_token");

  if (error) {
    console.error(error);
    return null;
  }

  const localAccessToken = getLocalAccessToken();
  const localRefreshToken = getLocalRefreshToken();

  if ((!localAccessToken || localAccessToken === "undefined") && access_token) {
    setLocalAccessToken(access_token);
    if (refresh_token) {
      setLocalRefreshToken(refresh_token);
    }
    return access_token;
  }

  if (!localAccessToken || localAccessToken === "undefined") {
    return null;
  }

  if (
    localRefreshToken &&
    Date.now() - Number(getTokenTimestamp() ?? 0) > EXPIRATION_TIME
  ) {
    refreshAccessToken();
  }

  return localAccessToken;
};

export const logout = () => {
  window.localStorage.removeItem("spotify_token_timestamp");
  window.localStorage.removeItem("spotify_access_token");
  window.localStorage.removeItem("spotify_refresh_token");
  window.location.reload();
};

const getHeaders = () => ({
  Authorization: `Bearer ${getAccessToken()}`,
  "Content-Type": "application/json",
});

const spotifyUri = "https://api.spotify.com/v1";

export const getUserProfile = async () => {
  try {
    const response = await fetch(`${spotifyUri}/me`, {
      method: "GET",
      headers: getHeaders(),
    });

    return response.json();
  } catch (err) {
    console.error(err);
    logout();
  }
};

export const getUserFollowedArtist = async () => {
  const response = await fetch(`${spotifyUri}/me/following?type=artist`, {
    method: "GET",
    headers: getHeaders(),
  });

  return response.json();
};

export const getPlaylists = async () => {
  const response = await fetch(`${spotifyUri}/me/playlists`, {
    method: "GET",
    headers: getHeaders(),
  });

  return response.json();
};

export const getTopArtists = async () => {
  const response = await fetch(`${spotifyUri}/me/top/artists`, {
    method: "GET",
    headers: getHeaders(),
  });
  return response.json();
};

export const getOneArtist = async (artistId: string | undefined) => {
  const response = await fetch(`${spotifyUri}/artists/${artistId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return response.json();
};

export const getRelatedArtists = async (artistId: string | undefined) => {
  const response = await fetch(
    `${spotifyUri}/artists/${artistId}/related-artists`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return response.json();
};

export const getOneTrack = async (trackId: string | undefined) => {
  const response = await fetch(`${spotifyUri}/tracks/${trackId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return response.json();
};

export const getRecommendationsBasedOnTrack = async (
  trackId: string | undefined
) => {
  const response = await fetch(
    `${spotifyUri}/recommendations?seed_tracks=${trackId}&limit=5`,
    {
      method: "GET",
      headers: getHeaders(),
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
        `${spotifyUri}/artists/${artistId}/albums?limit=1`,
        {
          method: "GET",
          headers: getHeaders(),
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
  const response = await fetch(`${spotifyUri}/albums/${albumId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return response.json();
};

export const getAlbumTracks = async (albumId: string | undefined) => {
  const response = await fetch(`${spotifyUri}/albums/${albumId}/tracks`, {
    method: "GET",
    headers: getHeaders(),
  });

  return response.json();
};

export const getTopTracks = async () => {
  const response = await fetch(`${spotifyUri}/me/top/tracks`, {
    method: "GET",
    headers: getHeaders(),
  });

  return response.json();
};

export const getRecentlyPlayedTracks = async () => {
  const response = await fetch(`${spotifyUri}/me/player/recently-played`, {
    method: "GET",
    headers: getHeaders(),
  });

  return response.json();
};

export const getPlaylistTracks = async (playlistId: string) => {
  const response = await fetch(`${spotifyUri}/playlists/${playlistId}/tracks`, {
    method: "GET",
    headers: getHeaders(),
  });

  return response.json();
};

export const getTotalUserInfo = async () => {
  const [userProfile, followedArtists, playlists] = await Promise.all([
    getUserProfile(),
    getUserFollowedArtist(),
    getPlaylists(),
  ]);

  return {
    userProfile,
    followedArtists,
    playlists,
  };
};
