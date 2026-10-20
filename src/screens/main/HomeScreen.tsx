import { StyleSheet, View, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import AppPost from '@/components/post/AppPost';
import { ImpactRankBandContainer } from '@/components/impact/impact-rank-band-container';
import Animated from 'react-native-reanimated';
import { useScrollTabBar } from '@/navigation/hooks/useScrollTabBar';
import { useTabBarContentInset } from '@/navigation/hooks/useTabBarContentInset';
import { useDebug } from '@/context/DebugContext';
import { useHomeScreen } from './hooks/use-home-screen';

type PostItem = React.ComponentProps<typeof AppPost>['post'];

export function HomeScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { isDebugMode } = useDebug();

  const {
    posts,
    isLoading,
    isError,
    isFallbackMode,
    isRefreshing,
    hasNextPage,
    isFetchingNextPage,
    hasNewContent,
    flatListRef,
    handleRefresh,
    handleLoadMore,
    handleNewPostsPress,
  } = useHomeScreen();

  const scrollHandler = useScrollTabBar();
  const tabBarInset = useTabBarContentInset();

  const keyExtractor = useCallback((item: PostItem) => item.id, []);

  const renderItem = useCallback(({ item }: { item: PostItem }) => <AppPost post={item} />, []);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={() => {
          void handleRefresh();
        }}
        colors={[theme.colors.primarySocio]}
        tintColor={theme.colors.primarySocio}
      />
    ),
    [isRefreshing, handleRefresh, theme.colors.primarySocio],
  );

  return (
    <View style={styles.container}>
      <AppHeader showSettings />
      <View style={styles.content}>
        {isDebugMode && (
          <View style={styles.debugModeBanner} testID="home-debug-mode-banner">
            <AppText style={styles.debugModeBannerText}>
              {isFallbackMode
                ? 'Mode Debug : Repli chronologique (ms-ranking en attente / 0 post classé)'
                : 'Mode Debug : Feed classé par ms-ranking (score actif)'}
            </AppText>
          </View>
        )}
        {hasNewContent && (
          <Pressable
            style={styles.newPostsBanner}
            onPress={handleNewPostsPress}
            accessibilityRole="button"
            accessibilityLabel="Nouveaux posts disponibles"
          >
            <Icon name="arrow-up" size={14} color="#FFFFFF" style={styles.bannerIcon} />
            <AppText style={styles.newPostsText}>Nouveaux posts disponibles</AppText>
          </Pressable>
        )}
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primarySocio} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <AppText>Une erreur est survenue lors du chargement des posts.</AppText>
          </View>
        ) : (
          <Animated.FlatList
            ref={flatListRef}
            data={posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, tabBarInset]}
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            refreshControl={refreshControl}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={<ImpactRankBandContainer />}
            ListFooterComponent={
              <View style={styles.footerLoader}>
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color={theme.colors.primarySocio} />
                ) : hasNextPage ? (
                  <AppText
                    style={[styles.loadMoreText, { color: theme.colors.primarySocio }]}
                    onPress={handleLoadMore}
                  >
                    Charger plus de posts
                  </AppText>
                ) : (
                  <AppText style={[styles.endText, { color: theme.colors.grey }]}>
                    Fin des posts
                  </AppText>
                )}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <AppText>Aucun post à afficher pour le moment.</AppText>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    debugModeBanner: {
      backgroundColor: theme.colors.blackOverlay,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
    },
    debugModeBannerText: {
      color: theme.colors.warning,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      fontFamily: theme.typography.fonts.primary,
      textAlign: 'center',
    },
    newPostsBanner: {
      position: 'absolute',
      top: 10,
      alignSelf: 'center',
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primarySocio,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    bannerIcon: {
      marginRight: 6,
    },
    newPostsText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },
    listContent: {
      paddingBottom: 20,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    footerLoader: {
      paddingVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadMoreText: {
      padding: 20,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    endText: {
      padding: 20,
      textAlign: 'center',
    },
    spacer: {
      height: 12,
    },
  });
