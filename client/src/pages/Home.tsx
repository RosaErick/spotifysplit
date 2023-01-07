import { Profile } from "../components/Profile";
import { useState } from "react";
import { getUserProfile, logout } from "../provider/spotfy";
import { UserProfile } from "../interfaces/interfaces";
import { useQuery } from "react-query";

type Props = {};

export const Home = (props: Props) => {
  const [profile, setProfile] = useState<UserProfile>();

  const query = useQuery("profile", getUserProfile, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data.error) {
        logout();
        window.location.href = "/login";
      }

      setProfile(data);
    },
    onError: (error) => {
      console.log(error);
      logout();
      window.location.href = "/login";
    },
  });

  return (
    <div className="bg-black  flex flex-col justify-center items-center">
      <Profile profile={profile} />

      <button
        className="bg-green-800 m-auto hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="button"
        onClick={() => logout()}
      >
        {" "}
        Log Out
      </button>
    </div>
  );
};
