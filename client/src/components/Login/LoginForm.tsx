import { Button } from "@radix-ui/themes";
import { getApiUrl } from "../../config/env";

export const LoginForm = () => {
  return (
    <Button asChild size="3" highContrast>
      <a href={getApiUrl("/login")}>Entrar com Spotify</a>
    </Button>
  );
};
