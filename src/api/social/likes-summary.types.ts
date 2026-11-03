/**
 * Contrat de `POST /api/v1/social/likes-summary` (api-gateway, GetPostsLikeSummaryRequestDTO et
 * PostLikeSummaryDTO). Types locaux : la version installee de `@volontariapp/contracts` ne les
 * exporte pas encore.
 */
export interface PostLikeSummary {
  postId: string;
  likeCount: number;
  likedByMe: boolean;
}

export interface GetPostsLikeSummaryRequest {
  postIds: string[];
}

export interface GetPostsLikeSummaryResponse {
  summaries: PostLikeSummary[];
}
