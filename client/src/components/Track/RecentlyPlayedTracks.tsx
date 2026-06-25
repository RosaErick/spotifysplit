import { Box, Flex, IconButton, ScrollArea } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRecentlyPlayed } from "../../shared/api/queries";
import { ErrorState } from "../Layout/ErrorState";
import { NowPlayingTimelineCard, useNowPlaying } from "../Player/MiniPlayer";
import { RowSkeleton } from "../Layout/Skeleton";
import { Section } from "../Layout/Section";
import { TrackCard } from "./TrackCard";

const sectionTitle = "Últimas reproduções";

export const RecentlyPlayedTracks = () => {
  const { data, isLoading, isError, error, refetch } = useRecentlyPlayed();
  const nowPlaying = useNowPlaying();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const items = data?.items ?? [];

  const scroll = (left: number) => {
    scrollRef.current?.scrollBy({ left, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <Section title={sectionTitle} eyebrow="Linha do tempo">
        <RowSkeleton count={6} />
      </Section>
    );
  }
  if (isError) {
    return (
      <Section title={sectionTitle} eyebrow="Linha do tempo">
        <ErrorState error={error} onRetry={refetch} />
      </Section>
    );
  }
  if (items.length === 0 && !nowPlaying.item) return null;

  return (
    <Section
      title={sectionTitle}
      eyebrow="Linha do tempo"
      action={
        <Flex gap="2" display={{ initial: "none", sm: "flex" }}>
          <IconButton variant="soft" color="gray" onClick={() => scroll(-320)}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton variant="soft" color="gray" onClick={() => scroll(320)}>
            <ChevronRightIcon />
          </IconButton>
        </Flex>
      }
    >
      <ScrollArea scrollbars="horizontal" className="scroll-row">
        <Flex ref={scrollRef} gap="4" pb="3">
          {nowPlaying.item && (
            <Box width={{ initial: "200px", sm: "230px" }} flexShrink="0">
              <NowPlayingTimelineCard
                state={nowPlaying}
                onTrackSelect={(track) => navigate(`/tracks/${track.id}`)}
              />
            </Box>
          )}
          {items.map((item) => (
            <Box
              key={item.played_at}
              width={{ initial: "200px", sm: "230px" }}
              flexShrink="0"
            >
              <TrackCard
                track={item.track}
                onClick={() => navigate(`/tracks/${item.track.id}`)}
              />
            </Box>
          ))}
        </Flex>
      </ScrollArea>
    </Section>
  );
};
