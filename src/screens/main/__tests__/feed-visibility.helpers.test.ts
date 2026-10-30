import {
  applyPinnedOrder,
  unseenFirst,
  withoutHandledPosts,
} from '../helpers/feed-visibility.helpers';

const post = (id: string, authorId = 'author-1'): { id: string; authorId: string } => ({
  id,
  authorId,
});

describe('withoutHandledPosts', () => {
  it('removes the posts of the user and the posts already liked or commented', () => {
    const posts = [post('a'), post('b'), post('c', 'me'), post('d')];

    const result = withoutHandledPosts(posts, new Set(['b']), 'me');

    expect(result.map((entry) => entry.id)).toEqual(['a', 'd']);
  });

  it('keeps every post of another author when the user is not known yet', () => {
    const posts = [post('a'), post('b', 'me')];

    const result = withoutHandledPosts(posts, new Set(), null);

    expect(result.map((entry) => entry.id)).toEqual(['a', 'b']);
  });
});

describe('unseenFirst', () => {
  it('puts the posts never displayed first and keeps the order inside each group', () => {
    const posts = [post('a'), post('b'), post('c'), post('d')];

    const result = unseenFirst(posts, new Set(['a', 'c']));

    expect(result.map((entry) => entry.id)).toEqual(['b', 'd', 'a', 'c']);
  });

  it('keeps the order when nothing was seen', () => {
    const posts = [post('a'), post('b')];

    expect(unseenFirst(posts, new Set()).map((entry) => entry.id)).toEqual(['a', 'b']);
  });
});

describe('applyPinnedOrder', () => {
  it('follows the pinned order and appends the posts loaded afterwards in their own order', () => {
    const posts = [post('a'), post('b'), post('c'), post('d'), post('e')];

    const result = applyPinnedOrder(posts, ['c', 'a', 'b']);

    expect(result.map((entry) => entry.id)).toEqual(['c', 'a', 'b', 'd', 'e']);
  });

  it('ignores a pinned id that is not in the list anymore', () => {
    const posts = [post('a'), post('b')];

    const result = applyPinnedOrder(posts, ['gone', 'b']);

    expect(result.map((entry) => entry.id)).toEqual(['b', 'a']);
  });

  it('returns the list as is when no order is pinned', () => {
    const posts = [post('a'), post('b')];

    expect(applyPinnedOrder(posts, []).map((entry) => entry.id)).toEqual(['a', 'b']);
  });
});
