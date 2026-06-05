import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import type { CalendarProps } from 'react-native-calendars';
import { theme } from '@/shared/themes/theme';

interface CalendarLocale {
  monthNames: string[];
  monthNamesShort: string[];
  dayNames: string[];
  dayNamesShort: string[];
  today: string;
}

interface CalendarLocaleConfig {
  locales: Record<string, CalendarLocale>;
  defaultLocale: string;
}

const TypedLocaleConfig = LocaleConfig as unknown as CalendarLocaleConfig;

TypedLocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ],
  monthNamesShort: [
    'Janv.',
    'Févr.',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juil.',
    'Août',
    'Sept.',
    'Oct.',
    'Nov.',
    'Déc.',
  ],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui",
};
TypedLocaleConfig.defaultLocale = 'fr';

export interface AppCalendarProps extends CalendarProps {
  containerStyle?: ViewStyle;
}

export const AppCalendar = ({
  style,
  containerStyle,
  theme: customTheme,
  ...props
}: AppCalendarProps): React.JSX.Element => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Calendar
        theme={{
          backgroundColor: theme.colors.white,
          calendarBackground: theme.colors.white,
          textSectionTitleColor: theme.colors.grey,
          selectedDayBackgroundColor: theme.colors.primaryEco,
          selectedDayTextColor: theme.colors.white,
          todayTextColor: theme.colors.primaryEco,
          dayTextColor: theme.colors.black,
          arrowColor: theme.colors.primaryEco,
          monthTextColor: theme.colors.black,
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
          textMonthFontWeight: 'bold',
          ...customTheme,
        }}
        style={[styles.calendar, style]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  calendar: {
    borderRadius: theme.radius.md,
  },
});
