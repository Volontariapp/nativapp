import React, { useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { cropImage } from '@/api/storage/crop-image';
import type { PickedImage } from '@/api/storage/file-upload.types';
import {
  CROP_RATIO_OPTIONS,
  DEFAULT_CROP_RATIO,
  clampZoom,
  computeRegion,
  panCenter,
  regionCenter,
  regionToImageStyle,
  toCropRect,
  type Point,
  type Size,
} from './event-cover-crop';
import { EventImagePreviews } from './event-image-previews';

const MAX_VIEWPORT_HEIGHT_RATIO = 0.4;
const ROOT_STYLE = { flex: 1 } as const;

interface EventCoverCropperProps {
  /** Photo à cadrer ; la fenêtre est fermée quand il n'y en a pas. */
  image: PickedImage | undefined;
  /** L'image à envoyer une fois recadrée, ou undefined si l'utilisateur annule. */
  onSettle: (result: PickedImage | undefined) => void;
}

export function EventCoverCropper({ image, onSettle }: EventCoverCropperProps): React.JSX.Element {
  return (
    <Modal
      visible={image !== undefined}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        onSettle(undefined);
      }}
    >
      <SafeAreaProvider>
        <GestureHandlerRootView style={ROOT_STYLE}>
          {image !== undefined && <CropperBody key={image.uri} image={image} onSettle={onSettle} />}
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Modal>
  );
}

interface CropperBodyProps {
  image: PickedImage;
  onSettle: (result: PickedImage | undefined) => void;
}

function CropperBody({ image, onSettle }: CropperBodyProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const imageSize: Size = { width: image.width, height: image.height };
  const imageCenter: Point = { x: image.width / 2, y: image.height / 2 };

  const [ratio, setRatio] = useState(DEFAULT_CROP_RATIO);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<Point>(imageCenter);
  const [isSaving, setIsSaving] = useState(false);

  const region = computeRegion(imageSize, ratio, zoom, center);

  const availableWidth = windowWidth - 2 * theme.spacing.xl;
  const maxHeight = windowHeight * MAX_VIEWPORT_HEIGHT_RATIO;
  const viewport: Size =
    availableWidth / ratio <= maxHeight
      ? { width: availableWidth, height: availableWidth / ratio }
      : { width: maxHeight * ratio, height: maxHeight };

  // Les gestes sont recréés à chaque rendu : l'état de départ vit dans une ref.
  const gestureStart = useRef({ zoom: 1, center: imageCenter, pxPerSourcePx: 1 });

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      gestureStart.current.center = regionCenter(region);
      gestureStart.current.pxPerSourcePx = viewport.width / region.width;
    })
    .onUpdate((event) => {
      const next = panCenter(
        gestureStart.current.center,
        { x: event.translationX, y: event.translationY },
        gestureStart.current.pxPerSourcePx,
      );
      setCenter(regionCenter(computeRegion(imageSize, ratio, zoom, next)));
    });

  const pinch = Gesture.Pinch()
    .runOnJS(true)
    .onStart(() => {
      gestureStart.current.zoom = zoom;
    })
    .onUpdate((event) => {
      const nextZoom = clampZoom(gestureStart.current.zoom * event.scale);
      setZoom(nextZoom);
      setCenter(regionCenter(computeRegion(imageSize, ratio, nextZoom, regionCenter(region))));
    });

  const selectRatio = (next: number): void => {
    setRatio(next);
    setZoom(1);
    setCenter(imageCenter);
  };

  const confirm = async (): Promise<void> => {
    setIsSaving(true);
    try {
      onSettle(await cropImage(image, toCropRect(region, imageSize)));
    } catch {
      Alert.alert('Erreur', 'Impossible de cadrer la photo.');
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.body}>
        <AppText style={styles.title}>Cadrer la photo</AppText>

        <View style={styles.ratios}>
          {CROP_RATIO_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              accessibilityLabel={`Format ${option.label}`}
              style={[styles.chip, option.ratio === ratio && styles.chipActive]}
              onPress={() => {
                selectRatio(option.ratio);
              }}
            >
              <AppText style={[styles.chipText, option.ratio === ratio && styles.chipTextActive]}>
                {option.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <GestureDetector gesture={Gesture.Simultaneous(pan, pinch)}>
          <View style={[styles.viewport, viewport]} testID="event-cover-cropper-viewport">
            <Image
              source={{ uri: image.uri }}
              style={[styles.positioned, regionToImageStyle(region, viewport, imageSize)]}
              contentFit="fill"
            />
          </View>
        </GestureDetector>
        <AppText style={styles.hint}>Pincez pour zoomer, glissez pour déplacer la photo.</AppText>

        <EventImagePreviews imageUri={image.uri} crop={{ region, image: imageSize }} />

        <View style={styles.actions}>
          <AppButton
            text="Annuler"
            variant="secondary"
            onPress={() => {
              onSettle(undefined);
            }}
            disabled={isSaving}
          />
          <AppButton
            text={isSaving ? 'Enregistrement...' : 'Valider'}
            onPress={() => {
              void confirm();
            }}
            disabled={isSaving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    body: {
      padding: theme.spacing.xl,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    ratios: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    chip: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      backgroundColor: theme.colors.white,
    },
    chipActive: {
      borderColor: theme.colors.primaryEco,
      backgroundColor: theme.colors.primaryEco,
    },
    chipText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    chipTextActive: {
      color: theme.colors.white,
      fontWeight: '600',
    },
    viewport: {
      alignSelf: 'center',
      overflow: 'hidden',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.lightGrey,
    },
    positioned: {
      position: 'absolute',
    },
    hint: {
      fontSize: 13,
      color: theme.colors.grey,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
  });
