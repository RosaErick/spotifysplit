import { getTopArtists } from "../../provider/spotfy";
import { ArtistCard } from "./ArtistCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const TopArtists = () => {
  const [topArtists, setTopArtists] = useState<any[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopArtists = async () => {
      const data = await getTopArtists();
      setTopArtists(data?.items);
    };
    fetchTopArtists();
  }, []);

  const handleArtistClick = (artist: any) => {
    navigate(`/artists/${artist.id}`);
  };

  if (!topArtists) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-white mb-4 text-2xl">Top Artists</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 grid-rows-1">
        {topArtists.map((artist: any) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onClick={() => handleArtistClick(artist)}
          />
        ))}
      </div>
    </div>
  );
};
