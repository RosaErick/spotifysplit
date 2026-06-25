import { InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";

type FeatureUnavailableStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
};

export const FeatureUnavailableState = ({
  title,
  description,
  onRetry,
}: FeatureUnavailableStateProps) => {
  return (
    <Card variant="surface" size="3">
      <Flex direction={{ initial: "column", sm: "row" }} gap="4" align="start">
        <Flex className="feature-icon" align="center" justify="center">
          <InfoCircledIcon width="18" height="18" />
        </Flex>

        <Flex direction="column" gap="2" style={{ maxWidth: 680 }}>
          <Heading size="4">{title}</Heading>
          <Text as="p" size="2" color="gray" style={{ lineHeight: 1.65 }}>
            {description}
          </Text>

          {onRetry && (
            <Button variant="soft" color="gray" mt="2" onClick={onRetry}>
              <ReloadIcon />
              Tentar novamente
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};
