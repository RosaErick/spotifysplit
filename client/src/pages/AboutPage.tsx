import {
  Box,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
} from "@radix-ui/themes";
import {
  ArrowLeftIcon,
  LockClosedIcon,
  MixIcon,
  Pencil2Icon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { AccentPicker } from "../components/Layout/AccentPicker";
import { EqualizerMark } from "../components/Layout/EqualizerMark";
import { GitHubNavButton } from "../components/Layout/GitHubNavButton";
import { Reveal } from "../components/Layout/Reveal";
import { ThemeToggle } from "../components/Layout/ThemeToggle";

type Topic = {
  icon: React.ReactNode;
  title: string;
  body: string;
};

const topics: Topic[] = [
  {
    icon: <MixIcon />,
    title: "O que é o SpotfySplit",
    body: "Um projeto pessoal de desenvolvimento, criado pra testar na prática a Web API do Spotify e o fluxo de autenticação OAuth 2.0. Não é um produto comercial — é só pra aprendizado e brincadeira.",
  },
  {
    icon: <PersonIcon />,
    title: "Você entra pelo Spotify, não por aqui",
    body: "Você não cria conta no SpotfySplit. O login acontece no próprio Spotify, via OAuth 2.0: você só autoriza o app a ler os seus dados de escuta direto da sua conta. Quem valida quem você é, é o Spotify.",
  },
  {
    icon: <LockClosedIcon />,
    title: "Não temos sua senha nem seu email",
    body: "Como a autenticação é feita do lado do Spotify, nunca vemos nem recebemos a sua senha ou o seu email. Não pedimos e não temos acesso a essas informações em momento nenhum.",
  },
  {
    icon: <Pencil2Icon />,
    title: "Não guardamos nada",
    body: "Não existe banco de dados de usuários aqui. Nenhuma informação sua é armazenada nos nossos servidores. O token de acesso fica apenas no seu navegador durante a sessão, só pra buscar os seus dados no Spotify, e some quando você sai.",
  },
];

export const AboutPage = () => {
  return (
    <Box className="app-background" minHeight="100vh">
      <Container size="3" px={{ initial: "4", sm: "5" }}>
        <Flex align="center" justify="between" py="4">
          <Flex asChild align="center" gap="3" className="brand-link">
            <Link to="/" aria-label="Voltar ao início">
              <Flex className="brand-mark" align="center" justify="center">
                <EqualizerMark />
              </Flex>
              <Text size="2" className="brand-title">
                SpotfySplit
              </Text>
            </Link>
          </Flex>
          <Flex align="center" gap="3">
            <GitHubNavButton />
            <AccentPicker />
            <ThemeToggle />
          </Flex>
        </Flex>

        <Box py={{ initial: "5", sm: "7" }}>
          <Reveal>
            <Text as="p" size="1" color="gray" className="section-eyebrow" mb="4">
              Sobre o projeto
            </Text>
          </Reveal>
          <Reveal delay={0.06}>
            <Heading
              className="display-heading"
              size={{ initial: "7", sm: "8" }}
              mb="4"
            >
              Um projeto pessoal, feito pra aprender.
            </Heading>
          </Reveal>
          <Reveal delay={0.12}>
            <Text
              as="p"
              size={{ initial: "3", sm: "4" }}
              color="gray"
              style={{ maxWidth: 620, lineHeight: 1.7 }}
            >
              O SpotfySplit reúne os seus stats do Spotify num painel próprio. Por
              trás disso, é um exercício de desenvolvimento com a Web API do
              Spotify e o fluxo OAuth 2.0.
            </Text>
          </Reveal>

          <Grid
            columns={{ initial: "1", sm: "2" }}
            gap="4"
            mt={{ initial: "6", sm: "7" }}
          >
            {topics.map((topic, index) => (
              <Reveal key={topic.title} delay={0.16 + index * 0.06}>
                <Card className="hero-panel" size="3" style={{ height: "100%" }}>
                  <Flex direction="column" gap="3">
                    <Flex
                      className="feature-icon"
                      align="center"
                      justify="center"
                    >
                      {topic.icon}
                    </Flex>
                    <Heading size="4">{topic.title}</Heading>
                    <Text as="p" size="2" color="gray" style={{ lineHeight: 1.65 }}>
                      {topic.body}
                    </Text>
                  </Flex>
                </Card>
              </Reveal>
            ))}
          </Grid>

          <Reveal delay={0.46}>
            <Flex mt="7" align="center" gap="4" wrap="wrap">
              <Flex asChild align="center" gap="2" className="about-back-link">
                <Link to="/">
                  <ArrowLeftIcon />
                  <Text size="2" weight="bold">
                    Voltar ao início
                  </Text>
                </Link>
              </Flex>
              <Text size="1" color="gray" className="serif-accent">
                feito pra aprender e brincar
              </Text>
            </Flex>
          </Reveal>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage;
