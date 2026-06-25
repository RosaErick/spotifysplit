import { Badge, Box, Card, Flex, Text } from "@radix-ui/themes";
import { SpotifyPlaylist } from "../../shared/types/spotify";
import { formatNumber } from "../../utils/format";
import { interactiveProps } from "../Layout/interactive";

type PlaylistCardProps = {
  playlist: SpotifyPlaylist;
  onClick?: () => void;
};

export const PlaylistCard = ({ playlist, onClick }: PlaylistCardProps) => {
  const imageUrl = playlist.images?.[0]?.url;
  const totalTracks = playlist.tracks?.total ?? playlist.items?.total ?? 0;

  return (
    <Card className="interactive-card" {...interactiveProps(onClick)}>
      <Box className="media-tile" mb="3">
        {imageUrl ? (
          <img src={imageUrl} alt={`Capa de ${playlist.name}`} loading="lazy" />
        ) : (
          <Flex height="100%" align="center" justify="center">
            <Text size="6" color="gray" weight="bold">
              PL
            </Text>
          </Flex>
        )}
      </Box>

      <Text as="p" size="3" weight="bold" className="truncate-2">
        {playlist.name}
      </Text>
      <Text as="p" size="2" color="gray" mt="1" className="truncate-2">
        {playlist.owner?.display_name || "Spotify"}
      </Text>

      <Flex gap="2" wrap="wrap" mt="3">
        <Badge color="amber" variant="soft" radius="full">
          {formatNumber(totalTracks)} faixas
        </Badge>
        {playlist.collaborative && (
          <Badge color="gray" variant="soft" radius="full">
            colaborativa
          </Badge>
        )}
      </Flex>
    </Card>
  );
};
