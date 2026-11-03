import { chunkPostIds, uniquePostIds } from '../likes-summary.utils';

const ids = (count: number): string[] => Array.from({ length: count }, (_, i) => `p-${String(i)}`);

describe('likes summary id helpers', () => {
  it('keeps the first occurrence of each id', () => {
    expect(uniquePostIds(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  it('makes no chunk for an empty list', () => {
    expect(chunkPostIds([])).toEqual([]);
  });

  it('keeps 100 ids in a single chunk and splits 101 ids in two', () => {
    expect(chunkPostIds(ids(100))).toHaveLength(1);
    expect(chunkPostIds(ids(101)).map((chunk) => chunk.length)).toEqual([100, 1]);
  });

  it('splits 250 ids in chunks of 100, 100 and 50 without losing order or duplicates', () => {
    const chunks = chunkPostIds([...ids(250), 'p-0', 'p-1']);
    expect(chunks.map((chunk) => chunk.length)).toEqual([100, 100, 50]);
    expect(chunks.flat()).toEqual(ids(250));
  });
});
