import React from "react";

type Props = {
  tracks: any;
};

const TopTracks = (props: Props) => {
  const { tracks } = props;

  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="text-white font-bold  mt-10 text-lg">
        Most Played Songs of All Time
      </div>

      <div className="flex flex-col gap-10">
        {tracks?.items?.map((track: any) => (
          <div className="flex items-center gap-5 justify-start" key={track.id}>
            <img
              className="rounded-full h-20 w-20"
              src={track.album.images[0].url}
              alt="artist"
            />
            <p className="text-white font-semibold size">{track.name}</p>
            <p className="text-white font-semibold">{track.artists[0].name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopTracks;
