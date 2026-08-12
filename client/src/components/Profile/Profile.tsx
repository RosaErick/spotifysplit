import { Avatar, Box, Card, Heading, Text } from "@radix-ui/themes";
import { useProfileOverview } from "../../shared/api/queries";
import { formatNumber } from "../../utils/format";
import { ImageStudioDialog } from "../../features/imageStudio";
import { ErrorState } from "../Layout/ErrorState";
import { ProfileSkeleton } from "../Layout/Skeleton";
import { Reveal } from "../Layout/Reveal";

const initialsOf = (name?: string) =>
  (name ?? "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SS";

// O plano e a unica informacao propria do usuario nessa linha; o resto era
// texto de reforco. Juntar tudo num rotulo so deixa a linha do topo curta o
// bastante para dividir espaco com a acao do card.
const connectionLabel = (product?: string) =>
  product ? `Spotify · ${product}` : "Spotify";

export const Profile = () => {
  const { data, isLoading, isError, error, refetch } = useProfileOverview();

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !data) return <ErrorState error={error} onRetry={refetch} />;

  const { profile, playlists, followedArtists } = data;
  const imageUrl = profile.images?.[0]?.url;
  const stats: Array<[string, string]> = [
    ["Seguidores", formatNumber(profile.followers?.total)],
    ["Playlists", formatNumber(playlists.total)],
    ["Seguindo", formatNumber(followedArtists.artists.items.length)],
  ];

  return (
    <Reveal>
      <Card className="hero-panel profile-card" mb="2">
        {/*
         * Cabecalho (procedencia + acao) -> quem e voce -> seus numeros.
         * A acao mora na linha do topo, e nao no rodape do card: ali ela e uma
         * ferramenta de canto, em largura natural, sem disputar atencao com o
         * nome nem virar um bloco de rodape do tamanho do card.
         */}
        <Box className="profile-layout">
          <Box className="profile-topline">
            <Text as="p" className="profile-meta">
              {connectionLabel(profile.product)}
            </Text>
            <Box className="profile-action">
              <ImageStudioDialog />
            </Box>
          </Box>

          <Box className="profile-identity">
            <Box className="avatar-ring">
              <Avatar
                src={imageUrl}
                fallback={initialsOf(profile.display_name)}
                size={{ initial: "5", sm: "6" }}
                radius="full"
              />
            </Box>

            <Heading className="display-heading truncate-2 profile-name" size="6">
              {profile.display_name}
            </Heading>
          </Box>

          <Box className="stat-strip">
            {stats.map(([label, value]) => (
              <Box className="stat-cell" key={label}>
                <Heading className="display-heading stat-value" size="3">
                  {value}
                </Heading>
                <Text as="p" size="1" color="gray" className="stat-label">
                  {label}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>
    </Reveal>
  );
};
