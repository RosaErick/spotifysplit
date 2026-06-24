import { Box, Flex, IconButton, ScrollArea } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentlyPlayedTracks } from "../../provider/spotfy";
import { Section } from "../Layout/Section";
import { TrackCard } from "./TrackCard";

interface ITrack {
  played_at: string;
  track: {
    id: string;
  };
}

export const RecentlyPlayedTracks = () => {
  const [tracks, setTracks] = useState<ITrack[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getRecentlyPlayedTracks().then((data) => setTracks(data?.items || []));
  }, []);

  const scroll = (left: number) => {
    scrollRef.current?.scrollBy({ left, behavior: "smooth" });
  };

  if (!tracks?.length) return null;

  return (
    <Section
      title="Ultimas reproducoes"
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
          {tracks.map((item) => (
            <Box
              key={item.played_at}
              width={{ initial: "220px", sm: "240px" }}
              flexShrink="0"
              onClick={() => navigate(`/tracks/${item.track.id}`)}
            >
              <TrackCard track={item.track} />
            </Box>
          ))}
        </Flex>
      </ScrollArea>
    </Section>
  );
};
