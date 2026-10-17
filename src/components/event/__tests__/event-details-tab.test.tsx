import React from 'react';
import { render } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { EventState } from '@volontariapp/contracts';
import type { UpdateEventFormValues } from '@/api/event/event.schema';
import type { AppEvent } from '@/api/event/event.api';
import { createEvent } from './event-app.factory';
import { EventDetailsTab } from '../EventDetailsTab';

const SAVE_LABEL = 'Enregistrer les modifications';

function Harness({ event }: { event: AppEvent }): React.JSX.Element {
  const { control } = useForm<UpdateEventFormValues>({
    defaultValues: {
      title: event.title,
      description: event.description,
      localisationName: event.localisationName,
      maxParticipants: event.maxParticipants,
    },
  });
  return (
    <EventDetailsTab
      currentEvent={event}
      control={control}
      errors={{}}
      isDirty
      isSubmitting={false}
      onSave={jest.fn()}
      onSelectTargetState={jest.fn()}
      isRefetching={false}
      onRefresh={jest.fn()}
    />
  );
}

const FUTURE = { startAt: '2999-10-15T10:00:00.000Z', endAt: '2999-10-15T12:00:00.000Z' };

describe('EventDetailsTab', () => {
  it('offers to save an event that can still be edited', () => {
    const { getByText, queryByTestId } = render(
      <Harness event={createEvent({ state: EventState.EVENT_STATE_PUBLISHED, ...FUTURE })} />,
    );

    expect(getByText(SAVE_LABEL)).toBeTruthy();
    expect(queryByTestId('event-locked-notice')).toBeNull();
  });

  it.each([
    [EventState.EVENT_STATE_FINISHED, /terminé/],
    [EventState.EVENT_STATE_CANCELLED, /annulé/],
  ])('locks a finished or cancelled event (state %s)', (state, wording) => {
    const { getByText, queryByText, getByTestId } = render(
      <Harness event={createEvent({ state, ...FUTURE })} />,
    );

    expect(getByTestId('event-locked-notice')).toBeTruthy();
    expect(getByText(wording)).toBeTruthy();
    expect(queryByText(SAVE_LABEL)).toBeNull();
  });
});
