export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

export const createMockEventsData = (totalCount = 3) => ({
  pages: [
    {
      events: [
        {
          id: 'event-1',
          title: 'Ramassage plage',
          type: 1,
          startAt: '2026-10-15T10:00:00Z',
          endAt: '2026-10-15T12:00:00Z',
          localisationName: 'Plage du Prado',
          maxParticipants: 20,
          currentParticipants: 5,
          awardedImpactScore: 50,
        },
      ],
      totalCount,
    },
  ],
});

export const createMockPostsData = (totalCount = 5) => ({
  pages: [
    {
      posts: [
        {
          id: 'post-1',
          title: 'Super moment',
          content: 'Merci à tous les bénévoles',
        },
      ],
      totalCount,
    },
  ],
});
