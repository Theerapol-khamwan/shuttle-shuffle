import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';

export interface NeoDividerProps {
  variant?: 'solid' | 'dashed';
  color?: string;
  style?: ViewStyle;
}

export default function NeoDivider({
  variant = 'dashed',
  color,
  style,
}: NeoDividerProps) {
  const isDashed = variant === 'dashed';

  const dividerStyle: ViewStyle = {
    borderBottomWidth: isDashed ? 2 : spacing.strokeThick,
    borderStyle: isDashed ? 'dashed' : 'solid',
    borderColor: color || (isDashed ? colors.outlineVariant : colors.onBackground),
    marginVertical: spacing.gutter,
    width: '100%',
    ...style,
  };

  return <View style={dividerStyle} />;
}
