import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { HttpMethodBadge } from '@/components/ui/HttpMethodBadge';
import { theme } from '@/shared/themes/theme';
import Icon from 'react-native-vector-icons/Feather';
import type { EndpointMeta } from './types';

interface EndpointCardProps {
  name: string;
  meta: EndpointMeta | null;
  onPress: () => void;
}

/**
 * Card representing a single API endpoint in the list.
 * Shows: method badge, function name, path, description, and chevron.
 */
export const EndpointCard = ({ name, meta, onPress }: EndpointCardProps): React.JSX.Element => {
  const hasPathParams =
    meta?.examplePathParams != null && Object.keys(meta.examplePathParams).length > 0;
  const hasBody = meta?.examplePayload != null && Object.keys(meta.examplePayload).length > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.left}>
        {meta != null && <HttpMethodBadge method={meta.method} size="sm" style={styles.badge} />}
        <View style={styles.info}>
          <AppText style={styles.name}>{name}</AppText>
          {meta?.path != null && (
            <AppText style={styles.path} numberOfLines={1}>
              {meta.path}
            </AppText>
          )}
          {meta?.description != null && (
            <AppText style={styles.description} numberOfLines={1}>
              {meta.description}
            </AppText>
          )}
          {/* Param badges */}
          {(hasPathParams || hasBody) && (
            <View style={styles.tagRow}>
              {hasPathParams && (
                <View style={styles.paramTag}>
                  <Icon name="link" size={9} color={theme.colors.primarySocio} />
                  <AppText style={styles.paramTagText}>params</AppText>
                </View>
              )}
              {hasBody && (
                <View style={[styles.paramTag, styles.bodyTag]}>
                  <Icon name="code" size={9} color="#8b5cf6" />
                  <AppText style={[styles.paramTagText, { color: '#8b5cf6' }]}>body</AppText>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
      <Icon name="chevron-right" size={18} color={theme.colors.lightGrey} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    ...theme.shadows.card,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  badge: {
    marginTop: 2,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    fontFamily: 'Courier_Prime',
  },
  path: {
    fontSize: 11,
    color: theme.colors.grey,
    fontFamily: 'Courier_Prime',
  },
  description: {
    fontSize: 12,
    color: theme.colors.grey,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: 4,
  },
  paramTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.primarySocio + '14',
    borderColor: theme.colors.primarySocio + '40',
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bodyTag: {
    backgroundColor: '#8b5cf614',
    borderColor: '#8b5cf640',
  },
  paramTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.primarySocio,
    letterSpacing: 0.3,
  },
});
