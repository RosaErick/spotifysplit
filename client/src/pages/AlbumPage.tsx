import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Badge, Box, Button, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/Layout/AppShell";
import { LoadingState } from "../components/Layout/LoadingState";
import { getAlbumById, getAlbumTracks } from "../provider/spotfy";
import { formatDuration } from "../utils/format";

const AlbumPage = () => {
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    getAlbumById(id).then(setAlbum);
    getAlbumTracks(id).then((response) => setTracks(response?.items || []));
  }, [id]);

  const totalDuration = useMemo(
    () => tracks.reduce((acc, track) => acc + track.duration_ms, 0),
    [tracks]
  );

  if (!album) {
    return (
      <AppShell>
        <LoadingState label="Carregando album" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Button variant="soft" color="gray" mb="4" onClick={() => navigate(-1)}>
        <ArrowLeftIcon />
        Voltar
      </Button>

      <Card className="hero-panel">
        <Grid columns={{ initial: "1", md: "280px 1fr" }} gap="5" align="center">
          <Box className="media-tile" style={{ borderRadius: "var(--radius-5)" }}>
            {album?.images?.[0]?.url && (
              <img src={album.images[0].url} alt={album.name} />
            )}
          </Box>

          <Box>
            <Text as="p" size="1" weight="bold" color="green" className="section-eyebrow">
              Album
            </Text>
            <Heading size={{ initial: "6", sm: "8" }} mt="2">
              {album.name}
            </Heading>
            <Flex gap="2" wrap="wrap" mt="4">
              {album.artists?.map((artist: any) => (
                <Badge
                  key={artist.id}
                  color="green"
                  variant="soft"
                  onClick={() => navigate(`/artists/${artist.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {artist.name}
                </Badge>
              ))}
            </Flex>

            <Grid columns={{ initial: "2", sm: "3" }} gap="3" mt="5">
              <Stat label="Faixas" value={album.total_tracks} />
              <Stat label="Duracao" value={formatDuration(totalDuration)} />
              <Stat label="Lancamento" value={album.release_date} compact />
            </Grid>
          </Box>
        </Grid>
      </Card>

      <Box py="5">
        <Text as="p" size="1" weight="bold" color="green" className="section-eyebrow">
          Tracklist
        </Text>
        <Heading size="6" mt="1" mb="4">
          Faixas do album
        </Heading>
        <Card>
          {tracks.map((track, index) => (
            <button
              key={track.id}
              type="button"
              onClick={() => navigate(`/tracks/${track.id}`)}
              className="track-row"
            >
              <Text size="2" color="gray" weight="bold">
                {index + 1}
              </Text>
              <Box>
                <Text as="p" size="2" weight="bold">
                  {track.name}
                </Text>
                <Text as="p" size="1" color="gray">
                  {track.artists?.map((artist: any) => artist.name).join(", ")}
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
