import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Badge, Box, Button, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/Layout/AppShell";
import { BackButton } from "../components/Layout/BackButton";
import { EmptyState } from "../components/Layout/EmptyState";
import { ErrorState } from "../components/Layout/ErrorState";
import { LoadingState } from "../components/Layout/LoadingState";
import { Reveal } from "../components/Layout/Reveal";
import { Section } from "../components/Layout/Section";
import { PlaylistTrackList } from "../components/Playlist/PlaylistTrackList";
import { usePlaylist, usePlaylistItems } from "../shared/api/queries";
import { formatNumber } from "../utils/format";

const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playlistQuery = usePlaylist(id);
  const itemsQuery = usePlaylistItems(id);
  const playlist = playlistQuery.data;
  const items = itemsQuery.data?.items ?? [];
  const totalTracks = playlist?.tracks?.total ?? playlist?.items?.total ?? items.length;

  if (playlistQuery.isLoading) {
    return (
      <AppShell>
        <LoadingState label="Carregando playlist" />
      </AppShell>
    );
  }

  if (playlistQuery.isError || !playlist) {
    return (
      <AppShell>
        <ErrorState error={playlistQuery.error} onRetry={playlistQuery.refetch} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Reveal>
        <Card className="hero-panel" size="3">
          <Grid columns={{ initial: "1", md: "260px 1fr" }} gap="5" align="center">
            <Box className="media-tile" style={{ borderRadius: "var(--radius-5)" }}>
              {playlist.images?.[0]?.url && (
                <img src={playlist.images[0].url} alt={playlist.name} />
              )}
            </Box>

            <Box>
              <Flex align="start" justify="between" gap="3" wrap="wrap">
                <Box minWidth="0" flexGrow="1">
                  <Text as="p" size="1" weight="bold" className="section-eyebrow">
                    Playlist
                  </Text>
                  <Heading size={{ initial: "6", sm: "8" }} mt="2">
                    {playlist.name}
                  </Heading>
                </Box>
                <BackButton />
              </Flex>
              {playlist.description && (
                <Text as="p" size="2" color="gray" mt="3" className="truncate-2">
                  {playlist.description}
                </Text>
              )}

              <Flex gap="2" wrap="wrap" mt="4">
                <Badge variant="soft" radius="full">
                  {formatNumber(totalTracks)} faixas
                </Badge>
                <Badge color="gray" variant="soft" radius="full">
                  {playlist.owner?.display_name || "Spotify"}
                </Badge>
                {playlist.public === false && (
                  <Badge color="gray" variant="soft" radius="full">
                    privada
                  </Badge>
                )}
                {playlist.collaborative && (
                  <Badge color="gray" variant="soft" radius="full">
                    colaborativa
                  </Badge>
                )}
              </Flex>

              {playlist.external_urls?.spotify && (
                <Flex mt="5">
                  <Button asChild variant="soft">
                    <a href={playlist.external_urls.spotify} target="_blank" rel="noreferrer">
                      <OpenInNewWindowIcon />
                      Abrir no Spotify
                    </a>
                  </Button>
                </Flex>
              )}
            </Box>
          </Grid>
        </Card>
      </Reveal>

      <Section title="Faixas da playlist" eyebrow="Conteúdo">
        {itemsQuery.isLoading ? (
          <LoadingState label="Carregando faixas" />
        ) : itemsQuery.isError ? (
          <ErrorState error={itemsQuery.error} onRetry={itemsQuery.refetch} />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhum item encontrado nessa playlist." />
        ) : (
          <PlaylistTrackList
            items={items}
            onTrackSelect={(track) => navigate(`/tracks/${track.id}`)}
          />
        )}
      </Section>
    </AppShell>
  );
};

export default PlaylistPage;
