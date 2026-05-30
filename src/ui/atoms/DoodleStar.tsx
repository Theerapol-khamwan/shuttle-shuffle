import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';

export interface DoodleStarProps {
  size?: number;
  color?: string;
  rotation?: number;
  style?: ViewStyle;
}

export default function DoodleStar({
  size = 24,
  color = colors.primaryContainer,
  rotation = 45, // 45 degrees gives the diamond shape
  style,
}: DoodleStarProps) {
  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    backgroundColor: color,
    borderWidth: 2,
    borderColor: colors.onBackground,
    transform: [{ rotate: `${rotation}deg` }],
    ...style,
  };

  return <View style={containerStyle} />;
}
