import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Badge, Box, Button, Card, Flex, Grid, Heading, Link as RadixLink, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/Layout/AppShell";
import { LoadingState } from "../components/Layout/LoadingState";
import { Section } from "../components/Layout/Section";
import { TrackCard } from "../components/Track/TrackCard";
import {
  getOneTrack,
  getRecommendationsBasedOnTrack,
} from "../provider/spotfy";
import { formatDuration } from "../utils/format";

const TrackPage = () => {
  const [track, setTrack] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[] | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    getOneTrack(id).then(setTrack);
    getRecommendationsBasedOnTrack(id).then((response) =>
      setRecommendations(response?.tracks || [])
    );
  }, [id]);

  if (!track) {
    return (
      <AppShell>
        <LoadingState label="Carregando faixa" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Button variant="soft" color="gray" mb="4" onClick={() => navigate(-1)}>
        <ArrowLeftIcon />
        Voltar
      </Button>

      <Card className="hero-panel">
        <Grid columns={{ initial: "1", md: "280px 1fr" }} gap="5" align="center">
          <Box className="media-tile" style={{ borderRadius: "var(--radius-5)" }}>
            {track?.album?.images?.[0]?.url && (
              <img src={track.album.images[0].url} alt={track.name} />
            )}
          </Box>

          <Box>
            <Text as="p" size="1" weight="bold" color="green" className="section-eyebrow">
              Faixa
            </Text>
            <Heading size={{ initial: "6", sm: "8" }} mt="2">
              {track.name}
            </Heading>
            <Text as="p" size="3" color="gray" mt="2">
              {track.album?.name}
            </Text>

            <Flex gap="2" wrap="wrap" mt="4">
              {track.artists?.map((artist: any) => (
                <RadixLink asChild key={artist.id}>
                  <Link to={`/artists/${artist.id}`}>
                    <Badge color="green" variant="soft">
                      {artist.name}
                    </Badge>
                  </Link>
                </RadixLink>
              ))}
            </Flex>

            <Grid columns={{ initial: "2", sm: "3" }} gap="3" mt="5">
              <Stat label="Duracao" value={formatDuration(track.duration_ms)} />
              <Stat label="Popularidade" value={track.popularity} />
              <Stat label="Preview" value={track.preview_url ? "Disponivel" : "Indisponivel"} compact />
            </Grid>

            {track.preview_url && (
              <Box mt="5">
                <audio src={track.preview_url} controls style={{ width: "100%" }} />
              </Box>
            )}
          </Box>
        </Grid>
      </Card>

      <Section title="Recomendacoes relacionadas" eyebrow="Proximo passo">
        <Grid columns={{ initial: "1", xs: "2", sm: "3", lg: "5" }} gap="4">
          {recommendations?.map((recommendedTrack) => (
            <Box
              key={recommendedTrack.id}
              onClick={() => navigate(`/tracks/${recommendedTrack.id}`)}
            >
              <TrackCard track={recommendedTrack} />
            </Box>
          ))}
        </Grid>
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
    <Text as="p" size={compact ? "2" : "5"} weight="bold" mt="1">
      {value}
    </Text>
  </Card>
);

export default TrackPage;
