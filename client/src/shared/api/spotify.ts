// Endpoints da Web API do Spotify usados pelo app.
// Cada funcao apenas descreve a chamada; auth e erros ficam no spotifyClient.

import {
  PlaybackState,
  PlaylistTrackItem,
  QueueState,
  RecentlyPlayedItem,
  SavedAlbumItem,
  SavedAudiobookItem,
  SavedEpisodeItem,
  SavedShowItem,
  SavedTrackItem,
  SearchResults,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyAudiobook,
  SpotifyEpisode,
  SpotifyPaged,
  SpotifyPlaylist,
  SpotifyShow,
  SpotifyTopTimeRange,
  SpotifyTrack,
  SpotifyUser,
} from "../types/spotify";
import { spotifyFetch } from "./spotifyClient";

export const getUserProfile = () => spotifyFetch<SpotifyUser>("/me");

export const getFollowedArtists = () =>
  spotifyFetch<{ artists: SpotifyPaged<SpotifyArtist> }>("/me/following?type=artist");

export const getPlaylists = (limit = 20, offset = 0) =>
  spotifyFetch<SpotifyPaged<SpotifyPlaylist>>(
    `/me/playlists?limit=${limit}&offset=${offset}`
  );

export const getPlaylist = (playlistId: string) =>
  spotifyFetch<SpotifyPlaylist>(`/playlists/${playlistId}`);

export const getPlaylistItems = (playlistId: string, limit = 50, offset = 0) =>
  spotifyFetch<SpotifyPaged<PlaylistTrackItem>>(
    `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`
  );

export const getAllPlaylists = async (): Promise<SpotifyPlaylist[]> => {
  const limit = 50;
  const playlists: SpotifyPlaylist[] = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const page = await getPlaylists(limit, offset);
    playlists.push(...page.items);
    total = page.total ?? playlists.length;
    offset += limit;

    if (!page.next) break;
  }

  return playlists;
};

export const getTopArtists = (timeRange: SpotifyTopTimeRange = "long_term", limit = 20) =>
  spotifyFetch<SpotifyPaged<SpotifyArtist>>(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`
  );

export const getTopTracks = (timeRange: SpotifyTopTimeRange = "long_term", limit = 20) =>
  spotifyFetch<SpotifyPaged<SpotifyTrack>>(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
  );

export const getRecentlyPlayedTracks = () =>
  spotifyFetch<SpotifyPaged<RecentlyPlayedItem>>("/me/player/recently-played");

export const getSavedTracks = (limit = 50, offset = 0) =>
  spotifyFetch<SpotifyPaged<SavedTrackItem>>(`/me/tracks?limit=${limit}&offset=${offset}`);

export const getSavedAlbums = (limit = 50, offset = 0) =>
  spotifyFetch<SpotifyPaged<SavedAlbumItem>>(`/me/albums?limit=${limit}&offset=${offset}`);

export const getSavedShows = (limit = 50, offset = 0) =>
  spotifyFetch<SpotifyPaged<SavedShowItem>>(`/me/shows?limit=${limit}&offset=${offset}`);

export const getSavedEpisodes = (limit = 50, offset = 0) =>
  spotifyFetch<SpotifyPaged<SavedEpisodeItem>>(`/me/episodes?limit=${limit}&offset=${offset}`);

export const getSavedAudiobooks = (limit = 50, offset = 0) =>
  spotifyFetch<SpotifyPaged<SavedAudiobookItem>>(
    `/me/audiobooks?limit=${limit}&offset=${offset}`
  );

export const getPlaybackState = () =>
  spotifyFetch<PlaybackState>("/me/player", undefined, { optionalAuth: true });

export const getQueue = () =>
  spotifyFetch<QueueState>("/me/player/queue", undefined, { optionalAuth: true });

export const getArtist = (artistId: string) =>
  spotifyFetch<SpotifyArtist>(`/artists/${artistId}`);

export const getRelatedArtists = (artistId: string) =>
  spotifyFetch<{ artists: SpotifyArtist[] }>(`/artists/${artistId}/related-artists`);

export const getArtistTopTracks = (artistId: string) =>
  spotifyFetch<{ tracks: SpotifyTrack[] }>(`/artists/${artistId}/top-tracks`);

export const getTrack = (trackId: string) =>
  spotifyFetch<SpotifyTrack>(`/tracks/${trackId}`);

export const getRecommendationsBasedOnTrack = (trackId: string) =>
  spotifyFetch<{ tracks: SpotifyTrack[] }>(
    `/recommendations?seed_tracks=${trackId}&limit=5`
  );

export const getAlbumById = (albumId: string) =>
  spotifyFetch<SpotifyAlbum>(`/albums/${albumId}`);

export const getAlbumTracks = (albumId: string) =>
  spotifyFetch<SpotifyPaged<SpotifyTrack>>(`/albums/${albumId}/tracks`);

export const searchSpotify = (query: string, types: string[], limit = 10) => {
  const params = new URLSearchParams({
    q: query,
    type: types.join(","),
    limit: String(limit),
  });

  return spotifyFetch<SearchResults>(`/search?${params.toString()}`);
};

// Albuns dos top artistas: deriva uma lista de descoberta a partir do top pessoal.
export const getTopAlbums = async (): Promise<SpotifyAlbum[]> => {
  const topArtists = await getTopArtists();

  const albumsByArtist = await Promise.all(
    topArtists.items.map((artist) =>
      spotifyFetch<SpotifyPaged<SpotifyAlbum>>(
        `/artists/${artist.id}/albums?limit=1`
      ).then((data) => data.items)
    )
  );

  return albumsByArtist.flat();
};

export interface ProfileOverview {
  profile: SpotifyUser;
  followedArtists: { artists: SpotifyPaged<SpotifyArtist> };
  playlists: SpotifyPaged<SpotifyPlaylist>;
}

export const getProfileOverview = async (): Promise<ProfileOverview> => {
  const [profile, followedArtists, playlists] = await Promise.all([
    getUserProfile(),
    getFollowedArtists(),
    getPlaylists(),
  ]);

  return { profile, followedArtists, playlists };
};
