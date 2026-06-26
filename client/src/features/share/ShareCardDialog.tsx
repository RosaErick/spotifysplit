// Modal (Radix Dialog) para gerar a imagem dos top artistas.
// Seletor de periodo + formato, preview ao vivo do poster e acoes de
// download / compartilhamento. Componente autossuficiente (sem props):
// usa os hooks de dados internamente. O outro dev monta <ShareButton /> no
// card de perfil (ShareButton apenas reexporta este componente).
import { useEffect, useMemo, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import {
  Box,
  Button,
  Callout,
  Dialog,
  Flex,
  SegmentedControl,
  Spinner,
  Text,
} from "@radix-ui/themes";
import {
  DownloadIcon,
  ExclamationTriangleIcon,
  Share2Icon,
} from "@radix-ui/react-icons";
import {
  useProfileOverview,
  useTopArtists,
  useTopTracks,
} from "../../shared/api/queries";
import { SpotifyTopTimeRange } from "../../shared/types/spotify";
import {
  defaultShareFormat,
  ShareFormat,
  shareFormatOptions,
  shareFormats,
} from "./formats";
import {
  defaultSharePeriod,
  getSharePeriodOption,
  sharePeriodOptions,
} from "./periods";
import { pickImageUrl, useImageDataUrls } from "./images";
import { ShareCardPoster, PosterItem } from "./ShareCardPoster";
import { defaultPosterColor, posterColorPresets } from "./posterThemes";
import { canShareFiles, useShareCardImage } from "./useShareCardImage";

// Sempre buscamos os 10 primeiros; o formato apenas fatia (evita refetch ao
// trocar Story/Post).
const MAX_ITEMS = 10;
const PREVIEW_HEIGHT = 440;

type ShareContent = "artists" | "tracks";

const shareContentOptions: { value: ShareContent; label: string }[] = [
  { value: "artists", label: "Artistas" },
  { value: "tracks", label: "Faixas" },
];

const POSTER_COLOR_KEY = "spotifysplit_poster_color";

const getInitialPosterColor = (): string => {
  if (typeof window === "undefined") return defaultPosterColor;
  const stored = window.localStorage.getItem(POSTER_COLOR_KEY);
  return stored && /^#[0-9a-fA-F]{6}$/.test(stored) ? stored : defaultPosterColor;
};

export const ShareCardDialog = () => {
  const [open, setOpen] = useState(false);
  const [timeRange, setTimeRange] =
    useState<SpotifyTopTimeRange>(defaultSharePeriod);
  const [format, setFormat] = useState<ShareFormat>(defaultShareFormat);
  const [accentColor, setAccentColor] = useState<string>(getInitialPosterColor);
  const [content, setContent] = useState<ShareContent>("artists");

  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.localStorage.setItem(POSTER_COLOR_KEY, accentColor);
  }, [accentColor]);

  const overview = useProfileOverview();
  const topArtists = useTopArtists(timeRange, MAX_ITEMS);
  const topTracks = useTopTracks(timeRange, MAX_ITEMS);
  const { status, error, download, share, reset } = useShareCardImage();

  const formatConfig = shareFormats[format];
  const periodOption = getSharePeriodOption(timeRange);
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
      return (topArtists.data?.items ?? [])
        .slice(0, MAX_ITEMS)
        .map((artist) => ({
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

  const { dataUrls, isLoading: imagesLoading } = useImageDataUrls(
    open ? imageUrls : []
  );

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
  const isWorking = status === "working";
  const assetsReady =
    !isLoadingData && !isError && !isEmpty && !imagesLoading;
  const actionsDisabled = !assetsReady || isWorking;

  const scale = PREVIEW_HEIGHT / formatConfig.height;
  const previewWidth = Math.round(formatConfig.width * scale);

  const fileName = `spotifysplit-top-${content}-${timeRange}.png`;
  const shareText = `Meus top ${contentNoun} no Spotify (${periodOption.label}) · via SpotfySplit`;

  const handleDownload = () => download(posterRef.current, fileName);
  const handleShare = () =>
    share(posterRef.current, fileName, shareText);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const supportsShare = canShareFiles();

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger>
        <Button variant="soft">
          <Share2Icon />
          Compartilhar stats em imagem
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="560px">
        <Dialog.Title>Compartilhar {contentLabel.toLowerCase()}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Gere uma imagem com os seus {contentNoun} mais{" "}
          {content === "artists" ? "ouvidos" : "ouvidas"} para compartilhar.
        </Dialog.Description>

        <Flex direction="column" gap="4">
          <Box>
            <Text as="p" size="1" weight="bold" mb="1" color="gray">
              Conteúdo
            </Text>
            <SegmentedControl.Root
              size="2"
              value={content}
              onValueChange={(value) => setContent(value as ShareContent)}
            >
              {shareContentOptions.map((option) => (
                <SegmentedControl.Item key={option.value} value={option.value}>
                  {option.label}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </Box>

          <Box>
            <Text as="p" size="1" weight="bold" mb="1" color="gray">
              Período
            </Text>
            <SegmentedControl.Root
              size="2"
              value={timeRange}
              onValueChange={(value) =>
                setTimeRange(value as SpotifyTopTimeRange)
              }
            >
              {sharePeriodOptions.map((option) => (
                <SegmentedControl.Item key={option.value} value={option.value}>
                  {option.label}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </Box>

          <Box>
            <Text as="p" size="1" weight="bold" mb="1" color="gray">
              Formato
            </Text>
            <SegmentedControl.Root
              size="2"
              value={format}
              onValueChange={(value) => setFormat(value as ShareFormat)}
            >
              {shareFormatOptions.map((option) => (
                <SegmentedControl.Item key={option.value} value={option.value}>
                  {option.label}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </Box>

          <Box>
            <Text as="p" size="1" weight="bold" mb="2" color="gray">
              Cor
            </Text>
            <Flex direction="column" gap="3" className="poster-color-field">
              <div className="poster-colorpicker">
                <HexColorPicker color={accentColor} onChange={setAccentColor} />
              </div>

              <Flex align="center" justify="between" gap="3" wrap="wrap">
                <Flex gap="2" align="center" wrap="wrap">
                  {posterColorPresets.map((preset) => {
                    const isActive =
                      preset.value.toLowerCase() === accentColor.toLowerCase();
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        className={`poster-color-preset${
                          isActive ? " poster-color-preset-active" : ""
                        }`}
                        style={{ background: preset.value }}
                        aria-label={preset.label}
                        aria-pressed={isActive}
                        onClick={() => setAccentColor(preset.value)}
                      />
                    );
                  })}
                </Flex>

                <Flex align="center" gap="2" className="poster-hex-field">
                  <Text size="1" color="gray">
                    Hex
                  </Text>
                  <HexColorInput
                    color={accentColor}
                    onChange={setAccentColor}
                    prefixed
                    className="poster-hex-input"
                    aria-label="Código hexadecimal da cor"
                  />
                </Flex>
              </Flex>
            </Flex>
          </Box>

          {/* Preview ao vivo */}
          <Flex
            justify="center"
            align="center"
            style={{
              background: "var(--gray-a3)",
              borderRadius: "var(--radius-4)",
              padding: 16,
              minHeight: PREVIEW_HEIGHT + 32,
            }}
          >
            {isError ? (
              <Callout.Root color="red" size="1">
                <Callout.Icon>
                  <ExclamationTriangleIcon />
                </Callout.Icon>
                <Callout.Text>
                  Não foi possível carregar{" "}
                  {content === "artists" ? "os seus artistas" : "as suas faixas"}.
                  Tente novamente.
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
                  <ShareCardPoster
                    ref={posterRef}
                    displayName={displayName}
                    avatarDataUrl={avatarDataUrl}
                    title={contentLabel}
                    items={posterItems}
                    periodLabel={periodOption.posterLabel}
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

          {status === "error" && error && (
            <Callout.Root color="red" size="1">
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          {status === "success" && (
            <Text size="1" color="green">
              Imagem gerada com sucesso.
            </Text>
          )}

          <Flex gap="3" justify="end" wrap="wrap">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Fechar
              </Button>
            </Dialog.Close>

            {supportsShare && (
              <Button
                variant="soft"
                disabled={actionsDisabled}
                onClick={handleShare}
              >
                <Share2Icon />
                Compartilhar
              </Button>
            )}

            <Button
              disabled={actionsDisabled}
              loading={isWorking}
              onClick={handleDownload}
            >
              <DownloadIcon />
              Baixar imagem
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
