import { Box, Card, Container, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { Navigate } from "react-router-dom";
import { EqualizerMark } from "../components/Layout/EqualizerMark";
import { Reveal } from "../components/Layout/Reveal";
import { ThemeToggle } from "../components/Layout/ThemeToggle";
import { LoginButton } from "../features/auth/LoginButton";
import { isAuthenticated } from "../features/auth/auth";

const highlights: Array<[string, string]> = [
  ["Top artistas", "Seu ranking dos artistas mais ouvidos."],
  ["Recentes", "O histórico de escuta como uma linha do tempo."],
  ["Descoberta", "Álbuns e relacionados a partir do seu top."],
];

export const Login = () => {
  if (isAuthenticated()) return <Navigate to="/" replace />;

  return (
    <Box className="app-background" minHeight="100vh">
      <Container size="4" px={{ initial: "4", sm: "5" }}>
        <Flex align="center" justify="between" py="4">
          <Flex align="center" gap="3">
            <Flex className="brand-mark" align="center" justify="center">
              <EqualizerMark />
            </Flex>
            <Text size="2" className="brand-title">
              Spotifysplit
            </Text>
          </Flex>
          <ThemeToggle />
        </Flex>

        <Grid
          columns={{ initial: "1", md: "1.05fr 0.95fr" }}
          gap={{ initial: "6", md: "8" }}
          align="center"
          minHeight="calc(100dvh - 96px)"
          py="6"
        >
          <Box>
            <Reveal>
              <Text as="p" size="1" color="gray" className="section-eyebrow" mb="4">
                Seus stats do Spotify
              </Text>
            </Reveal>
            <Reveal delay={0.08}>
              <Heading
                className="display-heading"
                size={{ initial: "7", sm: "8" }}
                mb="5"
              >
                Seus dados do Spotify, reunidos num só lugar.
              </Heading>
            </Reveal>
            <Reveal delay={0.16}>
              <Text as="p" size={{ initial: "3", sm: "4" }} color="gray" style={{ maxWidth: 520, lineHeight: 1.7 }}>
                Conecte sua conta e veja seus artistas, faixas e hábitos de escuta
                reunidos num painel leve e organizado.
              </Text>
            </Reveal>
            <Reveal delay={0.24}>
              <Flex mt="6" align="center" gap="4">
                <LoginButton />
                <Text size="1" color="gray" className="serif-accent">
                  leva poucos segundos
                </Text>
              </Flex>
            </Reveal>
          </Box>

          <Reveal delay={0.2} y={28}>
            <Card className="hero-panel" size="3">
              <Grid gap="3">
                {highlights.map(([title, subtitle], index) => (
                  <Card key={title} variant="ghost" size="2" style={{ padding: "var(--space-3)" }}>
                    <Flex gap="4" align="center">
                      <Heading className="display-heading" size="7" color="amber" style={{ minWidth: "2.5rem" }}>
                        0{index + 1}
                      </Heading>
                      <Box>
                        <Heading size="4">{title}</Heading>
                        <Text as="p" size="2" color="gray" mt="1">
                          {subtitle}
                        </Text>
                      </Box>
                    </Flex>
                  </Card>
                ))}
              </Grid>
            </Card>
          </Reveal>
        </Grid>
      </Container>
    </Box>
  );
};
