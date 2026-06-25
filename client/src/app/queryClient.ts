import { QueryClient } from "react-query";
import { SpotifyApiError } from "../shared/api/errors";

// Nao readianta repetir erros de autenticacao/autorizacao ou recurso ausente.
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof SpotifyApiError) {
    if (error.status === 401 || error.status === 403 || error.status === 404) {
      return false;
    }
  }
  return failureCount < 2;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});
