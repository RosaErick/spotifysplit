import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Callout } from "@radix-ui/themes";
import { isInAppBrowser } from "./inAppBrowser";

// Aviso para quem abriu o app de dentro de outro app (Instagram, Facebook...).
// Nesses navegadores embutidos o login do Spotify quase sempre falha ou exige
// digitar a senha, porque eles nao compartilham a sessao com o navegador.
export const InAppBrowserNotice = () => {
  if (!isInAppBrowser()) return null;

  return (
    <Callout.Root color="amber" size="1" mb="4" role="status">
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text>
        Você abriu por dentro de outro app. O login do Spotify costuma falhar
        aqui — toque no menu do navegador e escolha "Abrir no navegador" antes de
        entrar.
      </Callout.Text>
    </Callout.Root>
  );
};
