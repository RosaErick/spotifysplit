import { Box, Card, Container, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { ThemeToggle } from "../components/Layout/ThemeToggle";
import { LoginForm } from "../components/Login/LoginForm";
import { getAccessToken } from "../provider/spotfy";

export const Login = () => {
  const [hasToken, setToken] = useState<string | null | undefined>(null);

  useEffect(() => {
    setToken(getAccessToken());
  }, []);

  if (hasToken) return <Navigate to="/" />;

  return (
    <Box className="app-background" minHeight="100vh">
      <Container size="4" px="4">
        <Flex align="center" justify="between" py="4">
          <Flex align="center" gap="3">
            <Flex className="brand-mark" align="center" justify="center">
              SS
            </Flex>
            <Text size="2" weight="bold" className="brand-title">
              Spotifysplit
            </Text>
          </Flex>
          <ThemeToggle />
        </Flex>

        <Grid columns={{ initial: "1", md: "1.1fr 0.9fr" }} gap="6" align="center" minHeight="calc(100vh - 96px)">
          <Box>
            <Text as="p" size="1" weight="bold" color="green" className="section-eyebrow">
              Spotify analytics
            </Text>
            <Heading size={{ initial: "7", sm: "8" }} mt="3" mb="4">
              Um painel musical direto, limpo e pessoal.
            </Heading>
            <Text as="p" size="3" color="gray" style={{ maxWidth: 560, lineHeight: 1.7 }}>
              Acompanhe seus artistas, faixas recentes e albuns relacionados com
              uma interface leve, responsiva e preparada para evoluir.
            </Text>
            <Flex mt="5">
              <LoginForm />
            </Flex>
          </Box>

          <Card className="hero-panel">
            <Grid gap="3">
              {[
                ["Top artistas", "Ranking pessoal por periodo"],
                ["Recentes", "Historico de escuta navegavel"],
                ["Descoberta", "Albuns e recomendacoes conectadas"],
              ].map(([title, subtitle], index) => (
                <Card key={title} variant="surface">
                  <Text as="p" size="1" color="green" weight="bold">
                    0{index + 1}
                  </Text>
                  <Heading size="4" mt="3">
                    {title}
                  </Heading>
                  <Text as="p" size="2" color="gray" mt="1">
                    {subtitle}
                  </Text>
                </Card>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Container>
    </Box>
  );
};
