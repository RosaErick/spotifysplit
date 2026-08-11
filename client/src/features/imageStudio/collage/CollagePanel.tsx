// Painel do mosaico: grade quadrada de fotos de artistas ou capas de album.
//
// O preview e o proprio node exportado, renderizado na largura medida do
// container — o PNG sai identico ao que esta na tela, so reescalado para
// EXPORT_WIDTH na captura.

import { useMemo, useRef, useState } from "react";
import { Flex, SegmentedControl, Spinner, Switch, Text } from "@radix-ui/themes";
import { useProfileOverview } from "../../../shared/api/queries";
import { APP_NAME } from "../../../shared/constants/app";
import { getTopTimeRangeOption } from "../../../shared/constants/timeRanges";
import { useElementWidth } from "../../../shared/hooks/useElementWidth";
import {
  pickImageUrlForWidth,
  useImageDataUrls,
} from "../../../shared/image/remoteImages";
import { useImageExport } from "../../../shared/image/useImageExport";
import { SpotifyTopTimeRange } from "../../../shared/types/spotify";
import { EmptyState } from "../../../components/Layout/EmptyState";
import { ErrorState } from "../../../components/Layout/ErrorState";
import { ColorField } from "../ColorField";
import { ExportActions } from "../ExportActions";
import { imageFileFormats } from "../fileFormats";
import { PeriodField } from "../PeriodField";
import { StudioPanelProps } from "../studioPanel";
import { buildStudioTheme } from "../studioTheme";
import { StudioField, StudioLayout } from "../StudioLayout";
import { CollageBoard, CollageTile } from "./CollageBoard";
import { CollageSizePicker } from "./CollageSizePicker";
import {
  CollageSource,
  collageSourceOptions,
  DEFAULT_GRID_SIZE,
  EXPORT_WIDTH,
  getCollageSourceOption,
  MAX_GRID_SIZE,
  maxGridSizeFor,
} from "./collageOptions";
import { useCollageItems } from "./useCollageItems";

export const CollagePanel = ({
  timeRange,
  onTimeRangeChange,
  accentColor,
  onAccentColorChange,
  fileFormat,
  onFileFormatChange,
}: StudioPanelProps) => {
  const [source, setSource] = useState<CollageSource>("artists");
  // Tamanho pedido pelo usuario. O tamanho aplicado e limitado pelos itens que o
  // periodo devolve, mas a preferencia sobrevive a troca de periodo/conteudo.
  const [desiredSize, setDesiredSize] = useState(DEFAULT_GRID_SIZE);
  const [showLabels, setShowLabels] = useState(false);
  const [showCaption, setShowCaption] = useState(true);

  const boardRef = useRef<HTMLDivElement>(null);
  const { ref: previewRef, width: previewWidth } =
    useElementWidth<HTMLDivElement>();

  const overview = useProfileOverview();
  const { status, error: exportError, download, share } = useImageExport();
  const { items, isLoading, isError, error, refetch } = useCollageItems(
    source,
    timeRange
  );

  // Enquanto carrega mantemos o limite otimista para a grade nao "encolher"
  // antes de sabermos quantos itens existem.
  const availableMax = isLoading ? MAX_GRID_SIZE : maxGridSizeFor(items.length);
  const gridSize = Math.min(desiredSize, availableMax);

  // Cada celula ocupa EXPORT_WIDTH / gridSize no PNG: pedir a imagem nesse
  // tamanho evita baixar 640px para uma celula de 180px.
  const cellWidth = Math.round(EXPORT_WIDTH / gridSize);

  const visibleItems = useMemo(
    () =>
      items.slice(0, gridSize * gridSize).map((item) => ({
        ...item,
        imageUrl: pickImageUrlForWidth(item.images, cellWidth),
      })),
    [items, gridSize, cellWidth]
  );

  const imageUrls = useMemo(
    () =>
      visibleItems
        .map((item) => item.imageUrl)
        .filter((url): url is string => Boolean(url)),
    [visibleItems]
  );

  // As imagens viram data URLs same-origin: preview e captura usam exatamente as
  // mesmas fontes, e o canvas nunca fica "tingido" por recurso cross-origin.
  const { dataUrls, isLoading: imagesLoading } = useImageDataUrls(imageUrls);

  const tiles = useMemo<CollageTile[]>(
    () =>
      visibleItems.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        imageSrc: item.imageUrl ? dataUrls[item.imageUrl] : undefined,
      })),
    [visibleItems, dataUrls]
  );

  const sourceOption = getCollageSourceOption(source);
  const periodOption = getTopTimeRangeOption(timeRange);
  const displayName = overview.data?.profile.display_name ?? "Você";
  const eyebrow = `${sourceOption.captionLabel} · ${periodOption.captionLabel}`;
  const shareText = `Meu mosaico de ${sourceOption.noun} no Spotify (${periodOption.label}) · via ${APP_NAME}`;

  // Arredondar a largura para baixo ate um multiplo de `gridSize` mantem cada
  // celula com um numero inteiro de pixels. Sem isso as bordas caem em subpixels
  // e aparecem fios claros entre as capas — na tela e, ampliados, no PNG.
  const boardWidth = Math.floor(previewWidth / gridSize) * gridSize;

  const isEmpty = !isLoading && !isError && items.length === 0;
  const showsBoard = !isLoading && !isError && !isEmpty && boardWidth > 0;

  const fileFormatConfig = imageFileFormats[fileFormat];

  const exportRequest = {
    fileName: `spotifysplit-mosaico-${source}-${timeRange}-${gridSize}x${gridSize}.${fileFormatConfig.extension}`,
    // O mosaico ja pinta o proprio fundo; isso cobre as bordas e da ao JPEG a
    // base opaca que ele exige.
    backgroundColor: buildStudioTheme(accentColor).backgroundColor,
    targetWidth: EXPORT_WIDTH,
    mimeType: fileFormatConfig.mimeType,
    quality: fileFormatConfig.quality,
  };

  const controls = (
    <>
      <StudioField label="Conteúdo">
        <SegmentedControl.Root
          size="1"
          value={source}
          onValueChange={(value) => setSource(value as CollageSource)}
        >
          {collageSourceOptions.map((option) => (
            <SegmentedControl.Item key={option.value} value={option.value}>
              {option.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </StudioField>

      <PeriodField value={timeRange} onChange={onTimeRangeChange} />

      <CollageSizePicker
        value={gridSize}
        max={availableMax}
        disabled={isError || isEmpty}
        onChange={setDesiredSize}
      />

      <Flex direction="column" gap="2">
        <Text as="label" size="2">
          <Flex gap="2" align="center">
            <Switch
              size="1"
              checked={showLabels}
              onCheckedChange={setShowLabels}
            />
            Mostrar nomes
          </Flex>
        </Text>
        <Text as="label" size="2">
          <Flex gap="2" align="center">
            <Switch
              size="1"
              checked={showCaption}
              onCheckedChange={setShowCaption}
            />
            Mostrar legenda e marca
          </Flex>
        </Text>
      </Flex>

      <ColorField value={accentColor} onChange={onAccentColorChange} />

      <ExportActions
        status={status}
        error={exportError}
        disabled={!showsBoard || imagesLoading}
        fileFormat={fileFormat}
        onFileFormatChange={onFileFormatChange}
        shareText={shareText}
        onDownload={() => download(boardRef.current, exportRequest)}
        onShare={() => share(boardRef.current, { ...exportRequest, shareText })}
      />

      {imagesLoading && !isLoading && (
        <Flex gap="2" align="center">
          <Spinner size="1" />
          <Text size="1" color="gray">
            Preparando imagens…
          </Text>
        </Flex>
      )}

      {!isLoading && !isEmpty && availableMax < MAX_GRID_SIZE && (
        <Text as="p" size="1" color="gray">
          Esse período rendeu {items.length} {sourceOption.noun}: a maior grade
          cheia é {availableMax} × {availableMax}.
        </Text>
      )}
    </>
  );

  const preview = (
    <div className="studio-preview" ref={previewRef}>
      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isEmpty ? (
        <EmptyState
          message={`Sem ${sourceOption.noun} suficientes nesse período.`}
        />
      ) : showsBoard ? (
        <CollageBoard
          ref={boardRef}
          tiles={tiles}
          gridSize={gridSize}
          width={boardWidth}
          showLabels={showLabels}
          showCaption={showCaption}
          eyebrow={eyebrow}
          displayName={displayName}
          accentColor={accentColor}
        />
      ) : (
        <div className="skeleton studio-preview-placeholder" />
      )}
    </div>
  );

  return <StudioLayout controls={controls} preview={preview} />;
};
