// Esqueleto visual compartilhado pelos formatos do estudio: coluna de controles
// a esquerda, preview ao vivo a direita. Componente puro de layout — quem sabe
// o que exibir e cada painel (poster, mosaico).

import { ReactNode } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";

/** Rotulo + controle, para os campos da coluna da esquerda ficarem uniformes. */
export const StudioField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <Box>
    <Text as="p" size="1" weight="bold" mb="1" color="gray">
      {label}
    </Text>
    {children}
  </Box>
);

interface StudioLayoutProps {
  controls: ReactNode;
  preview: ReactNode;
}

export const StudioLayout = ({ controls, preview }: StudioLayoutProps) => (
  <Flex
    direction={{ initial: "column", sm: "row" }}
    gap={{ initial: "4", sm: "5" }}
    align="start"
  >
    <Flex
      direction="column"
      gap="4"
      width={{ initial: "100%", sm: "260px" }}
      flexShrink="0"
    >
      {controls}
    </Flex>

    <Box flexGrow="1" minWidth="0" width="100%">
      {preview}
    </Box>
  </Flex>
);
