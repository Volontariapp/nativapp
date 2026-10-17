import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreatePost } from '@/api/post/hooks';
import type { PostDraft } from './post-form-preview';

const PENDING_TITLE = 'Post en cours de traitement';
const PENDING_MESSAGE =
  'Vos images sont en cours de vérification. Votre post sera visible des autres utilisateurs dès qu’elles seront validées.';

interface UsePostSubmissionOptions {
  fileIds: string[];
  /** Une seule clé par formulaire : un réessai après échec reste idempotent côté serveur. */
  idempotencyKey: string;
  /** Appelé quand le post est créé, avant la navigation. */
  onPublished: () => void;
}

export const usePostSubmission = ({
  fileIds,
  idempotencyKey,
  onPublished,
}: UsePostSubmissionOptions) => {
  const navigation = useNavigation();
  const { mutateAsync: createPost, isPending } = useCreatePost();

  const submit = async (draft: PostDraft): Promise<void> => {
    try {
      const response = await createPost({
        title: draft.title.trim(),
        content: draft.content.trim(),
        eventId: draft.eventId,
        fileIds,
        idempotencyKey,
      });
      onPublished();
      if (response.post.mediaStatus !== 'PENDING') {
        navigation.goBack();
        return;
      }
      Alert.alert(PENDING_TITLE, PENDING_MESSAGE, [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      console.error('Failed to create post:', err instanceof Error ? err.message : String(err));
      Alert.alert('Erreur', 'Impossible de publier votre post.');
    }
  };

  return { submit, isPending };
};
