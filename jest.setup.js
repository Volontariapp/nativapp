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

// Meme principe que le mock officiel de la librairie, mais avec des fonctions simples et non des
// jest.fn : un resetAllMocks() ou restoreAllMocks() dans un test viderait leur implementation et
// useSafeAreaInsets renverrait undefined. Sans provider, les insets valent zero.
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const actual = jest.requireActual('react-native-safe-area-context');
  const metrics = {
    frame: { x: 0, y: 0, width: 320, height: 640 },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return {
    ...actual,
    initialWindowMetrics: metrics,
    useSafeAreaInsets: () => React.useContext(actual.SafeAreaInsetsContext) ?? metrics.insets,
    useSafeAreaFrame: () => React.useContext(actual.SafeAreaFrameContext) ?? metrics.frame,
    SafeAreaProvider: ({ children, initialMetrics = metrics }) =>
      React.createElement(
        actual.SafeAreaFrameContext.Provider,
        { value: initialMetrics.frame },
        React.createElement(
          actual.SafeAreaInsetsContext.Provider,
          { value: initialMetrics.insets },
          children,
        ),
      ),
  };
});

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
