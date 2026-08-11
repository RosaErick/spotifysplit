// Estudio de imagem: um unico gatilho no card de perfil abre este modal, onde o
// usuario escolhe entre os formatos exportaveis (poster ranqueado ou mosaico de
// capas). O dialogo cuida da moldura e do que vale para o estudio inteiro —
// periodo, cor e formato do arquivo — para nao se perder na troca de aba (o
// Radix Tabs desmonta o conteudo inativo). Cada painel busca os proprios dados e
// cuida da propria exportacao.

import { useEffect, useRef, useState } from "react";
import { Button, Dialog, Tabs } from "@radix-ui/themes";
import { ImageIcon } from "@radix-ui/react-icons";
import { SpotifyTopTimeRange } from "../../shared/types/spotify";
import { CollagePanel } from "./collage/CollagePanel";
import { defaultImageFileFormat, ImageFileFormat } from "./fileFormats";
import { PosterPanel } from "./poster/PosterPanel";
import { defaultStudioColor, isValidHex } from "./studioTheme";

type StudioFormat = "poster" | "collage";

const DEFAULT_PERIOD: SpotifyTopTimeRange = "medium_term";

// Nome legado (a cor nasceu no poster); mantido para nao descartar a escolha de
// quem ja usava o app.
const STUDIO_COLOR_KEY = "spotifysplit_poster_color";

const getInitialColor = (): string => {
  if (typeof window === "undefined") return defaultStudioColor;
  const stored = window.localStorage.getItem(STUDIO_COLOR_KEY);
  return stored && isValidHex(stored) ? stored : defaultStudioColor;
};

export const ImageStudioDialog = () => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<StudioFormat>("poster");
  const [timeRange, setTimeRange] = useState<SpotifyTopTimeRange>(DEFAULT_PERIOD);
  const [accentColor, setAccentColor] = useState<string>(getInitialColor);
  const [fileFormat, setFileFormat] = useState<ImageFileFormat>(
    defaultImageFileFormat
  );

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.localStorage.setItem(STUDIO_COLOR_KEY, accentColor);
  }, [accentColor]);

  // Por padrao o foco cai no painel da aba (`tabindex=0`), e o anel de foco
  // global desenha um retangulo em volta do conteudo inteiro ao abrir. Mandar o
  // foco para a aba ativa e mais util e so mostra o anel quando o usuario
  // chegou pelo teclado.
  const focusActiveTab = (event: Event) => {
    const activeTab = contentRef.current?.querySelector<HTMLElement>(
      '[role="tab"][data-state="active"]'
    );
    if (!activeTab) return;
    event.preventDefault();
    activeTab.focus();
  };

  const sharedProps = {
    timeRange,
    onTimeRangeChange: setTimeRange,
    accentColor,
    onAccentColorChange: setAccentColor,
    fileFormat,
    onFileFormatChange: setFileFormat,
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="soft">
          <ImageIcon />
          Gerar imagem
        </Button>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="900px"
        ref={contentRef}
        onOpenAutoFocus={focusActiveTab}
      >
        <Dialog.Title>Gerar imagem</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Monte uma imagem com os seus stats para baixar ou compartilhar.
        </Dialog.Description>

        <Tabs.Root
          value={format}
          onValueChange={(value) => setFormat(value as StudioFormat)}
        >
          <Tabs.List mb="4">
            <Tabs.Trigger value="poster">Pôster</Tabs.Trigger>
            <Tabs.Trigger value="collage">Mosaico</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="poster">
            <PosterPanel {...sharedProps} />
          </Tabs.Content>

          <Tabs.Content value="collage">
            <CollagePanel {...sharedProps} />
          </Tabs.Content>
        </Tabs.Root>

        <Dialog.Close>
          <Button variant="soft" color="gray" mt="4">
            Fechar
          </Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
};
