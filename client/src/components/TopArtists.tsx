import React, { useEffect, useState } from "react";

type Props = {
  artists: any;
};

const TopArtists = (props: Props) => {
  const [artist, setTopArtists] = useState<any>();

  const { artists } = props;

  console.log(artists);

  useEffect(() => {
    setTopArtists(artists);
  }, [artists]);

  return (
    <>
      <h3
        className="text-white font-bold text-2xl mt-10"
      >TopArtists</h3>
      <div className="flex flex-col gap-10">
      {artist?.items?.map((artist: any) => (
        <div className="flex items-center gap-5 justify-start" key={artist.id}>
          <img className="rounded-full h-20 w-20" src={artist.images[0].url} alt="artist" />
          <p className="text-white font-semibold">{artist.name}</p>
        </div>
      ))}
      </div>
    </>
  );
};

export default TopArtists;
