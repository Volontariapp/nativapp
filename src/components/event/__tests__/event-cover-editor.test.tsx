import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { createPostImage } from '@/api/post/__tests__/post-images.factory';
import { getFakeEcologyImage } from '@/utils/fake-images.util';
import * as mockSafeArea from '@/components/post/__tests__/safe-area.mock';
import { createEvent } from './event-app.factory';
import { EventCoverEditor } from '../event-cover-editor';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('react-native-safe-area-context', () => mockSafeArea);

const COVER_URL = 'https://cdn.test/event-cover/76c5b964-b5a1-43e3-85e2-040683457e56.webp';
const mockOnAdd = jest.fn();
const mockOnRetry = jest.fn();
const mockOnRemove = jest.fn();

const renderEditor = (props: Partial<React.ComponentProps<typeof EventCoverEditor>> = {}) =>
  render(
    <EventCoverEditor
      event={createEvent()}
      cover={undefined}
      onAdd={mockOnAdd}
      onRetry={mockOnRetry}
      onRemove={mockOnRemove}
      {...props}
    />,
  );

describe('EventCoverEditor', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows the current photo of the event', () => {
    const { getByTestId } = renderEditor({
      event: createEvent({ coverStatus: 'READY', coverUrl: COVER_URL }),
    });

    expect(getByTestId('event-cover-editor-current').props.source).toEqual({ uri: COVER_URL });
  });

  it('falls back to the stand-in image when the event has no ready photo', () => {
    const { getByTestId } = renderEditor({ event: createEvent({ id: 'event-9' }) });

    expect(getByTestId('event-cover-editor-current').props.source).toEqual({
      uri: getFakeEcologyImage('event-9'),
    });
  });

  it('lets the organizer pick another photo', () => {
    const { getByLabelText } = renderEditor();

    fireEvent.press(getByLabelText('Changer la photo'));

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['PENDING', 'Photo en cours de vérification'],
    ['REJECTED', 'Photo refusée : choisissez-en une autre'],
  ] as const)('explains a %s photo', (coverStatus, note) => {
    const { getByText } = renderEditor({ event: createEvent({ coverStatus }) });

    expect(getByText(note)).toBeTruthy();
  });

  it('shows the new photo with its previews instead of the current one', () => {
    const cover = createPostImage({ id: 'cover-1', status: 'ready' });
    const { queryByTestId, getByTestId, getByLabelText } = renderEditor({ cover });

    expect(queryByTestId('event-cover-editor-current')).toBeNull();
    expect(getByTestId('event-image-preview-swipe')).toBeTruthy();
    fireEvent.press(getByLabelText('Retirer la photo'));
    expect(mockOnRemove).toHaveBeenCalledWith('cover-1');
  });
});
