import React from "react";

type Props = {
  profile: any;
  playlists: any;
  following: any;
};

export const Profile = (props: Props) => {
  const { profile, playlists, following } = props;

  return (
    <div className="bg-gradient-to-b from-black to-transparent w-full flex flex-col items-center justify-center py-8">
      {profile?.images?.length && profile.images[0]?.url && (
        <img
          src={profile.images[0].url}
          alt="profile"
          className="m-auto rounded-full mt-6 h-32 w-32 shadow-md border-2 border-green-600"
        />
      )}
      <h1 className="m-auto mt-4 text-white font-bold text-xl text-center">
        {profile?.display_name}
      </h1>
      <div className="flex flex-col items-center text-white font-bold">
        <p className="rounded-full px-3 py-1 mt-4 bg-green-600">
          {profile?.product}
        </p>
        <div className="flex gap-5 mt-6">
          <div className="flex flex-col items-center">
            <p>{profile?.followers.total}</p>
            <p className="text-gray-300">Followers</p>
          </div>
          <div className="flex flex-col items-center">
            <p>{playlists?.total}</p>
            <p className="text-gray-300">Playlists</p>
          </div>
          <div className="flex flex-col items-center">
            <p>{following?.artists?.items?.length}</p>
            <p className="text-gray-300">Following</p>
          </div>
        </div>
      </div>
    </div>
  );
};
