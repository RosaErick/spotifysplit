import { Box, Button, Container, Flex, Text } from "@radix-ui/themes";
import React from "react";
import { ThemeToggle } from "./ThemeToggle";

type AppShellProps = {
  children: React.ReactNode;
  onLogout?: () => void;
};

export const AppShell = ({ children, onLogout }: AppShellProps) => {
  return (
    <Box className="app-background" minHeight="100vh">
      <Box className="app-header">
        <Container size="4" px="4">
          <Flex align="center" justify="between" py="3" gap="3">
            <Flex align="center" gap="3">
              <Flex className="brand-mark" align="center" justify="center">
                SS
              </Flex>
              <Box>
                <Text as="p" size="2" weight="bold" className="brand-title">
                  Spotifysplit
                </Text>
                <Text as="p" size="1" color="gray">
                  Painel musical pessoal
                </Text>
              </Box>
            </Flex>

            <Flex align="center" gap="2">
              <ThemeToggle />
              {onLogout && (
                <Button type="button" variant="soft" color="red" onClick={onLogout}>
                  Sair
                </Button>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Container size="4" px="4" py="5">
        {children}
      </Container>
    </Box>
  );
};
