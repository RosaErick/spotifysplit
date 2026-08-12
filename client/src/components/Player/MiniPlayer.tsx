import {
  Cross2Icon,
  OpenInNewWindowIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Flex,
  IconButton,
  Popover,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { usePlaybackState, useQueue } from "../../shared/api/queries";
import { SpotifyEpisode, SpotifyTrack } from "../../shared/types/spotify";
import { formatDuration } from "../../utils/format";
import { EqualizerMark } from "../Layout/EqualizerMark";

type PlayableItem = SpotifyTrack | SpotifyEpisode;

export type NowPlayingState = {
  isLoading: boolean;
  isError: boolean;
  isPlaying: boolean;
  item: PlayableItem | null;
  nextItem?: PlayableItem;
  progressMs?: number | null;
  refetch: () => void;
};

export const isTrack = (item: PlayableItem): item is SpotifyTrack => "album" in item;

const playableImageUrl = (item: PlayableItem) =>
  isTrack(item) ? item.album?.images?.[0]?.url : item.images?.[0]?.url;

const playableSubtitle = (item: PlayableItem) =>
  isTrack(item)
    ? item.artists?.map((artist) => artist.name).join(", ")
    : item.show?.name;

// A barra e um retrato do ultimo polling (30s), nao um cronometro: por isso ela
// e decorativa e o tempo continua escrito ao lado do artista.
const progressPercent = (durationMs?: number, progressMs?: number | null) => {
  if (!durationMs || !progressMs) return null;

  return Math.min(100, Math.max(0, (progressMs / durationMs) * 100));
};

export const useNowPlaying = (): NowPlayingState => {
  const playbackQuery = usePlaybackState();
  const queueQuery = useQueue();
  const playback = playbackQuery.data;
  const item = playback?.item ?? queueQuery.data?.currently_playing ?? null;

  return {
    isLoading: playbackQuery.isLoading,
    isError: playbackQuery.isError,
    isPlaying: Boolean(playback?.is_playing && item),
    item,
    nextItem: queueQuery.data?.queue?.[0],
    progressMs: playback?.progress_ms,
    refetch: () => {
      playbackQuery.refetch();
      queueQuery.refetch();
    },
  };
};

type PlayerNavControlProps = {
  state: NowPlayingState;
  showDock: boolean;
  onShowDock: () => void;
};

export const PlayerNavControl = ({
  state,
  showDock,
  onShowDock,
}: PlayerNavControlProps) => {
  const item = state.item;
  const label = state.isPlaying ? "Tocando agora" : "Player";

  return (
    <Popover.Root>
      <Tooltip content={label}>
        <Popover.Trigger>
          <IconButton
            type="button"
            variant={state.isPlaying && !showDock ? "soft" : "ghost"}
            color="gray"
            highContrast
            className="player-nav-trigger utility-icon-action clickable-control"
            aria-label={label}
          >
            <EqualizerMark />
          </IconButton>
        </Popover.Trigger>
      </Tooltip>

      <Popover.Content size="1" sideOffset={10} align="end" className="player-popover">
        <Flex direction="column" gap="3">
          <PlayerSummary state={state} compact />

          <Flex gap="2" justify="end" wrap="wrap">
            {state.isPlaying && !showDock && (
              <Button size="1" variant="soft" onClick={onShowDock}>
                Mostrar player
              </Button>
            )}
            {item?.external_urls?.spotify && (
              <Button asChild size="1" variant="soft" color="gray">
                <a href={item.external_urls.spotify} target="_blank" rel="noreferrer">
                  <OpenInNewWindowIcon />
                  Abrir
                </a>
              </Button>
            )}
            <IconButton
              size="1"
              variant="soft"
              color="gray"
              aria-label="Atualizar player"
              onClick={state.refetch}
            >
              <ReloadIcon />
            </IconButton>
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
};

type PlayerDockProps = {
  state: NowPlayingState;
  onDismiss: () => void;
};

/*
 * No mobile o alvo primario e a faixa inteira, que abre no Spotify: o dedo mira
 * a barra, nao um botao "Abrir" de 24px (que some abaixo de 640px). Sobram dois
 * utilitarios, ambos com alvo de 44px, e o dispensar fica isolado por um filete
 * — facil de acertar de proposito, dificil por acidente.
 */
export const PlayerDock = ({ state, onDismiss }: PlayerDockProps) => {
  if (!state.isPlaying || !state.item) return null;

  const item = state.item;
  const spotifyUrl = item.external_urls?.spotify;
  const progress = progressPercent(item.duration_ms, state.progressMs);

  return (
    <Box className="player-dock" role="region" aria-label="Tocando agora">
      <Card className="player-dock-card">
        <Box className="player-dock-row">
          {spotifyUrl ? (
            <a
              className="player-dock-link"
              href={spotifyUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Abrir ${item.name} no Spotify`}
            >
              <PlayerSummary state={state} />
            </a>
          ) : (
            <Box className="player-dock-link is-static">
              <PlayerSummary state={state} />
            </Box>
          )}

          <Flex className="player-dock-actions" align="center" gap="2" justify="end">
            {state.nextItem && (
              <Text size="1" color="gray" className="mini-player-next">
                Próxima: {state.nextItem.name}
              </Text>
            )}
            {spotifyUrl && (
              <Button asChild size="1" variant="soft" className="player-dock-open">
                <a href={spotifyUrl} target="_blank" rel="noreferrer">
                  <OpenInNewWindowIcon />
                  Abrir
                </a>
              </Button>
            )}
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              className="player-dock-action clickable-control"
              aria-label="Atualizar player"
              onClick={state.refetch}
            >
              <ReloadIcon />
            </IconButton>
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              className="player-dock-action player-dock-dismiss clickable-control"
              aria-label="Recolher player"
              onClick={onDismiss}
            >
              <Cross2Icon />
            </IconButton>
          </Flex>
        </Box>

        {progress !== null && (
          <Box className="player-dock-progress" aria-hidden="true">
            <Box className="player-dock-progress-fill" style={{ width: `${progress}%` }} />
          </Box>
        )}
      </Card>
    </Box>
  );
};

export const NowPlayingTimelineCard = ({
  state,
  onTrackSelect,
}: {
  state: NowPlayingState;
  onTrackSelect: (track: SpotifyTrack) => void;
}) => {
  if (!state.item) return null;

  const item = state.item;
  const imageUrl = playableImageUrl(item);
  const subtitle = playableSubtitle(item);

  return (
    <Card
      className="timeline-now-card interactive-card"
      onClick={() => isTrack(item) && onTrackSelect(item)}
    >
      <Box className="media-tile" mb="3">
        {imageUrl && <img src={imageUrl} alt={item.name} loading="lazy" />}
      </Box>
      <Text as="p" size="1" className="section-eyebrow">
        {state.isPlaying ? "Tocando agora" : "Pausado"}
      </Text>
      <Text as="p" size="3" weight="bold" className="truncate-2">
        {item.name}
      </Text>
      <Text as="p" size="2" color="gray" mt="1" className="truncate-2">
        {subtitle || "Spotify"}
      </Text>
    </Card>
  );
};

const PlayerSummary = ({
  state,
  compact,
}: {
  state: NowPlayingState;
  compact?: boolean;
}) => {
  if (state.isLoading) {
    return (
      <Flex align="center" gap="3">
        <Box className="player-pulse-icon">
          <EqualizerMark />
        </Box>
        <Text size="2" color="gray">
          Checando player...
        </Text>
      </Flex>
    );
  }

  if (state.isError) {
    return (
      <Box>
        <Text as="p" size="1" className="section-eyebrow">
          Player
        </Text>
        <Text as="p" size="2" color="gray">
          Tocando agora indisponível.
        </Text>
      </Box>
    );
  }

  if (!state.item) {
    return (
      <Flex align="center" gap="3">
        <Box className="player-pulse-icon">
          <EqualizerMark />
        </Box>
        <Box>
          <Text as="p" size="1" className="section-eyebrow">
            Player
          </Text>
          <Text as="p" size="2" color="gray">
            Nada tocando agora.
          </Text>
        </Box>
      </Flex>
    );
  }

  const imageUrl = playableImageUrl(state.item);
  const subtitle = playableSubtitle(state.item);
  const durationMs = state.item.duration_ms;
  const elapsed = state.progressMs ? formatDuration(state.progressMs) : "";
  const timing = elapsed && durationMs ? `${elapsed} / ${formatDuration(durationMs)}` : elapsed;

  return (
    <Flex align="center" gap="3" minWidth="0">
      <Box className={compact ? "mini-player-thumb compact" : "mini-player-thumb"}>
        {imageUrl ? (
          <img src={imageUrl} alt={state.item.name} loading="lazy" />
        ) : (
          <Flex height="100%" align="center" justify="center">
            <EqualizerMark />
          </Flex>
        )}
      </Box>
      <Box minWidth="0">
        <Text as="p" size="1" className="section-eyebrow">
          {state.isPlaying ? "Tocando agora" : "Pausado"}
        </Text>
        <Text as="p" size={compact ? "2" : "3"} weight="bold" className="truncate-2">
          {state.item.name}
        </Text>
        <Text as="p" size="1" color="gray" className="truncate-2">
          {subtitle || "Spotify"}
          {timing ? ` · ${timing}` : ""}
        </Text>
      </Box>
    </Flex>
  );
};
