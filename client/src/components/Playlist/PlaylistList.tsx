import { Badge, Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import { SpotifyPlaylist } from "../../shared/types/spotify";
import { formatNumber } from "../../utils/format";

type PlaylistListProps = {
  playlists: SpotifyPlaylist[];
  onSelect?: (playlist: SpotifyPlaylist) => void;
};

export const PlaylistList = ({ playlists, onSelect }: PlaylistListProps) => (
  <Card className="playlist-list">
    {playlists.map((playlist) => {
      const imageUrl = playlist.images?.[0]?.url;
      const totalTracks = playlist.tracks?.total ?? playlist.items?.total ?? 0;
      const spotifyUrl = playlist.external_urls?.spotify;

      return (
        <div
          key={playlist.id}
          role={onSelect ? "button" : undefined}
          tabIndex={onSelect ? 0 : undefined}
          className="playlist-row"
          onClick={() => onSelect?.(playlist)}
          onKeyDown={(event) => {
            if (onSelect && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              onSelect(playlist);
            }
          }}
        >
          <Box className="playlist-thumb">
            {imageUrl && (
              <img src={imageUrl} alt={`Capa de ${playlist.name}`} loading="lazy" />
            )}
          </Box>

          <Box minWidth="0">
            <Text as="p" size="3" weight="bold" className="truncate-2">
              {playlist.name}
            </Text>
            <Text as="p" size="1" color="gray" mt="1" className="truncate-2">
              {playlist.owner?.display_name || "Spotify"}
            </Text>
          </Box>

          <Flex className="playlist-meta" align="center" justify="end" gap="2" wrap="wrap">
            <Badge color="amber" variant="soft" radius="full">
              {formatNumber(totalTracks)} faixas
            </Badge>
            {playlist.public === false && (
              <Badge color="gray" variant="soft" radius="full">
                privada
              </Badge>
            )}
            {playlist.collaborative && (
              <Badge color="gray" variant="soft" radius="full">
                colaborativa
              </Badge>
            )}
            {spotifyUrl && (
              <Button
                asChild
                size="1"
                variant="soft"
                color="gray"
                onClick={(event) => event.stopPropagation()}
              >
                <a href={spotifyUrl} target="_blank" rel="noreferrer">
                  Abrir
                </a>
              </Button>
            )}
          </Flex>
        </div>
      );
    })}
  </Card>
);
