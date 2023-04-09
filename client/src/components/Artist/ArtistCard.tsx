import React from "react";

interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    images: { url: string }[];
    genres: string[];
    external_urls: { spotify: string };
  };
  onClick?: any;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  const { name, images, genres, external_urls } = artist;

  return (
    <div
      className="bg-gray-900 text-white p-4 rounded shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="artist-image">
        {images[0] && (
          <img
            src={images[0].url}
            alt={name}
            className="w-full h-48 object-cover rounded-lg"
          />
        )}
      </div>
      <div className="artist-info mt-4">
        <h3 className="text-white font-semibold text-lg">{name}</h3>
        <p className="text-gray-400 text-sm mt-2">
          Genres: {genres.join(", ")}
        </p>
      </div>
      <div className="artist-link mt-4">
        <a
          href={external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-all duration-200"
        >
          View on Spotify
        </a>
      </div>
    </div>
  );
};
