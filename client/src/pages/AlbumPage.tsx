import { Badge, Box, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/Layout/AppShell";
import { BackButton } from "../components/Layout/BackButton";
import { ErrorState } from "../components/Layout/ErrorState";
import { LoadingState } from "../components/Layout/LoadingState";
import { Reveal } from "../components/Layout/Reveal";
import { useAlbum, useAlbumTracks } from "../shared/api/queries";
import { formatDuration } from "../utils/format";

const AlbumPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const albumQuery = useAlbum(id);
  const tracksQuery = useAlbumTracks(id);
  const tracks = tracksQuery.data?.items ?? [];

  const totalDuration = useMemo(
    () => tracks.reduce((acc, track) => acc + (track.duration_ms ?? 0), 0),
    [tracks]
  );

  if (albumQuery.isLoading) {
    return (
      <AppShell>
        <LoadingState label="Carregando álbum" />
      </AppShell>
    );
  }

  if (albumQuery.isError || !albumQuery.data) {
    return (
      <AppShell>
        <ErrorState error={albumQuery.error} onRetry={albumQuery.refetch} />
      </AppShell>
    );
  }

  const album = albumQuery.data;

  return (
    <AppShell>
      <Reveal>
      <Card className="hero-panel" size="3">
        <Grid columns={{ initial: "1", md: "280px 1fr" }} gap="5" align="center">
          <Box className="media-tile" style={{ borderRadius: "var(--radius-5)" }}>
            {album.images?.[0]?.url && (
              <img src={album.images[0].url} alt={album.name} />
            )}
          </Box>

          <Box>
            <Flex align="start" justify="between" gap="3" wrap="wrap">
              <Box minWidth="0" flexGrow="1">
                <Text as="p" size="1" weight="bold" className="section-eyebrow">
                  Álbum
                </Text>
                <Heading size={{ initial: "6", sm: "8" }} mt="2">
                  {album.name}
                </Heading>
              </Box>
              <BackButton />
            </Flex>
            <Flex gap="2" wrap="wrap" mt="4">
              {album.artists?.map((artist) => (
                <Badge
                  key={artist.id}
                  variant="soft"
                  onClick={() => navigate(`/artists/${artist.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {artist.name}
                </Badge>
              ))}
            </Flex>

            <Grid columns={{ initial: "2", sm: "3" }} gap="3" mt="5">
              <Stat label="Faixas" value={album.total_tracks ?? tracks.length} />
              <Stat label="Duração" value={formatDuration(totalDuration)} />
              <Stat label="Lançamento" value={album.release_date ?? "-"} compact />
            </Grid>
          </Box>
        </Grid>
      </Card>
      </Reveal>

      <Box py="5">
        <Text as="p" size="1" weight="bold" className="section-eyebrow">
          Tracklist
        </Text>
        <Heading size="6" mt="1" mb="4">
          Faixas do álbum
        </Heading>
        <Card>
          {tracks.map((track, index) => (
            <button
              key={track.id}
              type="button"
              onClick={() => navigate(`/tracks/${track.id}`)}
              className="track-row"
            >
              <Text size="3" className="track-index">
                {index + 1}
              </Text>
              <Box>
                <Text as="p" size="2" weight="bold">
                  {track.name}
                </Text>
                <Text as="p" size="1" color="gray">
                  {track.artists?.map((artist) => artist.name).join(", ")}
                </Text>
              </Box>
              <Text size="2" color="gray" weight="medium">
                {formatDuration(track.duration_ms)}
              </Text>
            </button>
          ))}
        </Card>
      </Box>
    </AppShell>
  );
};

const Stat = ({
  label,
  value,
  compact,
}: {
  label: string;
  value: string | number;
  compact?: boolean;
}) => (
  <Card variant="surface">
    <Text as="p" size="1" color="gray">
      {label}
    </Text>
    <Text as="p" size={compact ? "2" : "5"} weight="bold" mt="1">
      {value}
    </Text>
  </Card>
);

export default AlbumPage;
