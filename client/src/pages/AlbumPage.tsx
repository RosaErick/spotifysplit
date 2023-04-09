import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAlbumById, getAlbumTracks } from "../provider/spotfy";
import { TrackCard } from "../components/Track/TrackCard";
import { ArtistCard } from "../components/Artist/ArtistCard";

const AlbumPage = () => {
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbum = async () => {
      const response = await getAlbumById(id);
      setAlbum(response);
      setArtists(response.artists);
    };
    fetchAlbum();
  }, [id]);

  useEffect(() => {
    const fetchAlbumTracks = async () => {
      const response = await getAlbumTracks(id);
      setTracks(response.items);
    };
    fetchAlbumTracks();
  }, [id]);

  const handleTrackClick = (id: string) => {
    navigate(`/tracks/${id}`);
  };

  const handleArtistClick = (id: string) => {
    navigate(`/artists/${id}`);
  };

  return (
    <div>
      {album ? (
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4">{album.name}</h1>
          <img
            src={album.images[0]?.url}
            alt={album.name}
            className="rounded-full mb-4 w-64 h-64 object-cover"
          />
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <p className="text-gray-500 font-medium">Artists:</p>
              {artists.map((artist: any) => (
                <p key={artist.id} onClick={() => handleArtistClick(artist.id)}>
                  {artist.name}
                </p>
              ))}
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <p className="text-gray-500 font-medium">Total Tracks:</p>
              <p>{album.total_tracks}</p>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <p className="text-gray-500 font-medium">Duration:</p>
              <p>
                {(
                  tracks.reduce((acc, track) => acc + track.duration_ms, 0) /
                  1000 /
                  60
                ).toFixed(2)}{" "}
                min
              </p>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Tracks</h2>
            <ul className="space-y-4">
              {tracks.map((track) => (
                <li key={track.id}>
                  <span
                    className=" cursor-pointer
                    font-bold
                    text-white
                    hover:text-green-400
                    transition duration-200 ease-in-out


                    "
                    onClick={() => handleTrackClick(track.id)}
                  >
                    {track.name}
                  </span>
                  <span className="text-gray-500">
                    {" "}
                    -{" "}
                    {(track.duration_ms / 1000 / 60)
                      .toFixed(2)
                      .replace(".", ":")}{" "}
                    min
                  </span>

                  <span className="font-bold">
                    {" "}
                    -{" "}
                    {track.artists.map((artist: any) => (
                      <span
                        key={artist.id}
                        onClick={() => handleArtistClick(artist.id)}
                        className="cursor-pointer hover:text-green-400"
                      >
                        {artist.name}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default AlbumPage;
