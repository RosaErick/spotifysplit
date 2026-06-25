import { OpenInNewWindowIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import { usePlaybackState, useQueue } from "../../shared/api/queries";
import { SpotifyEpisode, SpotifyTrack } from "../../shared/types/spotify";
import { formatDuration } from "../../utils/format";

const isTrack = (item: SpotifyTrack | SpotifyEpisode): item is SpotifyTrack =>
  "album" in item;

export const MiniPlayer = () => {
  const playbackQuery = usePlaybackState();
  const queueQuery = useQueue();
  const playback = playbackQuery.data;
  const item = playback?.item ?? queueQuery.data?.currently_playing ?? null;
  const nextItem = queueQuery.data?.queue?.[0];

  if (playbackQuery.isLoading) {
    return null;
  }

  if (playbackQuery.isError) {
    return (
      <Card className="mini-player" mb="5">
        <Flex align="center" justify="between" gap="3">
          <Box>
            <Text as="p" size="1" color="amber" className="section-eyebrow">
              Player
            </Text>
            <Text as="p" size="2" color="gray">
              Tocando agora indisponível. Verifique os scopes e faça login novamente.
            </Text>
          </Box>
          <Button size="1" variant="soft" color="gray" onClick={() => playbackQuery.refetch()}>
            <ReloadIcon />
            Atualizar
          </Button>
        </Flex>
      </Card>
    );
  }

  if (!item) {
    return (
      <Card className="mini-player" mb="5">
        <Flex align="center" justify="between" gap="3">
          <Box>
            <Text as="p" size="1" color="amber" className="section-eyebrow">
              Player
            </Text>
            <Text as="p" size="2" color="gray">
              Nada tocando agora.
            </Text>
          </Box>
          <Button size="1" variant="soft" color="gray" onClick={() => playbackQuery.refetch()}>
            <ReloadIcon />
            Atualizar
          </Button>
        </Flex>
      </Card>
    );
  }

  const imageUrl = isTrack(item) ? item.album?.images?.[0]?.url : item.images?.[0]?.url;
  const subtitle = isTrack(item)
    ? item.artists?.map((artist) => artist.name).join(", ")
    : item.show?.name;
  const spotifyUrl = item.external_urls?.spotify;

  return (
    <Card className="mini-player" mb="5">
      <Flex align="center" justify="between" gap="4" wrap="wrap">
        <Flex align="center" gap="3" minWidth="0">
          <Box className="mini-player-thumb">
            {imageUrl && <img src={imageUrl} alt={item.name} loading="lazy" />}
          </Box>
          <Box minWidth="0">
            <Text as="p" size="1" color="amber" className="section-eyebrow">
              {playback?.is_playing ? "Tocando agora" : "Pausado"}
            </Text>
            <Text as="p" size="3" weight="bold" className="truncate-2">
              {item.name}
            </Text>
            <Text as="p" size="1" color="gray" className="truncate-2">
              {subtitle || "Spotify"} · {formatDuration(playback?.progress_ms ?? undefined)}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap="2" wrap="wrap" justify="end">
          {nextItem && (
            <Text size="1" color="gray" className="mini-player-next">
              Próxima: {nextItem.name}
            </Text>
          )}
          {spotifyUrl && (
            <Button asChild size="1" variant="soft" color="amber">
              <a href={spotifyUrl} target="_blank" rel="noreferrer">
                <OpenInNewWindowIcon />
                Abrir
              </a>
            </Button>
          )}
          <Button size="1" variant="soft" color="gray" onClick={() => playbackQuery.refetch()}>
            <ReloadIcon />
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};
