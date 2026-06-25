import { Button } from "@radix-ui/themes";
import { getApiUrl } from "../../config/env";

// Inicia o fluxo OAuth redirecionando para o /login do backend.
export const LoginButton = () => {
  return (
    <Button asChild size="3" highContrast>
      <a href={getApiUrl("/login")}>Entrar com Spotify</a>
    </Button>
  );
};
