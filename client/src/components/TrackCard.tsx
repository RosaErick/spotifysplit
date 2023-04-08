import React from "react";

interface TrackCardProps {
  track: any;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded shadow cursor-pointer">
      <div  className="artist-image">
        <div className="artist-image">
          <img
            src={track.album.images[0].url}
            alt={`Album cover for ${track.name}`}
            className="w-full h-full object-cover rounded  m-1 rounded-lg"
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
