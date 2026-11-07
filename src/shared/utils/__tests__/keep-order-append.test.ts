import { keepOrderAndAppend } from '../keep-order-append';

interface Item {
  id: string;
  label?: string;
}

const ids = (items: Item[]): string[] => items.map((item) => item.id);

describe('keepOrderAndAppend', () => {
  it('keeps the current order and puts new items at the bottom', () => {
    const result = keepOrderAndAppend<Item>(
      [{ id: 'a' }, { id: 'b' }],
      [{ id: 'new' }, { id: 'b' }, { id: 'a' }],
    );

    expect(ids(result)).toEqual(['a', 'b', 'new']);
  });

  it('drops items that left the list without moving the others', () => {
    const result = keepOrderAndAppend<Item>(
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      [{ id: 'c' }, { id: 'a' }],
    );

    expect(ids(result)).toEqual(['a', 'c']);
  });

  it('takes the fresh data of an item that stays', () => {
    const result = keepOrderAndAppend<Item>(
      [{ id: 'a', label: 'old' }],
      [{ id: 'a', label: 'fresh' }],
    );

    expect(result[0]?.label).toBe('fresh');
  });

  it('returns the same array when nothing changed', () => {
    const current: Item[] = [{ id: 'a' }, { id: 'b' }];

    expect(keepOrderAndAppend(current, [...current].reverse())).toBe(current);
  });
});
