interface LocalStorageValues {
  accessToken: string | null;
  refreshToken: string | null;
  expireTime: string | null;
  timestamp: string | null;
}

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

  window.location.href = "/";
};

const hasTokenExpired = () => {
  const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALEUS;

  if (!accessToken || !timestamp) {
    return false;
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

export const getAcessToken = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const queryParams: any = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get("access_token"),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get("refresh_token"),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get("expires_in"),
  };

  const hasError = hasTokenExpired();

  if (hasError || LOCALSTORAGE_VALEUS.accessToken === "undefined") {
    refreshToken();
  }

  if (LOCALSTORAGE_VALEUS.accessToken) {
    return LOCALSTORAGE_VALEUS.accessToken;
  }

  if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    for (const property in queryParams) {
      window.localStorage.setItem(property, queryParams[property]);
    }

    window.localStorage.setItem(
      LOCALSTORAGE_KEYS.timestamp,
      Date.now().toString()
    );

    return queryParams[LOCALSTORAGE_KEYS.accessToken];
  }

  return null;
};

export const accessToken: string | null | undefined = getAcessToken();





const spotfyURI = "https://api.spotify.com/v1";
const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
});


export const getUserProfile = async () => {
    const response = await fetch(`${spotfyURI}/me`, {
        method: "GET",
        headers,
    });

    return response.json();
}


export const getPlaylists = async () => {
    const response = await fetch(`${spotfyURI}/me/playlists`, {
        method: "GET",
        headers,
    });

    return response.json();
}

export const getPlaylistTracks = async (playlistId: string) => {
    const response = await fetch(`${spotfyURI}/playlists/${playlistId}/tracks`, {
        method: "GET",
        headers,
    });

    return response.json();
}
