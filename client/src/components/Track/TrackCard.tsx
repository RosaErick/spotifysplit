import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import React from "react";
import { SpotifyTrack } from "../../shared/types/spotify";
import { interactiveProps } from "../Layout/interactive";

interface TrackCardProps {
  track: SpotifyTrack;
  onClick?: () => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, onClick }) => {
  const imageUrl = track.album?.images?.[0]?.url;
  const artists = track.artists?.map((artist) => artist.name).join(", ");
  const spotifyUrl = track.external_urls?.spotify;

  return (
    <Card className="interactive-card" {...interactiveProps(onClick)}>
      <Box className="media-tile" mb="3">
        {imageUrl ? (
          <img src={imageUrl} alt={`Capa de ${track.name}`} loading="lazy" />
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
      {spotifyUrl && (
        <Button
          asChild
          size="1"
          variant="soft"
          color="gray"
          mt="3"
          onClick={(event) => event.stopPropagation()}
        >
          <a href={spotifyUrl} target="_blank" rel="noreferrer">
            <OpenInNewWindowIcon />
            Ouvir
          </a>
        </Button>
      )}
    </Card>
  );
};
