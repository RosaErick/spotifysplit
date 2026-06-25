import { Grid } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useTopAlbums } from "../../shared/api/queries";
import { EmptyState } from "../Layout/EmptyState";
import { ErrorState } from "../Layout/ErrorState";
import { Reveal } from "../Layout/Reveal";
import { CardGridSkeleton } from "../Layout/Skeleton";
import { Section } from "../Layout/Section";
import { AlbumCard } from "./AlbumCard";

const columns = { initial: "2", xs: "2", sm: "3", lg: "5" };

const TopAlbums = () => {
  const { data, isLoading, isError, error, refetch } = useTopAlbums();
  const navigate = useNavigate();
  const albums = data ?? [];

  return (
    <Section title="Álbuns para investigar" eyebrow="Descoberta">
      {isLoading ? (
        <CardGridSkeleton count={5} columns={columns} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : albums.length === 0 ? (
        <EmptyState message="Nenhum álbum para descobrir por enquanto." />
      ) : (
        <Grid columns={columns} gap="4">
          {albums.map((album, index) => (
            <Reveal key={`${album.id}-${index}`} delay={Math.min(index, 10) * 0.035}>
              <AlbumCard
                album={album}
                onClick={() => navigate(`/albums/${album.id}`)}
              />
            </Reveal>
          ))}
        </Grid>
      )}
    </Section>
  );
};

export default TopAlbums;
