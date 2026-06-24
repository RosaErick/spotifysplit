import { Flex, Spinner, Text } from "@radix-ui/themes";

type LoadingStateProps = {
  label?: string;
};

export const LoadingState = ({ label = "Carregando" }: LoadingStateProps) => {
  return (
    <Flex minHeight="40vh" align="center" justify="center" gap="3">
      <Spinner />
      <Text size="2" color="gray" weight="medium">
        {label}
      </Text>
    </Flex>
  );
};
