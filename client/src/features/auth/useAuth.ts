import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";
import { clearSession, isAuthenticated } from "./auth";

// Estado de sessao para componentes: status atual e logout reativo.
export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [authenticated, setAuthenticated] = useState(isAuthenticated);

  const logout = useCallback(() => {
    clearSession();
    queryClient.clear();
    setAuthenticated(false);
    navigate("/login", { replace: true });
  }, [navigate, queryClient]);

  return { isAuthenticated: authenticated, logout };
};
