import type * as ReactNavigationNative from '@react-navigation/native';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import {
  mockMutateAsync,
  mockGoBack,
  mockUseCreatePost,
  mockUseNavigation,
} from './post-form-screen.mock';

jest.mock('@/api/post/hooks', () => ({
  useCreatePost: () => mockUseCreatePost(),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => mockUseNavigation(),
  };
});

import { PostFormScreen } from '../PostFormScreen';
import * as debugContextModule from '@/context/DebugContext';
import * as eventHooks from '@/api/event/hooks/use-get-my-events';
import * as socketContextModule from '@/context/SocketContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('PostFormScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    mockMutateAsync.mockResolvedValue({ id: 'post-new-1' });
    mockUseCreatePost.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
    mockUseNavigation.mockReturnValue({
      goBack: mockGoBack,
      navigate: jest.fn(),
    });

    jest.spyOn(debugContextModule, 'useDebug').mockReturnValue({
      isDebugMode: false,
      toggleDebugMode: jest.fn(),
    });

    jest.spyOn(eventHooks, 'useGetMyEvents').mockReturnValue({
      data: {
        pages: [{ events: [], totalCount: 0 }],
        pageParams: [1],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof eventHooks.useGetMyEvents>);

    jest.spyOn(socketContextModule, 'useSocket').mockReturnValue({
      isConnected: true,
      socket: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders hero title and form inputs with placeholders and character counters', () => {
    const { getByText, getByPlaceholderText } = render(
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <PostFormScreen />
        </SafeAreaProvider>
      </QueryClientProvider>,
    );

    expect(getByText('Créer une publication')).toBeTruthy();
    expect(getByText('Votre message')).toBeTruthy();
    expect(getByPlaceholderText('Ex: Grande collecte de printemps pour le quartier...')).toBeTruthy();
    expect(
      getByPlaceholderText(
        "Racontez votre expérience, les moments forts ou les prochaines étapes de l'action bénévole...",
      ),
    ).toBeTruthy();
    expect(getByText('0 / 100')).toBeTruthy();
    expect(getByText('0 / 1000')).toBeTruthy();
    expect(getByText('Publier le post')).toBeTruthy();
  });

  it('updates live preview and allows submitting when form is valid', async () => {
    const { getByPlaceholderText, getByText } = render(
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <PostFormScreen />
        </SafeAreaProvider>
      </QueryClientProvider>,
    );

    const titleInput = getByPlaceholderText('Ex: Grande collecte de printemps pour le quartier...');
    const contentInput = getByPlaceholderText(
      "Racontez votre expérience, les moments forts ou les prochaines étapes de l'action bénévole...",
    );

    fireEvent.changeText(titleInput, 'Nettoyage des quais');
    fireEvent.changeText(contentInput, 'Nous avons ramassé 50kg de déchets avec les bénévoles.');

    expect(getByText('19 / 100')).toBeTruthy();
    expect(getByText('54 / 1000')).toBeTruthy();

    const submitButton = getByText('Publier le post');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        title: 'Nettoyage des quais',
        content: 'Nous avons ramassé 50kg de déchets avec les bénévoles.',
        eventId: undefined,
      });
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });
});
