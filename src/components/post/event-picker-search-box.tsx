import React from 'react';
import { View, Pressable, TextInput } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { createEventPickerStyles } from './event-picker-modal.styles';

interface EventPickerSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export const EventPickerSearchBox = ({
  value,
  onChange,
}: EventPickerSearchBoxProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createEventPickerStyles);

  return (
    <View style={styles.searchBox}>
      <Feather name="search" size={16} color={theme.colors.grey} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher par nom..."
        placeholderTextColor={theme.colors.grey}
        value={value}
        onChangeText={onChange}
        autoCorrect={false}
      />
      {value !== '' && (
        <Pressable
          onPress={() => {
            onChange('');
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="x-circle" size={16} color={theme.colors.grey} />
        </Pressable>
      )}
    </View>
  );
};
