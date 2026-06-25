import { Flex, Text } from "@radix-ui/themes";

type EmptyStateProps = {
  message: string;
};

export const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <Flex minHeight="20vh" align="center" justify="center" py="4">
      <Text size="2" color="gray">
        {message}
      </Text>
    </Flex>
  );
};
