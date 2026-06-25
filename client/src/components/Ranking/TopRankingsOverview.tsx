import { Grid } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useTopArtists, useTopTracks } from "../../shared/api/queries";
import { EmptyState } from "../Layout/EmptyState";
import { ErrorState } from "../Layout/ErrorState";
import { LoadingState } from "../Layout/LoadingState";
import { Section } from "../Layout/Section";
import { ArtistRankingList, TrackRankingList } from "./RankingLists";

export const TopRankingsOverview = () => {
  const artistsQuery = useTopArtists("long_term", 10);
  const tracksQuery = useTopTracks("long_term", 10);
  const navigate = useNavigate();

  const artists = artistsQuery.data?.items ?? [];
  const tracks = tracksQuery.data?.items ?? [];

  return (
    <Grid columns={{ initial: "1", lg: "1fr 1fr" }} gap={{ initial: "2", lg: "6" }}>
      <Section
        title="Top artistas do último ano"
        titleTo="/top-artists"
        eyebrow="Ranking pessoal"
      >
        {artistsQuery.isLoading ? (
          <LoadingState label="Carregando artistas" />
        ) : artistsQuery.isError ? (
          <ErrorState error={artistsQuery.error} onRetry={artistsQuery.refetch} />
        ) : artists.length === 0 ? (
          <EmptyState message="Nenhum artista em destaque por enquanto." />
        ) : (
          <ArtistRankingList
            artists={artists}
            onSelect={(artist) => navigate(`/artists/${artist.id}`)}
          />
        )}
      </Section>

      <Section
        title="Top faixas do último ano"
        titleTo="/top-tracks"
        eyebrow="Mais ouvidas"
      >
        {tracksQuery.isLoading ? (
          <LoadingState label="Carregando faixas" />
        ) : tracksQuery.isError ? (
          <ErrorState error={tracksQuery.error} onRetry={tracksQuery.refetch} />
        ) : tracks.length === 0 ? (
          <EmptyState message="Nenhuma faixa em destaque por enquanto." />
        ) : (
          <TrackRankingList
            tracks={tracks}
            onSelect={(track) => navigate(`/tracks/${track.id}`)}
          />
        )}
      </Section>
    </Grid>
  );
};
