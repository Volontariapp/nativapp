import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
  TextInput,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { AppKeyboardAvoidingView } from '@/components/layout/AppKeyboardAvoidingView';
import { theme } from '@/shared/themes/theme';
import { useListComments } from '@/api/post/hooks/use-list-comments';
import { useCreateComment } from '@/api/post/hooks/use-create-comment';
import type { CommentWebResponse } from '@volontariapp/contracts';
import { CommentItem } from './CommentItem';

interface PostCommentsModalProps {
  postId: string;
  visible: boolean;
  onClose: () => void;
}

export const PostCommentsModal = ({ postId, visible, onClose }: PostCommentsModalProps) => {
  const [commentText, setCommentText] = useState('');
  const { data, isLoading } = useListComments(postId);
  const createComment = useCreateComment(postId);

  const comments = data?.comments ?? [];

  const handleSend = () => {
    const text = commentText.trim();
    if (!text) return;
    createComment.mutate(
      { content: text },
      {
        onSuccess: () => {
          setCommentText('');
          Keyboard.dismiss();
        },
      },
    );
  };

  const renderComment = ({ item }: { item: CommentWebResponse }) => <CommentItem comment={item} />;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <AppKeyboardAvoidingView style={styles.overlay} bottomOffset={20}>
        <View style={styles.container}>
          <View style={styles.header}>
            <AppText style={styles.title}>Commentaires</AppText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={theme.colors.black} />
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator style={styles.loader} color={theme.colors.primaryEco} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <AppText style={styles.emptyText}>Soyez le premier à commenter !</AppText>
                </View>
              }
            />
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Écrire un commentaire..."
              placeholderTextColor={theme.colors.grey}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[
                styles.sendButton,
                (!commentText.trim() || createComment.isPending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!commentText.trim() || createComment.isPending}
            >
              {createComment.isPending ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Icon name="send" size={20} color={theme.colors.white} />
              )}
            </Pressable>
          </View>
        </View>
      </AppKeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    maxHeight: '80%',
    minHeight: '50%',
    paddingBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: theme.typography.fonts.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  loader: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.grey,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGrey,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.black,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    maxHeight: 100,
    fontFamily: theme.typography.fonts.primary,
  },
  sendButton: {
    backgroundColor: theme.colors.primarySocio,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
