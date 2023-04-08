import { Profile } from "../components/Profile";
import { useState } from "react";
import { logout, getTotalUserInfo, accessToken } from "../provider/spotfy";
import { UserProfile } from "../interfaces/interfaces";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { TopArtists } from "../components/TopArtists";
import { TopTracks } from "../components/TopTracks";
import TopAlbums from "../components/TopAlbums";

type Props = {};

export const Home = (props: Props) => {
  const [profile, setProfile] = useState<UserProfile>();
  const [followedArtists, setFollowedArtists] = useState<any>();
  const [playlists, setPlaylists] = useState<any>();
  const [topArtists, setTopArtists] = useState<any>();
  const [topTracks, setTopTracks] = useState<any>();
  const [token, setToken] = useState<any>(null);
  const navigate = useNavigate();

  useQuery("getTotalUserInfo", getTotalUserInfo, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log(data);

      if (data.userProfile.error) {
        logout();
        navigate("/login");
      }

      setProfile(data.userProfile);
      setFollowedArtists(data.followedArtists);
      setPlaylists(data.playlists);
      setTopArtists(data.topArtists);
      setTopTracks(data.topTracks);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useQuery("getAccessToken", () => accessToken, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setToken(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <>
      {token && (
        <div className="bg-[#191414] min-h-screen flex flex-col items-center">
          <div className="containerpx-4 mx-auto max-w-screen-lg">
            <Profile
              profile={profile}
              playlists={playlists}
              following={followedArtists}
            />

            <button
              className="bg-red-700 m-auto flex mt-6 mb-10 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => logout()}
            >
              Log Out
            </button>

            <div>
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-4 md:text-3xl">
                  Top Artists
                </h2>
                <TopArtists />
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-4 md:text-3xl">
                  Top Tracks
                </h2>
                <TopTracks />
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-4 md:text-3xl">
                  Top Albums
                </h2>
                <TopAlbums />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
