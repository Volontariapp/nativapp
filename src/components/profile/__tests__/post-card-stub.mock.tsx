import React from 'react';
import { Text } from 'react-native';
import type { PostWeb } from '@volontariapp/contracts';

// AppPost charge auteur, likes et commentaires : les tests de section n'en gardent que le titre.
export const PostCardStub = ({ post }: { post: PostWeb }): React.JSX.Element => (
  <Text>{post.title}</Text>
);
