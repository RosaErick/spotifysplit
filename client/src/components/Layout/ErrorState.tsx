import { Button, Callout, Flex } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { SpotifyApiError } from "../../shared/api/errors";

type ErrorStateProps = {
  error?: unknown;
  onRetry?: () => void;
};

const messageFor = (error?: unknown): string => {
  if (error instanceof SpotifyApiError) {
    switch (error.status) {
      case 401:
        return "Sua sessão expirou. Entre novamente para continuar.";
      case 403:
        return "Sua conta não tem acesso a esses dados.";
      case 429:
        return "O Spotify limitou as requisições. Tente novamente em instantes.";
      default:
        return "Não foi possível carregar os dados agora.";
    }
  }
  return "Falha de conexão. Verifique sua internet e tente de novo.";
};

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <Flex direction="column" align="start" gap="3" py="4">
      <Callout.Root color="red" variant="surface">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>{messageFor(error)}</Callout.Text>
      </Callout.Root>
      {onRetry && (
        <Button variant="soft" color="gray" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </Flex>
  );
};
