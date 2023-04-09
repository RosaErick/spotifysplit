import React from "react";

interface TrackCardProps {
  track: any;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  return (
    <div className="bg-[#121212] text-white w-60 h-30 p-4 rounded-lg shadow-md cursor-pointer transform hover:scale-105 transition-all duration-200 ease-in-out h-full flex flex-col">
      <div className="artist-image mb-4 flex-grow">
        <img
          src={track.album.images[0].url}
          alt={`Album cover for ${track.name}`}
          className="w-full h-48 w-100 object-cover rounded-lg shadow-md"
        />
      </div>
      <div className="flex flex-col justify-end">
        <h3 className="text-white text-base font-semibold mb-1 truncate">
          {track.name}
        </h3>
        <p className="text-gray-400 text-sm truncate">
          {track.artists.map((artist: any) => artist.name).join(", ")}
        </p>
      </div>
    </div>
  );
};
