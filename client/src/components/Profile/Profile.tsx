import { Avatar, Badge, Box, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { getTotalUserInfo } from "../../provider/spotfy";
import { formatNumber } from "../../utils/format";
import { LoadingState } from "../Layout/LoadingState";

export const Profile = () => {
  const [profile, setProfile] = useState<any | null>(null);
  const [playlists, setPlaylists] = useState<any | null>(null);
  const [following, setFollowing] = useState<any | null>(null);

  useEffect(() => {
    getTotalUserInfo().then((data) => {
      setProfile(data.userProfile);
      setPlaylists(data.playlists);
      setFollowing(data.followedArtists);
    });
  }, []);

  if (!profile) return <LoadingState label="Carregando perfil" />;

  const imageUrl = profile?.images?.[0]?.url;
  const stats = [
    ["Seguidores", formatNumber(profile?.followers?.total)],
    ["Playlists", formatNumber(playlists?.total)],
    ["Seguindo", formatNumber(following?.artists?.items?.length)],
  ];

  return (
    <Grid columns={{ initial: "1", md: "1fr 320px" }} gap="4" mb="5">
      <Card className="hero-panel">
        <Flex align={{ initial: "start", sm: "end" }} gap="5" direction={{ initial: "column", sm: "row" }}>
          <Avatar
            src={imageUrl}
            fallback="SS"
            size="8"
            radius="large"
            color="green"
          />
          <Box>
            <Text as="p" size="1" weight="bold" color="green" className="section-eyebrow">
              Perfil conectado
            </Text>
            <Heading size={{ initial: "6", sm: "8" }} mt="2">
              {profile.display_name}
            </Heading>
            <Badge color="green" variant="soft" mt="4">
              {profile.product || "spotify"}
            </Badge>
          </Box>
        </Flex>
      </Card>

      <Grid columns={{ initial: "3", md: "1" }} gap="3">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <Text as="p" size="1" color="gray">
              {label}
            </Text>
            <Text as="p" size="5" weight="bold" mt="1">
              {value}
            </Text>
          </Card>
        ))}
      </Grid>
    </Grid>
  );
};
