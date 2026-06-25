// Hooks de dados do Spotify via React Query.
// Centralizam chaves de cache e estados de loading/erro para a UI.

import { useQuery } from "react-query";
import {
  getAlbumById,
  getAlbumTracks,
  getAllPlaylists,
  getArtist,
  getArtistTopTracks,
  getPlaybackState,
  getPlaylist,
  getPlaylistItems,
  getPlaylists,
  getProfileOverview,
  getQueue,
  getRecentlyPlayedTracks,
  getRecommendationsBasedOnTrack,
  getRelatedArtists,
  getSavedAlbums,
  getSavedAudiobooks,
  getSavedEpisodes,
  getSavedShows,
  getSavedTracks,
  searchSpotify,
  getTopAlbums,
  getTopArtists,
  getTopTracks,
  getTrack,
  getUserProfile,
} from "./spotify";
import { SpotifyTopTimeRange } from "../types/spotify";

export const queryKeys = {
  userProfile: ["user-profile"] as const,
  profileOverview: ["profile-overview"] as const,
  topArtists: (timeRange: SpotifyTopTimeRange, limit: number) =>
    ["top-artists", timeRange, limit] as const,
  topTracks: (timeRange: SpotifyTopTimeRange, limit: number) =>
    ["top-tracks", timeRange, limit] as const,
  recentlyPlayed: ["recently-played"] as const,
  playlists: (limit: number, offset: number) => ["playlists", limit, offset] as const,
  allPlaylists: ["playlists", "all"] as const,
  playlist: (id: string) => ["playlist", id] as const,
  playlistItems: (id: string) => ["playlist-items", id] as const,
  topAlbums: ["top-albums"] as const,
  artist: (id: string) => ["artist", id] as const,
  relatedArtists: (id: string) => ["related-artists", id] as const,
  artistTopTracks: (id: string) => ["artist-top-tracks", id] as const,
  track: (id: string) => ["track", id] as const,
  trackRecommendations: (id: string) => ["track-recommendations", id] as const,
  album: (id: string) => ["album", id] as const,
  albumTracks: (id: string) => ["album-tracks", id] as const,
  savedTracks: ["library", "tracks"] as const,
  savedAlbums: ["library", "albums"] as const,
  savedShows: ["library", "shows"] as const,
  savedEpisodes: ["library", "episodes"] as const,
  savedAudiobooks: ["library", "audiobooks"] as const,
  playbackState: ["player", "state"] as const,
  queue: ["player", "queue"] as const,
  search: (query: string, types: string[]) => ["search", query, types.join(",")] as const,
};

export const useProfileOverview = () =>
  useQuery(queryKeys.profileOverview, getProfileOverview);

export const useUserProfile = () => useQuery(queryKeys.userProfile, getUserProfile);

export const useTopArtists = (
  timeRange: SpotifyTopTimeRange = "long_term",
  limit = 20
) =>
  useQuery(queryKeys.topArtists(timeRange, limit), () =>
    getTopArtists(timeRange, limit)
  );

export const useTopTracks = (
  timeRange: SpotifyTopTimeRange = "long_term",
  limit = 20
) =>
  useQuery(queryKeys.topTracks(timeRange, limit), () =>
    getTopTracks(timeRange, limit)
  );

export const useRecentlyPlayed = () =>
  useQuery(queryKeys.recentlyPlayed, getRecentlyPlayedTracks);

export const usePlaylists = (limit = 12, offset = 0) =>
  useQuery(queryKeys.playlists(limit, offset), () => getPlaylists(limit, offset));

export const useAllPlaylists = () => useQuery(queryKeys.allPlaylists, getAllPlaylists);

export const usePlaylist = (id?: string) =>
  useQuery(queryKeys.playlist(id ?? ""), () => getPlaylist(id as string), {
    enabled: Boolean(id),
  });

export const usePlaylistItems = (id?: string) =>
  useQuery(queryKeys.playlistItems(id ?? ""), () => getPlaylistItems(id as string), {
    enabled: Boolean(id),
  });

export const useTopAlbums = () => useQuery(queryKeys.topAlbums, getTopAlbums);

export const useArtist = (id?: string) =>
  useQuery(queryKeys.artist(id ?? ""), () => getArtist(id as string), {
    enabled: Boolean(id),
  });

export const useRelatedArtists = (id?: string) =>
  useQuery(queryKeys.relatedArtists(id ?? ""), () => getRelatedArtists(id as string), {
    enabled: Boolean(id),
  });

export const useArtistTopTracks = (id?: string) =>
  useQuery(queryKeys.artistTopTracks(id ?? ""), () => getArtistTopTracks(id as string), {
    enabled: Boolean(id),
  });

export const useTrack = (id?: string) =>
  useQuery(queryKeys.track(id ?? ""), () => getTrack(id as string), {
    enabled: Boolean(id),
  });

export const useTrackRecommendations = (id?: string) =>
  useQuery(
    queryKeys.trackRecommendations(id ?? ""),
    () => getRecommendationsBasedOnTrack(id as string),
    { enabled: Boolean(id) }
  );

export const useAlbum = (id?: string) =>
  useQuery(queryKeys.album(id ?? ""), () => getAlbumById(id as string), {
    enabled: Boolean(id),
  });

export const useAlbumTracks = (id?: string) =>
  useQuery(queryKeys.albumTracks(id ?? ""), () => getAlbumTracks(id as string), {
    enabled: Boolean(id),
  });

export const useSavedTracks = () => useQuery(queryKeys.savedTracks, () => getSavedTracks());

export const useSavedAlbums = () => useQuery(queryKeys.savedAlbums, () => getSavedAlbums());

export const useSavedShows = () => useQuery(queryKeys.savedShows, () => getSavedShows());

export const useSavedEpisodes = () =>
  useQuery(queryKeys.savedEpisodes, () => getSavedEpisodes());

export const useSavedAudiobooks = () =>
  useQuery(queryKeys.savedAudiobooks, () => getSavedAudiobooks());

export const usePlaybackState = () =>
  useQuery(queryKeys.playbackState, getPlaybackState, {
    refetchInterval: 30000,
    retry: false,
  });

export const useQueue = () =>
  useQuery(queryKeys.queue, getQueue, {
    refetchInterval: 60000,
    retry: false,
  });

export const useSearchSpotify = (query: string, types: string[]) =>
  useQuery(queryKeys.search(query, types), () => searchSpotify(query, types), {
    enabled: query.trim().length >= 2,
  });
