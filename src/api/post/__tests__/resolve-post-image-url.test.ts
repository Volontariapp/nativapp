import { resolvePostImageUrl } from '../resolve-post-image-url';
import { createPostMediaWeb, createPostWeb } from './post-web.factory';

const IMAGE_URL = 'https://cdn.test/post/9b2f1c52-7a63-4d0e-8f41-0c5d2e6a7b13.webp';

describe('resolvePostImageUrl', () => {
  it('returns the url of the image of a READY post', () => {
    const post = createPostWeb({
      mediaStatus: 'READY',
      media: [createPostMediaWeb({ url: IMAGE_URL })],
    });

    expect(resolvePostImageUrl(post)).toBe(IMAGE_URL);
  });

  it('returns undefined for a post without media', () => {
    expect(resolvePostImageUrl(createPostWeb({ media: [], mediaStatus: 'NONE' }))).toBeUndefined();
  });

  it('returns undefined when the payload carries no media field at all', () => {
    expect(resolvePostImageUrl(createPostWeb())).toBeUndefined();
  });

  it('returns undefined while the media has no url yet (PENDING)', () => {
    const post = createPostWeb({ mediaStatus: 'PENDING', media: [createPostMediaWeb()] });

    expect(resolvePostImageUrl(post)).toBeUndefined();
  });

  it('ignores an empty url', () => {
    const post = createPostWeb({ media: [createPostMediaWeb({ url: '' })] });

    expect(resolvePostImageUrl(post)).toBeUndefined();
  });

  it('takes the first image by position', () => {
    const post = createPostWeb({
      mediaStatus: 'READY',
      media: [
        createPostMediaWeb({ position: 1, url: 'https://cdn.test/post/second.webp' }),
        createPostMediaWeb({ position: 0, url: IMAGE_URL }),
      ],
    });

    expect(resolvePostImageUrl(post)).toBe(IMAGE_URL);
  });
});
