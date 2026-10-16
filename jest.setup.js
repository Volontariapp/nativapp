process.env.EXPO_PUBLIC_APP_ENV = 'test';
global.IS_REACT_ACT_ENVIRONMENT = true;

jest.setTimeout(30000);

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
      EVENT_TYPE_SOCIAL: 1,
      EVENT_TYPE_ECOLOGY: 2,
      0: 'EVENT_TYPE_UNSPECIFIED',
      1: 'EVENT_TYPE_SOCIAL',
      2: 'EVENT_TYPE_ECOLOGY',
    },
    EventState: {
      EVENT_STATE_UNSPECIFIED: 0,
      EVENT_STATE_DRAFT: 1,
      EVENT_STATE_PUBLISHED: 2,
      EVENT_STATE_IN_PROGRESS: 3,
      EVENT_STATE_FINISHED: 4,
      EVENT_STATE_CANCELLED: 5,
      0: 'EVENT_STATE_UNSPECIFIED',
      1: 'EVENT_STATE_DRAFT',
      2: 'EVENT_STATE_PUBLISHED',
      3: 'EVENT_STATE_IN_PROGRESS',
      4: 'EVENT_STATE_FINISHED',
      5: 'EVENT_STATE_CANCELLED',
    },
  }),
  { virtual: true },
);

jest.mock('@volontariapp/errors', () => ({}), { virtual: true });
jest.mock('@volontariapp/logger', () => ({}), { virtual: true });

jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const React = require('react');
  return new Proxy(
    {},
    {
      get: () => {
        const IconComponent = (props) => React.createElement(Text, props, props.name || '');
        IconComponent.displayName = 'MockExpoIcon';
        return IconComponent;
      },
    },
  );
});

jest.mock('react-native-vector-icons/Feather', () => {
  const { Text } = require('react-native');
  const React = require('react');
  const FeatherIcon = (props) => React.createElement(Text, props, props.name || '');
  FeatherIcon.displayName = 'MockFeatherIcon';
  return FeatherIcon;
});


