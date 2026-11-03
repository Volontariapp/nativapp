import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });

export const createQueryWrapper = (client: QueryClient = createTestQueryClient()) => {
  const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return wrapper;
};
