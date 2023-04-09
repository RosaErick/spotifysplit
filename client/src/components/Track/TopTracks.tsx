import React, { useState, useEffect } from "react";
import { getTopTracks } from "../../provider/spotfy";
import { TrackCard } from "./TrackCard";
import { useNavigate } from "react-router-dom";

const TopTracks: React.FC = () => {
  const [tracks, setTracks] = useState<any[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getTopTracks().then((data) => {
      setTracks(data.items);
    });
  }, []);

  if (!tracks) return <div>Loading...</div>;

  const handleTrackClick = (id: string) => {
    navigate(`/tracks/${id}`);
  };

  return (
    <div className="pt-5">
      <h2 className="text-white mb-4 text-2xl">Top Tracks</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tracks.map((track: any) => (
          <div key={track.id} onClick={() => handleTrackClick(track.id)}>
            <TrackCard track={track} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopTracks;
