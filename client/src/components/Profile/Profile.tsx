import { Avatar, Badge, Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useProfileOverview } from "../../shared/api/queries";
import { formatNumber } from "../../utils/format";
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
        <Flex
          className="profile-layout"
          align="center"
          gap={{ initial: "4", sm: "6" }}
          direction={{ initial: "column", sm: "row" }}
        >
          <Flex className="profile-identity" align="center" gap="4">
            <Box className="avatar-ring">
              <Avatar
                src={imageUrl}
                fallback={initialsOf(profile.display_name)}
                size={{ initial: "5", sm: "7" }}
                radius="full"
                color="amber"
              />
            </Box>

            <Box style={{ minWidth: 0 }}>
              <Text as="p" color="gray" className="section-eyebrow profile-eyebrow" mb="1">
                Conectado ao Spotify
              </Text>
              <Heading className="display-heading truncate-2 profile-name" size={{ initial: "5", sm: "6" }}>
                {profile.display_name}
              </Heading>
              <Box mt="2">
                <Badge color="amber" variant="soft" radius="full" size="1">
                  {profile.product || "spotify"}
                </Badge>
              </Box>
            </Box>
          </Flex>

          <Box className="stat-strip">
            {stats.map(([label, value]) => (
              <Box className="stat-cell" key={label}>
                <Heading className="display-heading stat-value" size={{ initial: "3", sm: "4" }}>
                  {value}
                </Heading>
                <Text as="p" size="1" color="gray" mt="1">
                  {label}
                </Text>
              </Box>
            ))}
          </Box>
        </Flex>
      </Card>
    </Reveal>
  );
};
