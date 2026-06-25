import { Grid } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useTopArtists } from "../../shared/api/queries";
import { EmptyState } from "../Layout/EmptyState";
import { ErrorState } from "../Layout/ErrorState";
import { Reveal } from "../Layout/Reveal";
import { CardGridSkeleton } from "../Layout/Skeleton";
import { Section } from "../Layout/Section";
import { ArtistCard } from "./ArtistCard";

const columns = { initial: "1", xs: "2", md: "3", lg: "4" };

export const TopArtists = () => {
  const { data, isLoading, isError, error, refetch } = useTopArtists();
  const navigate = useNavigate();
  const artists = data?.items ?? [];

  return (
    <Section title="Artistas em alta para você" eyebrow="Top pessoal">
      {isLoading ? (
        <CardGridSkeleton count={4} columns={columns} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : artists.length === 0 ? (
        <EmptyState message="Nenhum artista em alta por enquanto." />
      ) : (
        <Grid columns={columns} gap="4">
          {artists.map((artist, index) => (
            <Reveal key={artist.id} delay={Math.min(index, 8) * 0.04}>
              <ArtistCard
                artist={artist}
                onClick={() => navigate(`/artists/${artist.id}`)}
              />
            </Reveal>
          ))}
        </Grid>
      )}
    </Section>
  );
};
