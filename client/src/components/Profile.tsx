import React from "react";
import { useState, useEffect } from "react";
import { getUserProfile } from "../provider/spotfy";
import { catchErrors } from "../utils/utils";
import { UserProfile } from "../interfaces/interfaces";


type Props = {};



export const Profile = (props: Props) => {
  const [profile, setProfile] = useState<UserProfile>();

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await getUserProfile();
      console.log(response);
      setProfile(response);
    };

    catchErrors(fetchUserData());
  }, []);

  return (
    <div>
      <h1>Profile</h1>
      {profile?.images.length && profile.images[0].url && (
        <img src={profile.images[0].url} alt="profile" />
      )}
      <p>{profile?.display_name}</p>
      <p>{profile?.email}</p>
      <p>{profile?.country}</p>
      <p>{profile?.product}</p>
      <p>{profile?.followers.total}</p>
    </div>
  );
};
