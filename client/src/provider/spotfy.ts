const EXPIRATION_TIME = 3600 * 1000; // 3600 seconds * 1000 = 1 hour in milliseconds

const setTokenTimestamp = () =>
  window.localStorage.setItem("spotify_token_timestamp", Date.now().toString());
const setLocalAccessToken = (token: string) => {
  setTokenTimestamp();
  window.localStorage.setItem("spotify_access_token", token);
};
const setLocalRefreshToken = (token: any) =>
  window.localStorage.setItem("spotify_refresh_token", token);
const getTokenTimestamp = () =>
  window.localStorage.getItem("spotify_token_timestamp");
const getLocalAccessToken = () =>
  window.localStorage.getItem("spotify_access_token");
const getLocalRefreshToken = () =>
  window.localStorage.getItem("spotify_refresh_token");

const refreshAccessToken = async () => {
  try {
    const response = await fetch(
      `/refresh_token?refresh_token=${getLocalRefreshToken()}`
    );
    const data = await response.json();
    const { access_token } = data;
    setLocalAccessToken(access_token);
    window.location.reload();
    return;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getAccessToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const access_token = urlParams.get("access_token");
  const refresh_token = urlParams.get("refresh_token");

  if (error) {
    console.error(error);
    refreshAccessToken();
  }

  if (Date.now() - Number(getTokenTimestamp() ?? 0) > EXPIRATION_TIME) {
    console.warn("Access token has expired, refreshing...");
    refreshAccessToken();
  }

  const localAccessToken = getLocalAccessToken();

  if ((!localAccessToken || localAccessToken === "undefined") && access_token) {
    setLocalAccessToken(access_token);
    setLocalRefreshToken(refresh_token);
    return access_token;
  }

  return localAccessToken;
};

export const token = getAccessToken();

export const logout = () => {
  window.localStorage.removeItem("spotify_token_timestamp");
  window.localStorage.removeItem("spotify_access_token");
  window.localStorage.removeItem("spotify_refresh_token");
  window.location.reload();
};

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// ... Rest of the code remains unchanged ...

const spotfyURI = "https://api.spotify.com/v1";

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
  const [userProfile, followedArtists, playlists] = await Promise.all([
    getUserProfile(),
    getUserFollowedArtist(),
    getPlaylists(),
  ]);

  console.log("userProfile", userProfile);
  console.log("followedArtists", followedArtists);
  console.log("playlists", playlists);

  return {
    userProfile,
    followedArtists,
    playlists,
  };
};
