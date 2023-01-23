import { BrowserRouter, Routes, Route } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "react-query";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Test } from "./pages/Test";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Home />} />

            <Route path='/test' element={<Test />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
