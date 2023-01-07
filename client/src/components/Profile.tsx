import React from "react";
import { useState, useEffect } from "react";
import { getUserProfile } from "../provider/spotfy";
import { catchErrors } from "../utils/utils";
import { UserProfile } from "../interfaces/interfaces";

type Props = {
  profile: UserProfile | undefined;
};

export const Profile = (props: Props) => {
  const { profile } = props;

  return (
    <div className="bg-black hover:from-pink-500 hover:to-yellow-500  flex-col items-center justify-center">
    {profile?.images.length && profile.images[0].url && (
        <img src={profile.images[0].url} alt="profile" className="m-auto rounded-full" />
      )} 

      <div className="flex flex-col items-center text-white font-bold">
        <p
          className="absolute bottom-0 left-0
      "
        >
          {profile?.display_name}
        </p>
        <p>{profile?.email}</p>
        <p>{profile?.country}</p>
        <p>{profile?.product}</p>
        <p>{profile?.followers.total}</p>
        <p></p>
      </div>
    </div>
  );
};
