import type { UserPublicProfile } from '../user.api';

interface PublicUserQuery {
  data: UserPublicProfile | null | undefined;
  isLoading: boolean;
}

export const mockUseGetPublicUser = jest.fn<PublicUserQuery, [string | undefined]>();

export const mockUseEventParticipants = jest.fn<
  { data: UserPublicProfile[] | undefined },
  [string]
>();
