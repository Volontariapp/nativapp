import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { adminEventApi } from '@/api/admin/admin.event.api';

import type { Event } from '@volontariapp/contracts';

interface AdminInspectorEventItemProps {
  eventId: string;
  onRemove?: (eventId: string) => void;
  onPress?: (event: Event) => void;
  removeLoading?: boolean;
}

export const AdminInspectorEventItem = ({
  eventId,
  onRemove,
  onPress,
  removeLoading = false,
}: AdminInspectorEventItemProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-event', eventId],
    queryFn: () => adminEventApi.getEvent({ id: eventId }),
    enabled: !!eventId && eventId !== 'null',
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primarySocio} />
      </View>
    );
  }

  const event = data?.event;

  if (!event) {
    return (
      <View style={styles.container}>
        <AppText style={styles.errorText}>Événement introuvable</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.info} onPress={() => onPress?.(event)}>
        <AppText style={styles.titleText} numberOfLines={1}>
          {event.title}
        </AppText>
        <AppText style={styles.statusText} numberOfLines={1}>
          {event.state}
        </AppText>
      </Pressable>

      {onRemove && (
        <Pressable
          onPress={() => {
            onRemove(eventId);
          }}
          disabled={removeLoading}
          style={({ pressed }) => [
            styles.removeBtn,
            { opacity: pressed || removeLoading ? 0.6 : 1 },
          ]}
        >
          {removeLoading ? (
            <ActivityIndicator size="small" color={theme.colors.danger} />
          ) : (
            <AppIcons icon="trash-2" iconLibrary="Feather" size={16} color={theme.colors.danger} />
          )}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.lightGrey + '40',
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
  },
  info: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  titleText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  statusText: {
    fontSize: 11,
    color: theme.colors.grey,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.danger,
    fontStyle: 'italic',
  },
  removeBtn: {
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.danger + '15',
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
