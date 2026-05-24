export const cacheStrategy = {
  staleTime: {
    default: 60 * 1000,
    static: 5 * 60 * 1000,
    realtime: 15 * 1000,
    user: 30 * 1000,
  },
  gcTime: {
    default: 10 * 60 * 1000,
    static: 30 * 60 * 1000,
  },
  prefetchRoutes: ['/projects', '/services', '/dashboard'] as const,
};

export async function prefetchQuery(
  fetcher: () => Promise<unknown>,
  key: readonly string[]
): Promise<void> {
  const { queryClient } = await import('./query-client');
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: fetcher,
    staleTime: cacheStrategy.staleTime.static,
  });
}

export function invalidateClientWorkspace(): void {
  import('./query-client').then(({ queryClient, queryKeys }) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clientFiles });
    queryClient.invalidateQueries({ queryKey: queryKeys.clientMediaRequests });
    queryClient.invalidateQueries({ queryKey: queryKeys.clientInvoices });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  });
}
