import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getOneTrack,
  getRecommendationsBasedOnTrack,
} from "../provider/spotfy";
import { TrackCard } from "../components/Track/TrackCard";

const TrackPage = () => {
  const [track, setTrack] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[] | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrack = async () => {
      const response = await getOneTrack(id);
      setTrack(response);
    };
    fetchTrack();
  }, [id]);

  useEffect(() => {
    const fetchRelatedTracks = async () => {
      const response = await getRecommendationsBasedOnTrack(id);
      setRecommendations(response.tracks);
    };
    fetchRelatedTracks();
  }, [id]);

  const handleTrackClick = (id: string) => {
    navigate(`/tracks/${id}`);
  };

  return (
    <div>
      {track ? (
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4">{track.name}</h1>
          <img
            src={track.album.images[0]?.url}
            alt={track.name}
            className="rounded-full mb-4 w-64 h-64 object-cover"
          />
          <div className="flex flex-col items-center space-y-4">
            <audio src={track.preview_url} controls className="mb-4" />
            <div className="flex items-center space-x-4 mb-4">
              <p className="text-gray-500 font-medium">Album:</p>
              <p>{track.album.name}</p>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <p className="text-gray-500 font-medium">Artists:</p>
              <p>
                {track.artists.map((artist: any) => (
                  <Link
                    to={`/artists/${artist.id}`}
                    key={artist.id}
                    className="text-blue-500 hover:underline"
                  >
                    {artist.name}
                  </Link>
                ))}
              </p>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <p className="text-gray-500 font-medium">Duration:</p>
              <p>{(track.duration_ms / 1000 / 60).toFixed(2)} min</p>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <p className="text-gray-500 font-medium">Popularity:</p>
              <p>{track.popularity}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div role="status">
            <svg
              aria-hidden="true"
              className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-green-500"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
      {recommendations && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Related Tracks</h2>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
            {recommendations.map((track) => (
              <div onClick={() => handleTrackClick(track.id)}>
                <TrackCard key={track.id} track={track} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPage;
