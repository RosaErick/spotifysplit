import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import { PlaylistTrackItem, SpotifyEpisode, SpotifyTrack } from "../../shared/types/spotify";
import { formatDuration } from "../../utils/format";

type PlaylistTrackListProps = {
  items: PlaylistTrackItem[];
  onTrackSelect: (track: SpotifyTrack) => void;
};

const isTrack = (item: SpotifyTrack | SpotifyEpisode): item is SpotifyTrack =>
  "album" in item;

export const PlaylistTrackList = ({ items, onTrackSelect }: PlaylistTrackListProps) => (
  <Card>
    {items.map((item, index) => {
      if (!item.track) return null;

      const media = item.track;
      const spotifyUrl = media.external_urls?.spotify;
      const artists = isTrack(media)
        ? media.artists?.map((artist) => artist.name).join(", ")
        : media.show?.name;
      const imageUrl = isTrack(media)
        ? media.album?.images?.[0]?.url
        : media.images?.[0]?.url;
      const canOpenInternally = isTrack(media);

      return (
        <div
          key={`${media.id}-${item.added_at ?? index}`}
          role={canOpenInternally ? "button" : undefined}
          tabIndex={canOpenInternally ? 0 : undefined}
          className="track-row playlist-track-row"
          onClick={() => canOpenInternally && onTrackSelect(media)}
          onKeyDown={(event) => {
            if (canOpenInternally && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              onTrackSelect(media);
            }
          }}
        >
          <Text size="3" color="amber" className="track-index">
            {index + 1}
          </Text>

          <Box className="playlist-track-thumb">
            {imageUrl && <img src={imageUrl} alt={media.name} loading="lazy" />}
          </Box>

          <Box minWidth="0">
            <Text as="p" size="2" weight="bold" className="truncate-2">
              {media.name}
            </Text>
            <Text as="p" size="1" color="gray" className="truncate-2">
              {artists || "Sem autoria informada"}
            </Text>
          </Box>

          <Flex align="center" justify="end" gap="2">
            <Text size="2" color="gray" weight="medium">
              {formatDuration(media.duration_ms)}
            </Text>
            {spotifyUrl && (
              <Button
                asChild
                size="1"
                variant="soft"
                color="gray"
                onClick={(event) => event.stopPropagation()}
              >
                <a href={spotifyUrl} target="_blank" rel="noreferrer">
                  <OpenInNewWindowIcon />
                  Ouvir
                </a>
              </Button>
            )}
          </Flex>
        </div>
      );
    })}
  </Card>
);
