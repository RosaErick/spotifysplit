// Bloco de exportacao, igual para todos os formatos do estudio: formato do
// arquivo, baixar, compartilhar (Web Share, quando o navegador suporta arquivos),
// atalhos para redes sociais e o retorno de sucesso/erro.
//
// Nao conhece o que esta sendo exportado — recebe estado e callbacks.

import { Button, Callout, Flex, SegmentedControl, Text } from "@radix-ui/themes";
import {
  DownloadIcon,
  ExclamationTriangleIcon,
  Share2Icon,
} from "@radix-ui/react-icons";
import {
  canShareFiles,
  ImageExportStatus,
} from "../../shared/image/useImageExport";
import {
  ImageFileFormat,
  imageFileFormatOptions,
  imageFileFormats,
} from "./fileFormats";
import { SocialShareRow } from "./SocialShareRow";
import { StudioField } from "./StudioLayout";

interface ExportActionsProps {
  status: ImageExportStatus;
  error: string | null;
  /** Assets ainda carregando ou dados indisponiveis. */
  disabled: boolean;
  fileFormat: ImageFileFormat;
  onFileFormatChange: (format: ImageFileFormat) => void;
  /** Legenda sugerida ao abrir a rede social. */
  shareText: string;
  onDownload: () => void;
  onShare: () => void;
}

export const ExportActions = ({
  status,
  error,
  disabled,
  fileFormat,
  onFileFormatChange,
  shareText,
  onDownload,
  onShare,
}: ExportActionsProps) => {
  const isWorking = status === "working";
  const blocked = disabled || isWorking;

  return (
    <Flex direction="column" gap="3">
      <StudioField label="Formato do arquivo">
        <SegmentedControl.Root
          size="1"
          value={fileFormat}
          onValueChange={(value) => onFileFormatChange(value as ImageFileFormat)}
        >
          {imageFileFormatOptions.map((option) => (
            <SegmentedControl.Item key={option.value} value={option.value}>
              {option.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </StudioField>

      <Flex gap="2" wrap="wrap">
        <Button disabled={blocked} loading={isWorking} onClick={onDownload}>
          <DownloadIcon />
          Baixar {imageFileFormats[fileFormat].label}
        </Button>

        {canShareFiles() && (
          <Button variant="soft" disabled={blocked} onClick={onShare}>
            <Share2Icon />
            Compartilhar
          </Button>
        )}
      </Flex>

      <SocialShareRow
        shareText={shareText}
        disabled={blocked}
        onDownload={onDownload}
        onShare={onShare}
      />

      {status === "error" && error && (
        <Callout.Root color="red" size="1">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {status === "success" && (
        <Text as="p" size="1" color="green">
          Imagem gerada com sucesso.
        </Text>
      )}
    </Flex>
  );
};
