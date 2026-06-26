import {
  BackpackIcon,
  ExitIcon,
  GitHubLogoIcon,
  InfoCircledIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { Box, Button, Container, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { Link, NavLink } from "react-router-dom";
import React, { useState } from "react";
import { AccentPicker } from "./AccentPicker";
import { EqualizerMark } from "./EqualizerMark";
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
                <Box display={{ initial: "none", xs: "block" }}>
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
              <Tooltip content="GitHub do projeto">
                <IconButton
                  asChild
                  variant="ghost"
                  color="gray"
                  highContrast
                  className="github-nav-action utility-icon-action clickable-control"
                >
                  <a
                    href="https://github.com/RosaErick/spotifysplit"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub do projeto"
                  >
                    <GitHubLogoIcon />
                  </a>
                </IconButton>
              </Tooltip>
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
      <PlayerDock state={playerState} onDismiss={() => setIsPlayerDockHidden(true)} />
    </Box>
  );
};
