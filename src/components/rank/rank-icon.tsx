import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import type { RankIconKind } from '@/shared/lib/rank/rank.types';

interface RankIconProps {
  kind: RankIconKind;
  size: number;
  /** Couleur du trait et du remplissage, prise dans le thème par l'appelant. */
  color: string;
}

const VIEW_BOX = '0 0 24 24';
const STROKE_WIDTH = 1.8;

/** Visuel décoratif d'une distinction : couronne, médaille, gemme ou flamme (jamais un emoji). */
export const RankIcon = ({ kind, size, color }: RankIconProps): React.JSX.Element => {
  switch (kind) {
    case 'crown':
      return (
        <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
          <Path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill={color} />
          <Path d="M5 21h14" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
        </Svg>
      );
    case 'medal':
      return (
        <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
          <Path
            d="M8 2l4 7 4-7"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinejoin="round"
            fill="none"
          />
          <Circle cx={12} cy={15} r={6} fill={color} />
        </Svg>
      );
    case 'gem':
      return (
        <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
          <Path d="M6 3h12l4 6-10 12L2 9z" fill={color} />
          <Path
            d="M2 9h20M9 3l3 6 3-6M12 21L8 9M12 21l4-12"
            stroke={color}
            strokeWidth={0.8}
            strokeOpacity={0.45}
            fill="none"
          />
        </Svg>
      );
    case 'flame':
      return (
        <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
          <Path
            d="M12 2c.6 3.6-3 5-3 9a4 4 0 0 0 .6 2.1A3 3 0 0 0 9 15.5a5 5 0 0 0 10 0c0-3-1.800-4.700-3.200-6.700.1 1.800-.5 3-1.500 3.600C14.700 8 13.500 4.500 12 2z"
            fill={color}
          />
        </Svg>
      );
  }
};
