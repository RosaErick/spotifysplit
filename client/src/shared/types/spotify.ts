// Tipos minimos do Spotify usados pela UI.
// Modelam apenas os campos que o app consome, nao o contrato completo da API.

export interface SpotifyImage {
  url: string;
  height?: number;
  width?: number;
}

export interface SpotifyFollowers {
  total: number;
}

export type SpotifyTopTimeRange = "long_term" | "medium_term" | "short_term";

export interface SpotifyArtist {
  id: string;
  name: string;
  images?: SpotifyImage[];
  genres?: string[];
  followers?: SpotifyFollowers;
  popularity?: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images?: SpotifyImage[];
  artists?: SpotifyArtist[];
  release_date?: string;
  total_tracks?: number;
  external_urls?: {
    spotify?: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  album?: SpotifyAlbum;
  artists?: SpotifyArtist[];
  duration_ms?: number;
  popularity?: number;
  preview_url?: string | null;
  external_urls?: {
    spotify?: string;
  };
}

export interface SpotifyUser {
  id?: string;
  display_name: string;
  product?: string;
  images?: SpotifyImage[];
  followers?: SpotifyFollowers;
}

export interface SpotifyPlaylistOwner {
  id: string;
  display_name?: string | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string | null;
  images?: SpotifyImage[];
  owner?: SpotifyPlaylistOwner;
  public?: boolean | null;
  collaborative?: boolean;
  external_urls?: {
    spotify?: string;
  };
  items?: {
    total: number;
  };
  tracks?: {
    total: number;
  };
}

export interface SpotifyShow {
  id: string;
  name: string;
  description?: string;
  publisher?: string;
  images?: SpotifyImage[];
  total_episodes?: number;
  external_urls?: {
    spotify?: string;
  };
}

export interface SpotifyEpisode {
  id: string;
  name: string;
  description?: string;
  images?: SpotifyImage[];
  release_date?: string;
  duration_ms?: number;
  show?: SpotifyShow;
  external_urls?: {
    spotify?: string;
  };
}

export interface SpotifyAudiobook {
  id: string;
  name: string;
  description?: string;
  authors?: Array<{ name: string }>;
  narrator?: Array<{ name: string }>;
  images?: SpotifyImage[];
  total_chapters?: number;
  external_urls?: {
    spotify?: string;
  };
}

export interface SpotifyChapter {
  id: string;
  name: string;
  description?: string;
  images?: SpotifyImage[];
  duration_ms?: number;
  external_urls?: {
    spotify?: string;
  };
}

export interface SavedTrackItem {
  added_at: string;
  track: SpotifyTrack;
}

export interface SavedAlbumItem {
  added_at: string;
  album: SpotifyAlbum;
}

export interface SavedShowItem {
  added_at: string;
  show: SpotifyShow;
}

export interface SavedEpisodeItem {
  added_at: string;
  episode: SpotifyEpisode;
}

export interface SavedAudiobookItem {
  added_at: string;
  audiobook: SpotifyAudiobook;
}

export interface PlaylistTrackItem {
  added_at?: string | null;
  track: SpotifyTrack | SpotifyEpisode | null;
}

export interface SpotifyDevice {
  id?: string | null;
  is_active?: boolean;
  is_private_session?: boolean;
  is_restricted?: boolean;
  name: string;
  type: string;
  volume_percent?: number | null;
}

export interface PlaybackState {
  device?: SpotifyDevice;
  is_playing?: boolean;
  progress_ms?: number | null;
  item?: SpotifyTrack | SpotifyEpisode | null;
  currently_playing_type?: "track" | "episode" | "ad" | "unknown";
  shuffle_state?: boolean;
  repeat_state?: string;
}

export interface QueueState {
  currently_playing?: SpotifyTrack | SpotifyEpisode | null;
  queue: Array<SpotifyTrack | SpotifyEpisode>;
}

export interface SearchResults {
  albums?: SpotifyPaged<SpotifyAlbum>;
  artists?: SpotifyPaged<SpotifyArtist>;
  playlists?: SpotifyPaged<SpotifyPlaylist>;
  tracks?: SpotifyPaged<SpotifyTrack>;
  shows?: SpotifyPaged<SpotifyShow>;
  episodes?: SpotifyPaged<SpotifyEpisode>;
  audiobooks?: SpotifyPaged<SpotifyAudiobook>;
}

export interface SpotifyPaged<T> {
  items: T[];
  total?: number;
  limit?: number;
  offset?: number;
  next?: string | null;
  previous?: string | null;
}

export interface RecentlyPlayedItem {
  played_at: string;
  track: SpotifyTrack;
}
