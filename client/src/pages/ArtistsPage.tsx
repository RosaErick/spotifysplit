import { Avatar, Box, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useNavigate, useParams } from "react-router-dom";
import { ArtistCard } from "../components/Artist/ArtistCard";
import { AppShell } from "../components/Layout/AppShell";
import { BackButton } from "../components/Layout/BackButton";
import { EmptyState } from "../components/Layout/EmptyState";
import { ErrorState } from "../components/Layout/ErrorState";
import { FeatureUnavailableState } from "../components/Layout/FeatureUnavailableState";
import { LoadingState } from "../components/Layout/LoadingState";
import { Reveal } from "../components/Layout/Reveal";
import { Section } from "../components/Layout/Section";
import { TrackRankingList } from "../components/Ranking/RankingLists";
import { useArtist, useArtistTopTracks, useRelatedArtists } from "../shared/api/queries";
import { formatGenresLabel, formatNumber } from "../utils/format";

const ArtistPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const artistQuery = useArtist(id);
  const topTracksQuery = useArtistTopTracks(id);
  const relatedQuery = useRelatedArtists(id);
  const relatedArtists = relatedQuery.data?.artists ?? [];
  const topTracks = topTracksQuery.data?.tracks ?? [];

  if (artistQuery.isLoading) {
    return (
      <AppShell>
        <LoadingState label="Carregando artista" />
      </AppShell>
    );
  }

  if (artistQuery.isError || !artistQuery.data) {
    return (
      <AppShell>
        <ErrorState error={artistQuery.error} onRetry={artistQuery.refetch} />
      </AppShell>
    );
  }

  const artist = artistQuery.data;

  return (
    <AppShell>
      <Reveal>
      <Card className="hero-panel" size="3">
        <Grid columns={{ initial: "1", md: "280px 1fr" }} gap="5" align="center">
          <Avatar
            src={artist.images?.[0]?.url}
            fallback="SS"
            size="9"
            radius="large"
          />
          <Box>
            <Flex align="start" justify="between" gap="3" wrap="wrap">
              <Box minWidth="0" flexGrow="1">
                <Text as="p" size="1" weight="bold" className="section-eyebrow">
                  Artista
                </Text>
                <Heading size={{ initial: "7", sm: "8" }} mt="2">
                  {artist.name}
                </Heading>
              </Box>
              <BackButton />
            </Flex>
            <Grid columns={{ initial: "1", sm: "3" }} gap="3" mt="5">
              <Stat label="Popularidade" value={artist.popularity ?? "-"} />
              <Stat label="Seguidores" value={formatNumber(artist.followers?.total)} />
              <Stat
                label="Gêneros"
                value={formatGenresLabel(artist.genres, "Não informado")}
                compact
              />
            </Grid>
          </Box>
        </Grid>
      </Card>
      </Reveal>

      <Section title="Faixas essenciais" eyebrow="Top do artista">
        {topTracksQuery.isLoading && <LoadingState label="Carregando faixas do artista" />}
        {topTracksQuery.isError && (
          <ErrorState error={topTracksQuery.error} onRetry={topTracksQuery.refetch} />
        )}
        {!topTracksQuery.isLoading && !topTracksQuery.isError && topTracks.length === 0 && (
          <EmptyState message="Nenhuma faixa principal disponível para este artista." />
        )}
        {topTracks.length > 0 && (
          <TrackRankingList
            tracks={topTracks}
            onSelect={(track) => navigate(`/tracks/${track.id}`)}
            limit={10}
          />
        )}
      </Section>

      <Section title="Artistas relacionados" eyebrow="Continue explorando">
        {relatedQuery.isLoading && <LoadingState label="Carregando artistas relacionados" />}
        {relatedQuery.isError && (
          <FeatureUnavailableState
            title="Artistas relacionados indisponíveis"
            description="O Spotify não retornou dados confiáveis para este artista ou não liberou esse endpoint para este app. Para evitar relações musicais erradas, esta seção não usa fallback."
            onRetry={relatedQuery.refetch}
          />
        )}
        {!relatedQuery.isLoading && !relatedQuery.isError && relatedArtists.length === 0 && (
          <EmptyState message="Nenhum artista relacionado disponível agora." />
        )}
        {relatedArtists.length > 0 && (
          <Grid columns={{ initial: "1", xs: "2", md: "3", lg: "4" }} gap="4">
            {relatedArtists.map((relatedArtist, index) => (
              <Reveal key={relatedArtist.id} delay={Math.min(index, 8) * 0.04}>
              <ArtistCard
                artist={relatedArtist}
                onClick={() => navigate(`/artists/${relatedArtist.id}`)}
              />
              </Reveal>
            ))}
          </Grid>
        )}
      </Section>
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
    <Text as="p" size={compact ? "2" : "5"} weight="bold" mt="1" className="truncate-2">
      {value}
    </Text>
  </Card>
);

export default ArtistPage;
