import { Grid, Tabs } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { AlbumCard } from "../components/Album/AlbumCard";
import { AppShell } from "../components/Layout/AppShell";
import { BackButton } from "../components/Layout/BackButton";
import { EmptyState } from "../components/Layout/EmptyState";
import { ErrorState } from "../components/Layout/ErrorState";
import { CardGridSkeleton } from "../components/Layout/Skeleton";
import { MediaCard } from "../components/Media/MediaCard";
import { Section } from "../components/Layout/Section";
import { TrackCard } from "../components/Track/TrackCard";
import {
  useSavedAlbums,
  useSavedAudiobooks,
  useSavedEpisodes,
  useSavedShows,
  useSavedTracks,
} from "../shared/api/queries";
import {
  SavedAlbumItem,
  SavedAudiobookItem,
  SavedEpisodeItem,
  SavedShowItem,
  SavedTrackItem,
} from "../shared/types/spotify";
import { formatDuration } from "../utils/format";

const columns = { initial: "2", xs: "2", sm: "3", lg: "5" };

const LibraryPage = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      <Section
        title="Biblioteca salva"
        eyebrow="Sua coleção"
        action={<BackButton />}
        withSeparator={false}
      >
        <Tabs.Root defaultValue="tracks">
          <Tabs.List mb="5">
            <Tabs.Trigger value="tracks">Músicas Curtidas</Tabs.Trigger>
            <Tabs.Trigger value="albums">Álbuns</Tabs.Trigger>
            <Tabs.Trigger value="shows">Shows</Tabs.Trigger>
            <Tabs.Trigger value="episodes">Episódios</Tabs.Trigger>
            <Tabs.Trigger value="audiobooks">Audiobooks</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="tracks">
            <SavedTracksGrid onTrackSelect={(id) => navigate(`/tracks/${id}`)} />
          </Tabs.Content>
          <Tabs.Content value="albums">
            <SavedAlbumsGrid onAlbumSelect={(id) => navigate(`/albums/${id}`)} />
          </Tabs.Content>
          <Tabs.Content value="shows">
            <SavedShowsGrid />
          </Tabs.Content>
          <Tabs.Content value="episodes">
            <SavedEpisodesGrid />
          </Tabs.Content>
          <Tabs.Content value="audiobooks">
            <SavedAudiobooksGrid />
          </Tabs.Content>
        </Tabs.Root>
      </Section>
    </AppShell>
  );
};

const SavedTracksGrid = ({ onTrackSelect }: { onTrackSelect: (id: string) => void }) => {
  const query = useSavedTracks();
  const items = query.data?.items ?? [];

  if (query.isLoading) return <CardGridSkeleton count={10} columns={columns} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (items.length === 0) return <EmptyState message="Nenhuma música curtida encontrada." />;

  return (
    <Grid columns={columns} gap="4">
      {items.map(({ track }: SavedTrackItem) => (
        <TrackCard key={track.id} track={track} onClick={() => onTrackSelect(track.id)} />
      ))}
    </Grid>
  );
};

const SavedAlbumsGrid = ({ onAlbumSelect }: { onAlbumSelect: (id: string) => void }) => {
  const query = useSavedAlbums();
  const items = query.data?.items ?? [];

  if (query.isLoading) return <CardGridSkeleton count={10} columns={columns} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (items.length === 0) return <EmptyState message="Nenhum álbum salvo encontrado." />;

  return (
    <Grid columns={columns} gap="4">
      {items.map(({ album }: SavedAlbumItem) => (
        <AlbumCard key={album.id} album={album} onClick={() => onAlbumSelect(album.id)} />
      ))}
    </Grid>
  );
};

const SavedShowsGrid = () => {
  const query = useSavedShows();
  const items = query.data?.items ?? [];

  if (query.isLoading) return <CardGridSkeleton count={10} columns={columns} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (items.length === 0) return <EmptyState message="Nenhum show salvo encontrado." />;

  return (
    <Grid columns={columns} gap="4">
      {items.map(({ show }: SavedShowItem) => (
        <MediaCard
          key={show.id}
          title={show.name}
          subtitle={show.publisher}
          imageUrl={show.images?.[0]?.url}
          fallback="SH"
          externalUrl={show.external_urls?.spotify}
        />
      ))}
    </Grid>
  );
};

const SavedEpisodesGrid = () => {
  const query = useSavedEpisodes();
  const items = query.data?.items ?? [];

  if (query.isLoading) return <CardGridSkeleton count={10} columns={columns} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (items.length === 0) return <EmptyState message="Nenhum episódio salvo encontrado." />;

  return (
    <Grid columns={columns} gap="4">
      {items.map(({ episode }: SavedEpisodeItem) => (
        <MediaCard
          key={episode.id}
          title={episode.name}
          subtitle={`${episode.show?.name ?? "Episódio"} • ${formatDuration(episode.duration_ms)}`}
          imageUrl={episode.images?.[0]?.url}
          fallback="EP"
          externalUrl={episode.external_urls?.spotify}
        />
      ))}
    </Grid>
  );
};

const SavedAudiobooksGrid = () => {
  const query = useSavedAudiobooks();
  const items = query.data?.items ?? [];

  if (query.isLoading) return <CardGridSkeleton count={10} columns={columns} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (items.length === 0) return <EmptyState message="Nenhum audiobook salvo encontrado." />;

  return (
    <Grid columns={columns} gap="4">
      {items.map(({ audiobook }: SavedAudiobookItem) => (
        <MediaCard
          key={audiobook.id}
          title={audiobook.name}
          subtitle={audiobook.authors?.map((author) => author.name).join(", ")}
          imageUrl={audiobook.images?.[0]?.url}
          fallback="AB"
          externalUrl={audiobook.external_urls?.spotify}
        />
      ))}
    </Grid>
  );
};

export default LibraryPage;
