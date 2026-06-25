import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Box, Button, Card, Flex, SegmentedControl, Text } from "@radix-ui/themes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/Layout/AppShell";
import { EmptyState } from "../components/Layout/EmptyState";
import { ErrorState } from "../components/Layout/ErrorState";
import { LoadingState } from "../components/Layout/LoadingState";
import { Section } from "../components/Layout/Section";
import { TrackRankingList } from "../components/Ranking/RankingLists";
import { useTopTracks } from "../shared/api/queries";
import { topTimeRangeOptions } from "../shared/constants/timeRanges";
import { SpotifyTopTimeRange } from "../shared/types/spotify";

const TopTracksPage = () => {
  const [timeRange, setTimeRange] = useState<SpotifyTopTimeRange>("long_term");
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useTopTracks(timeRange, 50);
  const tracks = data?.items ?? [];
  const selectedOption = topTimeRangeOptions.find((option) => option.value === timeRange);

  return (
    <AppShell>
      <Button variant="soft" color="gray" mb="4" onClick={() => navigate(-1)}>
        <ArrowLeftIcon />
        Voltar
      </Button>

      <Section title="Top faixas" eyebrow="Mais ouvidas">
        <Card className="filter-panel" mb="5">
          <Flex direction={{ initial: "column", sm: "row" }} gap="4" justify="between">
            <Box>
              <Text as="p" size="2" weight="bold">
                Período
              </Text>
              <Text as="p" size="1" color="gray" mt="1">
                {selectedOption?.description}
              </Text>
            </Box>

            <SegmentedControl.Root
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as SpotifyTopTimeRange)}
            >
              {topTimeRangeOptions.map((option) => (
                <SegmentedControl.Item key={option.value} value={option.value}>
                  {option.label}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </Flex>
        </Card>

        {isLoading ? (
          <LoadingState label="Carregando faixas" />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : tracks.length === 0 ? (
          <EmptyState message="Nenhuma faixa encontrada nesse período." />
        ) : (
          <TrackRankingList
            tracks={tracks}
            onSelect={(track) => navigate(`/tracks/${track.id}`)}
          />
        )}
      </Section>
    </AppShell>
  );
};

export default TopTracksPage;
