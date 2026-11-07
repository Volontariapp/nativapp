import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainAppNavigator from '../MainAppNavigator';
import { useHasLiveParticipation } from '@/api/event/hooks/use-has-live-participation';

jest.mock('@/api/event/hooks/use-has-live-participation');

// Mock screens to keep test light
jest.mock('@/screens', () => ({
  HomeScreen: () => null,
  SwipeScreen: () => null,
  ExploreScreen: () => null,
}));

jest.mock('../stacks/ProfileStack', () => () => null);
jest.mock('../stacks/CreateEventStack', () => () => null);

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual<Record<string, unknown>>('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

describe('MainAppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useHasLiveParticipation).mockReturnValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the central tab button with upward chevron by default', () => {
    const { getByLabelText } = render(
      <NavigationContainer>
        <MainAppNavigator />
      </NavigationContainer>,
    );

    const triggerBtn = getByLabelText('Ouvrir les actions rapides');
    expect(triggerBtn).toBeTruthy();
  });

  it('opens the QuickActionsModal when tapping the central tab button', () => {
    const { getByLabelText, getByText } = render(
      <NavigationContainer>
        <MainAppNavigator />
      </NavigationContainer>,
    );

    const triggerBtn = getByLabelText('Ouvrir les actions rapides');
    fireEvent.press(triggerBtn);

    expect(getByText('ACTIONS RAPIDES')).toBeTruthy();
    expect(getByText('Créer')).toBeTruthy();
    expect(getByText('Gérer')).toBeTruthy();
  });

  it('navigates to create and closes modal when selecting Créer', () => {
    const { getByLabelText, getByText } = render(
      <NavigationContainer>
        <MainAppNavigator />
      </NavigationContainer>,
    );

    // Open modal
    fireEvent.press(getByLabelText('Ouvrir les actions rapides'));

    // Press Créer
    fireEvent.press(getByText('Créer'));

    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
      screen: 'create',
      params: { screen: 'ManageEvents' },
    });
  });

  it('navigates to create and closes modal when selecting Gérer', () => {
    const { getByLabelText, getByText } = render(
      <NavigationContainer>
        <MainAppNavigator />
      </NavigationContainer>,
    );

    // Open modal
    fireEvent.press(getByLabelText('Ouvrir les actions rapides'));

    // Press Gérer
    fireEvent.press(getByText('Gérer'));

    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
      screen: 'create',
      params: { screen: 'ManageHub' },
    });
  });

  it('enables the live participation lookup only while the modal is open', () => {
    const { getByLabelText } = render(
      <NavigationContainer>
        <MainAppNavigator />
      </NavigationContainer>,
    );

    expect(useHasLiveParticipation).toHaveBeenLastCalledWith(false);
    fireEvent.press(getByLabelText('Ouvrir les actions rapides'));
    expect(useHasLiveParticipation).toHaveBeenLastCalledWith(true);
  });

  it('navigates to LiveEvent when selecting the live action', () => {
    const { getByLabelText } = render(
      <NavigationContainer>
        <MainAppNavigator />
      </NavigationContainer>,
    );

    fireEvent.press(getByLabelText('Ouvrir les actions rapides'));
    fireEvent.press(getByLabelText('Rejoindre un événement en direct'));

    expect(mockNavigate).toHaveBeenCalledWith('LiveEvent');
  });

  it('shows my live event wording when the user has a live participation', () => {
    jest.mocked(useHasLiveParticipation).mockReturnValue(true);
    const { getByLabelText, getByText } = render(
      <NavigationContainer>
        <MainAppNavigator />
      </NavigationContainer>,
    );

    fireEvent.press(getByLabelText('Ouvrir les actions rapides'));
    fireEvent.press(getByText('Mon événement en direct'));

    expect(mockNavigate).toHaveBeenCalledWith('LiveEvent');
  });
});
