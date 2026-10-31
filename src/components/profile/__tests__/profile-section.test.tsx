import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ProfileSection } from '../ProfileSection';

describe('ProfileSection', () => {
  it('shows the title and the content', () => {
    const { getByText } = render(
      <ProfileSection title="Posts">
        <Text>Contenu</Text>
      </ProfileSection>,
    );

    expect(getByText('Posts')).toBeTruthy();
    expect(getByText('Contenu')).toBeTruthy();
  });

  it('shows the optional action next to the title', () => {
    const { getByText } = render(
      <ProfileSection title="Posts" action={<Text>Action</Text>}>
        <Text>Contenu</Text>
      </ProfileSection>,
    );

    expect(getByText('Action')).toBeTruthy();
  });
});
