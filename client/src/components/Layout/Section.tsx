import { Box, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import React from "react";
import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";

type SectionProps = {
  title: string;
  titleTo?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export const Section = ({ title, titleTo, eyebrow, action, children }: SectionProps) => {
  return (
    <Box py={{ initial: "5", sm: "6" }}>
      <Reveal>
        <Flex
          align={{ initial: "start", sm: "end" }}
          justify="between"
          gap="3"
          mb="2"
          direction={{ initial: "column", sm: "row" }}
        >
          <Box>
            {eyebrow && (
              <Text as="p" size="1" color="amber" className="section-eyebrow" mb="1">
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
          {action}
        </Flex>
        <Separator size="4" mb="5" color="amber" style={{ opacity: 0.5 }} />
      </Reveal>
      {children}
    </Box>
  );
};
