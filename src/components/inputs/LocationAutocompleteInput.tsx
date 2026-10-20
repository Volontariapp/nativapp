import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Keyboard,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { nominatimService, type NominatimPlace } from '@/services/nominatim.service';
import { LocationPickerModal } from '@/components/map/LocationPickerModal';

export interface LocationAutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
  onSelectCoordinates?: (coords: { latitude: number; longitude: number }) => void;
}

const DEBOUNCE_DELAY_MS = 500;

export function LocationAutocompleteInput({
  value,
  onChangeText,
  placeholder = 'Ex: Paris, France',
  containerStyle,
  style,
  onSelectCoordinates,
}: LocationAutocompleteInputProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSelectedValueRef = useRef<string>(value);

  // Recherche avec autocomplétion débauncée
  const handleQueryChange = useCallback(
    (text: string) => {
      onChangeText(text);

      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }

      if (text.trim().length < 3) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      // Si le texte correspond exactement au dernier item sélectionné, on n'ouvre pas les suggestions
      if (text === lastSelectedValueRef.current) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);

      debounceTimerRef.current = setTimeout(() => {
        void (async () => {
          abortControllerRef.current?.abort();
          const controller = new AbortController();
          abortControllerRef.current = controller;

          try {
            const places = await nominatimService.searchPlaces(text, controller.signal);
            if (!controller.signal.aborted) {
              setSuggestions(places);
            }
          } catch (err) {
            if (!controller.signal.aborted) {
              console.warn('[LocationAutocompleteInput] Erreur recherche:', err);
              setSuggestions([]);
            }
          } finally {
            if (!controller.signal.aborted) {
              setIsLoading(false);
            }
          }
        })();
      }, DEBOUNCE_DELAY_MS);
    },
    [onChangeText],
  );

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSelectSuggestion = (place: NominatimPlace) => {
    lastSelectedValueRef.current = place.displayName;
    onChangeText(place.displayName);
    onSelectCoordinates?.({ latitude: place.latitude, longitude: place.longitude });
    setSuggestions([]);
    setIsFocused(false);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    lastSelectedValueRef.current = '';
    onChangeText('');
    setSuggestions([]);
  };

  const handleMapConfirm = (
    locationName: string,
    coordinates: { latitude: number; longitude: number },
  ) => {
    lastSelectedValueRef.current = locationName;
    onChangeText(locationName);
    onSelectCoordinates?.(coordinates);
    setSuggestions([]);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Input container */}
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        <TextInput
          style={[styles.input, style]}
          value={value}
          onChangeText={handleQueryChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.grey}
          onFocus={() => {
            setIsFocused(true);
            if (value.trim().length >= 3 && value !== lastSelectedValueRef.current) {
              handleQueryChange(value);
            }
          }}
          onBlur={() => {
            // Léger délai pour permettre le clic sur une suggestion avant le blur
            setTimeout(() => {
              setIsFocused(false);
            }, 250);
          }}
        />

        {/* Accessoires à droite */}
        <View style={styles.rightAccessories}>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primaryEco}
              style={styles.spinner}
            />
          )}

          {value.length > 0 && !isLoading && (
            <Pressable
              onPress={handleClear}
              style={styles.iconButton}
              hitSlop={8}
              accessibilityLabel="Effacer la saisie"
            >
              <AppIcons icon="x" size={16} color={theme.colors.grey} />
            </Pressable>
          )}

          {/* Bouton pour ouvrir la carte */}
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setIsMapModalVisible(true);
            }}
            style={styles.mapButton}
            accessibilityLabel="Ouvrir la carte pour placer un marqueur"
          >
            <AppIcons icon="map-pin" size={18} color={theme.colors.primaryEco} />
          </Pressable>
        </View>
      </View>

      {/* Dropdown des suggestions d'autocomplétion OpenStreetMap */}
      {isFocused && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((item, index) => (
            <Pressable
              key={`${item.placeId.toString()}-${index.toString()}`}
              onPress={() => {
                handleSelectSuggestion(item);
              }}
              style={({ pressed }) => [
                styles.suggestionItem,
                index < suggestions.length - 1 && styles.suggestionBorder,
                pressed && styles.suggestionPressed,
              ]}
            >
              <View style={styles.suggestionPin}>
                <AppIcons icon="map-pin" size={16} color={theme.colors.primaryEco} />
              </View>
              <View style={styles.suggestionTextContainer}>
                <AppText style={styles.primaryText} numberOfLines={1}>
                  {item.primaryText}
                </AppText>
                {item.secondaryText.length > 0 && (
                  <AppText style={styles.secondaryText} numberOfLines={1}>
                    {item.secondaryText}
                  </AppText>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Modal interactif carte avec marqueur */}
      <LocationPickerModal
        visible={isMapModalVisible}
        onClose={() => {
          setIsMapModalVisible(false);
        }}
        onConfirm={handleMapConfirm}
        initialLocationName={value}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      position: 'relative',
      zIndex: 50,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      borderWidth: 1.5,
      borderColor: theme.colors.primaryEco,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      minHeight: 52,
    },
    inputContainerFocused: {
      borderColor: theme.colors.darkGreen,
      boxShadow: '0 0 6px rgba(47, 110, 62, 0.3)',
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      fontFamily: theme.typography.fonts.primary,
      paddingVertical: theme.spacing.sm,
    },
    rightAccessories: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    spinner: {
      marginRight: theme.spacing.xs,
    },
    iconButton: {
      padding: theme.spacing.xs,
    },
    mapButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.whiteOverlay,
      borderWidth: 1,
      borderColor: theme.colors.primaryEco,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: 4,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
      zIndex: 9999,
      elevation: 10,
      overflow: 'hidden',
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    suggestionBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.lightGrey,
    },
    suggestionPressed: {
      backgroundColor: theme.colors.whiteOverlay,
    },
    suggestionPin: {
      marginRight: theme.spacing.sm,
    },
    suggestionTextContainer: {
      flex: 1,
    },
    primaryText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    secondaryText: {
      fontSize: 12,
      color: theme.colors.grey,
      marginTop: 1,
    },
  });
