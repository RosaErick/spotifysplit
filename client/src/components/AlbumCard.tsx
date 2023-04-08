import React from "react";


interface AlbumCardProps {
  album: any;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  return (
    <div className="bg-gray-800 p-4 rounded shadow-md">
      <div className="w-full h-40 mb-2">
        <img
          src={album.images[0].url}
          alt={`Album cover for ${album.name}`}
          className="w-full h-full object-cover rounded"
        />
      </div>
      <div>
        <h3 className="text-white text-lg">{album.name}</h3>
        <p className="text-gray-400">
          {album.artists.map((artist: any) => artist.name).join(", ")}
        </p>
        <p className="text-gray-400">{album.release_date}</p>
      </div>
    </div>
  );
};