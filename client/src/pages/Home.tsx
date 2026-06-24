import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import TopAlbums from "../components/Album/TopAlbums";
import { TopArtists } from "../components/Artist/TopArtists";
import { AppShell } from "../components/Layout/AppShell";
import { LoadingState } from "../components/Layout/LoadingState";
import { Profile } from "../components/Profile/Profile";
import { RecentlyPlayedTracks } from "../components/Track/RecentlyPlayedTracks";
import TopTracks from "../components/Track/TopTracks";
import { getAccessToken, logout } from "../provider/spotfy";

export const Home = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getAccessToken()));
    setLoading(false);
  }, []);

  if (loading) return <LoadingState label="Preparando painel" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <AppShell
      onLogout={() => {
        logout();
        setIsAuthenticated(false);
      }}
    >
      <Profile />
      <RecentlyPlayedTracks />
      <TopArtists />
      <TopTracks />
      <TopAlbums />
    </AppShell>
  );
};
