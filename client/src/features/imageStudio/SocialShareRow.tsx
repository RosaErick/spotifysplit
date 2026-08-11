// Atalhos para publicar a imagem nas redes.
//
// Dois comportamentos, porque as redes sao diferentes de verdade:
//
// - X, WhatsApp e Telegram tem endpoint de composicao por URL. Ele aceita texto
//   e link, mas nao arquivo: abrimos a rede com a legenda pronta e baixamos a
//   imagem para o usuario anexar.
// - Instagram nao tem endpoint nenhum. O unico caminho que leva a imagem ate o
//   story e a folha nativa (Web Share API), onde "Instagram > Stories" aparece
//   como destino com o arquivo anexado — disponivel no celular. Fora dela, so da
//   para baixar a imagem, copiar a legenda e avisar que a publicacao e no app.

import { useState } from "react";
import { Button, Flex, Text } from "@radix-ui/themes";
import { ExternalLinkIcon, InstagramLogoIcon } from "@radix-ui/react-icons";
import { APP_URL } from "../../shared/constants/app";
import { canShareFiles } from "../../shared/image/useImageExport";
import { INSTAGRAM_URL, socialTargets } from "./socialTargets";

interface SocialShareRowProps {
  shareText: string;
  disabled: boolean;
  /** Gera e baixa o arquivo com as opcoes atuais. */
  onDownload: () => void;
  /** Abre a folha nativa com o arquivo anexado. */
  onShare: () => void;
}

const copyCaption = (text: string) => {
  // Sem clipboard (contexto inseguro ou navegador antigo) seguimos assim mesmo:
  // a legenda continua visivel no proprio poster.
  navigator.clipboard?.writeText(text).catch(() => undefined);
};

export const SocialShareRow = ({
  shareText,
  disabled,
  onDownload,
  onShare,
}: SocialShareRowProps) => {
  const [instagramHint, setInstagramHint] = useState(false);
  const nativeShare = canShareFiles();

  // A aba precisa abrir no mesmo gesto do clique, senao o bloqueador de popup
  // barra; o download roda em paralelo para o arquivo ja estar na maquina.
  const openTarget = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    onDownload();
  };

  const shareToInstagram = () => {
    copyCaption(shareText);

    if (nativeShare) {
      onShare();
      return;
    }

    openTarget(INSTAGRAM_URL);
    setInstagramHint(true);
  };

  return (
    <Flex direction="column" gap="2">
      <Text as="p" size="1" weight="bold" color="gray">
        Postar em
      </Text>

      <Flex gap="2" wrap="wrap">
        <Button
          size="1"
          variant="outline"
          color="gray"
          disabled={disabled}
          onClick={shareToInstagram}
        >
          <InstagramLogoIcon />
          {nativeShare ? "Instagram Stories" : "Instagram"}
        </Button>

        {socialTargets.map((target) => (
          <Button
            key={target.value}
            size="1"
            variant="outline"
            color="gray"
            disabled={disabled}
            onClick={() => openTarget(target.buildUrl(shareText, APP_URL))}
          >
            {target.label}
            <ExternalLinkIcon />
          </Button>
        ))}
      </Flex>

      <Text as="p" size="1" color="gray">
        {nativeShare
          ? "O Instagram abre a folha de compartilhamento do sistema — escolha Stories e a imagem vai anexada. Nas outras redes a legenda vai pronta e a imagem é baixada para você anexar."
          : "As redes não aceitam anexo por link: a imagem é baixada e a legenda vai preenchida — é só anexar o arquivo na hora de postar."}
      </Text>

      {instagramHint && (
        <Text as="p" size="1" color="gray">
          Imagem baixada e legenda copiada. O story só pode ser publicado pelo app
          do Instagram — abra o app no celular (ou use este botão pelo navegador
          do celular) para postar.
        </Text>
      )}
    </Flex>
  );
};
