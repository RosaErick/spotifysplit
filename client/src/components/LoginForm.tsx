import { useState, useEffect } from "react";
import { accessToken, logout } from "../provider/spotfy";
import { Profile } from "./Profile";

export const LoginForm = () => {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">

      <div className="mb-4">
        <h1
          className="block text-gray-700 text-sm font-bold mb-2 sm:text-2xl"
        >
          Welcome to SpotStats
        </h1>


        <h2 className="title text-uppercase text-black font-bold">
          Login to Spotify
      </h2>


      </div>


      <div className="flex items-center justify-center">
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
      </div>
    </div>
  );
};
