import { Profile } from "../components/Profile";
import { useState, useEffect } from "react";
import { logout, getTotalUserInfo, accessToken } from "../provider/spotfy";
import { UserProfile } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import { TopArtists } from "../components/TopArtists";
import TopTracks from "../components/TopTracks";
import TopAlbums from "../components/TopAlbums";

type Props = {};

export const Home = (props: Props) => {
  const [profile, setProfile] = useState<UserProfile>();
  const [followedArtists, setFollowedArtists] = useState<any>();
  const [playlists, setPlaylists] = useState<any>();
  const [token, setToken] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTotalUserInfo();

        if (data.userProfile.error) {
          logout();
        }

        setProfile(data.userProfile);
        setFollowedArtists(data.followedArtists);
        setPlaylists(data.playlists);
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, [navigate]);

  useEffect(() => {
    setToken(accessToken);
  }, []);

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
                <TopArtists />
              </div>
              <div className="w-full">
                <TopTracks />
              </div>
              <div className="w-full">
                <TopAlbums />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
