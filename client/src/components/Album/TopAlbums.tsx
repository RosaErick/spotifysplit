import React, { useEffect, useState } from "react";
import { getTopAlbums } from "../../provider/spotfy";
import { AlbumCard } from "./AlbumCard";
import { useNavigate } from "react-router-dom";

const TopAlbums: React.FC = () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const response = await getTopAlbums();
      setAlbums(response);
    })();
  }, []);

  const handleAlbumClick = (id: string) => {
    navigate(`/albums/${id}`);
  };

  return (
    <div className="pt-5">
      <h2 className="text-white mb-4 text-2xl">Top Albums</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {albums.map((album, index) => (
          <div onClick={() => handleAlbumClick(album.id)}>
            <AlbumCard key={index} album={album} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopAlbums;
