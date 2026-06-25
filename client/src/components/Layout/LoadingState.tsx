import { Flex, Text } from "@radix-ui/themes";

type LoadingStateProps = {
  label?: string;
};

export const LoadingState = ({ label = "Carregando" }: LoadingStateProps) => {
  return (
    <Flex minHeight="40vh" align="center" justify="center" direction="column" gap="3">
      <span className="loading-eq" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <Text size="2" color="gray" className="serif-accent">
        {label}
      </Text>
    </Flex>
  );
};
