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
         * Identidade (plano, nome e a acao do card) -> numeros.
         *
         * O plano e o nome formam um par colado; a acao fica fora dessa pilha,
         * na propria linha do avatar. Dentro da pilha ela quebrava o ritmo do
         * texto: a caixa de 44px do botao soma ~14px de respiro interno antes do
         * rotulo, entao o vao ate o nome ficava muito maior que o do nome ate o
         * plano, por mais que o `gap` fosse o mesmo.
         */}
        <Box className="profile-layout">
          <Box className="profile-identity">
            <Box className="avatar-ring">
              <Avatar
                src={imageUrl}
                fallback={initialsOf(profile.display_name)}
                size={{ initial: "5", sm: "6" }}
                radius="full"
              />
            </Box>

            <Box className="profile-heading">
              <Text as="p" className="profile-meta">
                {connectionLabel(profile.product)}
              </Text>

              <Heading className="display-heading truncate-2 profile-name" size="6">
                {profile.display_name}
              </Heading>
            </Box>

            <Box className="profile-action">
              <ImageStudioDialog />
            </Box>
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
