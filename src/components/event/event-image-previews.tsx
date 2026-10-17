import React, { useCallback } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { FlatList, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { computeEventImageFrames, fitFrame, type EventImageFrame } from './event-image-frames';
import {
  computeFrameRegion,
  regionToImageStyle,
  type CropRegion,
  type Size,
} from './event-cover-crop';

const getFrameKey = (frame: EventImageFrame): string => frame.id;

const PREVIEW_MAX_WIDTH = 220;
const PREVIEW_MAX_HEIGHT = 150;

/** Région de l'image que l'éditeur de cadrage s'apprête à enregistrer. */
export interface PreviewCrop {
  region: CropRegion;
  image: Size;
}

interface EventImagePreviewsProps {
  /** Photo choisie (fichier local) ; sans elle, aucun aperçu n'est affiché. */
  imageUri: string | undefined;
  /** Avec une région, chaque cadre montre ce qu'il affichera de cette région (éditeur de cadrage). */
  crop?: PreviewCrop;
}

export function EventImagePreviews({ imageUri, crop }: EventImagePreviewsProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const renderFrame = useCallback(
    ({ item }: ListRenderItemInfo<EventImageFrame>) =>
      imageUri === undefined ? null : <FramePreview frame={item} imageUri={imageUri} crop={crop} />,
    [imageUri, crop],
  );

  if (imageUri === undefined) {
    return (
      <AppText style={styles.hint}>
        Ajoutez une photo pour voir comment elle sera cadrée dans l’application.
      </AppText>
    );
  }

  const frames = computeEventImageFrames({
    windowWidth: width,
    windowHeight: height,
    insetsTop: insets.top,
    insetsBottom: insets.bottom,
    isIos: Platform.OS === 'ios',
    spacingSm: theme.spacing.sm,
    radiusMd: theme.radius.md,
  });

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Aperçus</AppText>
      <AppText style={styles.hint}>
        Le même cadrage automatique que dans l’application (réduit à l’échelle). Si un cadre coupe
        mal la photo, choisissez-en une autre.
      </AppText>
      <FlatList
        horizontal
        data={frames}
        keyExtractor={getFrameKey}
        renderItem={renderFrame}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      />
    </View>
  );
}

interface FramePreviewProps {
  frame: EventImageFrame;
  imageUri: string;
  crop: PreviewCrop | undefined;
}

function FramePreview({ frame, imageUri, crop }: FramePreviewProps): React.JSX.Element {
  const styles = useStyles(createStyles);
  const size = fitFrame(frame, { maxWidth: PREVIEW_MAX_WIDTH, maxHeight: PREVIEW_MAX_HEIGHT });
  const imageStyle =
    crop === undefined
      ? StyleSheet.absoluteFill
      : [
          styles.positioned,
          regionToImageStyle(
            computeFrameRegion(crop.region, frame.width / frame.height),
            size,
            crop.image,
          ),
        ];

  return (
    <View style={styles.item} testID={`event-image-preview-${frame.id}`}>
      <View style={[styles.frame, size, { borderRadius: frame.radius }]}>
        <Image
          testID={`event-image-preview-image-${frame.id}`}
          source={{ uri: imageUri }}
          style={imageStyle}
          contentFit={crop === undefined ? 'cover' : 'fill'}
        />
        {frame.id === 'swipe' && (
          // Le dégradé de la carte de swipe, sous lequel passe le texte de l'évènement.
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            locations={[0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>
      <AppText style={styles.label}>{frame.label}</AppText>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    hint: {
      fontSize: 13,
      color: theme.colors.grey,
      marginBottom: theme.spacing.md,
    },
    row: {
      gap: theme.spacing.lg,
      alignItems: 'flex-end',
    },
    item: {
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    positioned: {
      position: 'absolute',
    },
    frame: {
      overflow: 'hidden',
      backgroundColor: theme.colors.lightGrey,
    },
    label: {
      fontSize: 12,
      color: theme.colors.grey,
    },
  });
