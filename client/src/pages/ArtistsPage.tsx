import { Avatar, Box, Button, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArtistCard } from "../components/Artist/ArtistCard";
import { AppShell } from "../components/Layout/AppShell";
import { LoadingState } from "../components/Layout/LoadingState";
import { Section } from "../components/Layout/Section";
import { getOneArtist, getRelatedArtists } from "../provider/spotfy";
import { formatNumber } from "../utils/format";

const ArtistPage = () => {
  const [artist, setArtist] = useState<any>(null);
  const [relatedArtists, setRelatedArtists] = useState<any[] | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    getOneArtist(id).then(setArtist);
    getRelatedArtists(id).then((response) => setRelatedArtists(response?.artists || []));
  }, [id]);

  if (!artist) {
    return (
      <AppShell>
        <LoadingState label="Carregando artista" />
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
          <Avatar
            src={artist?.images?.[0]?.url}
            fallback="SS"
            size="9"
            radius="large"
            color="green"
          />
          <Box>
            <Text as="p" size="1" weight="bold" color="green" className="section-eyebrow">
              Artista
            </Text>
            <Heading size={{ initial: "7", sm: "8" }} mt="2">
              {artist.name}
            </Heading>
            <Grid columns={{ initial: "1", sm: "3" }} gap="3" mt="5">
              <Stat label="Popularidade" value={artist.popularity} />
              <Stat label="Seguidores" value={formatNumber(artist?.followers?.total)} />
              <Stat label="Generos" value={artist?.genres?.slice(0, 2).join(", ") || "Nao informado"} compact />
            </Grid>
          </Box>
        </Grid>
      </Card>

      <Section title="Artistas relacionados" eyebrow="Continue explorando">
        <Grid columns={{ initial: "1", xs: "2", md: "3", lg: "4" }} gap="4">
          {relatedArtists?.map((relatedArtist) => (
            <ArtistCard
              key={relatedArtist.id}
              artist={relatedArtist}
              onClick={() => navigate(`/artists/${relatedArtist.id}`)}
            />
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
    <Text as="p" size={compact ? "2" : "5"} weight="bold" mt="1" className="truncate-2">
      {value}
    </Text>
  </Card>
);

export default ArtistPage;
