import { Navigate } from "react-router-dom";
import { isAuthenticated } from "./auth";

// Guarda unica de rotas privadas. O token e lido de forma sincrona,
// entao nao ha estado de loading nem flicker.
export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
