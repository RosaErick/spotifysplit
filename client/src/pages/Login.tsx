import { Box, Card, Container, Flex, Grid, Heading, Link as RadixLink, Separator, Text } from "@radix-ui/themes";
import { Link, Navigate } from "react-router-dom";
import { AccentPicker } from "../components/Layout/AccentPicker";
import { useAppTheme } from "../components/Layout/AppThemeProvider";
import { EqualizerMark } from "../components/Layout/EqualizerMark";
import { GitHubNavButton } from "../components/Layout/GitHubNavButton";
import { Reveal } from "../components/Layout/Reveal";
import { ThemeToggle } from "../components/Layout/ThemeToggle";
import { LoginButton } from "../features/auth/LoginButton";
import { isAuthenticated } from "../features/auth/auth";

const highlights: Array<[string, string]> = [
  ["Top artistas", "Seu ranking dos artistas mais ouvidos."],
  ["Top faixas", "As músicas que você mais repete."],
  ["Biblioteca", "Suas faixas, álbuns e shows salvos."],
];

export const Login = () => {
  const { accent } = useAppTheme();

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
              SpotfySplit
            </Text>
          </Flex>
          <Flex align="center" gap="3">
            <GitHubNavButton />
            <AccentPicker />
            <ThemeToggle />
          </Flex>
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
              <Flex mt="6" align="center" gap="4" wrap="wrap">
                <LoginButton />
                <Text size="1" color="gray" className="serif-accent">
                  leva poucos segundos
                </Text>
              </Flex>
            </Reveal>
            <Reveal delay={0.3}>
              <Text as="p" size="2" color="gray" mt="4">
                <RadixLink asChild color="gray" highContrast>
                  <Link to="/sobre">Sobre o projeto e a sua privacidade →</Link>
                </RadixLink>
              </Text>
            </Reveal>
          </Box>

          <Reveal delay={0.2} y={28}>
            <Card className="hero-panel" size="4">
              <Text as="p" size="1" color="gray" className="section-eyebrow" mb="5">
                O que você encontra
              </Text>
              <Flex direction="column">
                {highlights.map(([title, subtitle], index) => (
                  <Box key={title}>
                    {index > 0 && (
                      <Separator size="4" my="4" style={{ opacity: 0.45 }} />
                    )}
                    <Flex gap="4" align="center">
                      <Heading
                        className="display-heading serif-accent"
                        size="8"
                        color={accent}
                        style={{ minWidth: "2.5rem", lineHeight: 1 }}
                      >
                        {index + 1}
                      </Heading>
                      <Box>
                        <Heading size="4">{title}</Heading>
                        <Text as="p" size="2" color="gray" mt="1">
                          {subtitle}
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </Flex>
            </Card>
          </Reveal>
        </Grid>
      </Container>
    </Box>
  );
};
