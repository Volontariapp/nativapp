import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { HTTP_METHOD_COLORS } from '../../shared/themes/http-method-colors';
import { theme } from '@/shared/themes/theme';

interface HttpMethodBadgeProps {
  method: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

/**
 * A monospace badge showing an HTTP verb (GET, POST, PATCH, DELETE…).
 * Color is automatically assigned per method type.
 */
export const HttpMethodBadge = ({
  method,
  size = 'sm',
  style,
}: HttpMethodBadgeProps): React.JSX.Element => {
  const color = HTTP_METHOD_COLORS[method.toUpperCase()] ?? theme.colors.grey;
  const isMd = size === 'md';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + '1A',
          borderColor: color,
          paddingHorizontal: isMd ? 10 : 7,
          paddingVertical: isMd ? 4 : 2,
          borderRadius: isMd ? 7 : 4,
          borderWidth: isMd ? 1.5 : 1,
        },
        style,
      ]}
    >
      <AppText style={[styles.text, { color, fontSize: isMd ? 13 : 10 }]}>
        {method.toUpperCase()}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Courier_Prime',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
