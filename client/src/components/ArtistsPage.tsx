import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOneArtist, getRelatedArtists } from "../provider/spotfy";
import { ArtistCard } from "../components/ArtistCard";

const ArtistPage = () => {
  const [artist, setArtist] = useState<any>(null);
  const [relatedArtists, setRelatedArtists] = useState<any[] | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtist = async () => {
      const response = await getOneArtist(id);
      setArtist(response);
    };
    fetchArtist();
  }, [id]);

  useEffect(() => {
    const fetchRelatedArtists = async () => {
      const response = await getRelatedArtists(id);
      setRelatedArtists(response?.artists);
    };
    fetchRelatedArtists();
  }, [id]);

  const handleArtistClick = (id: string) => {
    navigate(`/artists/${id}`);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center py-8">
        <h1 className="text-3xl font-bold text-center mb-4">{artist?.name}</h1>
        <div className="rounded-full overflow-hidden w-64 h-64 flex items-center justify-center mb-4">
          {artist?.images[0] && (
            <img
              src={artist?.images[0].url}
              alt={artist?.name}
              className="w-full h-full object-cover rounded-full"
            />
          )}
        </div>
        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex items-center space-x-4">
            <p className="text-gray-500 font-medium">Popularity:</p>
            <p>{artist?.popularity}</p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-gray-500 font-medium">Genres:</p>
            <p>{artist?.genres.join(", ")}</p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-gray-500 font-medium">Followers:</p>
            <p>{artist?.followers.total}</p>
          </div>
        </div>
        <button
          className="bg-gray-900 text-white py-2 px-4 rounded-md shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
      {relatedArtists && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-4">
            Related Artists
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {relatedArtists.map((artist: any) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onClick={() => handleArtistClick(artist.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistPage;
