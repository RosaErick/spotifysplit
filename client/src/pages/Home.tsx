import { Profile } from "../components/Profile";
import { useEffect, useState } from "react";
import { logout, getTotalUserInfo, accessToken } from "../provider/spotfy";
import { UserProfile } from "../interfaces/interfaces";
import { useQuery } from "react-query";
import { Navigate } from "react-router";

type Props = {};

export const Home = (props: Props) => {
  const [profile, setProfile] = useState<UserProfile>();
  const [followedArtists, setFollowedArtists] = useState<any>();
  const [playlists, setPlaylists] = useState<any>();
  const [topArtists, setTopArtists] = useState<any>();
  const [token, setToken] = useState<any>(null);

  const getTotalUserInfoQuery = useQuery("getTotalUserInfo", getTotalUserInfo, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log(data);

      if (data.userProfile.error) {
        logout();
        return <Navigate to="/login" />;
      }

      setProfile(data.userProfile);
      setFollowedArtists(data.followedArtists);
      setPlaylists(data.playlists);
      setTopArtists(data.topArtists);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const tokenQuery = useQuery("getAccessToken", () => accessToken, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setToken(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  console.log("token", token);
  console.log("tokenQuery", tokenQuery);

  useEffect(() => {
    setToken(accessToken);
  });

  return (
    <>
      {token && (
        <div className="bg-black  flex flex-col justify-center items-center">
          <Profile
            profile={profile}
            playlists={playlists}
            following={followedArtists}
          />

          <button
            className="bg-red-700 m-auto hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() => logout()}
          >
            {" "}
            Log Out
          </button>
        </div>
      )}
    </>
  );
};
