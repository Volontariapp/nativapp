import { EventState } from '@volontariapp/contracts';
import { lightTheme } from '@/shared/themes/theme';
import { isEventDatePast, getEventStatusConfig, isEventEditable } from '../event-status.utils';

describe('event-status.utils', () => {
  describe('isEventDatePast', () => {
    it('returns false when dates are undefined or null or empty', () => {
      expect(isEventDatePast(undefined, undefined)).toBe(false);
      expect(isEventDatePast(null, null)).toBe(false);
      expect(isEventDatePast('', '')).toBe(false);
    });

    it('returns true when endDate is in the past', () => {
      const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();
      expect(isEventDatePast(pastDate)).toBe(true);
    });

    it('returns false when endDate is in the future', () => {
      const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
      expect(isEventDatePast(futureDate)).toBe(false);
    });

    it('falls back to startDate when endDate is not provided', () => {
      const pastStart = new Date(Date.now() - 7200 * 1000).toISOString();
      expect(isEventDatePast(undefined, pastStart)).toBe(true);

      const futureStart = new Date(Date.now() + 7200 * 1000).toISOString();
      expect(isEventDatePast(undefined, futureStart)).toBe(false);
    });
  });

  describe('getEventStatusConfig', () => {
    it('returns "À venir" for published event when date is NOT in the past', () => {
      const config = getEventStatusConfig(EventState.EVENT_STATE_PUBLISHED, false);
      expect(config.label).toBe('À venir');
      expect(config.icon).toBe('clock');
      expect(config.textColor(lightTheme)).toBe(lightTheme.colors.primaryEco);
      expect(config.bgColor(lightTheme)).toBe(lightTheme.colors.badgeGreenBackground);
      expect(config.borderColor(lightTheme)).toBe(lightTheme.colors.badgeGreenBorder);
    });

    it('returns "Annulé" for published event when date IS in the past', () => {
      const config = getEventStatusConfig(EventState.EVENT_STATE_PUBLISHED, true);
      expect(config.label).toBe('Annulé');
      expect(config.icon).toBe('slash');
      expect(config.textColor(lightTheme)).toBe(lightTheme.colors.danger);
      expect(config.bgColor(lightTheme)).toBe(lightTheme.colors.badgeRedBackground);
      expect(config.borderColor(lightTheme)).toBe(lightTheme.colors.badgeRedBorder);
    });

    it('returns "Annulé" for cancelled event', () => {
      const config = getEventStatusConfig(EventState.EVENT_STATE_CANCELLED, false);
      expect(config.label).toBe('Annulé');
      expect(config.icon).toBe('slash');
      expect(config.textColor(lightTheme)).toBe(lightTheme.colors.danger);
    });

    it('returns "En cours" for in-progress event', () => {
      const config = getEventStatusConfig(EventState.EVENT_STATE_IN_PROGRESS, false);
      expect(config.label).toBe('En cours');
      expect(config.icon).toBe('play-circle');
      expect(config.textColor(lightTheme)).toBe(lightTheme.colors.primarySocio);
      expect(config.bgColor(lightTheme)).toBe(lightTheme.colors.badgeSocioBackground);
      expect(config.borderColor(lightTheme)).toBe(lightTheme.colors.diamondBorder);
    });

    it('returns "Terminé" for finished event', () => {
      const config = getEventStatusConfig(EventState.EVENT_STATE_FINISHED, false);
      expect(config.label).toBe('Terminé');
      expect(config.icon).toBe('flag');
      expect(config.textColor(lightTheme)).toBe(lightTheme.colors.goldText);
      expect(config.bgColor(lightTheme)).toBe(lightTheme.colors.goldBackground);
      expect(config.borderColor(lightTheme)).toBe(lightTheme.colors.goldBorder);
    });

    it('returns "Brouillon" for draft event', () => {
      const config = getEventStatusConfig(EventState.EVENT_STATE_DRAFT, false);
      expect(config.label).toBe('Brouillon');
      expect(config.icon).toBe('edit-3');
      expect(config.textColor(lightTheme)).toBe(lightTheme.colors.grey);
    });

    it('handles numeric and string representations of EventState', () => {
      expect(getEventStatusConfig('EVENT_STATE_PUBLISHED', false).label).toBe('À venir');
      expect(getEventStatusConfig(2, false).label).toBe('À venir');
      expect(getEventStatusConfig('EVENT_STATE_IN_PROGRESS', false).label).toBe('En cours');
      expect(getEventStatusConfig('EVENT_STATE_FINISHED', false).label).toBe('Terminé');
    });
  });
});

describe('isEventEditable', () => {
  const FUTURE = { startAt: '2999-10-15T10:00:00.000Z', endAt: '2999-10-15T12:00:00.000Z' };
  const PAST = { startAt: '2001-10-15T10:00:00.000Z', endAt: '2001-10-15T12:00:00.000Z' };

  it.each([
    EventState.EVENT_STATE_DRAFT,
    EventState.EVENT_STATE_PUBLISHED,
    EventState.EVENT_STATE_IN_PROGRESS,
  ])('allows editing an upcoming or running event (state %s)', (state) => {
    expect(isEventEditable({ state, ...FUTURE })).toBe(true);
  });

  it.each([EventState.EVENT_STATE_FINISHED, EventState.EVENT_STATE_CANCELLED])(
    'forbids editing a finished or cancelled event (state %s)',
    (state) => {
      expect(isEventEditable({ state, ...FUTURE })).toBe(false);
    },
  );

  it('forbids editing a published event whose date has passed, shown as cancelled', () => {
    expect(isEventEditable({ state: EventState.EVENT_STATE_PUBLISHED, ...PAST })).toBe(false);
  });

  it('understands a state delivered by name', () => {
    expect(isEventEditable({ state: 'EVENT_STATE_FINISHED', ...FUTURE })).toBe(false);
  });
});
