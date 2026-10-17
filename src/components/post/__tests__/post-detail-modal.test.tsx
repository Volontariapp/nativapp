import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { createPostWeb } from '@/api/post/__tests__/post-web.factory';
import * as mockPostCard from '@/components/profile/__tests__/post-card-stub.mock';
import * as mockSafeArea from './safe-area.mock';
import { PostDetailModal } from '../post-detail-modal';

jest.mock('react-native-safe-area-context', () => mockSafeArea);

jest.mock('@/components/post/AppPost', () => ({
  __esModule: true,
  default: mockPostCard.PostCardStub,
}));

const mockOnClose = jest.fn();
const mockOnDelete = jest.fn();

describe('PostDetailModal', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('shows the post with its description and comments through the post card', () => {
    const post = createPostWeb({ title: 'Mission Maraude Paris' });

    const { getByText } = render(
      <PostDetailModal visible post={post} onClose={mockOnClose} onDelete={mockOnDelete} />,
    );

    expect(getByText('Mission Maraude Paris')).toBeTruthy();
  });

  it('renders nothing visible without a post', () => {
    const { queryByLabelText } = render(
      <PostDetailModal visible post={null} onClose={mockOnClose} onDelete={mockOnDelete} />,
    );

    expect(queryByLabelText('Fermer la vue')).toBeNull();
  });

  it('closes with the cross at the top', () => {
    const { getByLabelText } = render(
      <PostDetailModal
        visible
        post={createPostWeb()}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.press(getByLabelText('Fermer la vue'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('also closes with the button at the bottom, always reachable', () => {
    const { getByText } = render(
      <PostDetailModal
        visible
        post={createPostWeb()}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.press(getByText('Fermer'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('asks for confirmation and deletes only once confirmed', () => {
    const post = createPostWeb({ id: 'post-to-delete' });
    const { getByText } = render(
      <PostDetailModal visible post={post} onClose={mockOnClose} onDelete={mockOnDelete} />,
    );

    fireEvent.press(getByText('Supprimer'));

    expect(mockOnDelete).not.toHaveBeenCalled();
    const [, , buttons] = jest.mocked(Alert.alert).mock.calls.at(-1) ?? [];
    const confirm = buttons?.find((button) => button.style === 'destructive');
    confirm?.onPress?.();
    expect(mockOnDelete).toHaveBeenCalledWith('post-to-delete');
  });

  it('offers no delete button for a post that is not mine', () => {
    const { queryByText } = render(
      <PostDetailModal visible post={createPostWeb()} onClose={mockOnClose} />,
    );

    expect(queryByText('Supprimer')).toBeNull();
  });
});
