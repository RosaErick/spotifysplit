import React from "react";

interface TrackCardProps {
  track: any;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  return (
    <div className="bg-gray-800 p-4 rounded shadow-md">
      <div className="flex items-center">
        <div className="w-16 h-16 mr-4">
          <img
            src={track.album.images[0].url}
            alt={`Album cover for ${track.name}`}
            className="w-full h-full object-cover rounded"
          />
        </div>
        <div>
          <h3 className="text-white text-lg">{track.name}</h3>
          <p className="text-gray-400">
            {track.artists.map((artist: any) => artist.name).join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
};