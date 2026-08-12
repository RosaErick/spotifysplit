import {
  BackpackIcon,
  ExitIcon,
  InfoCircledIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { Box, Button, Container, Flex, Text } from "@radix-ui/themes";
import { Link, NavLink } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { AccentPicker } from "./AccentPicker";
import { EqualizerMark } from "./EqualizerMark";
import { GitHubNavButton } from "./GitHubNavButton";
import { MobileTabBar } from "./MobileTabBar";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../../features/auth/useAuth";
import { PlayerDock, PlayerNavControl, useNowPlaying } from "../Player/MiniPlayer";

type AppShellProps = {
  children: React.ReactNode;
  onLogout?: () => void;
};

export const AppShell = ({ children, onLogout }: AppShellProps) => {
  const { logout } = useAuth();
  const [isPlayerDockHidden, setIsPlayerDockHidden] = useState(false);
  const playerState = useNowPlaying();
  const showPlayerDock = playerState.isPlaying && !isPlayerDockHidden;
  const handleLogout = onLogout ?? logout;

  /*
   * A dispensa vale ate a reproducao parar, nao ate a proxima faixa. Trocar de
   * musica nao e intencao do usuario — a fila anda sozinha —, entao reabrir o
   * dock a cada faixa viraria uma interrupcao a cada tres minutos, bem em cima
   * da barra de navegacao. Voltar a tocar depois de parado, sim, e intencao: ai
   * o player volta. Enquanto isso o icone do header e o caminho de volta.
   */
  useEffect(() => {
    if (playerState.isPlaying) setIsPlayerDockHidden(false);
  }, [playerState.isPlaying]);

  return (
    <Box
      className={`app-background ${showPlayerDock ? "has-player-dock" : ""}`}
      minHeight="100vh"
    >
      <Box className="app-header">
        <Container size="4" px={{ initial: "4", sm: "5" }}>
          <Box className="app-header-row" py="3">
            <Flex asChild className="brand-link" align="center" gap="3">
              <Link to="/" aria-label="Voltar ao início">
                <Flex className="brand-mark" align="center" justify="center">
                  <EqualizerMark />
                </Flex>
                <Box className="brand-copy">
                  <Text as="p" size="2" className="brand-title">
                    SpotfySplit
                  </Text>
                  <Text as="p" size="1" color="gray">
                    Seus stats do Spotify
                  </Text>
                </Box>
              </Link>
            </Flex>

            <Flex className="nav-actions" align="center" gap="1">
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `nav-action ${isActive ? "nav-action-active" : ""}`
                }
              >
                <MagnifyingGlassIcon />
                <span>Busca</span>
              </NavLink>
              <NavLink
                to="/library"
                className={({ isActive }) =>
                  `nav-action ${isActive ? "nav-action-active" : ""}`
                }
              >
                <BackpackIcon />
                <span>Biblioteca</span>
              </NavLink>
              <NavLink
                to="/sobre"
                className={({ isActive }) =>
                  `nav-action ${isActive ? "nav-action-active" : ""}`
                }
              >
                <InfoCircledIcon />
                <span>Sobre</span>
              </NavLink>
            </Flex>

            <Flex className="utility-actions" align="center" gap="2">
              {!showPlayerDock && (
                <Box className="player-nav-slot">
                  <PlayerNavControl
                    state={playerState}
                    showDock={showPlayerDock}
                    onShowDock={() => setIsPlayerDockHidden(false)}
                  />
                </Box>
              )}
              <GitHubNavButton />
              <AccentPicker />
              <ThemeToggle />
              <Button
                type="button"
                variant="soft"
                color="gray"
                className="logout-action clickable-control"
                onClick={handleLogout}
              >
                <ExitIcon />
                <Box asChild display={{ initial: "none", xs: "inline" }}>
                  <span>Sair</span>
                </Box>
              </Button>
            </Flex>
          </Box>
        </Container>
      </Box>

      <Container size="4" px={{ initial: "4", sm: "5" }} py={{ initial: "5", sm: "6" }}>
        {children}
      </Container>
      {showPlayerDock && (
        <PlayerDock state={playerState} onDismiss={() => setIsPlayerDockHidden(true)} />
      )}
      <MobileTabBar onLogout={handleLogout} />
    </Box>
  );
};
