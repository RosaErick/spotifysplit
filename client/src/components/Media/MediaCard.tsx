import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import { interactiveProps } from "../Layout/interactive";

type MediaCardProps = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  fallback?: string;
  externalUrl?: string;
  onClick?: () => void;
};

export const MediaCard = ({
  title,
  subtitle,
  imageUrl,
  fallback = "SP",
  externalUrl,
  onClick,
}: MediaCardProps) => (
  <Card className="interactive-card" {...interactiveProps(onClick)}>
    <Box className="media-tile" mb="3">
      {imageUrl ? (
        <img src={imageUrl} alt={title} loading="lazy" />
      ) : (
        <Flex height="100%" align="center" justify="center">
          <Text size="6" color="gray" weight="bold">
            {fallback}
          </Text>
        </Flex>
      )}
    </Box>

    <Text as="p" size="3" weight="bold" className="truncate-2">
      {title}
    </Text>
    {subtitle && (
      <Text as="p" size="2" color="gray" mt="1" className="truncate-2">
        {subtitle}
      </Text>
    )}

    {externalUrl && (
      <Button
        asChild
        size="1"
        variant="soft"
        color="gray"
        mt="3"
        onClick={(event) => event.stopPropagation()}
      >
        <a href={externalUrl} target="_blank" rel="noreferrer">
          <OpenInNewWindowIcon />
          Abrir
        </a>
      </Button>
    )}
  </Card>
);
