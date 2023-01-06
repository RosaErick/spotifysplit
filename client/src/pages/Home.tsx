import { Profile } from "../components/Profile";
import { useState, useEffect } from "react";
import { getUserProfile, logout } from "../provider/spotfy";
import { catchErrors } from "../utils/utils";
import { UserProfile } from "../interfaces/interfaces";
import { useQuery } from "react-query";

type Props = {};

export const Home = (props: Props) => {
  const [profile, setProfile] = useState<UserProfile>();



  useEffect(() => {
    const fetchUserData = async () => {
      const response = await getUserProfile();
      console.log(response);

      if (response.error) {
        logout();
        window.location.href = "/login";
      } else {
        setProfile(response);
      }
    };

    catchErrors(fetchUserData());
  });

  return (
    <div>
      <h1>Welcome</h1>

      <Profile profile={profile} />
     
          <>
            <button
              className="bg-green-800 hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              <p>Logged In</p>
            </button>

            <button
              className="bg-green-800 hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => logout()}
            >
              {" "}
              Log Out
            </button>
     
          </>
        
    </div>
  );
};
