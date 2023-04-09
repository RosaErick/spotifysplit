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
      className="bg-[#1f1a1a] text-white h-full p-4 rounded-lg shadow-md cursor-pointer transform hover:scale-105 transition-all duration-200 ease-in-out flex flex-col justify-center align-center "
      onClick={onClick}
    >
      <div>
        {images[0] && (
          <img
            src={images[0].url}
            alt={name}
            className="m-auto rounded-full  h-32 w-32 shadow-md border-2 border-green-600"
          />
        )}
      </div>
      <div className="flex flex-col justify-center w-full mt-4">
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
          className="text-green-600 hover:text-blue-800 transition-all duration-200"
        >
          View on Spotify
        </a>
      </div>
    </div>
  );
};
