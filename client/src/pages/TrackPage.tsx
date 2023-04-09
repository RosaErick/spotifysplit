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
        <div>Loading...</div>
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