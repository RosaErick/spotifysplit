import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Box,
  Card,
  Flex,
  Grid,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/Layout/AppShell";
import { BackButton } from "../components/Layout/BackButton";
import { EmptyState } from "../components/Layout/EmptyState";
import { ErrorState } from "../components/Layout/ErrorState";
import { LoadingState } from "../components/Layout/LoadingState";
import { Section } from "../components/Layout/Section";
import { PlaylistList } from "../components/Playlist/PlaylistList";
import { useAllPlaylists, useUserProfile } from "../shared/api/queries";
import { SpotifyPlaylist } from "../shared/types/spotify";

type OwnershipFilter = "all" | "mine" | "followed";
type VisibilityFilter = "all" | "public" | "private" | "collaborative";
type SortMode = "name" | "tracks" | "owner";

const trackTotalOf = (playlist: SpotifyPlaylist) =>
  playlist.tracks?.total ?? playlist.items?.total ?? 0;

const PlaylistsPage = () => {
  const [search, setSearch] = useState("");
  const [ownership, setOwnership] = useState<OwnershipFilter>("all");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const navigate = useNavigate();

  const playlistsQuery = useAllPlaylists();
  const profileQuery = useUserProfile();
  const userId = profileQuery.data?.id;
  const playlists = playlistsQuery.data ?? [];

  const filteredPlaylists = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return playlists
      .filter((playlist) => {
        const haystack = [
          playlist.name,
          playlist.description,
          playlist.owner?.display_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return !normalizedSearch || haystack.includes(normalizedSearch);
      })
      .filter((playlist) => {
        if (ownership === "all" || !userId) return true;
        if (ownership === "mine") return playlist.owner?.id === userId;
        return playlist.owner?.id !== userId;
      })
      .filter((playlist) => {
        if (visibility === "all") return true;
        if (visibility === "public") return playlist.public === true;
        if (visibility === "private") return playlist.public === false;
        return playlist.collaborative === true;
      })
      .sort((first, second) => {
        if (sortMode === "tracks") return trackTotalOf(second) - trackTotalOf(first);
        if (sortMode === "owner") {
          return (first.owner?.display_name || "").localeCompare(
            second.owner?.display_name || "",
            "pt-BR"
          );
        }
        return first.name.localeCompare(second.name, "pt-BR");
      });
  }, [ownership, playlists, search, sortMode, userId, visibility]);

  return (
    <AppShell>
      <Section title="Playlists" eyebrow="Biblioteca" action={<BackButton />}>
        <Card className="filter-panel" mb="5">
          <Grid columns={{ initial: "1", md: "1.2fr 0.8fr 0.8fr 0.8fr" }} gap="3">
            <TextField.Root
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, descrição ou dono"
            >
              <TextField.Slot>
                <MagnifyingGlassIcon />
              </TextField.Slot>
            </TextField.Root>

            <Select.Root
              value={ownership}
              onValueChange={(value) => setOwnership(value as OwnershipFilter)}
            >
              <Select.Trigger aria-label="Filtrar por propriedade" />
              <Select.Content>
                <Select.Item value="all">Todas</Select.Item>
                <Select.Item value="mine">Minhas</Select.Item>
                <Select.Item value="followed">Seguidas</Select.Item>
              </Select.Content>
            </Select.Root>

            <Select.Root
              value={visibility}
              onValueChange={(value) => setVisibility(value as VisibilityFilter)}
            >
              <Select.Trigger aria-label="Filtrar por visibilidade" />
              <Select.Content>
                <Select.Item value="all">Qualquer visibilidade</Select.Item>
                <Select.Item value="public">Públicas</Select.Item>
                <Select.Item value="private">Privadas</Select.Item>
                <Select.Item value="collaborative">Colaborativas</Select.Item>
              </Select.Content>
            </Select.Root>

            <Select.Root
              value={sortMode}
              onValueChange={(value) => setSortMode(value as SortMode)}
            >
              <Select.Trigger aria-label="Ordenar playlists" />
              <Select.Content>
                <Select.Item value="name">Nome</Select.Item>
                <Select.Item value="tracks">Mais faixas</Select.Item>
                <Select.Item value="owner">Dono</Select.Item>
              </Select.Content>
            </Select.Root>
          </Grid>

          <Flex mt="3" justify="between" gap="3" wrap="wrap">
            <Text size="1" color="gray">
              {filteredPlaylists.length} de {playlists.length} playlists
            </Text>
            <Text size="1" color="gray">
              A API de playlists não oferece filtro por período.
            </Text>
          </Flex>
        </Card>

        {playlistsQuery.isLoading ? (
          <LoadingState label="Carregando playlists" />
        ) : playlistsQuery.isError ? (
          <ErrorState error={playlistsQuery.error} onRetry={playlistsQuery.refetch} />
        ) : filteredPlaylists.length === 0 ? (
          <EmptyState message="Nenhuma playlist encontrada com esses filtros." />
        ) : (
          <PlaylistList
            playlists={filteredPlaylists}
            onSelect={(playlist) => navigate(`/playlists/${playlist.id}`)}
          />
        )}
      </Section>
    </AppShell>
  );
};

export default PlaylistsPage;
