import { Badge, Box, Card, Flex, Text } from "@radix-ui/themes";
import React from "react";
import { SpotifyArtist } from "../../shared/types/spotify";
import { formatNumber, topGenres } from "../../utils/format";
import { interactiveProps } from "../Layout/interactive";

interface ArtistCardProps {
  artist: SpotifyArtist;
  onClick?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  const imageUrl = artist.images?.[0]?.url;
  const genres = topGenres(artist.genres);

  return (
    <Card className="interactive-card" {...interactiveProps(onClick)}>
      <Box className="media-tile" mb="3">
        {imageUrl ? (
          <img src={imageUrl} alt={artist.name} loading="lazy" />
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
            <Badge key={genre} variant="soft" radius="full">
              {genre}
            </Badge>
          ))
        ) : (
          <Badge color="gray" variant="soft" radius="full">
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
