import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const TrackPage = () => {
  const [track, setTrack] = useState<any>(null);
  const { id } = useParams<{ id: string }>();

  const fetchTrack = async () => {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      method: "GET",
    });
    const data = await response.json();
    setTrack(data);
  };

  useEffect(() => {
    fetchTrack();
  }, []);

  return (
    <div>
      {track ? (
        <div>
          <h1>{track.name}</h1>
          <img src={track.album.images[0]?.url} alt={track.name} />
          <p>
            Artist(s):{" "}
            {track.artists.map((artist: any) => artist.name).join(", ")}
          </p>
          <p>Album: {track.album.name}</p>
          <p>Popularity: {track.popularity}</p>
          <p>Release Date: {track.album.release_date}</p>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default TrackPage;
