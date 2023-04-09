import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home, Login } from "../pages";
import ArtistPage from "../pages/ArtistsPage";
import TrackPage from "../pages/TrackPage";
import AlbumPage from "../pages/AlbumPage";


function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/artists/:id" element={<ArtistPage />} />
        <Route path="/tracks/:id" element={<TrackPage />} />
        <Route path="/albums/:id" element={<AlbumPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
