import React from 'react';
import { useProfile } from '@/api/user/hooks/use-profile';
import { useGetEvent } from '@/api/event/hooks/use-get-event';
import { resolveAvatarUrl } from '@/api/user/resolve-avatar-url';
import type { PostImage } from '@/api/post/post-images.types';
import { PostPreviewModal } from '@/components/post/post-preview-modal';

export interface PostDraft {
  title: string;
  content: string;
  eventId?: string;
}

interface PostFormPreviewProps {
  draft: PostDraft | null;
  images: PostImage[];
  isPublishing: boolean;
  onEdit: () => void;
  onConfirm: (draft: PostDraft) => void;
}

type PreviewContentProps = Omit<PostFormPreviewProps, 'draft'> & { draft: PostDraft };

function PostFormPreviewContent({
  draft,
  images,
  isPublishing,
  onEdit,
  onConfirm,
}: PreviewContentProps): React.JSX.Element {
  const { data: profile } = useProfile();
  const { data: event } = useGetEvent(draft.eventId);

  return (
    <PostPreviewModal
      visible
      pseudo={profile?.pseudo}
      avatarUrl={resolveAvatarUrl(profile)}
      title={draft.title.trim()}
      content={draft.content.trim()}
      imageUri={images[0]?.source.uri}
      eventTitle={event?.title}
      isPublishing={isPublishing}
      onEdit={onEdit}
      onConfirm={() => {
        onConfirm(draft);
      }}
    />
  );
}

/** Relie l'apercu au profil de l'auteur, a l'evenement lie et aux images choisies. */
export function PostFormPreview({
  draft,
  ...props
}: PostFormPreviewProps): React.JSX.Element | null {
  return draft === null ? null : <PostFormPreviewContent draft={draft} {...props} />;
}
