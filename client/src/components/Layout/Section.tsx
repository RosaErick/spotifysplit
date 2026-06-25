import { Box, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import React from "react";
import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";

type SectionProps = {
  title: string;
  titleTo?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  withSeparator?: boolean;
  children: React.ReactNode;
};

export const Section = ({
  title,
  titleTo,
  eyebrow,
  action,
  withSeparator = true,
  children,
}: SectionProps) => {
  return (
    <Box py={{ initial: "5", sm: "6" }}>
      <Reveal>
        <Flex
          align="end"
          justify="between"
          gap="3"
          mb="2"
          wrap="wrap"
        >
          <Box minWidth="0" flexGrow="1">
            {eyebrow && (
              <Text as="p" size="1" className="section-eyebrow" mb="1">
                {eyebrow}
              </Text>
            )}
            {titleTo ? (
              <Link to={titleTo} className="section-title-link">
                <Heading size={{ initial: "6", sm: "7" }} weight="medium">
                  {title}
                </Heading>
              </Link>
            ) : (
              <Heading size={{ initial: "6", sm: "7" }} weight="medium">
                {title}
              </Heading>
            )}
          </Box>
          {action && <Box flexShrink="0">{action}</Box>}
        </Flex>
        {withSeparator && <Separator size="4" mb="5" style={{ opacity: 0.5 }} />}
      </Reveal>
      {children}
    </Box>
  );
};
