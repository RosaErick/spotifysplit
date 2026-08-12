import { AppShell } from "../components/Layout/AppShell";
import { PlaylistOverview } from "../components/Playlist/PlaylistOverview";
import { Profile } from "../components/Profile/Profile";
import { TopRankingsOverview } from "../components/Ranking/TopRankingsOverview";
import { RecentlyPlayedTracks } from "../components/Track/RecentlyPlayedTracks";
import { TourInvite } from "../features/tour";

export const Home = () => {
  return (
    <AppShell>
      <Profile />
      <TourInvite />
      <TopRankingsOverview />
      <PlaylistOverview />
      <RecentlyPlayedTracks />
    </AppShell>
  );
};
