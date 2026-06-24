import { Box, Card, Flex, Text } from "@radix-ui/themes";
import React from "react";

interface TrackCardProps {
  track: any;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const imageUrl = track?.album?.images?.[0]?.url;
  const artists = track?.artists?.map((artist: any) => artist.name).join(", ");

  return (
    <Card className="interactive-card">
      <Box className="media-tile" mb="3">
        {imageUrl ? (
          <img src={imageUrl} alt={`Capa de ${track.name}`} />
        ) : (
          <Flex height="100%" align="center" justify="center">
            <Text size="6" color="gray" weight="bold">
              ♪
            </Text>
          </Flex>
        )}
      </Box>
      <Text as="p" size="3" weight="bold" className="truncate-2">
        {track.name}
      </Text>
      <Text as="p" size="2" color="gray" mt="1" className="truncate-2">
        {artists}
      </Text>
    </Card>
  );
};
