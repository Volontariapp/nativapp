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
    TagsNames: {
      ECOLOGIE: 'ECOLOGIE',
      SOCIAL: 'SOCIAL',
      BENEVOLAT: 'BENEVOLAT',
      CERTIFIED: 'CERTIFIED',
    },
    MIN_ATTENDEES_FOR_ORGANIZER_POINTS: 3,
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

// Le paquet est en ESM pur : jest ne le resout pas. Seules les valeurs d'enum du direct sont
// simulees ici ; les tests qui ont besoin d'autres valeurs declarent leur propre mock.
jest.mock(
  '@volontariapp/messaging',
  () => ({
    LiveWebsocketMessagingType: {
      LIVE_POSITIONS_UPDATED: 'live.positions_updated',
      LIVE_SHARING_STOPPED: 'live.sharing_stopped',
    },
    LiveClientMessageType: { LIVE_POSITION: 'live.position' },
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

// Les cadres de classement lisent les podiums via React Query. Hors des tests du classement, les
// composants qui les posent (commentaire, participant, organisateur, profil, post) s'affichent sans
// cadre et sans avoir besoin d'un QueryClientProvider.
jest.mock('@/api/user/hooks/use-user-distinction', () => ({
  useUserDistinction: jest.fn(() => undefined),
  useDistinctionMap: jest.fn(() => new Map()),
}));

// Le SDK Datadog a du code natif absent des tests : Datadog fournit ce mock (DdSdkReactNative, DdRum
// et le reste en jest.fn).
jest.mock('@datadog/mobile-react-native', () => require('@datadog/mobile-react-native/jest'));
