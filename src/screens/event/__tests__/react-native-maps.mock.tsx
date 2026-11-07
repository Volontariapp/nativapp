import React from 'react';
import { View, type ViewProps } from 'react-native';

interface MapViewHandle {
  fitToCoordinates: (coordinates: { latitude: number; longitude: number }[]) => void;
}

const MapView = React.forwardRef<MapViewHandle, ViewProps>(function MockMapView(props, ref) {
  React.useImperativeHandle(ref, () => ({ fitToCoordinates: () => undefined }));
  return <View testID="mock-map-view">{props.children}</View>;
});

export default MapView;
export const Marker = (): React.JSX.Element => <View testID="mock-map-marker" />;
export const UrlTile = (): React.JSX.Element => <View testID="mock-map-tile" />;
export const Polyline = (): React.JSX.Element => <View testID="mock-map-polyline" />;
