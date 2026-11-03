import { AppState, type AppStateStatus } from 'react-native';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';

type Cleanup = () => void;

// Une valeur null d'isInternetReachable signifie "inconnu": on se fie alors a isConnected.
export const isNetworkOnline = (state: NetInfoState): boolean =>
  state.isConnected === true && state.isInternetReachable !== false;

export const setupFocusManager = (): Cleanup => {
  const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
    focusManager.setFocused(status === 'active');
  });
  return () => {
    subscription.remove();
  };
};

export const setupOnlineManager = (): Cleanup =>
  NetInfo.addEventListener((state) => {
    onlineManager.setOnline(isNetworkOnline(state));
  });

export const setupQueryManagers = (): Cleanup => {
  const cleanups = [setupFocusManager(), setupOnlineManager()];
  return () => {
    cleanups.forEach((cleanup) => {
      cleanup();
    });
  };
};
