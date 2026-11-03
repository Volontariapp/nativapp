import React from 'react';
import { Text } from 'react-native';

export const mockUseInfiniteComments = jest.fn();
export const mockFetchNextPage = jest.fn();
export const mockCreateMutate = jest.fn();

export const mockUseCreateComment = () => ({ mutate: mockCreateMutate, isPending: false });

export const mockCommentItem = ({ comment }: { comment: { content: string } }) => (
  <Text>{comment.content}</Text>
);
