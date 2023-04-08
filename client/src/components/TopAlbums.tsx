import React, { useEffect, useState } from "react";
import { getTopAlbums } from "../provider/spotfy";
import { AlbumCard } from "./AlbumCard";

const TopAlbums: React.FC = () => {
  const [albums, setAlbums] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const response = await getTopAlbums();
      setAlbums(response);
    })();
  }, []);

  return (
    <div className="pt-5">
      <h2 className="text-white mb-4 text-2xl">Top Albums</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {albums.map((album, index) => (
          <AlbumCard key={index} album={album} />
        ))}
      </div>
    </div>
  );
};

export default TopAlbums;
