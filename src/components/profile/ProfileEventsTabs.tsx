import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AppText, AppIconsButton, AppButton, EventCard, ProfileSection } from '@/components';
import { WishedEventCard } from '@/components/dataDisplay/WishedEventCard';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { PaginatedEventListData } from './profile-events.types';

interface ProfileEventsTabsProps {
  finished?: PaginatedEventListData;
  created?: PaginatedEventListData;
  wished?: PaginatedEventListData;
}

type TabKey = 'finished' | 'created' | 'wished';

interface TabConfig {
  key: TabKey;
  icon: string;
  activeVariant: 'socio' | 'eco' | 'danger';
  title: string;
  emptyText: string;
}

/** Ordre d'affichage des onglets dans la barre. */
const TABS: TabConfig[] = [
  {
    key: 'finished',
    icon: 'check-circle',
    activeVariant: 'eco',
    title: 'Événements terminés',
    emptyText: 'Aucun événement terminé pour le moment.',
  },
  {
    key: 'wished',
    icon: 'heart',
    activeVariant: 'danger',
    title: 'Wishlist',
    emptyText: 'Aucun événement dans votre wishlist.',
  },
  {
    key: 'created',
    icon: 'plus',
    activeVariant: 'eco',
    title: 'Mes événements créés',
    emptyText: 'Aucun événement créé pour le moment.',
  },
];

interface EventTabContentProps {
  tab: TabConfig;
  data: PaginatedEventListData;
}

function SeeMoreButton({ data }: { data: PaginatedEventListData }): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.seeMoreContainer}>
      <AppButton
        variant="eco"
        size="small"
        text={data.isFetchingNextPage ? 'Chargement...' : 'Voir plus'}
        onPress={() => {
          data.fetchNextPage();
        }}
        disabled={data.isFetchingNextPage}
      />
    </View>
  );
}

function EventList({ tab, data }: EventTabContentProps): React.JSX.Element {
  const Card = tab.key === 'wished' ? WishedEventCard : EventCard;

  return (
    <View>
      {data.events.map((event) => (
        <Card key={event.id} event={event} />
      ))}
      {data.hasNextPage && <SeeMoreButton data={data} />}
    </View>
  );
}

function EventTabContent({ tab, data }: EventTabContentProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <ProfileSection title={tab.title}>
      {data.isLoading ? (
        <ActivityIndicator color={theme.colors.primaryEco} />
      ) : data.events.length > 0 ? (
        <EventList tab={tab} data={data} />
      ) : (
        <AppText style={styles.emptyText}>{tab.emptyText}</AppText>
      )}
    </ProfileSection>
  );
}

export function ProfileEventsTabs({
  finished,
  created,
  wished,
}: ProfileEventsTabsProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const dataByTab: Record<TabKey, PaginatedEventListData | undefined> = {
    finished,
    created,
    wished,
  };
  const availableTabs = TABS.filter((tab) => dataByTab[tab.key] !== undefined);

  const defaultTab = (['finished', 'wished', 'created'] as const).find(
    (key) => dataByTab[key] !== undefined,
  );
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab ?? 'wished');

  const activeConfig = TABS.find((tab) => tab.key === activeTab);
  const activeData = dataByTab[activeTab];

  return (
    <>
      {availableTabs.length > 1 && (
        <View style={styles.tabBar}>
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <AppIconsButton
                key={tab.key}
                icon={tab.icon}
                size={48}
                variant={isActive ? tab.activeVariant : 'white'}
                iconColor={isActive ? theme.colors.white : theme.colors.grey}
                onPress={() => {
                  setActiveTab(tab.key);
                }}
              />
            );
          })}
        </View>
      )}

      {activeConfig && activeData && <EventTabContent tab={activeConfig} data={activeData} />}
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
