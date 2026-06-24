import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import React from "react";

type SectionProps = {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export const Section = ({ title, eyebrow, action, children }: SectionProps) => {
  return (
    <Box py="5">
      <Flex align={{ initial: "start", sm: "end" }} justify="between" gap="3" mb="4" direction={{ initial: "column", sm: "row" }}>
        <Box>
          {eyebrow && (
            <Text as="p" size="1" weight="bold" color="green" className="section-eyebrow">
              {eyebrow}
            </Text>
          )}
          <Heading size={{ initial: "5", sm: "6" }} weight="bold">
            {title}
          </Heading>
        </Box>
        {action}
      </Flex>
      {children}
    </Box>
  );
};
