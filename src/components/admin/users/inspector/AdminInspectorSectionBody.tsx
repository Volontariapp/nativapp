import React from 'react';
import { ActivityIndicator } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';

interface AdminInspectorSectionBodyProps {
  isLoading: boolean;
  children: React.ReactNode;
  hasItems: boolean;
}

export function AdminInspectorSectionBody({
  isLoading,
  children,
  hasItems,
}: AdminInspectorSectionBodyProps): React.JSX.Element {
  if (isLoading) {
    return <ActivityIndicator size="small" color={theme.colors.primarySocio} />;
  }
  if (!hasItems) {
    return <AppText style={emptyTextStyle}>Aucun élément</AppText>;
  }
  return <>{children}</>;
}

const emptyTextStyle = {
  fontSize: theme.typography.fontSize.sm,
  color: theme.colors.grey,
  fontStyle: 'italic' as const,
};
