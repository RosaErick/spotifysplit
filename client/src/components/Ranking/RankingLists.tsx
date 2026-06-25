import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Badge, Box, Card, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { KeyboardEvent } from "react";
import { SpotifyArtist, SpotifyTrack } from "../../shared/types/spotify";
import { formatDuration, formatNumber } from "../../utils/format";

type ArtistRankingListProps = {
  artists: SpotifyArtist[];
  onSelect: (artist: SpotifyArtist) => void;
  limit?: number;
};

type TrackRankingListProps = {
  tracks: SpotifyTrack[];
  onSelect: (track: SpotifyTrack) => void;
  limit?: number;
};

const artistGenresLabel = (artist: SpotifyArtist) =>
  artist.genres?.slice(0, 2).join(", ") || "Sem gênero informado";

const handleSelectableKeyDown = <T,>(
  event: KeyboardEvent<HTMLDivElement>,
  item: T,
  onSelect: (item: T) => void
) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect(item);
  }
};

export const ArtistRankingList = ({
  artists,
  onSelect,
  limit,
}: ArtistRankingListProps) => (
  <Card className="ranking-list">
    {artists.slice(0, limit).map((artist, index) => {
      const genres = artistGenresLabel(artist);

      return (
        <div
          key={artist.id}
          role="button"
          tabIndex={0}
          className="ranking-row artist-ranking-row"
          onClick={() => onSelect(artist)}
          onKeyDown={(event) => handleSelectableKeyDown(event, artist, onSelect)}
        >
          <Text size="4" weight="bold" className="ranking-index">
            {String(index + 1).padStart(2, "0")}
          </Text>

          <Box className="ranking-thumb">
            {artist.images?.[0]?.url && (
              <img src={artist.images[0].url} alt={artist.name} loading="lazy" />
            )}
          </Box>

          <Box className="ranking-copy">
            <Text as="p" size="3" weight="bold" className="ranking-title">
              {artist.name}
            </Text>
            <Text
              as="p"
              size="1"
              color="gray"
              className="ranking-subtitle"
              title={`${artist.name}: ${genres}`}
            >
              {genres}
            </Text>
          </Box>

          <Flex
            className="ranking-meta artist-ranking-meta"
            direction="column"
            align="end"
            gap="1"
          >
            <Badge color="amber" variant="soft" radius="full">
              {artist.popularity ?? "-"} pop.
            </Badge>
            {artist.followers?.total !== undefined && (
              <Text size="1" color="gray">
                {formatNumber(artist.followers.total)}
              </Text>
            )}
          </Flex>
        </div>
      );
    })}
  </Card>
);

export const TrackRankingList = ({
  tracks,
  onSelect,
  limit,
}: TrackRankingListProps) => {
  return (
    <Card className="ranking-list">
      {tracks.slice(0, limit).map((track, index) => {
        const artists = track.artists?.map((artist) => artist.name).join(", ");
        const spotifyUrl = track.external_urls?.spotify;

        return (
          <div
            key={track.id}
            role="button"
            tabIndex={0}
            className="ranking-row track-ranking-row"
            onClick={() => onSelect(track)}
            onKeyDown={(event) => handleSelectableKeyDown(event, track, onSelect)}
          >
            <Text size="4" weight="bold" className="ranking-index">
              {String(index + 1).padStart(2, "0")}
            </Text>

            <Box className="ranking-thumb">
              {track.album?.images?.[0]?.url && (
                <img src={track.album.images[0].url} alt={track.name} loading="lazy" />
              )}
            </Box>

            <Box className="ranking-copy">
              <Text as="p" size="3" weight="bold" className="ranking-title">
                {track.name}
              </Text>
              <Text as="p" size="1" color="gray" className="ranking-subtitle">
                {artists}
              </Text>
            </Box>

            <Flex className="ranking-meta" direction="column" align="end" gap="1">
              <Badge className="ranking-secondary" color="amber" variant="soft" radius="full">
                {track.popularity ?? "-"} pop.
              </Badge>
              <Flex className="ranking-meta-row" align="center" justify="end" gap="2">
                <Text className="ranking-secondary" size="1" color="gray">
                  {formatDuration(track.duration_ms)}
                </Text>
                {spotifyUrl && (
                  <Tooltip content="Ouvir no Spotify">
                    <IconButton
                      asChild
                      size="1"
                      variant="soft"
                      color="gray"
                      radius="full"
                      className="ranking-listen-action"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <a
                        href={spotifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Ouvir no Spotify"
                      >
                        <OpenInNewWindowIcon />
                      </a>
                    </IconButton>
                  </Tooltip>
                )}
              </Flex>
            </Flex>
          </div>
        );
      })}
    </Card>
  );
};
