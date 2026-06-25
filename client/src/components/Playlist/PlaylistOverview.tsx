import { Grid } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { usePlaylists } from "../../shared/api/queries";
import { EmptyState } from "../Layout/EmptyState";
import { ErrorState } from "../Layout/ErrorState";
import { CardGridSkeleton } from "../Layout/Skeleton";
import { Section } from "../Layout/Section";
import { PlaylistCard } from "./PlaylistCard";

const columns = { initial: "2", xs: "2", sm: "3", lg: "6" };

export const PlaylistOverview = () => {
  const { data, isLoading, isError, error, refetch } = usePlaylists(6, 0);
  const navigate = useNavigate();
  const playlists = data?.items ?? [];

  return (
    <Section title="Playlists" titleTo="/playlists" eyebrow="Biblioteca">
      {isLoading ? (
        <CardGridSkeleton count={6} columns={columns} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : playlists.length === 0 ? (
        <EmptyState message="Nenhuma playlist encontrada por enquanto." />
      ) : (
        <Grid columns={columns} gap="4">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onClick={() => navigate(`/playlists/${playlist.id}`)}
            />
          ))}
        </Grid>
      )}
    </Section>
  );
};
