import React, { useState, useEffect } from "react";
import { getTopTracks } from   "../provider/spotfy";
import { TrackCard } from "./TrackCard";

export const TopTracks: React.FC = () => {
  const [tracks, setTracks] = useState<any | null>(null);

  useEffect(() => {
    getTopTracks().then((data) => {
      setTracks(data.items);
    });
  }, []);

  if (!tracks) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-white mb-4 text-2xl">Top Tracks</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tracks.map((track: any) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
};