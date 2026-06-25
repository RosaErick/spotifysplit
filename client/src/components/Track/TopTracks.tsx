import { Grid } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useTopTracks } from "../../shared/api/queries";
import { EmptyState } from "../Layout/EmptyState";
import { ErrorState } from "../Layout/ErrorState";
import { Reveal } from "../Layout/Reveal";
import { CardGridSkeleton } from "../Layout/Skeleton";
import { Section } from "../Layout/Section";
import { TrackCard } from "./TrackCard";

const columns = { initial: "2", xs: "2", sm: "3", lg: "5" };

const TopTracks = () => {
  const { data, isLoading, isError, error, refetch } = useTopTracks();
  const navigate = useNavigate();
  const tracks = data?.items ?? [];

  return (
    <Section title="Faixas que definem seu momento" eyebrow="Mais ouvidas">
      {isLoading ? (
        <CardGridSkeleton count={5} columns={columns} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : tracks.length === 0 ? (
        <EmptyState message="Nenhuma faixa em destaque por enquanto." />
      ) : (
        <Grid columns={columns} gap="4">
          {tracks.map((track, index) => (
            <Reveal key={track.id} delay={Math.min(index, 10) * 0.035}>
              <TrackCard
                track={track}
                onClick={() => navigate(`/tracks/${track.id}`)}
              />
            </Reveal>
          ))}
        </Grid>
      )}
    </Section>
  );
};

export default TopTracks;
