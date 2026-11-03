import { QueryClient } from '@tanstack/react-query';
import {
  PROFILE_QUERY_KEY,
  PUBLIC_PROFILE_QUERY_KEY,
  publicProfileQueryKey,
} from '../user-query-keys';

describe('user query keys', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    queryClient.setQueryData(PROFILE_QUERY_KEY, { id: 'me' });
    queryClient.setQueryData(publicProfileQueryKey('author-1'), { id: 'author-1' });
    queryClient.setQueryData(publicProfileQueryKey('author-2'), { id: 'author-2' });
  });

  afterEach(() => {
    queryClient.clear();
    jest.restoreAllMocks();
  });

  it('invalider le profil perso n invalide pas les profils publics', async () => {
    await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY, refetchType: 'none' });

    expect(queryClient.getQueryState(PROFILE_QUERY_KEY)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(publicProfileQueryKey('author-1'))?.isInvalidated).toBe(false);
    expect(queryClient.getQueryState(publicProfileQueryKey('author-2'))?.isInvalidated).toBe(false);
  });

  it('invalider les profils publics n invalide pas le profil perso', async () => {
    await queryClient.invalidateQueries({ queryKey: PUBLIC_PROFILE_QUERY_KEY, refetchType: 'none' });

    expect(queryClient.getQueryState(PROFILE_QUERY_KEY)?.isInvalidated).toBe(false);
    expect(queryClient.getQueryState(publicProfileQueryKey('author-1'))?.isInvalidated).toBe(true);
  });

  it('invalider un profil public cible n invalide que celui-la', async () => {
    await queryClient.invalidateQueries({
      queryKey: publicProfileQueryKey('author-1'),
      refetchType: 'none',
    });

    expect(queryClient.getQueryState(publicProfileQueryKey('author-1'))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(publicProfileQueryKey('author-2'))?.isInvalidated).toBe(false);
  });
});
