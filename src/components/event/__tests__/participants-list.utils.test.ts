import { buildParticipantSections } from '../participants-list.utils';

const person = (id: string): { id: string; pseudo: string } => ({ id, pseudo: `pseudo-${id}` });
const ids = (people: { id: string }[]): string[] => people.map((p) => p.id);

describe('buildParticipantSections', () => {
  it('puts the people I follow first, then the others, each in the server order', () => {
    const sections = buildParticipantSections({
      participants: [person('a'), person('b'), person('c'), person('d')],
      followedIds: new Set(['d', 'b']),
      currentUserId: 'me',
    });

    expect(sections.map((s) => s.key)).toEqual(['followed', 'others']);
    expect(ids(sections[0]?.data ?? [])).toEqual(['b', 'd']);
    expect(ids(sections[1]?.data ?? [])).toEqual(['a', 'c']);
  });

  it('titles the sections with their count', () => {
    const sections = buildParticipantSections({
      participants: [person('a'), person('b'), person('c')],
      followedIds: new Set(['b']),
      currentUserId: 'me',
    });

    expect(sections.map((s) => s.title)).toEqual(['Vous suivez (1)', 'Autres participants (2)']);
  });

  it('uses a single plain section when I follow nobody here', () => {
    const sections = buildParticipantSections({
      participants: [person('a'), person('b')],
      followedIds: new Set(['zzz']),
      currentUserId: 'me',
    });

    expect(sections).toHaveLength(1);
    expect(sections[0]?.key).toBe('others');
    expect(sections[0]?.title).toBe('Participants (2)');
  });

  it('keeps only the followed section title when everybody is followed', () => {
    const sections = buildParticipantSections({
      participants: [person('a'), person('b')],
      followedIds: new Set(['a', 'b']),
      currentUserId: 'me',
    });

    expect(sections.map((s) => s.key)).toEqual(['followed']);
  });

  it('shows me at the top of the others and never among the followed', () => {
    const sections = buildParticipantSections({
      participants: [person('a'), person('me'), person('b')],
      followedIds: new Set(['b', 'me']),
      currentUserId: 'me',
    });

    expect(ids(sections[0]?.data ?? [])).toEqual(['b']);
    expect(ids(sections[1]?.data ?? [])).toEqual(['me', 'a']);
  });

  it('returns no section for an empty list', () => {
    expect(
      buildParticipantSections({
        participants: [],
        followedIds: new Set(['a']),
        currentUserId: 'me',
      }),
    ).toEqual([]);
  });

  it('does not change the order when the followed set is the same object type but empty', () => {
    const sections = buildParticipantSections({
      participants: [person('c'), person('a'), person('b')],
      followedIds: new Set<string>(),
      currentUserId: null,
    });

    expect(ids(sections[0]?.data ?? [])).toEqual(['c', 'a', 'b']);
  });
});
