import { Badge, Box, Card, Flex, Text } from "@radix-ui/themes";
import React from "react";
import { formatNumber } from "../../utils/format";

interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    images?: { url: string }[];
    genres?: string[];
    followers?: { total: number };
  };
  onClick?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  const imageUrl = artist.images?.[0]?.url;
  const genres = artist.genres?.slice(0, 2);

  return (
    <Card className="interactive-card" onClick={onClick}>
      <Box className="media-tile" mb="3">
        {imageUrl ? (
          <img src={imageUrl} alt={artist.name} />
        ) : (
          <Flex height="100%" align="center" justify="center">
            <Text size="6" color="gray" weight="bold">
              SS
            </Text>
          </Flex>
        )}
      </Box>

      <Text as="p" size="3" weight="bold" className="truncate-2">
        {artist.name}
      </Text>

      <Flex gap="2" wrap="wrap" mt="3">
        {genres?.length ? (
          genres.map((genre) => (
            <Badge key={genre} color="green" variant="soft">
              {genre}
            </Badge>
          ))
        ) : (
          <Badge color="gray" variant="soft">
            artista
          </Badge>
        )}
      </Flex>

      {artist.followers?.total !== undefined && (
        <Text as="p" size="1" color="gray" mt="3">
          {formatNumber(artist.followers.total)} seguidores
        </Text>
      )}
    </Card>
  );
};
