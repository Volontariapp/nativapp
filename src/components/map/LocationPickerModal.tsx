import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import MapView, { UrlTile, Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { useLocation } from '@/hooks/use-location';
import { nominatimService, type OsmReverseGeocodeResult } from '@/services/nominatim.service';

// Centre par défaut : Paris, France
const DEFAULT_COORDS = {
  latitude: 48.8566,
  longitude: 2.3522,
};

// Seuil d'immobilité requis pour proposer la sélection (0.8 seconde)
const SETTLE_TIMEOUT_MS = 800;

// Seuil de tolérance au micro-jitter natif (~22 mètres)
// Évite que les fluctuations infinitésimales de react-native-maps réinitialisent le timer en boucle
const JITTER_THRESHOLD = 0.0002;

function isSignificantChange(
  c1: { latitude: number; longitude: number },
  c2: { latitude: number; longitude: number },
): boolean {
  return (
    Math.abs(c1.latitude - c2.latitude) > JITTER_THRESHOLD ||
    Math.abs(c1.longitude - c2.longitude) > JITTER_THRESHOLD
  );
}

export type OsmStatus = 'idle' | 'loading' | 'waiting_osm' | 'success' | 'not_found';

export interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (locationName: string, coordinates: { latitude: number; longitude: number }) => void;
  initialLocationName?: string;
}

export function LocationPickerModal({
  visible,
  onClose,
  onConfirm,
}: LocationPickerModalProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { coordinates: userCoords } = useLocation();

  const mapRef = useRef<MapView | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const wasVisibleRef = useRef<boolean>(false);
  const userCoordsRef = useRef(userCoords);
  userCoordsRef.current = userCoords;

  const isMovingRef = useRef<boolean>(false);
  const canSelectRef = useRef<boolean>(false);
  const currentCoordsRef = useRef<{ latitude: number; longitude: number }>(
    userCoords ?? DEFAULT_COORDS,
  );
  const initialRegionRef = useRef<Region>({
    latitude: (userCoords ?? DEFAULT_COORDS).latitude,
    longitude: (userCoords ?? DEFAULT_COORDS).longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number }>(
    userCoords ?? DEFAULT_COORDS,
  );
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [canSelectLocation, setCanSelectLocation] = useState<boolean>(false);

  // États de la modal de confirmation
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState<boolean>(false);
  const [osmStatus, setOsmStatus] = useState<OsmStatus>('idle');
  const [resolvedResult, setResolvedResult] = useState<OsmReverseGeocodeResult | null>(null);

  /**
   * Réenclenche le compte à rebours de 0.8s dès qu'un déplacement significatif survient.
   * Si le curseur reste immobile pendant 0.8s, canSelectLocation bascule à true.
   */
  const restartSettleTimer = useCallback(
    (newCoords?: { latitude: number; longitude: number }, force = false) => {
      if (!force && newCoords && !isSignificantChange(newCoords, currentCoordsRef.current)) {
        // En dessous du seuil de déplacement (jitter ignoré)
        return;
      }

      if (newCoords) {
        currentCoordsRef.current = newCoords;
      }

      if (!isMovingRef.current) {
        isMovingRef.current = true;
        setIsMoving(true);
      }
      if (canSelectRef.current) {
        canSelectRef.current = false;
        setCanSelectLocation(false);
      }

      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current);
      }

      settleTimerRef.current = setTimeout(() => {
        const finalCoords = currentCoordsRef.current;
        setSelectedCoords(finalCoords);
        isMovingRef.current = false;
        canSelectRef.current = true;
        setIsMoving(false);
        setCanSelectLocation(true);
      }, SETTLE_TIMEOUT_MS);
    },
    [],
  );

  // Initialisation à l'ouverture du modal : exécutée UNIQUEMENT à la bascule de visible
  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      wasVisibleRef.current = true;
      const target = userCoordsRef.current ?? DEFAULT_COORDS;
      initialRegionRef.current = {
        latitude: target.latitude,
        longitude: target.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setSelectedCoords(target);
      currentCoordsRef.current = target;
      isMovingRef.current = false;
      canSelectRef.current = false;
      setIsMoving(false);
      setCanSelectLocation(false);
      setIsConfirmModalVisible(false);
      setOsmStatus('idle');
      setResolvedResult(null);

      // Lance le timer de 0.8s sur la position initiale
      restartSettleTimer(target, true);
    } else if (!visible && wasVisibleRef.current) {
      wasVisibleRef.current = false;
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      isMovingRef.current = false;
      canSelectRef.current = false;
      setIsMoving(false);
      setCanSelectLocation(false);
    }
  }, [visible, restartSettleTimer]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  // Déplacement de la carte : redémarre le compte à rebours de 0.8s si significatif
  const handleRegionChange = useCallback(
    (region: Region) => {
      restartSettleTimer({
        latitude: region.latitude,
        longitude: region.longitude,
      });
    },
    [restartSettleTimer],
  );

  // Fin de déplacement : démarrage garanti du timer de 0.8s
  const handleRegionChangeComplete = useCallback((region: Region) => {
    currentCoordsRef.current = {
      latitude: region.latitude,
      longitude: region.longitude,
    };

    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current);
    }

    settleTimerRef.current = setTimeout(() => {
      const finalCoords = currentCoordsRef.current;
      setSelectedCoords(finalCoords);
      isMovingRef.current = false;
      canSelectRef.current = true;
      setIsMoving(false);
      setCanSelectLocation(true);
    }, SETTLE_TIMEOUT_MS);
  }, []);

  // Clic sur la carte : anime le centre de la carte vers ce point
  const handleMapPress = useCallback(
    (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
      const coords = e.nativeEvent.coordinate;
      mapRef.current?.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      restartSettleTimer(coords, true);
    },
    [restartSettleTimer],
  );

  // Recentrer sur la position GPS
  const handleRecenter = useCallback(() => {
    const coords = userCoordsRef.current;
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      restartSettleTimer(coords, true);
    }
  }, [restartSettleTimer]);

  // Clic sur "Sélectionner cet endroit" : ouvre la modal et déclenche l'appel OpenStreetMap
  const handleSelectLocation = async (): Promise<void> => {
    if (isMoving || !canSelectLocation) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsConfirmModalVisible(true);
    setOsmStatus('loading');
    setResolvedResult(null);

    const targetCoords = selectedCoords;

    try {
      const result = await nominatimService.reverseGeocodeWithFallback(
        targetCoords.latitude,
        targetCoords.longitude,
        {
          radiusMeters: 500,
          signal: controller.signal,
          onWaitingOsm: () => {
            setOsmStatus('waiting_osm');
          },
        },
      );

      if (controller.signal.aborted) return;

      if (result !== null && result.displayName.trim().length > 0) {
        setResolvedResult(result);
        setOsmStatus('success');
      } else {
        setResolvedResult(null);
        setOsmStatus('not_found');
      }
    } catch {
      if (!controller.signal.aborted) {
        setOsmStatus('waiting_osm');
      }
    }
  };

  // Validation finale dans la modal -> redirection vers le formulaire
  const handleConfirmAndClose = (): void => {
    if (resolvedResult !== null && resolvedResult.displayName.trim().length > 0) {
      onConfirm(resolvedResult.displayName.trim(), {
        latitude: resolvedResult.latitude,
        longitude: resolvedResult.longitude,
      });
      setIsConfirmModalVisible(false);
      onClose();
    }
  };

  const handleCloseConfirmModal = (): void => {
    abortControllerRef.current?.abort();
    setIsConfirmModalVisible(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={isConfirmModalVisible ? handleCloseConfirmModal : onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
            <AppIcons icon="x" size={24} color={theme.colors.text} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <AppText style={styles.headerTitle}>Positionner le lieu</AppText>
            <AppText style={styles.headerSubtitle}>
              Déplacez la carte pour aligner le curseur
            </AppText>
          </View>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegionRef.current}
            onRegionChange={handleRegionChange}
            onRegionChangeComplete={handleRegionChangeComplete}
            onPress={handleMapPress}
          >
            <UrlTile
              urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />

            {/* Position GPS de l'utilisateur en arrière-plan */}
            {userCoords && (
              <Marker
                coordinate={userCoords}
                title="Ma position"
                pinColor={theme.colors.primarySocio}
              />
            )}
          </MapView>

          {/* Curseur central interactif fixé au point visé */}
          <View style={styles.centerCursorContainer} pointerEvents="none">
            <View style={[styles.centerPin, isMoving && styles.centerPinLifted]}>
              <View style={styles.pinBubble}>
                <AppIcons icon="map-pin" size={22} color={theme.colors.white} />
              </View>
              <View style={styles.pinTip} />
            </View>
            <View style={[styles.pinShadow, isMoving && styles.pinShadowLifted]} />
          </View>

          {/* Bouton de recentrage GPS */}
          {userCoords && (
            <View style={styles.recenterButton}>
              <AppIconsButton
                icon="crosshair"
                size={44}
                variant="white"
                iconColor={theme.colors.primaryEco}
                onPress={handleRecenter}
                accessibilityLabel="Recentrer sur ma position"
              />
            </View>
          )}

          {/* Bottom Card sur la carte */}
          <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.addressRow}>
              <View style={styles.pinIconContainer}>
                <AppIcons
                  icon={!canSelectLocation ? 'move' : 'map-pin'}
                  size={22}
                  color={!canSelectLocation ? theme.colors.primarySocio : theme.colors.primaryEco}
                />
              </View>
              <View style={styles.addressTextContainer}>
                <AppText style={styles.addressLabel}>
                  {!canSelectLocation ? 'DÉPLACEMENT DU CURSEUR' : 'POSITION STABILISÉE'}
                </AppText>
                <AppText style={styles.addressHintText}>
                  {!canSelectLocation
                    ? 'Déplacez la carte pour aligner le curseur sur le lieu.'
                    : 'Curseur immobilisé. Vous pouvez sélectionner cet endroit.'}
                </AppText>
              </View>
            </View>

            {/* Bouton pour sélectionner cet endroit : proposé uniquement après 0.8s d'arrêt */}
            {canSelectLocation ? (
              <AppButton
                text="Sélectionner cet endroit"
                variant="eco"
                icon="map-pin"
                onPress={() => {
                  void handleSelectLocation();
                }}
                textStyle={styles.confirmButtonText}
                style={styles.confirmButton}
              />
            ) : (
              <View style={styles.settlePendingContainer}>
                <View style={styles.settleSpinner}>
                  <AppIcons icon="clock" size={16} color={theme.colors.grey} />
                </View>
                <AppText style={styles.settlePendingText}>Arrêtez-vous pour selectionner</AppText>
              </View>
            )}
          </View>
        </View>

        {/* Modal de confirmation en superposition (évite un Modal natif imbriqué sur iOS/Android) */}
        {isConfirmModalVisible && (
          <View style={styles.modalBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseConfirmModal} />
            <View style={styles.confirmModalCard}>
              {/* Header de la modal */}
              <View style={styles.confirmModalHeader}>
                <View style={styles.confirmModalIconBubble}>
                  <AppIcons
                    icon={
                      osmStatus === 'waiting_osm'
                        ? 'clock'
                        : osmStatus === 'not_found'
                          ? 'alert-circle'
                          : osmStatus === 'loading'
                            ? 'loader'
                            : 'map-pin'
                    }
                    size={22}
                    color={
                      osmStatus === 'waiting_osm' || osmStatus === 'not_found'
                        ? theme.colors.warning
                        : theme.colors.primaryEco
                    }
                  />
                </View>
                <AppText style={styles.confirmModalTitle}>
                  {osmStatus === 'waiting_osm'
                    ? 'Attente OpenStreetMap'
                    : osmStatus === 'not_found'
                      ? 'Adresse introuvable'
                      : osmStatus === 'loading'
                        ? 'Localisation du lieu'
                        : 'Confirmer ce lieu'}
                </AppText>
                <Pressable
                  onPress={handleCloseConfirmModal}
                  style={styles.confirmModalClose}
                  hitSlop={8}
                >
                  <AppIcons icon="x" size={20} color={theme.colors.grey} />
                </Pressable>
              </View>

              {/* Contenu de la modal selon l'état OSM */}
              <View style={styles.confirmModalBody}>
                {osmStatus === 'loading' ? (
                  <View style={styles.modalLoadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primaryEco} />
                    <AppText style={styles.modalLoadingText}>
                      Recherche de l'adresse à ce point...
                    </AppText>
                    <AppText style={styles.modalLoadingSubtext}>
                      Interrogation du service OpenStreetMap
                    </AppText>
                  </View>
                ) : osmStatus === 'waiting_osm' ? (
                  <View style={styles.modalWaitingContainer}>
                    <ActivityIndicator size="large" color="#B45309" />
                    <AppText style={styles.modalWaitingTitle}>En attente de Open StreetMap</AppText>
                    <AppText style={styles.modalWaitingSubtext}>
                      Le service OpenStreetMap met plus de temps à répondre ou subit un
                      ralentissement temporaire. Récupération en cours...
                    </AppText>
                    <AppButton
                      text="Réessayer"
                      variant="secondary"
                      icon="refresh-cw"
                      onPress={() => {
                        void handleSelectLocation();
                      }}
                      style={styles.retryButton}
                    />
                  </View>
                ) : osmStatus === 'not_found' ? (
                  <View style={styles.modalErrorContainer}>
                    <AppText style={styles.modalErrorTitle}>
                      Aucune adresse dans un rayon de 500 m
                    </AppText>
                    <AppText style={styles.modalErrorText}>
                      Aucune rue, bâtiment ou adresse postale n'a pu être localisée dans un rayon de
                      500 mètres autour de ce point.
                    </AppText>
                    <AppText style={styles.modalErrorSubtext}>
                      Déplacez légèrement le repère sur la carte vers une voie répertoriée puis
                      validez à nouveau.
                    </AppText>
                  </View>
                ) : resolvedResult ? (
                  <View style={styles.modalAddressContainer}>
                    {/* Badge adresse exacte ou rayon 500m */}
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.badgeContainer,
                          resolvedResult.isNearby ? styles.badgeNearby : styles.badgeExact,
                        ]}
                      >
                        <AppIcons
                          icon={resolvedResult.isNearby ? 'compass' : 'check'}
                          size={13}
                          color={resolvedResult.isNearby ? '#B45309' : theme.colors.primaryEco}
                        />
                        <AppText
                          style={[
                            styles.badgeText,
                            resolvedResult.isNearby
                              ? styles.badgeTextNearby
                              : styles.badgeTextExact,
                          ]}
                        >
                          {resolvedResult.isNearby
                            ? 'Adresse la plus proche (rayon de 500 m)'
                            : 'Adresse exacte'}
                        </AppText>
                      </View>
                    </View>

                    <AppText style={styles.modalAddressLabel}>
                      {resolvedResult.isNearby
                        ? `ADRESSE LA PLUS PROCHE${resolvedResult.distanceMeters !== undefined && resolvedResult.distanceMeters > 0 ? ` (~${String(resolvedResult.distanceMeters)} m)` : ''}`
                        : 'ADRESSE DU POINT'}
                    </AppText>
                    <AppText style={styles.modalAddressValue} numberOfLines={3}>
                      {resolvedResult.displayName}
                    </AppText>

                    {resolvedResult.isNearby && (
                      <AppText style={styles.modalAddressHint}>
                        Aucune adresse directe au point visé. L'adresse la plus proche répertoriée
                        dans un rayon de 500 mètres a été sélectionnée.
                      </AppText>
                    )}
                  </View>
                ) : null}
              </View>

              {/* Actions de la modal : le bouton Valider apparaît UNIQUEMENT une fois l'adresse apparue */}
              <View style={styles.confirmModalActions}>
                {osmStatus === 'success' && resolvedResult ? (
                  <>
                    <AppButton
                      text="Valider"
                      variant="eco"
                      icon="check"
                      onPress={handleConfirmAndClose}
                      textStyle={styles.confirmButtonText}
                      style={styles.modalButton}
                    />
                    <AppButton
                      text="Modifier la position"
                      variant="secondary"
                      onPress={handleCloseConfirmModal}
                      style={styles.modalSecondaryButton}
                    />
                  </>
                ) : osmStatus === 'not_found' ? (
                  <AppButton
                    text="Déplacer le repère"
                    variant="eco"
                    icon="arrow-left"
                    onPress={handleCloseConfirmModal}
                    style={styles.modalButton}
                  />
                ) : (
                  <AppButton
                    text="Annuler"
                    variant="secondary"
                    onPress={handleCloseConfirmModal}
                    style={styles.modalSecondaryButton}
                  />
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.lightGrey,
      backgroundColor: theme.colors.background,
      zIndex: 10,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.grey,
      marginTop: 2,
    },
    headerRightSpacer: {
      width: 32,
    },
    mapContainer: {
      flex: 1,
      position: 'relative',
    },
    map: {
      width: '100%',
      height: '100%',
    },
    centerCursorContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 15,
    },
    centerPin: {
      alignItems: 'center',
      transform: [{ translateY: -22 }],
    },
    centerPinLifted: {
      transform: [{ translateY: -32 }],
    },
    pinBubble: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primaryEco,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2.5,
      borderColor: theme.colors.white,
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.35)',
    },
    pinTip: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: 6,
      borderRightWidth: 6,
      borderBottomWidth: 0,
      borderTopWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: theme.colors.primaryEco,
      marginTop: -2,
    },
    pinShadow: {
      position: 'absolute',
      top: '50%',
      width: 12,
      height: 6,
      borderRadius: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      transform: [{ translateY: -3 }],
    },
    pinShadowLifted: {
      transform: [{ translateY: -3 }, { scale: 0.6 }],
      opacity: 0.25,
    },
    recenterButton: {
      position: 'absolute',
      right: 16,
      top: 16,
      borderRadius: theme.radius.full,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
      zIndex: 10,
    },
    bottomCard: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.15)',
      zIndex: 20,
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    pinIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.whiteOverlay,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
      marginTop: 2,
    },
    addressTextContainer: {
      flex: 1,
    },
    addressLabel: {
      fontSize: 11,
      color: theme.colors.grey,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginBottom: 3,
    },
    addressHintText: {
      fontSize: 13,
      color: theme.colors.grey,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    confirmButton: {
      width: '100%',
      marginTop: theme.spacing.xs,
    },
    confirmButtonText: {
      flexShrink: 1,
      textAlign: 'center',
    },
    settlePendingContainer: {
      height: 46,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.whiteOverlay,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      borderStyle: 'dashed',
      marginTop: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    settleSpinner: {
      marginRight: 4,
    },
    settlePendingText: {
      fontSize: 13,
      color: theme.colors.grey,
      fontStyle: 'italic',
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
      zIndex: 100,
      elevation: 10,
    },
    confirmModalCard: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    },
    confirmModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    confirmModalIconBubble: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.whiteOverlay,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    confirmModalTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
    },
    confirmModalClose: {
      padding: theme.spacing.xs,
    },
    confirmModalBody: {
      marginBottom: theme.spacing.lg,
    },
    modalLoadingContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    modalLoadingText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    modalLoadingSubtext: {
      fontSize: 12,
      color: theme.colors.grey,
      textAlign: 'center',
    },
    modalWaitingContainer: {
      backgroundColor: '#FFFBEB',
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: '#FDE68A',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    modalWaitingTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#B45309',
      textAlign: 'center',
      marginTop: 4,
    },
    modalWaitingSubtext: {
      fontSize: 12,
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 17,
      marginBottom: 6,
    },
    retryButton: {
      width: '100%',
      marginTop: theme.spacing.xs,
    },
    modalAddressContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
    },
    badgeRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    badgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      gap: 5,
    },
    badgeExact: {
      backgroundColor: '#ECFDF5',
    },
    badgeNearby: {
      backgroundColor: '#FEF3C7',
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    badgeTextExact: {
      color: theme.colors.primaryEco,
    },
    badgeTextNearby: {
      color: '#B45309',
    },
    modalAddressLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.grey,
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    modalAddressValue: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
      lineHeight: 22,
    },
    modalAddressHint: {
      fontSize: 12,
      color: theme.colors.grey,
      fontStyle: 'italic',
      marginTop: 8,
      lineHeight: 16,
    },
    modalErrorContainer: {
      backgroundColor: '#FFF7ED',
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: '#FDBA74',
    },
    modalErrorTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.warning,
      marginBottom: 4,
    },
    modalErrorText: {
      fontSize: 13,
      color: theme.colors.text,
      lineHeight: 18,
      marginBottom: 4,
    },
    modalErrorSubtext: {
      fontSize: 12,
      color: theme.colors.grey,
      lineHeight: 16,
    },
    confirmModalActions: {
      gap: theme.spacing.xs,
    },
    modalButton: {
      width: '100%',
    },
    modalSecondaryButton: {
      width: '100%',
      marginTop: theme.spacing.xs,
    },
  });
