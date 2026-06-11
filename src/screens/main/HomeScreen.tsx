import { StyleSheet, FlatList, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';
import { useListPosts } from '@/api/post/hooks/use-list-all-posts';
import AppPost from '@/components/post/AppPost';

export function HomeScreen(): React.JSX.Element {
  const { data, isLoading, isError, refetch } = useListPosts({
    limit: 10,
    page: 1,
  });

  const posts = data?.posts ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.background} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <AppText>Une erreur est survenue lors du chargement des posts.</AppText>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AppPost post={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={() => {
              void refetch();
            }}
            refreshing={isLoading}
            ListEmptyComponent={
              <View style={styles.center}>
                <AppText>Aucun post à afficher pour le moment.</AppText>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spacer: {
    height: 12,
  },
});
