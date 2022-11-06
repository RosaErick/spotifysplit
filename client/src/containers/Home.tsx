import React from "react";
import { Profile } from "../components/Profile";

type Props = {};

export const Home = (props: Props) => {
  return (
    <div>
      <h1>Welcome</h1>

      <Profile />
    </div>
  );
};
