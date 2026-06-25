import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Badge, Box, Button, Card, Flex, Grid, Heading, Link as RadixLink, Text } from "@radix-ui/themes";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/Layout/AppShell";
import { BackButton } from "../components/Layout/BackButton";
import { EmptyState } from "../components/Layout/EmptyState";
import { ErrorState } from "../components/Layout/ErrorState";
import { LoadingState } from "../components/Layout/LoadingState";
import { Reveal } from "../components/Layout/Reveal";
import { Section } from "../components/Layout/Section";
import { TrackRankingList } from "../components/Ranking/RankingLists";
import { TrackCard } from "../components/Track/TrackCard";
import {
  useAlbumTracks,
  useArtistTopTracks,
  useTrack,
} from "../shared/api/queries";
import { SpotifyTrack } from "../shared/types/spotify";
import { formatDuration } from "../utils/format";

const TrackPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trackQuery = useTrack(id);

  if (trackQuery.isLoading) {
    return (
      <AppShell>
        <LoadingState label="Carregando faixa" />
      </AppShell>
    );
  }

  if (trackQuery.isError || !trackQuery.data) {
    return (
      <AppShell>
        <ErrorState error={trackQuery.error} onRetry={trackQuery.refetch} />
      </AppShell>
    );
  }

  const track = trackQuery.data;

  return (
    <AppShell>
      <Reveal>
      <Card className="hero-panel" size="3">
        <Grid columns={{ initial: "1", md: "280px 1fr" }} gap="5" align="center">
          <Box className="media-tile" style={{ borderRadius: "var(--radius-5)" }}>
            {track.album?.images?.[0]?.url && (
              <img src={track.album.images[0].url} alt={track.name} />
            )}
          </Box>

          <Box>
            <Flex align="start" justify="between" gap="3" wrap="wrap">
              <Box minWidth="0" flexGrow="1">
                <Text as="p" size="1" weight="bold" className="section-eyebrow">
                  Faixa
                </Text>
                <Heading size={{ initial: "6", sm: "8" }} mt="2">
                  {track.name}
                </Heading>
              </Box>
              <BackButton />
            </Flex>
            {track.album?.id && (
              <RadixLink asChild>
                <Link to={`/albums/${track.album.id}`}>
                  <Badge color="gray" variant="surface" mt="3">
                    {track.album.name}
                  </Badge>
                </Link>
              </RadixLink>
            )}

            <Flex gap="2" wrap="wrap" mt="4">
              {track.artists?.map((artist) => (
                <RadixLink asChild key={artist.id}>
                  <Link to={`/artists/${artist.id}`}>
                    <Badge variant="soft">
                      {artist.name}
                    </Badge>
                  </Link>
                </RadixLink>
              ))}
            </Flex>

            {track.external_urls?.spotify && (
              <Flex mt="4">
                <Button asChild variant="soft">
                  <a href={track.external_urls.spotify} target="_blank" rel="noreferrer">
                    <OpenInNewWindowIcon />
                    Ouvir no Spotify
                  </a>
                </Button>
              </Flex>
            )}

            <Grid columns={{ initial: "2", sm: "3" }} gap="3" mt="5">
              <Stat label="Duração" value={formatDuration(track.duration_ms)} />
              <Stat label="Popularidade" value={track.popularity ?? "-"} />
              <Stat
                label="Preview"
                value={track.preview_url ? "Disponível" : "Indisponível"}
                compact
              />
            </Grid>

            {track.preview_url && (
              <Box mt="5">
                <audio src={track.preview_url} controls style={{ width: "100%" }} />
              </Box>
            )}
          </Box>
        </Grid>
      </Card>
      </Reveal>

      <TrackDiscovery track={track} currentTrackId={track.id} />
    </AppShell>
  );
};

const TrackDiscovery = ({
  track,
  currentTrackId,
}: {
  track: SpotifyTrack;
  currentTrackId: string;
}) => {
  const navigate = useNavigate();
  const albumTracksQuery = useAlbumTracks(track.album?.id);
  const primaryArtistId = track.artists?.[0]?.id;
  const secondaryArtistId = track.artists?.[1]?.id;
  const primaryArtistTracksQuery = useArtistTopTracks(primaryArtistId);
  const secondaryArtistTracksQuery = useArtistTopTracks(secondaryArtistId);

  const albumTracks = (albumTracksQuery.data?.items ?? [])
    .filter((albumTrack) => albumTrack.id !== currentTrackId)
    .map((albumTrack) => ({
      ...albumTrack,
      album: albumTrack.album ?? track.album,
      artists: albumTrack.artists ?? track.artists,
    }));

  const artistTracks = dedupeTracks([
    ...(primaryArtistTracksQuery.data?.tracks ?? []),
    ...(secondaryArtistTracksQuery.data?.tracks ?? []),
  ]).filter((artistTrack) => artistTrack.id !== currentTrackId);

  const isArtistTracksLoading =
    primaryArtistTracksQuery.isLoading || secondaryArtistTracksQuery.isLoading;
  const isArtistTracksError =
    primaryArtistTracksQuery.isError || secondaryArtistTracksQuery.isError;

  return (
    <>
      <Section title="Mais do mesmo álbum" eyebrow="Mesmo contexto">
        {albumTracksQuery.isLoading && <LoadingState label="Carregando faixas do álbum" />}
        {albumTracksQuery.isError && (
          <ErrorState error={albumTracksQuery.error} onRetry={albumTracksQuery.refetch} />
        )}
        {!albumTracksQuery.isLoading && !albumTracksQuery.isError && albumTracks.length === 0 && (
          <EmptyState message="Nenhuma outra faixa disponível nesse álbum." />
        )}
        {albumTracks.length > 0 && (
          <Grid columns={{ initial: "2", xs: "2", sm: "3", lg: "5" }} gap="4">
            {albumTracks.slice(0, 5).map((albumTrack, index) => (
              <Reveal key={albumTrack.id} delay={Math.min(index, 8) * 0.04}>
                <TrackCard
                  track={albumTrack}
                  onClick={() => navigate(`/tracks/${albumTrack.id}`)}
                />
              </Reveal>
            ))}
          </Grid>
        )}
      </Section>

      <Section title="Mais dos artistas" eyebrow="Top faixas">
        {isArtistTracksLoading && <LoadingState label="Carregando faixas dos artistas" />}
        {isArtistTracksError && (
          <ErrorState
            error={primaryArtistTracksQuery.error ?? secondaryArtistTracksQuery.error}
            onRetry={() => {
              primaryArtistTracksQuery.refetch();
              secondaryArtistTracksQuery.refetch();
            }}
          />
        )}
        {!isArtistTracksLoading && !isArtistTracksError && artistTracks.length === 0 && (
          <EmptyState message="Nenhuma faixa popular disponível para esses artistas." />
        )}
        {artistTracks.length > 0 && (
          <TrackRankingList
            tracks={artistTracks}
            limit={10}
            onSelect={(artistTrack) => navigate(`/tracks/${artistTrack.id}`)}
          />
        )}
      </Section>
    </>
  );
};

const dedupeTracks = (tracks: SpotifyTrack[]) => {
  const seen = new Set<string>();

  return tracks.filter((track) => {
    if (seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  });
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

export default TrackPage;
