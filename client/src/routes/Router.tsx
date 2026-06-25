import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "../features/auth/RequireAuth";
import { Home, Login } from "../pages";
import AlbumPage from "../pages/AlbumPage";
import ArtistPage from "../pages/ArtistsPage";
import LibraryPage from "../pages/LibraryPage";
import PlaylistPage from "../pages/PlaylistPage";
import PlaylistsPage from "../pages/PlaylistsPage";
import SearchPage from "../pages/SearchPage";
import TopArtistsPage from "../pages/TopArtistsPage";
import TopTracksPage from "../pages/TopTracksPage";
import TrackPage from "../pages/TrackPage";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/top-artists"
          element={
            <RequireAuth>
              <TopArtistsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/top-tracks"
          element={
            <RequireAuth>
              <TopTracksPage />
            </RequireAuth>
          }
        />
        <Route
          path="/library"
          element={
            <RequireAuth>
              <LibraryPage />
            </RequireAuth>
          }
        />
        <Route
          path="/search"
          element={
            <RequireAuth>
              <SearchPage />
            </RequireAuth>
          }
        />
        <Route
          path="/playlists"
          element={
            <RequireAuth>
              <PlaylistsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/playlists/:id"
          element={
            <RequireAuth>
              <PlaylistPage />
            </RequireAuth>
          }
        />
        <Route
          path="/artists/:id"
          element={
            <RequireAuth>
              <ArtistPage />
            </RequireAuth>
          }
        />
        <Route
          path="/tracks/:id"
          element={
            <RequireAuth>
              <TrackPage />
            </RequireAuth>
          }
        />
        <Route
          path="/albums/:id"
          element={
            <RequireAuth>
              <AlbumPage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
