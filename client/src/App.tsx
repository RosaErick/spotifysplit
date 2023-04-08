import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Home, Login } from "./pages";
import { Test } from "./pages/Test";
import ArtistPage from "./components/ArtistsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/artists/:id" element={<ArtistPage />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
