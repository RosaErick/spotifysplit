import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Home, Login } from "./pages";
import { Test } from "./pages/Test";
import ArtistPage from "./pages/ArtistsPage";
import TrackPage from "./pages/TrackPage";
import AlbumPage from "./pages/AlbumPage";
import Router from "./routes/Router";

const queryClient = new QueryClient();

function App() {
  return <Router />;
}

export default App;
