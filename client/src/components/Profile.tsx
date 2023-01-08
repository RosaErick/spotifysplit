import React from "react";
import { useState, useEffect } from "react";
import { getUserProfile } from "../provider/spotfy";
import { catchErrors } from "../utils/utils";
import { UserProfile } from "../interfaces/interfaces";

type Props = {
  profile: UserProfile | undefined;
  playlists: any;
  following: any;
};

export const Profile = (props: Props) => {
  const { profile, playlists, following } = props;

  return (
    <div className="bg-black hover:from-pink-500 hover:to-yellow-500  flex-col items-center justify-center">
      {profile?.images.length && profile.images[0].url && (
        <img
          src={profile.images[0].url}
          alt="profile"
          className="m-auto rounded-full mt-10 h-40 w-40"
        />
      )}
      <h1 className=" m-auto text-white font-bold text-center">
        {profile?.display_name}
      </h1>
      <div className="flex flex-col items-center text-white font-bold">
        <p>{profile?.product}</p>
        <div className="flex gap-5">
          <div className="m-auto flex flex-col items-center">
            <p>{profile?.followers.total}</p>
            <p>Followers</p>
          </div>
          <div className="m-auto flex flex-col items-center">
            <p>{playlists?.total}</p>
            <p>Playlists</p>
          </div>
          <div className="m-auto flex flex-col items-center">
            <p>{following?.artists?.items?.length}</p>
            <p>Following</p>
          </div>
        </div>
        <p></p>
      </div>
    </div>
  );
};
