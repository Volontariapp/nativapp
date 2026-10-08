process.env.EXPO_PUBLIC_APP_ENV = 'test';
global.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock(
  '@volontariapp/shared',
  () => ({
    UserRoles: {
      ORGANIZATION: 'ORGANIZATION',
      VOLUNTEER: 'VOLUNTEER',
      ADMIN: 'ADMIN',
    },
  }),
  { virtual: true },
);

jest.mock(
  '@volontariapp/contracts',
  () => ({
    EventType: {
      EVENT_TYPE_UNSPECIFIED: 0,
      EVENT_TYPE_ECOLOGY: 1,
      EVENT_TYPE_SOCIAL: 2,
    },
  }),
  { virtual: true },
);

jest.mock('@volontariapp/errors', () => ({}), { virtual: true });
jest.mock('@volontariapp/logger', () => ({}), { virtual: true });

