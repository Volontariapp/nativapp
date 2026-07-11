import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { useSocket } from '@/context/SocketContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { AppIcons } from '@/components/media/AppIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export interface AppHeaderProps {
  showBack?: boolean;
  showSettings?: boolean;
}

export default function AppHeader({
  showBack = false,
  showSettings = false,
}: AppHeaderProps): React.JSX.Element {
  const { isConnected } = useSocket();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <Feather
            name="arrow-left"
            size={24}
            color={theme.colors.black}
            style={styles.backIcon}
            onPress={() => {
              navigation.goBack();
            }}
          />
        )}
        <AppText style={styles.title}>VolontariApp</AppText>
      </View>
      <View style={styles.rightContainer}>
        {showSettings && (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Settings');
            }}
            style={styles.settingsButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AppIcons icon="settings" size={24} color={theme.colors.black} />
          </TouchableOpacity>
        )}
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isConnected ? theme.colors.success : theme.colors.danger },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  backIcon: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  settingsButton: {
    marginRight: theme.spacing.sm,
  },
});
