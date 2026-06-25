import { AppShell } from "../components/Layout/AppShell";
import { PlaylistOverview } from "../components/Playlist/PlaylistOverview";
import { Profile } from "../components/Profile/Profile";
import { TopRankingsOverview } from "../components/Ranking/TopRankingsOverview";
import { RecentlyPlayedTracks } from "../components/Track/RecentlyPlayedTracks";
import { useAuth } from "../features/auth/useAuth";

export const Home = () => {
  const { logout } = useAuth();

  return (
      <AppShell onLogout={logout}>
        <Profile />
        <TopRankingsOverview />
        <PlaylistOverview />
        <RecentlyPlayedTracks />
      </AppShell>
  );
};
