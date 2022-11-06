import { useState, useEffect } from "react";
import { accessToken, logout } from "../provider/spotfy";
import { Profile } from "./Profile";

export const LoginForm = () => {
  const [token, setToken] = useState<string | null | undefined>(null);
  useEffect(() => setToken(accessToken));

  return (
    <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="flex items-center justify-between">
        {!token && (
          <button
            className="bg-green-800 hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            <a
              href="http://localhost:3000/login"
              className="text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign In
            </a>
          </button>
        )}

        {token && (
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
            <Profile />
          </>
        )}
      </div>
    </form>
  );
};
