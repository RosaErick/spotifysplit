// Modal (Radix Dialog) para gerar a imagem dos top artistas.
// Seletor de periodo + formato, preview ao vivo do poster e acoes de
// download / compartilhamento. Componente autossuficiente (sem props):
// usa os hooks de dados internamente. O outro dev monta <ShareButton /> no
// card de perfil (ShareButton apenas reexporta este componente).
import { useMemo, useRef, useState } from "react";
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
import { useProfileOverview, useTopArtists } from "../../shared/api/queries";
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
import { ShareCardPoster, PosterArtist } from "./ShareCardPoster";
import {
  defaultShareAccent,
  ShareAccent,
  shareAccentThemes,
} from "./posterThemes";
import { canShareFiles, useShareCardImage } from "./useShareCardImage";

// Sempre buscamos os 10 primeiros; o formato apenas fatia (evita refetch ao
// trocar Story/Post).
const MAX_ARTISTS = 10;
const PREVIEW_HEIGHT = 440;

export const ShareCardDialog = () => {
  const [open, setOpen] = useState(false);
  const [timeRange, setTimeRange] =
    useState<SpotifyTopTimeRange>(defaultSharePeriod);
  const [format, setFormat] = useState<ShareFormat>(defaultShareFormat);

  const posterRef = useRef<HTMLDivElement>(null);

  const overview = useProfileOverview();
  const topArtists = useTopArtists(timeRange, MAX_ARTISTS);
  const { status, error, download, share, reset } = useShareCardImage();

  const formatConfig = shareFormats[format];
  const periodOption = getSharePeriodOption(timeRange);

  const profile = overview.data?.profile;
  const displayName = profile?.display_name ?? "Você";
  const avatarUrl = pickImageUrl(profile?.images);

  const artists = useMemo(
    () => topArtists.data?.items ?? [],
    [topArtists.data]
  );

  // URLs (avatar + artistas) que precisam virar data URL antes da captura.
  const imageUrls = useMemo(() => {
    const urls: string[] = [];
    if (avatarUrl) urls.push(avatarUrl);
    for (const artist of artists.slice(0, MAX_ARTISTS)) {
      const url = pickImageUrl(artist.images);
      if (url) urls.push(url);
    }
    return urls;
  }, [avatarUrl, artists]);

  const { dataUrls, isLoading: imagesLoading } = useImageDataUrls(
    open ? imageUrls : []
  );

  const posterArtists: PosterArtist[] = useMemo(
    () =>
      artists.slice(0, MAX_ARTISTS).map((artist) => {
        const url = pickImageUrl(artist.images);
        return {
          id: artist.id,
          name: artist.name,
          imageDataUrl: url ? dataUrls[url] : undefined,
        };
      }),
    [artists, dataUrls]
  );

  const avatarDataUrl = avatarUrl ? dataUrls[avatarUrl] : undefined;

  const isLoadingData = overview.isLoading || topArtists.isLoading;
  const isError = overview.isError || topArtists.isError;
  const isEmpty = !isLoadingData && !isError && artists.length === 0;
  const isWorking = status === "working";
  const assetsReady =
    !isLoadingData && !isError && !isEmpty && !imagesLoading;
  const actionsDisabled = !assetsReady || isWorking;

  const scale = PREVIEW_HEIGHT / formatConfig.height;
  const previewWidth = Math.round(formatConfig.width * scale);

  const fileName = `spotifysplit-top-artists-${timeRange}.png`;
  const shareText = `Meus top artistas no Spotify (${periodOption.label}) · via SpotfySplit`;

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
          Gerar imagem
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="560px">
        <Dialog.Title>Compartilhar top artistas</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Gere uma imagem com os seus artistas mais ouvidos para compartilhar.
        </Dialog.Description>

        <Flex direction="column" gap="4">
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
                  Não foi possível carregar os seus artistas. Tente novamente.
                </Callout.Text>
              </Callout.Root>
            ) : isEmpty ? (
              <Text size="2" color="gray">
                Nenhum artista encontrado nesse período.
              </Text>
            ) : isLoadingData ? (
              <Flex direction="column" align="center" gap="2">
                <Spinner size="3" />
                <Text size="2" color="gray">
                  Carregando artistas…
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
                    artists={posterArtists}
                    periodLabel={periodOption.posterLabel}
                    format={formatConfig}
                    accent={defaultShareAccent}
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
