import { ArrowLeftIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  CheckboxCards,
  Flex,
  Grid,
  Text,
  TextField,
} from "@radix-ui/themes";
import type React from "react";
import { Component, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlbumCard } from "../components/Album/AlbumCard";
import { ArtistCard } from "../components/Artist/ArtistCard";
import { AppShell } from "../components/Layout/AppShell";
import { EmptyState } from "../components/Layout/EmptyState";
import { ErrorState } from "../components/Layout/ErrorState";
import { LoadingState } from "../components/Layout/LoadingState";
import { MediaCard } from "../components/Media/MediaCard";
import { PlaylistCard } from "../components/Playlist/PlaylistCard";
import { Section } from "../components/Layout/Section";
import { TrackCard } from "../components/Track/TrackCard";
import { useSearchSpotify } from "../shared/api/queries";

const baseSearchTypes = ["track", "artist", "album"];
const columns = { initial: "2", xs: "2", sm: "3", lg: "5" };

type OptionalType = "playlist" | "show" | "episode";

const optionalTypes: Array<{
  value: OptionalType;
  label: string;
  description: string;
}> = [
  {
    value: "playlist",
    label: "Playlists",
    description: "Inclui playlists públicas e acessíveis",
  },
  {
    value: "show",
    label: "Shows",
    description: "Inclui podcasts disponíveis no catálogo",
  },
  {
    value: "episode",
    label: "Episódios",
    description: "Inclui episódios de shows disponíveis",
  },
];

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [extraTypes, setExtraTypes] = useState<OptionalType[]>([]);
  const navigate = useNavigate();
  const searchTypes = useMemo(
    () => [...baseSearchTypes, ...extraTypes],
    [extraTypes]
  );
  const searchQuery = useSearchSpotify(query.trim(), searchTypes);
  const results = searchQuery.data;
  const hasQuery = query.trim().length >= 2;
  const tracks = compact(results?.tracks?.items);
  const albums = compact(results?.albums?.items);
  const artists = compact(results?.artists?.items);
  const playlists = compact(results?.playlists?.items);
  const shows = compact(results?.shows?.items);
  const episodes = compact(results?.episodes?.items);
  const totalResults =
    tracks.length +
    albums.length +
    artists.length +
    playlists.length +
    shows.length +
    episodes.length;

  return (
    <AppShell>
      <Button variant="soft" color="gray" mb="4" onClick={() => navigate(-1)}>
        <ArrowLeftIcon />
        Voltar
      </Button>

      <Section title="Busca global" eyebrow="Catálogo Spotify">
        <Card className="filter-panel" mb="5">
          <Flex direction="column" gap="4">
            <Box>
              <TextField.Root
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar músicas, artistas e álbuns"
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon />
                </TextField.Slot>
              </TextField.Root>
              <Text as="p" size="1" color="gray" mt="3">
                A busca principal usa tipos estáveis no Brasil: músicas, artistas e álbuns.
              </Text>
            </Box>

            <Box>
              <Text as="p" size="2" weight="bold" mb="2">
                Incluir também
              </Text>
              <CheckboxCards.Root
                columns={{ initial: "1", sm: "3" }}
                value={extraTypes}
                onValueChange={(value: string[]) => setExtraTypes(value as OptionalType[])}
              >
                {optionalTypes.map((type) => (
                  <CheckboxCards.Item key={type.value} value={type.value}>
                    <Flex direction="column" width="100%">
                      <Text weight="bold">{type.label}</Text>
                      <Text size="1" color="gray">
                        {type.description}
                      </Text>
                    </Flex>
                  </CheckboxCards.Item>
                ))}
              </CheckboxCards.Root>
            </Box>
          </Flex>
        </Card>

        <SearchBoundary boundaryKey={`${query}:${searchTypes.join(",")}`}>
          {!hasQuery && <EmptyState message="Digite algo para começar a busca." />}
          {hasQuery && searchQuery.isLoading && <LoadingState label="Buscando no Spotify" />}
          {hasQuery && searchQuery.isError && (
            <ErrorState error={searchQuery.error} onRetry={searchQuery.refetch} />
          )}
          {hasQuery && !searchQuery.isLoading && !searchQuery.isError && totalResults === 0 && (
            <EmptyState message="Nenhum resultado encontrado." />
          )}

          {tracks.length ? (
            <ResultSection title="Músicas">
              {tracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onClick={() => navigate(`/tracks/${track.id}`)}
                />
              ))}
            </ResultSection>
          ) : null}

          {artists.length ? (
            <ResultSection title="Artistas">
              {artists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onClick={() => navigate(`/artists/${artist.id}`)}
                />
              ))}
            </ResultSection>
          ) : null}

          {albums.length ? (
            <ResultSection title="Álbuns">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => navigate(`/albums/${album.id}`)}
                />
              ))}
            </ResultSection>
          ) : null}

          {playlists.length ? (
            <ResultSection title="Playlists">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onClick={() => navigate(`/playlists/${playlist.id}`)}
                />
              ))}
            </ResultSection>
          ) : null}

          {shows.length ? (
            <ResultSection title="Shows">
              {shows.map((show) => (
                <MediaCard
                  key={show.id}
                  title={show.name}
                  subtitle={show.publisher}
                  imageUrl={show.images?.[0]?.url}
                  fallback="SH"
                  externalUrl={show.external_urls?.spotify}
                />
              ))}
            </ResultSection>
          ) : null}

          {episodes.length ? (
            <ResultSection title="Episódios">
              {episodes.map((episode) => (
                <MediaCard
                  key={episode.id}
                  title={episode.name}
                  subtitle={episode.show?.name}
                  imageUrl={episode.images?.[0]?.url}
                  fallback="EP"
                  externalUrl={episode.external_urls?.spotify}
                />
              ))}
            </ResultSection>
          ) : null}
        </SearchBoundary>
      </Section>
    </AppShell>
  );
};

const compact = <T,>(items?: Array<T | null>): T[] =>
  (items ?? []).filter((item): item is T => Boolean(item));

const ResultSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Box mb="6">
    <Text as="p" size="2" weight="bold" mb="3">
      {title}
    </Text>
    <Grid columns={columns} gap="4">
      {children}
    </Grid>
  </Box>
);

class SearchBoundary extends Component<
  { boundaryKey: string; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: { boundaryKey: string }) {
    if (previousProps.boundaryKey !== this.props.boundaryKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState message="A busca retornou um item indisponível. Ajuste os filtros e tente novamente." />
      );
    }

    return this.props.children;
  }
}

export default SearchPage;
