import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ManageEventsScreen } from '../ManageEventsScreen';
import {
  mockNavigation,
  createMockEventsData,
  createMockPostsData,
} from './manage-events-screen.mock';
import * as getMyEventsHook from '@/api/event/hooks/use-get-my-events';
import * as getMyPostsHook from '@/api/post/hooks/use-get-my-posts';
import type * as ReactNavigationNative from '@react-navigation/native';
import type * as ReactNative from 'react-native';


jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => mockNavigation,
  };
});

jest.mock('@/components/layout/AppHeader', () => {
  const { View } = jest.requireActual<typeof ReactNative>('react-native');
  return function MockAppHeader() {
    return <View testID="mock-app-header" />;
  };
});

describe('ManageEventsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the creation hub header and both content sections', () => {
    jest.spyOn(getMyEventsHook, 'useGetMyEvents').mockReturnValue({
      data: createMockEventsData(4),
    } as unknown as ReturnType<typeof getMyEventsHook.useGetMyEvents>);

    jest.spyOn(getMyPostsHook, 'useGetMyPosts').mockReturnValue({
      data: createMockPostsData(7),
    } as unknown as ReturnType<typeof getMyPostsHook.useGetMyPosts>);

    const { getByText } = render(<ManageEventsScreen />);

    expect(getByText('Gestion de contenu')).toBeTruthy();
    expect(getByText('Espace Création')).toBeTruthy();
    expect(getByText('Missions & Événements')).toBeTruthy();
    expect(getByText('Publications & Social')).toBeTruthy();
    expect(getByText('Créer un événement')).toBeTruthy();
    expect(getByText('Créer un post')).toBeTruthy();
    expect(getByText('Mes événements créés')).toBeTruthy();
    expect(getByText('Mes posts créés')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
  });

  it('navigates to EventForm when clicking on create event card', () => {
    jest.spyOn(getMyEventsHook, 'useGetMyEvents').mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof getMyEventsHook.useGetMyEvents>);

    jest.spyOn(getMyPostsHook, 'useGetMyPosts').mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof getMyPostsHook.useGetMyPosts>);

    const { getByText } = render(<ManageEventsScreen />);
    fireEvent.press(getByText('Créer un événement'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('EventForm');
  });

  it('navigates to MyEvents when clicking on my events link', () => {
    jest.spyOn(getMyEventsHook, 'useGetMyEvents').mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof getMyEventsHook.useGetMyEvents>);

    jest.spyOn(getMyPostsHook, 'useGetMyPosts').mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof getMyPostsHook.useGetMyPosts>);

    const { getByText } = render(<ManageEventsScreen />);
    fireEvent.press(getByText('Mes événements créés'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('MyEvents');
  });

  it('navigates to PostForm when clicking on create post card', () => {
    jest.spyOn(getMyEventsHook, 'useGetMyEvents').mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof getMyEventsHook.useGetMyEvents>);

    jest.spyOn(getMyPostsHook, 'useGetMyPosts').mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof getMyPostsHook.useGetMyPosts>);

    const { getByText } = render(<ManageEventsScreen />);
    fireEvent.press(getByText('Créer un post'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('PostForm');
  });

  it('navigates to MyPosts when clicking on my posts link', () => {
    jest.spyOn(getMyEventsHook, 'useGetMyEvents').mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof getMyEventsHook.useGetMyEvents>);

    jest.spyOn(getMyPostsHook, 'useGetMyPosts').mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof getMyPostsHook.useGetMyPosts>);

    const { getByText } = render(<ManageEventsScreen />);
    fireEvent.press(getByText('Mes posts créés'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('MyPosts');
  });
});
