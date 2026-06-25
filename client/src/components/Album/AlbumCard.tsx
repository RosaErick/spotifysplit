import { Badge, Box, Card, Flex, Text } from "@radix-ui/themes";
import React from "react";
import { SpotifyAlbum } from "../../shared/types/spotify";
import { interactiveProps } from "../Layout/interactive";

interface AlbumCardProps {
  album: SpotifyAlbum;
  onClick?: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
  const imageUrl = album.images?.[0]?.url;
  const artists = album.artists?.map((artist) => artist.name).join(", ");

  return (
    <Card className="interactive-card" {...interactiveProps(onClick)}>
      <Box className="media-tile" mb="3">
        {imageUrl ? (
          <img src={imageUrl} alt={`Capa de ${album.name}`} loading="lazy" />
        ) : (
          <Flex height="100%" align="center" justify="center">
            <Text size="6" color="gray" weight="bold">
              LP
            </Text>
          </Flex>
        )}
      </Box>
      <Text as="p" size="3" weight="bold" className="truncate-2">
        {album.name}
      </Text>
      <Text as="p" size="2" color="gray" mt="1" className="truncate-2">
        {artists}
      </Text>
      {album.release_date && (
        <Badge color="amber" variant="soft" radius="full" mt="3">
          {album.release_date}
        </Badge>
      )}
    </Card>
  );
};
