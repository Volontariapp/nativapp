import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { useUserDistinction } from '@/api/user/hooks/use-user-distinction';
import { lightTheme } from '@/shared/themes/theme';
import { RankFrame } from '../rank-frame';

jest.mock('@/api/user/hooks/use-user-distinction', () => ({
  useUserDistinction: jest.fn(),
}));
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Path: 'Path',
  Circle: 'Circle',
}));

const mockedUseUserDistinction = jest.mocked(useUserDistinction);

describe('RankFrame', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders its children unchanged for a user who is not on a podium', () => {
    mockedUseUserDistinction.mockReturnValue(undefined);

    const { getByText, queryByTestId } = render(
      <RankFrame userId="user-1" intensity="strong">
        <Text>bio</Text>
      </RankFrame>,
    );

    expect(getByText('bio')).toBeTruthy();
    expect(queryByTestId('rank-frame')).toBeNull();
  });

  it('draws a gold frame and a label around the global first', () => {
    mockedUseUserDistinction.mockReturnValue({ scope: 'global', tier: 1 });

    const { getByTestId, getByText } = render(
      <RankFrame userId="user-1" intensity="strong">
        <Text>bio</Text>
      </RankFrame>,
    );

    expect(getByText('bio')).toBeTruthy();
    expect(StyleSheet.flatten(getByTestId('rank-frame').props.style)).toMatchObject({
      borderColor: lightTheme.colors.gold,
      borderWidth: 2,
    });
    expect(getByTestId('rank-label').props.accessibilityLabel).toBe("Couronne d'or");
  });

  it('draws a thin frame without a label', () => {
    mockedUseUserDistinction.mockReturnValue({ scope: 'month', tier: 2 });

    const { getByTestId, queryByTestId } = render(
      <RankFrame userId="user-2" intensity="thin">
        <Text>commentaire</Text>
      </RankFrame>,
    );

    expect(StyleSheet.flatten(getByTestId('rank-frame').props.style)).toMatchObject({
      borderColor: lightTheme.colors.emerald,
      borderWidth: 1,
    });
    expect(queryByTestId('rank-label')).toBeNull();
  });
});
