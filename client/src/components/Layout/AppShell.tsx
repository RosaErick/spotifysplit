import { BackpackIcon, ExitIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Box, Button, Container, Flex, Text } from "@radix-ui/themes";
import { Link, NavLink } from "react-router-dom";
import React from "react";
import { EqualizerMark } from "./EqualizerMark";
import { ThemeToggle } from "./ThemeToggle";
import { MiniPlayer } from "../Player/MiniPlayer";

type AppShellProps = {
  children: React.ReactNode;
  onLogout?: () => void;
};

export const AppShell = ({ children, onLogout }: AppShellProps) => {
  return (
    <Box className="app-background" minHeight="100vh">
      <Box className="app-header">
        <Container size="4" px={{ initial: "4", sm: "5" }}>
          <Flex align="center" justify="between" py="3" gap="3">
            <Flex asChild align="center" gap="3">
              <Link to="/" aria-label="Voltar ao início">
                <Flex className="brand-mark" align="center" justify="center">
                  <EqualizerMark />
                </Flex>
                <Box display={{ initial: "none", xs: "block" }}>
                  <Text as="p" size="2" className="brand-title">
                    Spotifysplit
                  </Text>
                  <Text as="p" size="1" color="gray">
                    Seus stats do Spotify
                  </Text>
                </Box>
              </Link>
            </Flex>

            <Flex align="center" gap="3">
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
              </Flex>
              <ThemeToggle />
              {onLogout && (
                <Button type="button" variant="soft" color="gray" onClick={onLogout}>
                  <ExitIcon />
                  <Box asChild display={{ initial: "none", xs: "inline" }}>
                    <span>Sair</span>
                  </Box>
                </Button>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Container size="4" px={{ initial: "4", sm: "5" }} py={{ initial: "5", sm: "6" }}>
        <MiniPlayer />
        {children}
      </Container>
    </Box>
  );
};
