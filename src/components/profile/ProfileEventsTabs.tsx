import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AppText, AppIconsButton, AppButton, EventCard, ProfileSection } from '@/components';
import { WishedEventCard } from '@/components/dataDisplay/WishedEventCard';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';

export interface PaginatedEventListData {
  events: AppEvent[];
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

interface ProfileEventsTabsProps {
  participated?: PaginatedEventListData;
  created?: PaginatedEventListData;
  wished?: PaginatedEventListData;
}

export function ProfileEventsTabs({ participated, created, wished }: ProfileEventsTabsProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const defaultTab = participated ? 'participated' : created ? 'created' : 'wished';
  const [activeTab, setActiveTab] = useState<'participated' | 'created' | 'wished'>(defaultTab);

  const availableTabsCount = [participated, created, wished].filter(Boolean).length;

  return (
    <>
      {availableTabsCount > 1 && (
        <View style={styles.tabBar}>
          {participated && (
            <AppIconsButton
              icon="calendar"
              size={48}
              variant={activeTab === 'participated' ? 'socio' : 'white'}
              iconColor={activeTab === 'participated' ? theme.colors.white : theme.colors.grey}
              onPress={() => {
                setActiveTab('participated');
              }}
            />
          )}
          {wished && (
            <AppIconsButton
              icon="heart"
              size={48}
              variant={activeTab === 'wished' ? 'danger' : 'white'}
              iconColor={activeTab === 'wished' ? theme.colors.white : theme.colors.grey}
              onPress={() => {
                setActiveTab('wished');
              }}
            />
          )}
          {created && (
            <AppIconsButton
              icon="plus"
              size={48}
              variant={activeTab === 'created' ? 'eco' : 'white'}
              iconColor={activeTab === 'created' ? theme.colors.white : theme.colors.grey}
              onPress={() => {
                setActiveTab('created');
              }}
            />
          )}
        </View>
      )}

      {activeTab === 'participated' && participated && (
        <ProfileSection title="Événements à venir">
          {participated.isLoading ? (
            <ActivityIndicator color={theme.colors.primaryEco} />
          ) : participated.events.length > 0 ? (
            <View>
              {participated.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
              {participated.hasNextPage && (
                <View style={styles.seeMoreContainer}>
                  <AppButton
                    variant="eco"
                    size="small"
                    text={participated.isFetchingNextPage ? 'Chargement...' : 'Voir plus'}
                    onPress={() => {
                      participated.fetchNextPage();
                    }}
                    disabled={participated.isFetchingNextPage}
                  />
                </View>
              )}
            </View>
          ) : (
            <AppText style={styles.emptyText}>Aucun événement à venir pour le moment.</AppText>
          )}
        </ProfileSection>
      )}

      {activeTab === 'created' && created && (
        <ProfileSection title="Mes événements créés">
          {created.isLoading ? (
            <ActivityIndicator color={theme.colors.primaryEco} />
          ) : created.events.length > 0 ? (
            <View>
              {created.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
              {created.hasNextPage && (
                <View style={styles.seeMoreContainer}>
                  <AppButton
                    variant="eco"
                    size="small"
                    text={created.isFetchingNextPage ? 'Chargement...' : 'Voir plus'}
                    onPress={() => {
                      created.fetchNextPage();
                    }}
                    disabled={created.isFetchingNextPage}
                  />
                </View>
              )}
            </View>
          ) : (
            <AppText style={styles.emptyText}>Aucun événement créé pour le moment.</AppText>
          )}
        </ProfileSection>
      )}

      {activeTab === 'wished' && wished && (
        <ProfileSection title="Wishlist">
          {wished.isLoading ? (
            <ActivityIndicator color={theme.colors.primaryEco} />
          ) : wished.events.length > 0 ? (
            <View>
              {wished.events.map((event) => (
                <WishedEventCard key={event.id} event={event} />
              ))}
              {wished.hasNextPage && (
                <View style={styles.seeMoreContainer}>
                  <AppButton
                    variant="eco"
                    size="small"
                    text={wished.isFetchingNextPage ? 'Chargement...' : 'Voir plus'}
                    onPress={() => {
                      wished.fetchNextPage();
                    }}
                    disabled={wished.isFetchingNextPage}
                  />
                </View>
              )}
            </View>
          ) : (
            <AppText style={styles.emptyText}>Aucun événement dans votre wishlist.</AppText>
          )}
        </ProfileSection>
      )}
    </>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    seeMoreContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    emptyText: {
      color: theme.colors.grey,
      fontStyle: 'italic',
      textAlign: 'center',
      marginVertical: theme.spacing.lg,
    },
  });
