// Painel do poster: lista ranqueada dos top artistas ou faixas, em Story 9:16 ou
// Post 4:5, com cor de acento escolhida pelo usuario. Cuida dos proprios dados,
// imagens e exportacao; a moldura (modal, abas) fica no ImageStudioDialog.

import { useMemo, useRef, useState } from "react";
import {
  Box,
  Callout,
  Flex,
  SegmentedControl,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import {
  useProfileOverview,
  useTopArtists,
  useTopTracks,
} from "../../../shared/api/queries";
import { APP_BRAND, APP_NAME } from "../../../shared/constants/app";
import { getTopTimeRangeOption } from "../../../shared/constants/timeRanges";
import {
  pickImageUrl,
  useImageDataUrls,
} from "../../../shared/image/remoteImages";
import { useImageExport } from "../../../shared/image/useImageExport";
import { ColorField } from "../ColorField";
import { ExportActions } from "../ExportActions";
import { imageFileFormats } from "../fileFormats";
import { PeriodField } from "../PeriodField";
import { StudioPanelProps } from "../studioPanel";
import { buildStudioTheme } from "../studioTheme";
import { StudioField, StudioLayout } from "../StudioLayout";
import {
  defaultShareFormat,
  ShareFormat,
  shareFormatOptions,
  shareFormats,
} from "./formats";
import { PosterCard, PosterItem } from "./PosterCard";

// Sempre buscamos os 10 primeiros; o formato apenas fatia (evita refetch ao
// trocar Story/Post).
const MAX_ITEMS = 10;
const PREVIEW_HEIGHT = 460;

type PosterContent = "artists" | "tracks";

const posterContentOptions: { value: PosterContent; label: string }[] = [
  { value: "artists", label: "Artistas" },
  { value: "tracks", label: "Faixas" },
];

export const PosterPanel = ({
  timeRange,
  onTimeRangeChange,
  accentColor,
  onAccentColorChange,
  fileFormat,
  onFileFormatChange,
}: StudioPanelProps) => {
  const [format, setFormat] = useState<ShareFormat>(defaultShareFormat);
  const [content, setContent] = useState<PosterContent>("artists");

  const posterRef = useRef<HTMLDivElement>(null);

  const overview = useProfileOverview();
  const topArtists = useTopArtists(timeRange, MAX_ITEMS, {
    enabled: content === "artists",
  });
  const topTracks = useTopTracks(timeRange, MAX_ITEMS, {
    enabled: content === "tracks",
  });
  const { status, error, download, share } = useImageExport();

  const formatConfig = shareFormats[format];
  const periodOption = getTopTimeRangeOption(timeRange);
  const activeQuery = content === "artists" ? topArtists : topTracks;

  const profile = overview.data?.profile;
  const displayName = profile?.display_name ?? "Você";
  const avatarUrl = pickImageUrl(profile?.images);

  const contentLabel = content === "artists" ? "Top artistas" : "Top faixas";
  const contentNoun = content === "artists" ? "artistas" : "faixas";
  const tagline =
    content === "artists"
      ? "Seus top artistas · dados via Spotify"
      : "Suas top faixas · dados via Spotify";

  // Lista unificada (artistas ou faixas) com a url de imagem ainda crua.
  const sourceItems = useMemo(() => {
    if (content === "artists") {
      return (topArtists.data?.items ?? []).slice(0, MAX_ITEMS).map((artist) => ({
        id: artist.id,
        name: artist.name,
        subtitle: undefined as string | undefined,
        imageUrl: pickImageUrl(artist.images),
      }));
    }
    return (topTracks.data?.items ?? []).slice(0, MAX_ITEMS).map((track) => ({
      id: track.id,
      name: track.name,
      subtitle: track.artists?.map((artist) => artist.name).join(", "),
      imageUrl: pickImageUrl(track.album?.images),
    }));
  }, [content, topArtists.data, topTracks.data]);

  // URLs (avatar + itens) que precisam virar data URL antes da captura.
  const imageUrls = useMemo(() => {
    const urls: string[] = [];
    if (avatarUrl) urls.push(avatarUrl);
    for (const item of sourceItems) {
      if (item.imageUrl) urls.push(item.imageUrl);
    }
    return urls;
  }, [avatarUrl, sourceItems]);

  const { dataUrls, isLoading: imagesLoading } = useImageDataUrls(imageUrls);

  const posterItems: PosterItem[] = useMemo(
    () =>
      sourceItems.map((item) => ({
        id: item.id,
        name: item.name,
        subtitle: item.subtitle,
        imageDataUrl: item.imageUrl ? dataUrls[item.imageUrl] : undefined,
      })),
    [sourceItems, dataUrls]
  );

  const avatarDataUrl = avatarUrl ? dataUrls[avatarUrl] : undefined;

  const isLoadingData = overview.isLoading || activeQuery.isLoading;
  const isError = overview.isError || activeQuery.isError;
  const isEmpty = !isLoadingData && !isError && sourceItems.length === 0;
  const showsPoster = !isLoadingData && !isError && !isEmpty;

  const scale = PREVIEW_HEIGHT / formatConfig.height;
  const previewWidth = Math.round(formatConfig.width * scale);

  const fileFormatConfig = imageFileFormats[fileFormat];

  const exportRequest = {
    fileName: `${APP_BRAND}-top-${content}-${timeRange}.${fileFormatConfig.extension}`,
    // O poster ja pinta o proprio fundo; isso cobre as bordas e da ao JPEG a
    // base opaca que ele exige.
    backgroundColor: buildStudioTheme(accentColor).backgroundColor,
    mimeType: fileFormatConfig.mimeType,
    quality: fileFormatConfig.quality,
  };

  const shareText = `Meus top ${contentNoun} no Spotify (${periodOption.label}) · via ${APP_NAME}`;

  const controls = (
    <>
      <StudioField label="Conteúdo">
        <SegmentedControl.Root
          size="1"
          value={content}
          onValueChange={(value) => setContent(value as PosterContent)}
        >
          {posterContentOptions.map((option) => (
            <SegmentedControl.Item key={option.value} value={option.value}>
              {option.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </StudioField>

      <PeriodField value={timeRange} onChange={onTimeRangeChange} />

      <StudioField label="Formato">
        <SegmentedControl.Root
          size="1"
          value={format}
          onValueChange={(value) => setFormat(value as ShareFormat)}
        >
          {shareFormatOptions.map((option) => (
            <SegmentedControl.Item key={option.value} value={option.value}>
              {option.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </StudioField>

      <ColorField value={accentColor} onChange={onAccentColorChange} />

      <ExportActions
        status={status}
        error={error}
        disabled={!showsPoster || imagesLoading}
        fileFormat={fileFormat}
        onFileFormatChange={onFileFormatChange}
        shareText={shareText}
        onDownload={() => download(posterRef.current, exportRequest)}
        onShare={() => share(posterRef.current, { ...exportRequest, shareText })}
      />
    </>
  );

  const preview = (
    <Flex
      className="studio-preview studio-preview-padded"
      align="center"
      justify="center"
      style={{ minHeight: PREVIEW_HEIGHT + 32 }}
    >
      {isError ? (
        <Callout.Root color="red" size="1">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>
            Não foi possível carregar{" "}
            {content === "artists" ? "os seus artistas" : "as suas faixas"}. Tente
            novamente.
          </Callout.Text>
        </Callout.Root>
      ) : isEmpty ? (
        <Text size="2" color="gray">
          {content === "artists"
            ? "Nenhum artista encontrado"
            : "Nenhuma faixa encontrada"}{" "}
          nesse período.
        </Text>
      ) : isLoadingData ? (
        <Flex direction="column" align="center" gap="2">
          <Spinner size="3" />
          <Text size="2" color="gray">
            Carregando {contentNoun}…
          </Text>
        </Flex>
      ) : (
        <Box
          style={{
            position: "relative",
            width: previewWidth,
            height: PREVIEW_HEIGHT,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 18px 50px rgba(0,0,0,0.4)",
          }}
        >
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <PosterCard
              ref={posterRef}
              displayName={displayName}
              avatarDataUrl={avatarDataUrl}
              title={contentLabel}
              items={posterItems}
              periodLabel={periodOption.captionLabel}
              tagline={tagline}
              format={formatConfig}
              accentColor={accentColor}
            />
          </Box>

          {imagesLoading && (
            <Flex
              align="center"
              justify="center"
              gap="2"
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(20,14,9,0.55)",
              }}
            >
              <Spinner />
              <Text size="1" style={{ color: "#f5e9d8" }}>
                Preparando imagens…
              </Text>
            </Flex>
          )}
        </Box>
      )}
    </Flex>
  );

  return <StudioLayout controls={controls} preview={preview} />;
};
