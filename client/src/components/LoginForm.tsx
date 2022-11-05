import React from "react";
import { useState, useEffect } from "react";

type Props = {};

export const LoginForm = (props: Props) => {
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");

    if (refreshToken) {
      fetch(
        `/api/refresh_token?refresh_token=${refreshToken}`
      )
        .then((response) => {
          console.log(response);
          return response.json();
        })
        .then((data) => console.log(data))
        .catch((error) => console.log(error))
    }
  });

  return (
    <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="flex items-center justify-between">
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
    </form>
  );
};
