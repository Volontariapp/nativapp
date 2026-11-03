import { dedupeById } from '../dedupe-by-id';

describe('dedupeById', () => {
  it('conserve le premier exemplaire et l ordre', () => {
    const items = [
      { id: 'a', v: 1 },
      { id: 'b', v: 2 },
      { id: 'a', v: 3 },
      { id: 'c', v: 4 },
      { id: 'b', v: 5 },
    ];
    expect(dedupeById(items)).toEqual([
      { id: 'a', v: 1 },
      { id: 'b', v: 2 },
      { id: 'c', v: 4 },
    ]);
  });

  it('renvoie une liste vide pour une liste vide', () => {
    expect(dedupeById([])).toEqual([]);
  });

  it('ne modifie pas la liste d entree', () => {
    const items = [{ id: 'a' }, { id: 'a' }];
    dedupeById(items);
    expect(items).toHaveLength(2);
  });
});
