import React, { useState, useEffect, useRef } from "react";
import { getRecentlyPlayedTracks } from "../../provider/spotfy";
import { TrackCard } from "./TrackCard";
import { useNavigate } from "react-router-dom";

interface ITrack {
  played_at: string;
  track: {
    id: string;
    external_urls: {
      spotify: string;
    };
  };
}

export const RecentlyPlayedTracks: React.FC = () => {
  const [tracks, setTracks] = useState<ITrack[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getRecentlyPlayedTracks().then((data) => {
      setTracks(data.items);
    });
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  if (!tracks) return null;

  return (
    <div className="my-10">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Recently Played Tracks
      </h2>

      <div className="py-10 px-5 relative">
        <div>
          <button
            className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 z-10 text-green-500 hover:text-green-600 transition-all duration-200 ease-in-out"
            onClick={scrollLeft}
          >
            &lt;
          </button>
          <button
            className="hidden md:block absolute right-0  top-1/2 transform -translate-y-1/2 z-10 text-green-500 hover:text-green-600 transition-all duration-200 ease-in-out"
            onClick={scrollRight}
          >
            &gt;
          </button>
          <div className="overflow-x-scroll md:overflow-hidden relative w-full h-80" ref={scrollRef}>
            <div className="flex gap-1 py-4 pl-4 space-x-4 transition-all duration-200 ease-in-out whitespace-nowrap">
              {tracks.map((track: ITrack) => (
                <div
                  key={track.played_at}
                  onClick={() => navigate(`/tracks/${track.track.id}`)}
                  className="w-80 h-50"
                >
                  <TrackCard key={track.track.id} track={track.track} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
