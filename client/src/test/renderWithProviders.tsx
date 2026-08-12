// Monta a mesma pilha de providers do `main.tsx`, para os testes de componente
// exercitarem os componentes como eles rodam de verdade.
//
// `retry: false` e obrigatorio: com o retry padrao do React Query um teste de
// erro esperaria varios segundos antes de o estado de erro aparecer.

import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider, setLogger } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { AppThemeProvider } from "../components/Layout/AppThemeProvider";

// No React Query 3 o logger e global, nao uma opcao do QueryClient. Sem
// silencia-lo, todo teste de estado de erro despeja a falha esperada no console
// e esconde as falhas de verdade.
setLogger({ log: () => {}, warn: () => {}, error: () => {} });

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
    },
  });

type ProviderOptions = {
  route?: string;
  queryClient?: QueryClient;
};

/*
 * Os providers vao pela opcao `wrapper`, e nao envolvendo o `ui` na chamada: so
 * assim o `rerender` devolvido pela Testing Library remonta a arvore com os
 * mesmos providers. Envolver na chamada faz o rerender perder o Router e o
 * QueryClient.
 */
export const renderWithProviders = (
  ui: React.ReactNode,
  { route = "/", queryClient, ...options }: ProviderOptions & RenderOptions = {}
) => {
  const client = queryClient ?? createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <AppThemeProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AppThemeProvider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};
